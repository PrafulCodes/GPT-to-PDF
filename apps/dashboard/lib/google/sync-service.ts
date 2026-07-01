import { db } from '@repo/db';
import { logAudit, logError } from '../logger';
import { getGoogleOAuthConfig } from './env';
import { refreshGoogleOAuthAccessToken } from './oauth';
import { getGoogleRefreshToken } from './integration-service';
import { buildGoogleSearchConsoleSiteResource } from './search-console';
import { config } from '../config';

export interface SyncResult {
  success: boolean;
  error?: string;
  duration?: number;
  rowsSynced?: number;
}

const GOOGLE_INTEGRATION_PROVIDER = 'google_search_console';

async function fetchWithRetry(url: string, options: any, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        // Rate limit hit: exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      if (!response.ok) {
        throw new Error(`Google API status ${response.status}: ${await response.text()}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

function extractPathname(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.pathname;
  } catch {
    return urlStr;
  }
}

export async function runSearchConsoleSync(force = false): Promise<SyncResult> {
  const startTime = Date.now();
  
  // 1. Fetch integration record
  const integration = await db.integration.findUnique({
    where: { provider: GOOGLE_INTEGRATION_PROVIDER }
  });

  if (!integration) {
    return { success: false, error: 'Google Search Console integration not configured.' };
  }

  // Prevent double sync if already running (unless forced)
  if (integration.status === 'SYNCING' && !force) {
    // If sync has been running for more than 15 minutes, assume it timed out/crashed and allow take-over
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (integration.updatedAt > fifteenMinsAgo) {
      return { success: false, error: 'Synchronization is already in progress.' };
    }
  }

  // Update status to SYNCING
  await db.integration.update({
    where: { provider: GOOGLE_INTEGRATION_PROVIDER },
    data: { status: 'SYNCING' }
  });

  try {
    // 2. Refresh tokens
    const refreshToken = await getGoogleRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token unavailable. Please reconnect Google Search Console.');
    }

    const oauthConfig = getGoogleOAuthConfig();
    const tokenResult = await refreshGoogleOAuthAccessToken(refreshToken, oauthConfig);

    const metadata = (integration.metadata as Record<string, any>) || {};
    const siteProperty = metadata.siteProperty || config.GOOGLE_SITE_PROPERTY;

    if (!siteProperty) {
      throw new Error('Google Search Console Site Property is not configured.');
    }

    // GSC data has a delay of ~2 days, sync last 30 days up to 2 days ago
    const today = new Date();
    const end = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
    
    const requestBody = {
      startDate: formatDateStr(start),
      endDate: formatDateStr(end),
      dimensions: ['date', 'query', 'page'],
      rowLimit: 10000
    };

    const siteResourceUrl = buildGoogleSearchConsoleSiteResource(siteProperty);
    const queryUrl = `${siteResourceUrl}/searchAnalytics/query`;

    logAudit('GOOGLE_SEARCH_CONSOLE_SYNC_STARTING', 'system', {
      siteProperty,
      startDate: requestBody.startDate,
      endDate: requestBody.endDate
    });

    const data = await fetchWithRetry(queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenResult.accessToken}`
      },
      body: JSON.stringify(requestBody)
    });

    const rows = (data.rows || []) as Array<{
      keys: string[];
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;

    // Normalizations & Groupings
    const dailyMap = new Map<string, { clicks: number; impressions: number; weightedPosition: number }>();
    const queryMap = new Map<string, { clicks: number; impressions: number; weightedPosition: number }>();
    const pageMap = new Map<string, { clicks: number; impressions: number; weightedPosition: number }>();
    
    const snapshotData: any[] = [];

    for (const row of rows) {
      if (!row.keys || row.keys.length < 3) continue;
      
      const dateStr = row.keys[0]; // YYYY-MM-DD
      const query = row.keys[1];
      const rawPage = row.keys[2];
      const page = extractPathname(rawPage);

      const clicks = row.clicks;
      const impressions = row.impressions;
      const position = row.position;

      // Skip invalid items
      if (!dateStr || !query || !page) continue;

      const dateObj = new Date(dateStr);
      dateObj.setUTCHours(0, 0, 0, 0);

      // Save raw snapshot details
      snapshotData.push({
        date: dateObj,
        query,
        landingPage: page,
        clicks,
        impressions,
        ctr: row.ctr,
        position
      });

      // 1. Aggregate Daily
      const dailyKey = dateStr;
      const dailyVal = dailyMap.get(dailyKey) || { clicks: 0, impressions: 0, weightedPosition: 0 };
      dailyVal.clicks += clicks;
      dailyVal.impressions += impressions;
      dailyVal.weightedPosition += position * impressions;
      dailyMap.set(dailyKey, dailyVal);

      // 2. Aggregate Query
      const queryKey = `${dateStr}____${query}`;
      const queryVal = queryMap.get(queryKey) || { clicks: 0, impressions: 0, weightedPosition: 0 };
      queryVal.clicks += clicks;
      queryVal.impressions += impressions;
      queryVal.weightedPosition += position * impressions;
      queryMap.set(queryKey, queryVal);

      // 3. Aggregate Page
      const pageKey = `${dateStr}____${page}`;
      const pageVal = pageMap.get(pageKey) || { clicks: 0, impressions: 0, weightedPosition: 0 };
      pageVal.clicks += clicks;
      pageVal.impressions += impressions;
      pageVal.weightedPosition += position * impressions;
      pageMap.set(pageKey, pageVal);
    }

    const startRange = new Date(start);
    startRange.setUTCHours(0, 0, 0, 0);
    const endRange = new Date(end);
    endRange.setUTCHours(23, 59, 59, 999);

    // Format for createMany operations
    const dailyData = Array.from(dailyMap.entries()).map(([dateStr, v]) => {
      const dateObj = new Date(dateStr);
      dateObj.setUTCHours(0, 0, 0, 0);
      return {
        date: dateObj,
        clicks: v.clicks,
        impressions: v.impressions,
        ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
        position: v.impressions > 0 ? v.weightedPosition / v.impressions : 0
      };
    });

    const queryData = Array.from(queryMap.entries()).map(([keyStr, v]) => {
      const [dateStr, query] = keyStr.split('____');
      const dateObj = new Date(dateStr);
      dateObj.setUTCHours(0, 0, 0, 0);
      return {
        date: dateObj,
        query,
        clicks: v.clicks,
        impressions: v.impressions,
        ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
        position: v.impressions > 0 ? v.weightedPosition / v.impressions : 0
      };
    });

    const pageData = Array.from(pageMap.entries()).map(([keyStr, v]) => {
      const [dateStr, landingPage] = keyStr.split('____');
      const dateObj = new Date(dateStr);
      dateObj.setUTCHours(0, 0, 0, 0);
      return {
        date: dateObj,
        landingPage,
        clicks: v.clicks,
        impressions: v.impressions,
        ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
        position: v.impressions > 0 ? v.weightedPosition / v.impressions : 0
      };
    });

    // Transaction atomic update
    await db.$transaction(async (tx) => {
      // 1. Wipe existing overlapping ranges
      await tx.searchConsoleDaily.deleteMany({ where: { date: { gte: startRange, lte: endRange } } });
      await tx.searchConsoleQuery.deleteMany({ where: { date: { gte: startRange, lte: endRange } } });
      await tx.searchConsolePage.deleteMany({ where: { date: { gte: startRange, lte: endRange } } });
      await tx.searchConsoleSnapshot.deleteMany({ where: { date: { gte: startRange, lte: endRange } } });

      // 2. Insert fresh bulk data
      if (dailyData.length > 0) {
        await tx.searchConsoleDaily.createMany({ data: dailyData });
      }
      if (queryData.length > 0) {
        await tx.searchConsoleQuery.createMany({ data: queryData });
      }
      if (pageData.length > 0) {
        await tx.searchConsolePage.createMany({ data: pageData });
      }
      if (snapshotData.length > 0) {
        await tx.searchConsoleSnapshot.createMany({ data: snapshotData });
      }
    });

    const duration = Date.now() - startTime;

    // Save success metadata
    await db.integration.update({
      where: { provider: GOOGLE_INTEGRATION_PROVIDER },
      data: {
        status: 'CONNECTED',
        lastSuccessfulSync: new Date(),
        lastError: null,
        metadata: {
          ...metadata,
          lastSyncDurationMs: duration,
          lastSyncRows: rows.length
        }
      }
    });

    logAudit('GOOGLE_SEARCH_CONSOLE_SYNC_SUCCESS', 'system', {
      durationMs: duration,
      rowsFetched: rows.length,
      snapshotRows: snapshotData.length
    });

    return {
      success: true,
      duration,
      rowsSynced: snapshotData.length
    };

  } catch (error: any) {
    const duration = Date.now() - startTime;
    logError('GOOGLE_SEARCH_CONSOLE_SYNC_FAILED', error);

    // Save failure metadata
    const currentMetadata = (integration?.metadata as Record<string, any>) || {};
    await db.integration.update({
      where: { provider: GOOGLE_INTEGRATION_PROVIDER },
      data: {
        status: 'CONNECTED', // Reset status so reconnect works
        lastFailedSync: new Date(),
        lastError: error.message || 'Unknown synchronization error',
        metadata: {
          ...currentMetadata,
          lastFailedSyncDurationMs: duration
        }
      }
    }).catch(e => console.error('[Sync Failure Metadata Write Failed]:', e));

    return {
      success: false,
      error: error.message || 'Sync failed.'
    };
  }
}
