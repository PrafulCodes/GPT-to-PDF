import { db } from '@repo/db';

export interface TrackingData {
  success: boolean;
  failureReason?: string | null;
  failureStage?: string | null;
  httpStatus?: number | null;
  pdfSize?: number | null;
  chatSource?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  country?: string | null;
  city?: string | null;
  generationDuration: number;
}

export type TimeRange = 'today' | '24h' | '7d' | '28d' | '90d' | '12m' | 'all-time';

export interface TelemetryPayload {
  schemaVersion?: number;
  eventType: 'pageview' | 'export' | 'feature' | 'health';
  anonymousVisitorId: string;
  sessionId: string;
  userAgent?: string;
  
  // Pageview info
  landingPath?: string;
  landingQuery?: string;
  currentPage?: string;
  rawReferrer?: string;
  normalizedReferrer?: string;
  
  // UTM parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  
  // Browser/Device Details
  browser?: string;
  browserVersion?: string;
  operatingSystem?: string;
  osVersion?: string;
  deviceType?: string;
  touchSupport?: boolean;
  screenResolution?: string;
  viewport?: string;
  darkMode?: boolean;
  language?: string;
  timezone?: string;
  
  // Geography Info
  country?: string;
  city?: string;
  region?: string;
  continent?: string;
  
  // Network
  approximateLatency?: number;
  connectionType?: string;
  protocol?: string;

  // Export specifics
  exportId?: string;
  success?: boolean;
  failureReason?: string | null;
  failureStage?: string | null;
  httpStatus?: number | null;
  pdfSize?: number | null;
  generationDuration?: number;
  queueTime?: number | null;
  parseTime?: number | null;
  renderTime?: number | null;
  estimatedPages?: number | null;
  messageCount?: number | null;
  imagesCount?: number | null;
  codeBlockCount?: number | null;
  tablesCount?: number | null;
  visitNumber?: number | null;

  // V4 Telemetry additions
  exportSource?: string | null;
  exportSizeBucket?: string | null;
  exportDurationBucket?: string | null;
  localHour?: number | null;
  dayOfWeek?: number | null;
  exportNumberInSession?: number | null;
  lifetimeExportNumber?: number | null;
  returningSession?: boolean | null;
  exportEngineVersion?: string | null;
  screenSizeBucket?: string | null;
  viewportSizeBucket?: string | null;

  // Feature specifics
  featureName?: string;
  featureMetadata?: string | null;

  // Health specs
  dbLatency?: number;
  redisLatency?: number;
  apiLatency?: number;
  avgQueue?: number;
  queueTimeSpec?: number; 
  errorRate?: number;
  activeDbConnections?: number;
  activeRedisConnections?: number;
  deployVersion?: string | null;
  gitCommit?: string | null;
  environment?: string | null;

  // Browser performance metrics
  ttfb?: number | null;
  pageLoadTime?: number | null;
  hydrationTime?: number | null;
  apiResponseTime?: number | null;
  downloadTime?: number | null;
}

export interface DimensionCount {
  name: string;
  count: number;
}

export interface ChartDataPoint {
  label: string;
  exports: number;
  successes: number;
  failures: number;
  visitors: number;
  sessions: number;
  avgDuration?: number;
}

export interface ExecutiveOverview {
  visitorsCount: number;
  sessionsCount: number;
  exportsCount: number;
  conversionRate: number;
  returningVisitorsRate: number;
  avgDuration: number;
  successRate: number;
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  revenuePlaceholder: string;
  liveActivity: Array<{
    timestamp: Date;
    country: string;
    browser: string;
    success: boolean;
    duration: number;
    landingPath: string;
    eventType: string;
  }>;
  trends: Array<{
    label: string;
    visitors: number;
    sessions: number;
    exports: number;
  }>;
  topCountries: DimensionCount[];
  topLandingPages: DimensionCount[];
  topReferrers: DimensionCount[];
}

export interface GrowthMetrics {
  landingPages: Array<{ page: string; visitors: number; exports: number; conversionRate: number }>;
  referrers: Array<{ source: string; sessions: number; successRate: number }>;
  utmCampaigns: Array<{ utmSource: string; utmCampaign: string; sessions: number; exports: number; conversionRate: number }>;
  countriesGrowth: Array<{ country: string; sessions: number; exports: number; successRate: number }>;
  conversionFunnel: {
    sessions: number;
    exportClicks: number;
    successfulExports: number;
  };
  growthIntelligence: {
    bestLandingPage: string;
    worstLandingPage: string;
    fastestGrowingReferrer: string;
    highestConversionBrowser: string;
    fastestGrowingCountry: string;
    highestConversionDevice: string;
  };
}

export interface PerformanceMetrics {
  avgDuration: number;
  median: number;
  p95: number;
  p99: number;
  minDuration: number;
  maxDuration: number;
  avgQueueTime: number;
  avgParseTime: number;
  avgRenderTime: number;
  successRate: number;
  failureRate: number;
  latencyBuckets: DimensionCount[];
  pdfSizeBuckets: DimensionCount[];
  failureTimeline: Array<{ label: string; failures: number }>;
  failureStageBreakdown: DimensionCount[];
  failureReasonBreakdown: DimensionCount[];
  slowestExports: Array<{ id: string; exportSizeBucket: string | null; generationDuration: number }>;
  fastestExports: Array<{ id: string; exportSizeBucket: string | null; generationDuration: number }>;
  deployments: Array<{ version: string; successRate: number; avgDuration: number; exportsCount: number }>;
  systemHealth: Array<{ timestamp: Date; dbLatency: number; redisLatency: number; apiLatency: number; errorRate: number }>;
}

export interface FounderInsight {
  id: string;
  period: 'Today' | 'Last 7 Days' | 'Last 28 Days';
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info';
}

export interface DecisionPoint {
  title: string;
  metric: string;
  trend: 'up' | 'down' | 'neutral';
  status: 'critical' | 'optimal' | 'info';
  action: string;
}

export interface DecisionCenterData {
  biggestWin: DecisionPoint;
  biggestProblem: DecisionPoint;
  fastestReferrer: DecisionPoint;
  worstLandingPage: DecisionPoint;
  deployImpact: DecisionPoint;
  suggestedAction: string;
}

export interface ProductMetrics {
  avgPdfSize: number;
  maxPdfSize: number;
  avgMessages: number;
  avgImages: number;
  avgTables: number;
  avgCodeBlocks: number;
  failureStages: DimensionCount[];
  failureReasons: DimensionCount[];
}

/**
 * Checks database connection health.
 */
export async function checkDbStatus(): Promise<'CONNECTED' | 'DISCONNECTED'> {
  try {
    await db.$queryRaw`SELECT 1`;
    return 'CONNECTED';
  } catch (error) {
    console.error('[Analytics DB Check] Connection failure:', error);
    return 'DISCONNECTED';
  }
}

/**
 * Resolves range string into start/end dates.
 */
export function resolveTimeRange(range: string): { start: Date; end: Date; interval: 'hour' | 'day' | 'week' | 'month' } {
  const now = new Date();
  let start = new Date(0);
  let end = new Date(now);
  let interval: 'hour' | 'day' | 'week' | 'month' = 'day';

  switch (range) {
    case 'today': {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      interval = 'hour';
      break;
    }
    case '24h': {
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      interval = 'hour';
      break;
    }
    case '7d':
    case '28d': {
      start = new Date(now);
      start.setUTCDate(now.getUTCDate() - (range === '7d' ? 7 : 28));
      start.setUTCHours(0, 0, 0, 0);
      interval = 'day';
      break;
    }
    case '90d': {
      start = new Date(now);
      start.setUTCDate(now.getUTCDate() - 90);
      start.setUTCHours(0, 0, 0, 0);
      interval = 'week';
      break;
    }
    case '12m': {
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1, 0, 0, 0, 0));
      interval = 'month';
      break;
    }
    case 'all-time':
    default: {
      start = new Date(0);
      interval = 'month';
      break;
    }
  }

  return { start, end, interval };
}

export function resolveComparisonRange(range: string): { start: Date; end: Date } {
  const current = resolveTimeRange(range);
  const durationMs = Math.max(1, current.end.getTime() - current.start.getTime());
  const end = new Date(current.start.getTime());
  const start = new Date(end.getTime() - durationMs);
  return { start, end };
}

export function formatPercentageChange(currentValue: number, previousValue: number): number {
  if (previousValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return Math.round(((currentValue - previousValue) / previousValue) * 1000) / 10;
}

const countryDisplayNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

export function normalizeCountryName(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  if (upper.length <= 3) {
    const resolved = countryDisplayNames?.of(upper);
    if (resolved && resolved.toUpperCase() !== upper) {
      return resolved;
    }
  }

  if (/^[A-Z]{2,3}$/.test(upper)) {
    return null;
  }

  return trimmed;
}

export function formatLocationLabel(city?: string | null, country?: string | null): string | null {
  const normalizedCity = city?.trim();
  const normalizedCountry = normalizeCountryName(country);

  if (normalizedCity && normalizedCountry) return `${normalizedCity}, ${normalizedCountry}`;
  if (normalizedCity) return normalizedCity;
  if (normalizedCountry) return normalizedCountry;
  return null;
}

/**
 * Normalizes referrers.
 */
export function normalizeReferrerUrl(referrerUrl: string): string {
  if (!referrerUrl || referrerUrl.trim() === '' || referrerUrl.toLowerCase() === 'direct') return 'Direct';
  try {
    const url = new URL(referrerUrl);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();
    const search = url.search.toLowerCase();
    
    if (host.includes('google.com')) {
      if (search.includes('google_ai_overview') || path.includes('/ai-overview') || (search.includes('&sxsrf=') && search.includes('google_ai'))) {
        return 'Google AI Overview';
      }
      return 'Google Search';
    }
    if (host.includes('bing.com')) return 'Bing';
    if (host.includes('duckduckgo.com') || host.includes('ddg.gg')) return 'DuckDuckGo';
    if (host.includes('perplexity.ai')) return 'Perplexity';
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'ChatGPT';
    if (host.includes('gemini.google.com')) return 'Gemini';
    if (host.includes('claude.ai')) return 'Claude';
    if (host.includes('reddit.com')) return 'Reddit';
    if (host.includes('github.com')) return 'GitHub';
    
    return 'Unknown Referrer';
  } catch {
    const refLower = referrerUrl.toLowerCase().trim();
    if (refLower.includes('google')) return 'Google Search';
    if (refLower.includes('bing')) return 'Bing';
    if (refLower.includes('duckduckgo') || refLower.includes('ddg')) return 'DuckDuckGo';
    if (refLower.includes('perplexity')) return 'Perplexity';
    if (refLower.includes('chatgpt') || refLower.includes('openai')) return 'ChatGPT';
    if (refLower.includes('gemini')) return 'Gemini';
    if (refLower.includes('claude')) return 'Claude';
    if (refLower.includes('reddit')) return 'Reddit';
    if (refLower.includes('github')) return 'GitHub';
    
    return 'Unknown Referrer';
  }
}

/**
 * Normalized acquisition source, medium, and channel detection helper.
 */
export function detectTrafficDetails(
  rawReferrer: string,
  utms: { utmSource?: string; utmMedium?: string }
): { channel: string; source: string; medium: string } {
  if (utms.utmSource) {
    return {
      channel: 'Campaign',
      source: utms.utmSource,
      medium: utms.utmMedium || 'campaign'
    };
  }

  const normalized = normalizeReferrerUrl(rawReferrer);

  if (normalized === 'Direct') {
    return { channel: 'Direct', source: 'Direct', medium: 'none' };
  }

  if (['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Google AI Overview'].includes(normalized)) {
    return { channel: 'AI', source: normalized, medium: 'referral' };
  }

  if (['Google Search', 'Bing', 'DuckDuckGo'].includes(normalized)) {
    return { channel: 'Search', source: normalized, medium: 'organic' };
  }

  if (['Reddit', 'GitHub'].includes(normalized)) {
    return { channel: 'Social', source: normalized, medium: 'referral' };
  }

  return {
    channel: 'Referral',
    source: normalized || 'Unknown',
    medium: 'referral'
  };
}

/**
 * Robust User Agent details extractor.
 */
export interface UserAgentDetails {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot';
}

export function parseUserAgent(uaString: string): UserAgentDetails {
  const ua = uaString || '';
  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  let os = 'Unknown';
  let osVersion = 'Unknown';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' = 'Desktop';

  // 1. Detect Bot
  if (/bot|googlebot|crawler|spider|robot|crawling/i.test(ua)) {
    return { browser: 'Bot', browserVersion: '1.0', os: 'Linux', osVersion: 'Unknown', deviceType: 'Bot' };
  }

  // 2. Detect OS
  if (ua.includes('Windows NT')) {
    os = 'Windows';
    const match = ua.match(/Windows NT ([\d.]+)/);
    osVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    os = 'macOS';
    const match = ua.match(/Mac OS X ([\d_.]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    os = 'iOS';
    const match = ua.match(/OS ([\d_.]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
    deviceType = ua.includes('iPad') ? 'Tablet' : 'Mobile';
  } else if (ua.includes('Android')) {
    os = 'Android';
    const match = ua.match(/Android ([\d.]+)/);
    osVersion = match ? match[1] : 'Unknown';
    deviceType = /mobile/i.test(ua) ? 'Mobile' : 'Tablet';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
    osVersion = 'Unknown';
  }

  // 3. Detect Browser
  if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera';
    const match = ua.match(/(?:Opera|OPR)\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    const match = ua.match(/Edg\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Chrome') || ua.includes('CriOS')) {
    browser = 'Chrome';
    const match = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Firefox') || ua.includes('FxiOS')) {
    browser = 'Firefox';
    const match = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    const match = ua.match(/Version\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }

  // 4. Fallback Device Type
  if (deviceType === 'Desktop') {
    if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) {
      deviceType = 'Mobile';
    } else if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) {
      deviceType = 'Tablet';
    }
  }

  return { browser, browserVersion, os, osVersion, deviceType };
}

/**
 * Classifies screen resolution sizes into viewport buckets.
 */
export function bucketScreenSize(res: string): string {
  if (!res || !res.includes('x')) return 'Unknown';
  const width = parseInt(res.split('x')[0]);
  if (isNaN(width)) return 'Unknown';
  if (width < 375) return 'Mobile Small';
  if (width < 768) return 'Mobile Large';
  if (width < 1024) return 'Tablet';
  if (width < 1440) return 'Laptop';
  if (width < 1920) return 'Desktop';
  if (width < 2560) return 'Desktop Large';
  return 'Ultrawide';
}

/**
 * Classifies PDF size weights.
 */
export function bucketPdfSize(sizeInBytes?: number | null): string {
  if (!sizeInBytes) return 'Unknown';
  const kb = sizeInBytes / 1024;
  if (kb < 100) return 'Small';
  if (kb < 500) return 'Medium';
  if (kb < 2048) return 'Large';
  return 'Huge';
}

/**
 * Classifies export render times.
 */
export function bucketExportDuration(durationInSeconds?: number | null): string {
  if (!durationInSeconds) return 'Unknown';
  if (durationInSeconds <= 2.0) return '0–2 sec';
  if (durationInSeconds <= 5.0) return '2–5 sec';
  if (durationInSeconds <= 10.0) return '5–10 sec';
  return '10+ sec';
}

/**
 * Legacy tracker method mapping directly to trackTelemetry for backward compatibility.
 */
export async function trackExportEvent(data: TrackingData): Promise<void> {
  try {
    await trackTelemetry({
      schemaVersion: 2,
      eventType: 'export',
      anonymousVisitorId: 'anon-legacy-visitor',
      sessionId: 'anon-legacy-session',
      success: data.success,
      failureReason: data.failureReason,
      failureStage: data.failureStage,
      httpStatus: data.httpStatus,
      pdfSize: data.pdfSize,
      rawReferrer: data.referrer || 'Unknown',
      userAgent: data.userAgent || undefined,
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      generationDuration: data.generationDuration
    });
  } catch (error) {
    console.error('[Legacy Analytics Tracker] Failed:', error);
  }
}

/**
 * V4 Ingestion Worker.
 */
export async function trackTelemetry(payload: TelemetryPayload): Promise<void> {
  const now = new Date();
  try {
    const anonymousVisitorId = payload.anonymousVisitorId || 'anon-visitor';
    const sessionId = payload.sessionId || 'anon-session';

    // 1. Resolve normalized referrers and channels
    const rawReferrer = payload.rawReferrer || 'Direct';
    const normalizedReferrer = normalizeReferrerUrl(rawReferrer);
    const utms = { utmSource: payload.utmSource, utmMedium: payload.utmMedium };
    const acq = detectTrafficDetails(rawReferrer, utms);

    const landingPath = payload.landingPath || payload.currentPage || '/';
    const landingQuery = payload.landingQuery || null;

    // 2. Perform robust User-Agent detection on server
    const uaDetails = parseUserAgent(payload.userAgent || '');
    const browser = uaDetails.browser;
    const browserVersion = uaDetails.browserVersion;
    const operatingSystem = uaDetails.os;
    const osVersion = uaDetails.osVersion;
    const deviceType = uaDetails.deviceType;

    // 3. Viewport size buckets
    const screenSizeBucket = bucketScreenSize(payload.screenResolution || '');
    const viewportSizeBucket = bucketScreenSize(payload.viewport || '');

    // 4. Retrieve Visitor aggregates & progress counters
    const visitor = await db.visitor.findUnique({ where: { anonymousVisitorId } });
    const lifetimeExportNumber = (visitor?.totalExports || 0) + (payload.eventType === 'export' ? 1 : 0);
    const returningSession = visitor ? (visitor.totalSessions > 1) : false;

    // 5. Query active Session
    const session = await db.session.findUnique({ where: { sessionId } });
    const exportNumberInSession = (session?.exports || 0) + (payload.eventType === 'export' ? 1 : 0);

    // 6. Resolve V4 Export specific bucket metrics
    const exportSource = payload.exportSource || 'ChatGPT';
    const exportSizeBucket = bucketPdfSize(payload.pdfSize);
    const exportDurationBucket = bucketExportDuration(payload.generationDuration);
    const localHour = payload.localHour ?? now.getHours();
    const dayOfWeek = payload.dayOfWeek ?? now.getDay();
    const exportEngineVersion = 'v2.0.4';

    // 7. Upsert Visitor
    await db.visitor.upsert({
      where: { anonymousVisitorId },
      create: {
        anonymousVisitorId,
        firstVisit: now,
        lastVisit: now,
        firstLandingPath: landingPath,
        firstLandingQuery: landingQuery,
        latestLandingPath: landingPath,
        latestLandingQuery: landingQuery,
        firstRawReferrer: rawReferrer,
        firstNormalizedReferrer: normalizedReferrer,
        latestRawReferrer: rawReferrer,
        latestNormalizedReferrer: normalizedReferrer,
        acquisitionSource: acq.source,
        preferredBrowser: browser,
        preferredDevice: deviceType,
        preferredCountry: payload.country || 'Unknown',
        totalSessions: 1,
        totalExports: payload.eventType === 'export' ? 1 : 0,
        avgSessionDuration: 0.0,
        returningVisitor: false
      },
      update: {
        lastVisit: now,
        latestLandingPath: landingPath,
        latestLandingQuery: landingQuery,
        latestRawReferrer: rawReferrer,
        latestNormalizedReferrer: normalizedReferrer,
        preferredBrowser: browser || undefined,
        preferredDevice: deviceType || undefined,
        preferredCountry: payload.country || undefined,
        returningVisitor: true,
        totalExports: payload.eventType === 'export' ? { increment: 1 } : undefined
      }
    });

    // 8. Session handling
    if (!session) {
      await db.session.create({
        data: {
          sessionId,
          anonymousVisitorId,
          started: now,
          ended: now,
          duration: 0.0,
          landingPath,
          landingQuery,
          exitPage: payload.currentPage || '/',
          pagesViewed: 1,
          exports: payload.eventType === 'export' ? 1 : 0,
          bounce: true,
          rawReferrer,
          normalizedReferrer,
          trafficChannel: acq.channel,
          trafficSource: acq.source,
          trafficMedium: acq.medium,
          utmSource: payload.utmSource || null,
          utmMedium: payload.utmMedium || null,
          utmCampaign: payload.utmCampaign || null,
          utmContent: payload.utmContent || null,
          utmTerm: payload.utmTerm || null
        }
      });
      await db.visitor.update({
        where: { anonymousVisitorId },
        data: { totalSessions: { increment: 1 } }
      });
    } else {
      const duration = (now.getTime() - new Date(session.started).getTime()) / 1000;
      await db.session.update({
        where: { sessionId },
        data: {
          ended: now,
          duration,
          exitPage: payload.currentPage || session.exitPage,
          pagesViewed: { increment: 1 },
          exports: payload.eventType === 'export' ? { increment: 1 } : undefined,
          bounce: false
        }
      });
    }

    // 9. Save V4 Ingested Events
    if (payload.eventType === 'export') {
      await db.exportEvent.create({
        data: {
          id: payload.exportId || undefined,
          timestamp: now,
          success: payload.success ?? false,
          failureReason: payload.failureReason || null,
          failureStage: payload.failureStage || null,
          httpStatus: payload.httpStatus || null,
          pdfSize: payload.pdfSize || null,
          chatSource: 'chatgpt-shared',
          rawReferrer,
          normalizedReferrer,
          browser,
          browserVersion,
          operatingSystem,
          osVersion,
          deviceType,
          country: payload.country || 'Unknown',
          city: payload.city || 'Unknown',
          generationDuration: payload.generationDuration || 0.0,
          schemaVersion: payload.schemaVersion || 2,
          
          queueTime: payload.queueTime || null,
          parseTime: payload.parseTime || null,
          renderTime: payload.renderTime || null,
          estimatedPages: payload.estimatedPages || null,
          messageCount: payload.messageCount || null,
          imagesCount: payload.imagesCount || null,
          codeBlockCount: payload.codeBlockCount || null,
          tablesCount: payload.tablesCount || null,
          
          anonymousVisitorId,
          sessionId,
          visitNumber: payload.visitNumber || null,
          returningVisitor: session ? true : false,
          landingPath,
          landingQuery,
          currentPage: payload.currentPage || null,
          trafficChannel: acq.channel,
          trafficSource: acq.source,
          trafficMedium: acq.medium,
          utmSource: payload.utmSource || null,
          utmMedium: payload.utmMedium || null,
          utmCampaign: payload.utmCampaign || null,
          utmContent: payload.utmContent || null,
          utmTerm: payload.utmTerm || null,
          
          touchSupport: payload.touchSupport || false,
          screenResolution: payload.screenResolution || null,
          viewport: payload.viewport || null,
          darkMode: payload.darkMode || false,
          language: payload.language || null,
          timezone: payload.timezone || null,
          
          region: payload.region || null,
          continent: payload.continent || null,
          approximateLatency: payload.approximateLatency || null,
          connectionType: payload.connectionType || null,
          protocol: payload.protocol || null,
          ttfb: payload.ttfb || null,
          pageLoadTime: payload.pageLoadTime || null,
          hydrationTime: payload.hydrationTime || null,
          apiResponseTime: payload.apiResponseTime || null,
          downloadTime: payload.downloadTime || null,
          deployVersion: payload.deployVersion || null,
          gitCommit: payload.gitCommit || null,
          environment: payload.environment || null,

          // V4 added telemetry writes
          exportSource,
          exportSizeBucket,
          exportDurationBucket,
          localHour,
          dayOfWeek,
          exportNumberInSession,
          lifetimeExportNumber,
          returningSession,
          exportEngineVersion,
          screenSizeBucket,
          viewportSizeBucket
        }
      });

      updateDailyStatistics(now).catch(err => console.error('[Telemetry Tracker V4] Daily stats failed:', err));
    } else if (payload.eventType === 'feature') {
      await db.featureUsage.create({
        data: {
          timestamp: now,
          feature: payload.featureName || 'unknown',
          metadata: payload.featureMetadata || null
        }
      });
    } else if (payload.eventType === 'health') {
      await db.systemHealth.create({
        data: {
          timestamp: now,
          dbLatency: payload.dbLatency ?? 0.0,
          redisLatency: payload.redisLatency ?? 0.0,
          apiLatency: payload.apiLatency ?? 0.0,
          avgQueue: payload.avgQueue ?? 0.0,
          queueTime: payload.queueTimeSpec ?? 0.0,
          errorRate: payload.errorRate ?? 0.0,
          activeDbConnections: payload.activeDbConnections ?? 0,
          activeRedisConnections: payload.activeRedisConnections ?? 0,
          deployVersion: payload.deployVersion || null,
          buildVersion: payload.deployVersion || null,
          environment: payload.environment || 'production'
        }
      });
    }
  } catch (error) {
    console.error('[Analytics Telemetry V4] Ingestion crashed:', error);
  }
}

/**
 * Worker to refresh DailyStatistic records.
 */
export async function updateDailyStatistics(date: Date): Promise<void> {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  try {
    const stats: any[] = await db.$queryRaw`
      WITH successful_events AS (
        SELECT "generationDuration", "queueTime", "parseTime", "renderTime"
        FROM "ExportEvent"
        WHERE success = true AND timestamp >= ${startOfDay} AND timestamp <= ${endOfDay}
      ),
      all_events AS (
        SELECT success, browser, "landingPath", "normalizedReferrer", "anonymousVisitorId", "sessionId"
        FROM "ExportEvent"
        WHERE timestamp >= ${startOfDay} AND timestamp <= ${endOfDay}
      )
      SELECT
        (SELECT COUNT(*) FROM all_events)::bigint AS total_exports,
        (SELECT COUNT(*) FROM all_events WHERE success = true)::bigint AS successes,
        (SELECT COUNT(*) FROM all_events WHERE success = false)::bigint AS failures,
        (SELECT COUNT(DISTINCT "anonymousVisitorId") FROM all_events WHERE "anonymousVisitorId" IS NOT NULL)::bigint AS visitors,
        (SELECT COUNT(DISTINCT "sessionId") FROM all_events WHERE "sessionId" IS NOT NULL)::bigint AS sessions,
        (SELECT AVG("generationDuration") FROM successful_events)::float AS avg_duration,
        (SELECT AVG("queueTime") FROM successful_events)::float AS avg_queue,
        (SELECT AVG("parseTime") FROM successful_events)::float AS avg_parse,
        (SELECT AVG("renderTime") FROM successful_events)::float AS avg_render,
        (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "generationDuration") FROM successful_events)::float AS median,
        (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "generationDuration") FROM successful_events)::float AS p95,
        (SELECT PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY "generationDuration") FROM successful_events)::float AS p99;
    `;

    const row = stats[0] || {};
    const totalExports = Number(row.total_exports || 0);

    if (totalExports > 0) {
      await db.dailyStatistic.upsert({
        where: { date: startOfDay },
        create: {
          date: startOfDay,
          totalExports,
          successes: Number(row.successes || 0),
          failures: Number(row.failures || 0),
          avgGenerationTime: row.avg_duration || 0.0,
          visitors: Number(row.visitors || 0),
          sessions: Number(row.sessions || 0),
          conversionRate: Number(row.sessions) > 0 ? (Number(row.successes) / Number(row.sessions)) * 100 : 0.0,
          avgDuration: row.avg_duration || 0.0,
          median: row.median || 0.0,
          p95: row.p95 || 0.0,
          p99: row.p99 || 0.0,
          avgQueueTime: row.avg_queue || 0.0,
          avgParseTime: row.avg_parse || 0.0,
          avgRenderTime: row.avg_render || 0.0
        },
        update: {
          totalExports,
          successes: Number(row.successes || 0),
          failures: Number(row.failures || 0),
          avgGenerationTime: row.avg_duration || 0.0,
          visitors: Number(row.visitors || 0),
          sessions: Number(row.sessions || 0),
          conversionRate: Number(row.sessions) > 0 ? (Number(row.successes) / Number(row.sessions)) * 100 : 0.0,
          avgDuration: row.avg_duration || 0.0,
          median: row.median || 0.0,
          p95: row.p95 || 0.0,
          p99: row.p99 || 0.0,
          avgQueueTime: row.avg_queue || 0.0,
          avgParseTime: row.avg_parse || 0.0,
          avgRenderTime: row.avg_render || 0.0
        }
      });
    }
  } catch (error) {
    console.error('[Analytics Engine] updateDailyStatistics aggregation crashed:', error);
  }
}

/**
 * Monthly Archival Aggregation.
 */
export async function archiveCompletedMonths(): Promise<void> {
  try {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1;

    const earliestEvent = await db.exportEvent.findFirst({
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true }
    });

    if (!earliestEvent) return;

    const startYear = earliestEvent.timestamp.getUTCFullYear();
    const startMonth = earliestEvent.timestamp.getUTCMonth() + 1;

    let iterYear = startYear;
    let iterMonth = startMonth;

    while (iterYear < currentYear || (iterYear === currentYear && iterMonth < currentMonth)) {
      const existing = await db.monthlyStatistic.findUnique({
        where: { year_month: { year: iterYear, month: iterMonth } }
      });

      if (!existing) {
        const startOfMonth = new Date(Date.UTC(iterYear, iterMonth - 1, 1, 0, 0, 0, 0));
        const endOfMonth = new Date(Date.UTC(iterYear, iterMonth, 1, 0, 0, 0, 0));

        const [totalCount, successCount, failureCount, avgDurationResult, visitorsCount, sessionsCount] = await Promise.all([
          db.exportEvent.count({ where: { timestamp: { gte: startOfMonth, lt: endOfMonth } } }),
          db.exportEvent.count({ where: { timestamp: { gte: startOfMonth, lt: endOfMonth }, success: true } }),
          db.exportEvent.count({ where: { timestamp: { gte: startOfMonth, lt: endOfMonth }, success: false } }),
          db.exportEvent.aggregate({
            _avg: { generationDuration: true },
            where: { timestamp: { gte: startOfMonth, lt: endOfMonth }, success: true }
          }),
          db.visitor.count({ where: { firstVisit: { gte: startOfMonth, lt: endOfMonth } } }),
          db.session.count({ where: { started: { gte: startOfMonth, lt: endOfMonth } } })
        ]);

        if (totalCount > 0) {
          const successRate = (successCount / totalCount) * 100;
          const failureRate = (failureCount / totalCount) * 100;
          const avgGenerationTime = avgDurationResult._avg.generationDuration || 0.0;

          const daysInMonth = new Date(iterYear, iterMonth, 0).getDate();
          const avgDailyExports = totalCount / daysInMonth;

          const topCountryResult = await db.exportEvent.groupBy({
            by: ['country'],
            _count: { id: true },
            where: { timestamp: { gte: startOfMonth, lt: endOfMonth } },
            orderBy: { _count: { id: 'desc' } },
            take: 1
          });
          const topCountry = topCountryResult[0]?.country || 'Unknown';

          const topBrowserResult = await db.exportEvent.groupBy({
            by: ['browser'],
            _count: { id: true },
            where: { timestamp: { gte: startOfMonth, lt: endOfMonth } },
            orderBy: { _count: { id: 'desc' } },
            take: 1
          });
          const topBrowser = topBrowserResult[0]?.browser || 'Unknown';

          const topReferrerResult = await db.exportEvent.groupBy({
            by: ['normalizedReferrer'],
            _count: { id: true },
            where: { timestamp: { gte: startOfMonth, lt: endOfMonth } },
            orderBy: { _count: { id: 'desc' } },
            take: 1
          });
          const topReferrer = topReferrerResult[0]?.normalizedReferrer || 'Unknown';

          await db.monthlyStatistic.create({
            data: {
              year: iterYear,
              month: iterMonth,
              totalExports: totalCount,
              avgDailyExports,
              successRate,
              failureRate,
              avgGenerationTime,
              topCountry,
              topBrowser,
              topReferrer,
              
              monthlyVisitors: visitorsCount,
              monthlySessions: sessionsCount,
              conversionRate: sessionsCount > 0 ? (successCount / sessionsCount) * 100 : 0.0,
              returningVisitorRate: visitorsCount > 0 ? 50.0 : 0.0, 
              avgDuration: avgGenerationTime,
              median: avgGenerationTime,
              p95: avgGenerationTime,
              p99: avgGenerationTime,
              bestLandingPage: '/',
              bestReferrer: topReferrer,
              bestAcquisitionChannel: topReferrer
            }
          });
        }
      }

      iterMonth++;
      if (iterMonth > 12) {
        iterMonth = 1;
        iterYear++;
      }
    }
  } catch (error) {
    console.error('[Analytics Archiver] Monthly archival failed:', error);
  }
}

/**
 * 1. Executive Overview Service Query
 */
export async function getExecutiveOverview(range: string): Promise<ExecutiveOverview> {
  const dbStatus = await checkDbStatus();
  const defaultOverview: ExecutiveOverview = {
    visitorsCount: 0,
    sessionsCount: 0,
    exportsCount: 0,
    conversionRate: 0,
    returningVisitorsRate: 0,
    avgDuration: 0.0,
    successRate: 100.0,
    systemStatus: dbStatus === 'CONNECTED' ? 'HEALTHY' : 'DOWN',
    revenuePlaceholder: '$0.00',
    liveActivity: [],
    trends: [],
    topCountries: [],
    topLandingPages: [],
    topReferrers: []
  };

  try {
    if (dbStatus === 'DISCONNECTED') return defaultOverview;
    const { start, end } = resolveTimeRange(range);

    const [visitors, sessions, exportsCount, successCount, avgDurationResult, liveEvents] = await Promise.all([
      db.visitor.count({ where: { lastVisit: { gte: start, lte: end } } }),
      db.session.count({ where: { started: { gte: start, lte: end } } }),
      db.exportEvent.count({ where: { timestamp: { gte: start, lte: end } } }),
      db.exportEvent.count({ where: { timestamp: { gte: start, lte: end }, success: true } }),
      db.exportEvent.aggregate({
        _avg: { generationDuration: true },
        where: { timestamp: { gte: start, lte: end }, success: true }
      }),
      db.exportEvent.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: {
          timestamp: true,
          country: true,
          browser: true,
          success: true,
          generationDuration: true,
          landingPath: true
        }
      })
    ]);

    const returningCount = await db.visitor.count({
      where: { lastVisit: { gte: start, lte: end }, returningVisitor: true }
    });

    const conversionRate = sessions > 0 ? (successCount / sessions) * 100 : 0.0;
    const returningRate = visitors > 0 ? (returningCount / visitors) * 100 : 0.0;
    const successRate = exportsCount > 0 ? (successCount / exportsCount) * 100 : 100.0;

    const trendsData = await getTrendData(range);
    const trends = trendsData.map(t => ({
      label: t.label,
      visitors: Math.round(t.exports * 0.8), 
      sessions: Math.round(t.exports * 0.9),
      exports: t.exports
    }));

    const topCountries = await getDimensionBreakdown('country', range);
    const topLandingPages = await getDimensionBreakdown('landingPath', range);
    const topReferrers = await getDimensionBreakdown('normalizedReferrer', range);

    return {
      visitorsCount: visitors,
      sessionsCount: sessions,
      exportsCount,
      conversionRate: Math.round(conversionRate * 10) / 10,
      returningVisitorsRate: Math.round(returningRate * 10) / 10,
      avgDuration: Math.round((avgDurationResult._avg.generationDuration || 0.0) * 100) / 100,
      successRate: Math.round(successRate * 10) / 10,
      systemStatus: 'HEALTHY',
      revenuePlaceholder: `$${(successCount * 0.05).toFixed(2)}`,
      liveActivity: liveEvents.map(e => ({
        timestamp: e.timestamp,
        country: e.country,
        browser: e.browser,
        success: e.success,
        duration: Math.round(e.generationDuration * 10) / 10,
        landingPath: e.landingPath || '/',
        eventType: e.success ? 'Export Success' : 'Export Failure'
      })),
      trends,
      topCountries,
      topLandingPages,
      topReferrers
    };

  } catch (error) {
    console.error('[Analytics] getExecutiveOverview failed:', error);
    return defaultOverview;
  }
}

/**
 * 2. Growth Analytics V4 Service Query
 */
export async function getGrowthMetrics(range: string): Promise<GrowthMetrics> {
  const defaultGrowth: GrowthMetrics = {
    landingPages: [],
    referrers: [],
    utmCampaigns: [],
    countriesGrowth: [],
    conversionFunnel: { sessions: 0, exportClicks: 0, successfulExports: 0 },
    growthIntelligence: {
      bestLandingPage: 'None',
      worstLandingPage: 'None',
      fastestGrowingReferrer: 'None',
      highestConversionBrowser: 'None',
      fastestGrowingCountry: 'None',
      highestConversionDevice: 'None'
    }
  };

  try {
    const { start, end } = resolveTimeRange(range);

    const [pages, refs, campaigns, countriesGroup, totalSessions, clicks, successExports, sortedDevices, browsers] = await Promise.all([
      db.exportEvent.groupBy({ by: ['landingPath', 'success'], _count: { id: true }, where: { timestamp: { gte: start, lte: end } } }),
      db.exportEvent.groupBy({ by: ['normalizedReferrer', 'success'], _count: { id: true }, where: { timestamp: { gte: start, lte: end } } }),
      db.exportEvent.groupBy({ by: ['utmSource', 'utmCampaign', 'success'], _count: { id: true }, where: { timestamp: { gte: start, lte: end }, utmSource: { not: null } } }),
      db.exportEvent.groupBy({ by: ['country', 'success'], _count: { id: true }, where: { timestamp: { gte: start, lte: end } } }),
      db.session.count({ where: { started: { gte: start, lte: end } } }),
      db.exportEvent.count({ where: { timestamp: { gte: start, lte: end } } }),
      db.exportEvent.count({ where: { timestamp: { gte: start, lte: end }, success: true } }),
      db.exportEvent.groupBy({ by: ['deviceType'], _count: { id: true }, where: { timestamp: { gte: start, lte: end }, success: true }, orderBy: { _count: { id: 'desc' } } }),
      db.exportEvent.groupBy({ by: ['browser'], _count: { id: true }, where: { timestamp: { gte: start, lte: end }, success: true }, orderBy: { _count: { id: 'desc' } }, take: 1 })
    ]);

    const pageCounts = new Map<string, { total: number; successes: number }>();
    pages.forEach(p => {
      const path = p.landingPath || '/';
      const currentVal = pageCounts.get(path) || { total: 0, successes: 0 };
      currentVal.total += p._count.id;
      if (p.success) currentVal.successes += p._count.id;
      pageCounts.set(path, currentVal);
    });
    const pagesResult = Array.from(pageCounts.entries()).map(([page, v]) => ({ page, visitors: v.total, exports: v.successes, conversionRate: v.total > 0 ? Math.round((v.successes / v.total) * 1000) / 10 : 0 })).sort((a, b) => b.visitors - a.visitors).slice(0, 10);

    const referrerCounts = new Map<string, { total: number; successes: number }>();
    refs.forEach(r => {
      const source = r.normalizedReferrer || 'Direct';
      const currentVal = referrerCounts.get(source) || { total: 0, successes: 0 };
      currentVal.total += r._count.id;
      if (r.success) currentVal.successes += r._count.id;
      referrerCounts.set(source, currentVal);
    });
    const referrersResult = Array.from(referrerCounts.entries()).map(([source, v]) => ({ source, sessions: v.total, successRate: v.total > 0 ? Math.round((v.successes / v.total) * 1000) / 10 : 100 })).sort((a, b) => b.sessions - a.sessions).slice(0, 10);

    const campaignCounts = new Map<string, { total: number; successes: number }>();
    campaigns.forEach(c => {
      const key = `${c.utmSource || 'Unknown'}____${c.utmCampaign || 'Unknown'}`;
      const currentVal = campaignCounts.get(key) || { total: 0, successes: 0 };
      currentVal.total += c._count.id;
      if (c.success) currentVal.successes += c._count.id;
      campaignCounts.set(key, currentVal);
    });
    const utmCampaigns = Array.from(campaignCounts.entries()).map(([keyStr, v]) => {
      const [utmSource, utmCampaign] = keyStr.split('____');
      return { utmSource, utmCampaign, sessions: v.total, exports: v.successes, conversionRate: v.total > 0 ? Math.round((v.successes / v.total) * 1000) / 10 : 0 };
    }).sort((a, b) => b.sessions - a.sessions).slice(0, 10);

    const countryCounts = new Map<string, { total: number; successes: number }>();
    countriesGroup.forEach(c => {
      const country = c.country || 'Unknown';
      const currentVal = countryCounts.get(country) || { total: 0, successes: 0 };
      currentVal.total += c._count.id;
      if (c.success) currentVal.successes += c._count.id;
      countryCounts.set(country, currentVal);
    });
    const countriesGrowth = Array.from(countryCounts.entries()).map(([country, v]) => ({ country, sessions: v.total, exports: v.successes, successRate: v.total > 0 ? Math.round((v.successes / v.total) * 1000) / 10 : 100 })).sort((a, b) => b.sessions - a.sessions).slice(0, 10);

    const sortedPages = [...pagesResult].sort((a, b) => b.conversionRate - a.conversionRate);

    return {
      landingPages: pagesResult,
      referrers: referrersResult,
      utmCampaigns,
      countriesGrowth,
      conversionFunnel: { sessions: totalSessions, exportClicks: clicks, successfulExports: successExports },
      growthIntelligence: {
        bestLandingPage: sortedPages[0]?.page || '/',
        worstLandingPage: sortedPages[sortedPages.length - 1]?.page || '/',
        fastestGrowingReferrer: referrersResult[0]?.source || 'Direct',
        highestConversionBrowser: browsers[0]?.browser || 'Chrome',
        fastestGrowingCountry: countriesGrowth[0]?.country || 'Unknown',
        highestConversionDevice: sortedDevices[0]?.deviceType || 'Desktop'
      }
    };
  } catch (error) {
    console.error('[Analytics] getGrowthMetrics failed:', error);
    return defaultGrowth;
  }
}

/**
 * 3. Performance Metrics Service Query
 */
export async function getPerformanceMetrics(range: string): Promise<PerformanceMetrics> {
  const { start, end } = resolveTimeRange(range);
  const defaultPerformance: PerformanceMetrics = {
    avgDuration: 0,
    median: 0,
    p95: 0,
    p99: 0,
    minDuration: 0,
    maxDuration: 0,
    avgQueueTime: 0.0,
    avgParseTime: 0.0,
    avgRenderTime: 0.0,
    successRate: 100,
    failureRate: 0,
    latencyBuckets: [],
    pdfSizeBuckets: [],
    failureTimeline: [],
    failureStageBreakdown: [],
    failureReasonBreakdown: [],
    slowestExports: [],
    fastestExports: [],
    deployments: [],
    systemHealth: []
  };

  try {
    const stats: any[] = await db.$queryRaw`
      WITH successful_events AS (
        SELECT "generationDuration", "queueTime", "parseTime", "renderTime"
        FROM "ExportEvent"
        WHERE success = true AND timestamp >= ${start} AND timestamp <= ${end}
      ),
      all_events AS (
        SELECT success
        FROM "ExportEvent"
        WHERE timestamp >= ${start} AND timestamp <= ${end}
      )
      SELECT
        (SELECT COUNT(*) FROM all_events)::bigint AS total,
        (SELECT COUNT(*) FROM all_events WHERE success = true)::bigint AS successes,
        (SELECT COUNT(*) FROM all_events WHERE success = false)::bigint AS failures,
        (SELECT AVG("generationDuration") FROM successful_events)::float AS avg_duration,
        (SELECT MIN("generationDuration") FROM successful_events)::float AS min_duration,
        (SELECT MAX("generationDuration") FROM successful_events)::float AS max_duration,
        (SELECT AVG("queueTime") FROM successful_events)::float AS avg_queue,
        (SELECT AVG("parseTime") FROM successful_events)::float AS avg_parse,
        (SELECT AVG("renderTime") FROM successful_events)::float AS avg_render,
        (SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "generationDuration") FROM successful_events)::float AS median,
        (SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "generationDuration") FROM successful_events)::float AS p95,
        (SELECT PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY "generationDuration") FROM successful_events)::float AS p99;
    `;

    const row = stats[0] || {};
    const total = Number(row.total || 0);
    const successes = Number(row.successes || 0);
    const failures = Number(row.failures || 0);

    const successRate = total > 0 ? (successes / total) * 100 : 100;
    const failureRate = total > 0 ? (failures / total) * 100 : 0;

    const [stages, reasons, deploys, healthLogs, latencyBuckets, pdfSizeBuckets, failureTimeline, slowestExports, fastestExports] = await Promise.all([
      db.exportEvent.groupBy({
        by: ['failureStage'],
        _count: { id: true },
        where: { success: false, timestamp: { gte: start, lte: end } },
        orderBy: { _count: { id: 'desc' } }
      }),
      db.exportEvent.groupBy({
        by: ['failureReason'],
        _count: { id: true },
        where: { success: false, timestamp: { gte: start, lte: end } },
        orderBy: { _count: { id: 'desc' } }
      }),
      db.exportEvent.groupBy({
        by: ['deployVersion'],
        _count: { id: true },
        _avg: { generationDuration: true },
        where: { deployVersion: { not: null }, timestamp: { gte: start, lte: end } }
      }),
      db.systemHealth.findMany({
        take: 30,
        orderBy: { timestamp: 'desc' },
        select: {
          timestamp: true,
          dbLatency: true,
          redisLatency: true,
          apiLatency: true,
          errorRate: true
        }
      }),
      db.exportEvent.groupBy({
        by: ['exportDurationBucket'],
        _count: { id: true },
        where: { timestamp: { gte: start, lte: end }, success: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      db.exportEvent.groupBy({
        by: ['exportSizeBucket'],
        _count: { id: true },
        where: { timestamp: { gte: start, lte: end }, success: true },
        orderBy: { _count: { id: 'desc' } }
      }),
      db.$queryRaw`
        SELECT DATE_TRUNC('day', timestamp) AS period, COUNT(*)::bigint AS failures
        FROM "ExportEvent"
        WHERE success = false AND timestamp >= ${start} AND timestamp <= ${end}
        GROUP BY period
        ORDER BY period ASC;
      `,
      db.exportEvent.findMany({
        where: { success: true, timestamp: { gte: start, lte: end } },
        orderBy: { generationDuration: 'desc' },
        take: 5,
        select: { id: true, exportSizeBucket: true, generationDuration: true }
      }),
      db.exportEvent.findMany({
        where: { success: true, timestamp: { gte: start, lte: end } },
        orderBy: { generationDuration: 'asc' },
        take: 5,
        select: { id: true, exportSizeBucket: true, generationDuration: true }
      })
    ]);

    const deployments = await Promise.all(
      deploys.map(async d => {
        const totalDep = d._count.id;
        const succDep = await db.exportEvent.count({
          where: { deployVersion: d.deployVersion, success: true, timestamp: { gte: start, lte: end } }
        });
        return {
          version: d.deployVersion || 'Legacy',
          successRate: totalDep > 0 ? Math.round((succDep / totalDep) * 100) : 100,
          avgDuration: Math.round((d._avg.generationDuration || 0.0) * 100) / 100,
          exportsCount: totalDep
        };
      })
    );

    return {
      avgDuration: Math.round((row.avg_duration || 0) * 100) / 100,
      median: Math.round((row.median || 0) * 100) / 100,
      p95: Math.round((row.p95 || 0) * 100) / 100,
      p99: Math.round((row.p99 || 0) * 100) / 100,
      minDuration: Math.round((row.min_duration || 0) * 100) / 100,
      maxDuration: Math.round((row.max_duration || 0) * 100) / 100,
      avgQueueTime: Math.round((row.avg_queue || 0) * 100) / 100,
      avgParseTime: Math.round((row.avg_parse || 0) * 100) / 100,
      avgRenderTime: Math.round((row.avg_render || 0) * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      latencyBuckets: latencyBuckets.map((bucket) => ({
        name: bucket.exportDurationBucket || 'Unspecified',
        count: bucket._count.id
      })),
      pdfSizeBuckets: pdfSizeBuckets.map((bucket) => ({
        name: bucket.exportSizeBucket || 'Unspecified',
        count: bucket._count.id
      })),
      failureTimeline: (failureTimeline as Array<{ period: Date; failures: bigint }>).map((item) => ({
        label: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(item.period)),
        failures: Number(item.failures)
      })),
      failureStageBreakdown: stages.map(s => ({ name: s.failureStage || 'Unknown', count: s._count.id })),
      failureReasonBreakdown: reasons.map(r => ({ name: r.failureReason || 'Unknown', count: r._count.id })),
      slowestExports: slowestExports.map((item) => ({
        id: item.id,
        exportSizeBucket: item.exportSizeBucket,
        generationDuration: Math.round(item.generationDuration * 100) / 100
      })),
      fastestExports: fastestExports.map((item) => ({
        id: item.id,
        exportSizeBucket: item.exportSizeBucket,
        generationDuration: Math.round(item.generationDuration * 100) / 100
      })),
      deployments,
      systemHealth: healthLogs.map(h => ({
        timestamp: h.timestamp,
        dbLatency: h.dbLatency,
        redisLatency: h.redisLatency,
        apiLatency: h.apiLatency,
        errorRate: h.errorRate
      })).reverse()
    };

  } catch (error) {
    console.error('[Analytics] getPerformanceMetrics failed:', error);
    return defaultPerformance;
  }
}

/**
 * 4. Export Explorer Query
 */
export async function getExportExplorer(filters: any): Promise<{ logs: any[]; totalCount: number }> {
  try {
    const where: any = {};

    if (filters.status === 'success') where.success = true;
    if (filters.status === 'failed') where.success = false;

    if (filters.device && filters.device !== 'all') {
      where.deviceType = { equals: filters.device, mode: 'insensitive' };
    }

    if (filters.browser && filters.browser !== 'all') {
      where.browser = { equals: filters.browser, mode: 'insensitive' };
    }

    if (filters.country && filters.country !== 'all') {
      where.country = { equals: filters.country, mode: 'insensitive' };
    }

    if (filters.city && filters.city !== 'all') {
      where.city = { equals: filters.city, mode: 'insensitive' };
    }

    if (filters.exportSource && filters.exportSource !== 'all') {
      where.exportSource = { equals: filters.exportSource, mode: 'insensitive' };
    }

    if (filters.trafficSource && filters.trafficSource !== 'all') {
      where.trafficSource = { equals: filters.trafficSource, mode: 'insensitive' };
    }

    if (filters.sessionId) {
      where.sessionId = { contains: filters.sessionId, mode: 'insensitive' };
    }

    if (filters.visitorId) {
      where.anonymousVisitorId = { contains: filters.visitorId, mode: 'insensitive' };
    }

    if (filters.durationBucket && filters.durationBucket !== 'all') {
      where.exportDurationBucket = { equals: filters.durationBucket, mode: 'insensitive' };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.timestamp = {};
      if (filters.dateFrom) where.timestamp.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.timestamp.lte = new Date(filters.dateTo);
    }

    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { rawReferrer: { contains: filters.search, mode: 'insensitive' } },
        { normalizedReferrer: { contains: filters.search, mode: 'insensitive' } },
        { country: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { failureReason: { contains: filters.search, mode: 'insensitive' } },
        { sessionId: { contains: filters.search, mode: 'insensitive' } },
        { anonymousVisitorId: { contains: filters.search, mode: 'insensitive' } },
        { exportSource: { contains: filters.search, mode: 'insensitive' } },
        { trafficSource: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.dateRange && filters.dateRange !== 'all') {
      const { start, end } = resolveTimeRange(filters.dateRange);
      where.timestamp = { gte: start, lte: end };
    }

    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    let pagOptions: any = {
      take: limit,
      skip: offset,
      orderBy: { timestamp: 'desc' }
    };

    if (filters.cursorId) {
      pagOptions = {
        take: limit,
        skip: 1, 
        cursor: { id: filters.cursorId },
        orderBy: { timestamp: 'desc' }
      };
    }

    const [logs, totalCount] = await Promise.all([
      db.exportEvent.findMany({
        where,
        ...pagOptions
      }),
      db.exportEvent.count({ where })
    ]);

    return {
      logs,
      totalCount
    };
  } catch (error) {
    console.error('[Analytics] getExportExplorer failed:', error);
    return { logs: [], totalCount: 0 };
  }
}

/**
 * 5. Founder Insights V3 Query
 */
export async function getFounderInsights(): Promise<FounderInsight[]> {
  try {
    const buildWindowInsights = async (range: 'today' | '7d' | '28d', periodLabel: 'Today' | 'Last 7 Days' | 'Last 28 Days') => {
      const [current, previous, browsers, countries, referrers] = await Promise.all([
        getOverviewSnapshot(range),
        getOverviewSnapshot(range, resolveComparisonRange(range)),
        getDimensionBreakdown('browser', range),
        getDimensionBreakdown('country', range),
        getDimensionBreakdown('normalizedReferrer', range)
      ]);

      const topBrowser = browsers[0]?.name || 'Unknown';
      const topCountry = countries[0]?.name || 'Unknown';
      const topReferrer = referrers[0]?.name || 'Unknown';
      
      const exportDelta = formatPercentageChange(current.exportsCount, previous.exportsCount);
      const successDelta = formatPercentageChange(current.successRate, previous.successRate);
      const latencyDelta = formatPercentageChange(current.avgDuration, previous.avgDuration);

      const insights: FounderInsight[] = [
        {
          id: `${range}-exports`,
          period: periodLabel,
          title: `${periodLabel} exports ${exportDelta >= 0 ? 'increased' : 'decreased'} ${Math.abs(exportDelta).toFixed(1)}%`,
          description: `${current.exportsCount.toLocaleString()} exports completed in ${periodLabel.toLowerCase()} versus ${previous.exportsCount.toLocaleString()} in the prior period.`,
          type: exportDelta >= 0 ? 'success' : 'warning'
        },
        {
          id: `${range}-success`,
          period: periodLabel,
          title: `Success rate ${successDelta >= 0 ? 'improved' : 'softened'} ${Math.abs(successDelta).toFixed(1)}%`,
          description: `The period ended at ${current.successRate.toFixed(1)}% successful exports with ${current.avgDuration.toFixed(1)}s average latency.`,
          type: successDelta >= 0 ? 'success' : 'warning'
        },
        {
          id: `${range}-country`,
          period: periodLabel,
          title: `Largest country: ${topCountry}`,
          description: `${topCountry} led demand, while ${topBrowser} was the most active browser and ${topReferrer} was the largest acquisition source.`,
          type: 'info'
        },
        {
          id: `${range}-latency`,
          period: periodLabel,
          title: `Latency ${latencyDelta >= 0 ? 'worsened' : 'improved'} ${Math.abs(latencyDelta).toFixed(1)}%`,
          description: `Average export latency is ${current.avgDuration.toFixed(1)}s compared with ${previous.avgDuration.toFixed(1)}s in the prior window.`,
          type: latencyDelta <= 0 ? 'success' : 'warning'
        }
      ];

      // Dynamic GSC Search performance insights if sync'd data exists
      const { start: currentStart, end: currentEnd } = resolveTimeRange(range);
      const { start: prevStart, end: prevEnd } = resolveComparisonRange(range);

      const [currentGsc, prevGsc] = await Promise.all([
        db.searchConsoleDaily.aggregate({
          _sum: { clicks: true, impressions: true },
          where: { date: { gte: currentStart, lte: currentEnd } }
        }),
        db.searchConsoleDaily.aggregate({
          _sum: { clicks: true, impressions: true },
          where: { date: { gte: prevStart, lte: prevEnd } }
        })
      ]);

      const currentClicks = currentGsc._sum.clicks || 0;
      const prevClicks = prevGsc._sum.clicks || 0;
      const clicksDelta = formatPercentageChange(currentClicks, prevClicks);

      if (currentClicks > 0 || prevClicks > 0) {
        insights.push({
          id: `${range}-search-clicks`,
          period: periodLabel,
          title: `Google Organic clicks ${clicksDelta >= 0 ? 'increased' : 'decreased'} ${Math.abs(clicksDelta).toFixed(1)}%`,
          description: `Captured ${currentClicks.toLocaleString()} organic Google search clicks in ${periodLabel.toLowerCase()} vs ${prevClicks.toLocaleString()} in the previous window.`,
          type: clicksDelta >= 0 ? 'success' : 'warning'
        });
      }

      return insights;
    };

    const [todayInsights, weekInsights, monthInsights] = await Promise.all([
      buildWindowInsights('today', 'Today'),
      buildWindowInsights('7d', 'Last 7 Days'),
      buildWindowInsights('28d', 'Last 28 Days')
    ]);

    return [...todayInsights, ...weekInsights, ...monthInsights];
  } catch (error) {
    console.error('[Analytics] getFounderInsights failed:', error);
    return [];
  }
}

/**
 * 6. Decision Center Query
 */
export async function getDecisionCenter(): Promise<DecisionCenterData> {
  try {
    const range = '7d';
    const overview = await getOverviewSnapshot(range);
    const previous = await getOverviewSnapshot(range, resolveComparisonRange(range));
    
    const browsers = await getDimensionPerformanceBreakdown('browser', range);
    const slowestBrowser = browsers.find(b => b.successRate < 90) || browsers[0];
    
    const landingPages = await getDimensionPerformanceBreakdown('landingPath', range);
    const worstPage = [...landingPages].sort((a,b) => a.successRate - b.successRate)[0];

    const referrers = await getDimensionPerformanceBreakdown('normalizedReferrer', range);
    const topReferrer = referrers[0];

    return {
      biggestWin: {
        title: "Weekly Traffic Success",
        metric: `${topReferrer?.name || 'Direct'} referrals: ${topReferrer?.exports || 0}`,
        trend: "up",
        status: "optimal",
        action: "Optimize onboarding flow for visitors arriving from this channel."
      },
      biggestProblem: {
        title: "Highest Error Source",
        metric: worstPage ? `${worstPage.name} conversions at ${worstPage.successRate.toFixed(1)}%` : "None detected",
        trend: "down",
        status: worstPage && worstPage.successRate < 90 ? "critical" : "optimal",
        action: worstPage ? `Review client-side telemetry logs on ${worstPage.name} to diagnose failures.` : "Maintain monitoring."
      },
      fastestReferrer: {
        title: "Top Channel Volume",
        metric: `${topReferrer?.name || 'Direct'} (${topReferrer?.exports || 0} completions)`,
        trend: "up",
        status: "optimal",
        action: "Enhance onboarding path to maintain referral loop."
      },
      worstLandingPage: {
        title: "Lowest Conversion Page",
        metric: worstPage ? `${worstPage.name} (${worstPage.successRate.toFixed(1)}%)` : "N/A",
        trend: "down",
        status: "critical",
        action: "Simplify page body copywriting and improve visual call-to-actions."
      },
      deployImpact: {
        title: "System Performance",
        metric: `Average generation time is ${overview.avgDuration.toFixed(2)}s`,
        trend: overview.avgDuration <= previous.avgDuration ? "up" : "down",
        status: overview.avgDuration <= 3.0 ? "optimal" : "critical",
        action: "Monitor server response latency on API exports."
      },
      suggestedAction: worstPage ? `Prioritize fixing the low-converting landing page: ${worstPage.name}.` : "Platform health is normal. Proceed with monitoring."
    };
  } catch (error) {
    console.error('[Analytics] getDecisionCenter failed:', error);
    return {
      biggestWin: { title: 'N/A', metric: 'N/A', trend: 'neutral', status: 'info', action: 'N/A' },
      biggestProblem: { title: 'N/A', metric: 'N/A', trend: 'neutral', status: 'info', action: 'N/A' },
      fastestReferrer: { title: 'N/A', metric: 'N/A', trend: 'neutral', status: 'info', action: 'N/A' },
      worstLandingPage: { title: 'N/A', metric: 'N/A', trend: 'neutral', status: 'info', action: 'N/A' },
      deployImpact: { title: 'N/A', metric: 'N/A', trend: 'neutral', status: 'info', action: 'N/A' },
      suggestedAction: 'N/A'
    };
  }
}

/**
 * 7. Live Stream Activity logs
 */
export async function getRealtimeActivity(): Promise<any[]> {
  try {
    const events = await db.exportEvent.findMany({
      take: 20,
      orderBy: { timestamp: 'desc' },
      select: {
        timestamp: true,
        country: true,
        browser: true,
        success: true,
        generationDuration: true,
        landingPath: true
      }
    });

    return events.map(e => ({
      timestamp: e.timestamp,
      country: e.country,
      browser: e.browser,
      success: e.success,
      duration: Math.round(e.generationDuration * 100) / 100,
      landingPath: e.landingPath || '/',
      eventType: e.success ? 'Export Success' : 'Export Failure'
    }));
  } catch (error) {
    console.error('[Analytics] getRealtimeActivity failed:', error);
    return [];
  }
}

/**
 * 8. System Health analytics time-series metrics.
 */
export async function getHealthMetrics(range: string): Promise<any[]> {
  const { start, end } = resolveTimeRange(range);
  try {
    const health = await db.systemHealth.findMany({
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    return health.reverse();
  } catch (error) {
    console.error('[Analytics] getHealthMetrics failed:', error);
    return [];
  }
}

/**
 * 9. Product Metrics
 */
export async function getProductMetrics(range: string): Promise<ProductMetrics> {
  const { start, end } = resolveTimeRange(range);
  try {
    const stats = await db.exportEvent.aggregate({
      _avg: {
        pdfSize: true,
        messageCount: true,
        imagesCount: true,
        tablesCount: true,
        codeBlockCount: true
      },
      _max: {
        pdfSize: true
      },
      where: { timestamp: { gte: start, lte: end }, success: true }
    });

    const [stages, reasons] = await Promise.all([
      db.exportEvent.groupBy({
        by: ['failureStage'],
        _count: { id: true },
        where: { success: false, timestamp: { gte: start, lte: end } },
        orderBy: { _count: { id: 'desc' } }
      }),
      db.exportEvent.groupBy({
        by: ['failureReason'],
        _count: { id: true },
        where: { success: false, timestamp: { gte: start, lte: end } },
        orderBy: { _count: { id: 'desc' } }
      })
    ]);

    return {
      avgPdfSize: Math.round((stats._avg.pdfSize || 0.0) / 1024), 
      maxPdfSize: Math.round((stats._max.pdfSize || 0.0) / 1024), 
      avgMessages: Math.round((stats._avg.messageCount || 0.0) * 10) / 10,
      avgImages: Math.round((stats._avg.imagesCount || 0.0) * 10) / 10,
      avgTables: Math.round((stats._avg.tablesCount || 0.0) * 10) / 10,
      avgCodeBlocks: Math.round((stats._avg.codeBlockCount || 0.0) * 10) / 10,
      failureStages: stages.map(s => ({ name: s.failureStage || 'Unknown', count: s._count.id })),
      failureReasons: reasons.map(r => ({ name: r.failureReason || 'Unknown', count: r._count.id }))
    };
  } catch (error) {
    console.error('[Analytics] getProductMetrics failed:', error);
    return {
      avgPdfSize: 0,
      maxPdfSize: 0,
      avgMessages: 0,
      avgImages: 0,
      avgTables: 0,
      avgCodeBlocks: 0,
      failureStages: [],
      failureReasons: []
    };
  }
}

/**
 * Legacy helpers.
 */
export async function getKPIMetrics(range: string): Promise<any> {
  const overview = await getExecutiveOverview(range);
  return {
    totalExports: overview.exportsCount,
    todayExports: Math.round(overview.exportsCount * 0.15),
    weekExports: Math.round(overview.exportsCount * 0.7),
    monthExports: overview.exportsCount,
    successes: Math.round(overview.exportsCount * (overview.successRate / 100)),
    failures: Math.round(overview.exportsCount * ((100 - overview.successRate) / 100)),
    successRate: overview.successRate,
    failureRate: 100 - overview.successRate,
    avgDuration: overview.avgDuration,
    dbStatus: overview.systemStatus === 'HEALTHY' ? 'CONNECTED' : 'DISCONNECTED'
  };
}

export async function getTrendData(range: string): Promise<ChartDataPoint[]> {
  const { start, end, interval } = resolveTimeRange(range);

  try {
    let result: Array<{ period: Date; exports: bigint; successes: bigint; failures: bigint; visitors: bigint; sessions: bigint; avg_duration: number }> = [];

    if (interval === 'hour') {
      result = await db.$queryRaw`
        SELECT
          DATE_TRUNC('hour', timestamp) AS period,
          COUNT(*)::bigint AS exports,
          COUNT(*) FILTER (WHERE success = true)::bigint AS successes,
          COUNT(*) FILTER (WHERE success = false)::bigint AS failures,
          COUNT(DISTINCT "anonymousVisitorId")::bigint AS visitors,
          COUNT(DISTINCT "sessionId")::bigint AS sessions,
          COALESCE(AVG("generationDuration") FILTER (WHERE success = true), 0.0)::float AS avg_duration
        FROM "ExportEvent"
        WHERE timestamp >= ${start} AND timestamp <= ${end}
        GROUP BY period
        ORDER BY period ASC;
      `;
    } else if (interval === 'month') {
      result = await db.$queryRaw`
        SELECT
          DATE_TRUNC('month', timestamp) AS period,
          COUNT(*)::bigint AS exports,
          COUNT(*) FILTER (WHERE success = true)::bigint AS successes,
          COUNT(*) FILTER (WHERE success = false)::bigint AS failures,
          COUNT(DISTINCT "anonymousVisitorId")::bigint AS visitors,
          COUNT(DISTINCT "sessionId")::bigint AS sessions,
          COALESCE(AVG("generationDuration") FILTER (WHERE success = true), 0.0)::float AS avg_duration
        FROM "ExportEvent"
        WHERE timestamp >= ${start} AND timestamp <= ${end}
        GROUP BY period
        ORDER BY period ASC;
      `;
    } else if (interval === 'week') {
      result = await db.$queryRaw`
        SELECT
          DATE_TRUNC('week', timestamp) AS period,
          COUNT(*)::bigint AS exports,
          COUNT(*) FILTER (WHERE success = true)::bigint AS successes,
          COUNT(*) FILTER (WHERE success = false)::bigint AS failures,
          COUNT(DISTINCT "anonymousVisitorId")::bigint AS visitors,
          COUNT(DISTINCT "sessionId")::bigint AS sessions,
          COALESCE(AVG("generationDuration") FILTER (WHERE success = true), 0.0)::float AS avg_duration
        FROM "ExportEvent"
        WHERE timestamp >= ${start} AND timestamp <= ${end}
        GROUP BY period
        ORDER BY period ASC;
      `;
    } else {
      result = await db.$queryRaw`
        SELECT
          DATE_TRUNC('day', timestamp) AS period,
          COUNT(*)::bigint AS exports,
          COUNT(*) FILTER (WHERE success = true)::bigint AS successes,
          COUNT(*) FILTER (WHERE success = false)::bigint AS failures,
          COUNT(DISTINCT "anonymousVisitorId")::bigint AS visitors,
          COUNT(DISTINCT "sessionId")::bigint AS sessions,
          COALESCE(AVG("generationDuration") FILTER (WHERE success = true), 0.0)::float AS avg_duration
        FROM "ExportEvent"
        WHERE timestamp >= ${start} AND timestamp <= ${end}
        GROUP BY period
        ORDER BY period ASC;
      `;
    }

    return result.map(r => {
      let label = '';
      if (interval === 'hour') {
        label = new Date(r.period).toISOString().replace('T', ' ').substring(11, 16);
      } else if (interval === 'week') {
        label = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(r.period));
      } else if (interval === 'month') {
        label = new Date(r.period).toISOString().substring(0, 7);
      } else {
        label = new Date(r.period).toISOString().split('T')[0];
      }

      return {
        label,
        exports: Number(r.exports),
        successes: Number(r.successes),
        failures: Number(r.failures),
        visitors: Number(r.visitors || 0),
        sessions: Number(r.sessions || 0),
        avgDuration: Math.round((r.avg_duration || 0.0) * 100) / 100
      };
    });
  } catch (error) {
    console.error('[Analytics] getTrendData failed:', error);
    return [];
  }
}

export async function getDimensionBreakdown(
  dimension: 'browser' | 'browserVersion' | 'deviceType' | 'operatingSystem' | 'osVersion' | 'referrer' | 'country' | 'city' | 'landingPath' | 'normalizedReferrer' | 'exportSource' | 'trafficSource' | 'language' | 'timezone' | 'screenSizeBucket',
  range: string
): Promise<DimensionCount[]> {
  const { start, end } = resolveTimeRange(range);

  try {
    const validDimensions = ['browser', 'browserVersion', 'deviceType', 'operatingSystem', 'osVersion', 'referrer', 'country', 'city', 'landingPath', 'normalizedReferrer', 'exportSource', 'trafficSource', 'language', 'timezone', 'screenSizeBucket'];
    if (!validDimensions.includes(dimension)) {
      throw new Error(`Invalid dimension: ${dimension}`);
    }

    const grouped = await db.exportEvent.groupBy({
      by: [dimension as any],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    return grouped
      .map(g => {
        const rawValue = g[dimension as any] as string | null | undefined;
        const normalizedValue = dimension === 'country'
          ? normalizeCountryName(rawValue)
          : rawValue?.trim() || null;

        return normalizedValue ? { name: normalizedValue, count: g._count.id } : null;
      })
      .filter((item): item is DimensionCount => !!item);
  } catch (error) {
    console.error(`[Analytics] getDimensionBreakdown failed for ${dimension}:`, error);
    return [];
  }
}

export async function getLocationBreakdown(range: string): Promise<DimensionCount[]> {
  const { start, end } = resolveTimeRange(range);

  try {
    const grouped = await db.exportEvent.groupBy({
      by: ['city', 'country'],
      _count: { id: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    return grouped
      .map(g => ({
        name: formatLocationLabel(g.city, g.country) || '',
        count: g._count.id
      }))
      .filter(item => item.name !== '');
  } catch (error) {
    console.error('[Analytics] getLocationBreakdown failed:', error);
    return [];
  }
}

export async function getDimensionPerformanceBreakdown(
  dimension: 'browser' | 'browserVersion' | 'deviceType' | 'operatingSystem' | 'osVersion' | 'referrer' | 'country' | 'city' | 'landingPath' | 'normalizedReferrer' | 'exportSource' | 'trafficSource' | 'language' | 'timezone' | 'screenSizeBucket',
  range: string
): Promise<Array<{ name: string; exports: number; successRate: number; avgLatency: number }>> {
  const { start, end } = resolveTimeRange(range);

  try {
    const [allRows, successRows] = await Promise.all([
      db.exportEvent.groupBy({
        by: [dimension as any],
        _count: { id: true },
        _avg: { generationDuration: true },
        where: { timestamp: { gte: start, lte: end } },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      db.exportEvent.groupBy({
        by: [dimension as any],
        _count: { id: true },
        where: { timestamp: { gte: start, lte: end }, success: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    const successMap = new Map<string, number>();
    successRows.forEach((row) => {
      const key = (row[dimension as any] as string | null | undefined) || '';
      successMap.set(key, row._count.id);
    });

    return allRows
      .map((row) => {
        const rawValue = row[dimension as any] as string | null | undefined;
        const normalizedValue = dimension === 'country'
          ? normalizeCountryName(rawValue)
          : rawValue?.trim() || null;

        if (!normalizedValue) return null;

        const count = row._count.id;
        const successCount = successMap.get(rawValue || '') || 0;

        return {
          name: normalizedValue,
          exports: count,
          successRate: count > 0 ? Math.round((successCount / count) * 1000) / 10 : 100,
          avgLatency: Math.round((row._avg.generationDuration || 0) * 100) / 100
        };
      })
      .filter((item): item is { name: string; exports: number; successRate: number; avgLatency: number } => !!item);
  } catch (error) {
    console.error(`[Analytics] getDimensionPerformanceBreakdown failed for ${dimension}:`, error);
    return [];
  }
}

export async function getLocationPerformanceBreakdown(range: string): Promise<Array<{ name: string; exports: number; successRate: number; avgLatency: number }>> {
  const { start, end } = resolveTimeRange(range);

  try {
    const [allRows, successRows] = await Promise.all([
      db.exportEvent.groupBy({
        by: ['city', 'country'],
        _count: { id: true },
        _avg: { generationDuration: true },
        where: { timestamp: { gte: start, lte: end } },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      db.exportEvent.groupBy({
        by: ['city', 'country'],
        _count: { id: true },
        where: { timestamp: { gte: start, lte: end }, success: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    const successMap = new Map<string, number>();
    successRows.forEach((row) => {
      const key = `${row.city || ''}__${row.country || ''}`;
      successMap.set(key, row._count.id);
    });

    return allRows
      .map((row) => {
        const name = formatLocationLabel(row.city, row.country);
        if (!name) return null;

        const count = row._count.id;
        const successCount = successMap.get(`${row.city || ''}__${row.country || ''}`) || 0;

        return {
          name,
          exports: count,
          successRate: count > 0 ? Math.round((successCount / count) * 1000) / 10 : 100,
          avgLatency: Math.round((row._avg.generationDuration || 0) * 100) / 100
        };
      })
      .filter((item): item is { name: string; exports: number; successRate: number; avgLatency: number } => !!item);
  } catch (error) {
    console.error('[Analytics] getLocationPerformanceBreakdown failed:', error);
    return [];
  }
}

interface OverviewSnapshot {
  visitorsCount: number;
  sessionsCount: number;
  exportsCount: number;
  conversionRate: number;
  returningVisitorsRate: number;
  avgDuration: number;
  successRate: number;
}

export async function getOverviewSnapshot(range: string, bounds?: { start: Date; end: Date }): Promise<OverviewSnapshot> {
  const { start, end } = bounds || resolveTimeRange(range);

  const [visitors, sessions, exportsCount, successCount, avgDurationResult, returningCount] = await Promise.all([
    db.visitor.count({ where: { lastVisit: { gte: start, lte: end } } }),
    db.session.count({ where: { started: { gte: start, lte: end } } }),
    db.exportEvent.count({ where: { timestamp: { gte: start, lte: end } } }),
    db.exportEvent.count({ where: { timestamp: { gte: start, lte: end }, success: true } }),
    db.exportEvent.aggregate({
      _avg: { generationDuration: true },
      where: { timestamp: { gte: start, lte: end }, success: true }
    }),
    db.visitor.count({
      where: { lastVisit: { gte: start, lte: end }, returningVisitor: true }
    })
  ]);

  const conversionRate = sessions > 0 ? (successCount / sessions) * 100 : 0.0;
  const returningRate = visitors > 0 ? (returningCount / visitors) * 100 : 0.0;
  const successRate = exportsCount > 0 ? (successCount / exportsCount) * 100 : 100.0;

  return {
    visitorsCount: visitors,
    sessionsCount: sessions,
    exportsCount,
    conversionRate: Math.round(conversionRate * 10) / 10,
    returningVisitorsRate: Math.round(returningRate * 10) / 10,
    avgDuration: Math.round((avgDurationResult._avg.generationDuration || 0.0) * 100) / 100,
    successRate: Math.round(successRate * 10) / 10
  };
}

export async function getExportsLogs(filters: any): Promise<{ logs: any[], totalCount: number }> {
  return getExportExplorer(filters);
}

export async function getSeoPerformance(range: string = 'all-time'): Promise<any[]> {
  const { start, end } = resolveTimeRange(range);
  try {
    const grouped = await db.exportEvent.groupBy({
      by: ['normalizedReferrer'],
      _count: { id: true },
      _avg: { generationDuration: true },
      where: { timestamp: { gte: start, lte: end } },
      orderBy: { _count: { id: 'desc' } }
    });

    return grouped.map(g => ({
      referrer: g.normalizedReferrer || 'Direct',
      exports: g._count.id,
      avgLatency: Math.round((g._avg.generationDuration || 0) * 100) / 100
    }));
  } catch (error) {
    console.error('[Analytics] getSeoPerformance failed:', error);
    return [];
  }
}

/**
 * Prepare service boundaries for Google Search Console synchronization snapshots.
 */
export async function getSearchConsoleSnapshots(range: string): Promise<any[]> {
  const { start, end } = resolveTimeRange(range);
  try {
    return await db.searchConsoleSnapshot.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    console.error('[Analytics] getSearchConsoleSnapshots failed:', error);
    return [];
  }
}

/**
 * Prepare service boundaries for the Incident Alerting Framework.
 */
/**
 * Prepare service boundaries for the Incident Alerting Framework.
 */
export async function getActiveAlerts(): Promise<any[]> {
  try {
    return await db.alert.findMany({
      where: { resolved: false },
      orderBy: { timestamp: 'desc' }
    });
  } catch (error) {
    console.error('[Analytics] getActiveAlerts failed:', error);
    return [];
  }
}

/**
 * Fetch Search Console Daily Summary stats.
 */
export async function getSearchConsolePerformance(range: string): Promise<any[]> {
  const { start, end } = resolveTimeRange(range);
  try {
    return await db.searchConsoleDaily.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: 'asc' }
    });
  } catch (error) {
    console.error('[Analytics] getSearchConsolePerformance failed:', error);
    return [];
  }
}

/**
 * Fetch Search Console Top Queries.
 */
export async function getSearchConsoleQueries(range: string): Promise<any[]> {
  const { start, end } = resolveTimeRange(range);
  try {
    const data = await db.searchConsoleQuery.groupBy({
      by: ['query'],
      _sum: { clicks: true, impressions: true },
      _avg: { position: true },
      where: { date: { gte: start, lte: end } },
      orderBy: { _sum: { clicks: 'desc' } },
      take: 20
    });

    return data.map(q => {
      const clicks = q._sum.clicks || 0;
      const impressions = q._sum.impressions || 0;
      return {
        query: q.query,
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : 0,
        position: q._avg.position || 0
      };
    });
  } catch (error) {
    console.error('[Analytics] getSearchConsoleQueries failed:', error);
    return [];
  }
}

/**
 * Fetch Search Console Landing Pages.
 */
export async function getSearchConsolePages(range: string): Promise<any[]> {
  const { start, end } = resolveTimeRange(range);
  try {
    const data = await db.searchConsolePage.groupBy({
      by: ['landingPage'],
      _sum: { clicks: true, impressions: true },
      _avg: { position: true },
      where: { date: { gte: start, lte: end } },
      orderBy: { _sum: { clicks: 'desc' } },
      take: 20
    });

    return data.map(p => {
      const clicks = p._sum.clicks || 0;
      const impressions = p._sum.impressions || 0;
      return {
        landingPage: p.landingPage,
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : 0,
        position: p._avg.position || 0
      };
    });
  } catch (error) {
    console.error('[Analytics] getSearchConsolePages failed:', error);
    return [];
  }
}

