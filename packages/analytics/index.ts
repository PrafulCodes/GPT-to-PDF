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
  generationDuration: number; // overall duration in seconds
}

/**
 * Detects the client browser from User-Agent.
 */
export function detectBrowser(ua: string): string {
  if (!ua) return 'Unknown';
  const uaLower = ua.toLowerCase();
  
  if (uaLower.includes('opera') || uaLower.includes('opr/')) return 'Opera';
  if (uaLower.includes('edg/')) return 'Edge';
  if (uaLower.includes('chrome') || uaLower.includes('crios')) {
    // Make sure it's not a search engine bot identifying as Chrome
    if (uaLower.includes('googlebot') || uaLower.includes('bingbot')) {
      return 'Unknown';
    }
    return 'Chrome';
  }
  if (uaLower.includes('firefox') || uaLower.includes('fxios')) return 'Firefox';
  if (uaLower.includes('safari') && !uaLower.includes('chrome') && !uaLower.includes('android')) return 'Safari';
  
  return 'Unknown';
}

/**
 * Detects the device type (Desktop, Mobile, Tablet, Bot, Unknown) from User-Agent.
 */
export function detectDevice(ua: string): string {
  if (!ua) return 'Unknown';
  const uaLower = ua.toLowerCase();
  
  // List of common bot signatures
  const bots = [
    'bot', 'crawler', 'spider', 'googlebot', 'bingbot', 'yandexbot', 
    'slurp', 'duckduckbot', 'baiduspider', 'twitterbot', 'facebookexternalhit',
    'perplexitybot', 'chatgpt-user', 'applebot', 'ia_archiver'
  ];
  if (bots.some(bot => uaLower.includes(bot))) return 'Bot';
  
  // Check for tablets first
  if (uaLower.includes('ipad') || (uaLower.includes('android') && !uaLower.includes('mobile'))) {
    return 'Tablet';
  }
  
  // Check for mobile phones
  if (/mobi|iphone|ipod|iemobile|blackberry|webos/i.test(uaLower)) {
    return 'Mobile';
  }
  
  // Default to desktop for standard PCs
  if (uaLower.includes('win') || uaLower.includes('macintosh') || uaLower.includes('linux')) {
    return 'Desktop';
  }
  
  return 'Unknown';
}

/**
 * Detects the Operating System from User-Agent.
 */
export function detectOS(ua: string): string {
  if (!ua) return 'Unknown';
  const uaLower = ua.toLowerCase();
  
  if (uaLower.includes('win')) return 'Windows';
  if (uaLower.includes('macintosh') || uaLower.includes('mac os x')) {
    if (/iphone|ipad|ipod/.test(uaLower)) return 'iOS';
    return 'macOS';
  }
  if (uaLower.includes('android')) return 'Android';
  if (/iphone|ipad|ipod/.test(uaLower)) return 'iOS';
  if (uaLower.includes('linux')) return 'Linux';
  
  return 'Unknown';
}

/**
 * Normalizes referrer strings into categorized values:
 * Google, Google AI Overview, Bing, DuckDuckGo, Perplexity, ChatGPT, Reddit, GitHub, Direct, Unknown.
 */
export function detectReferrer(referrerUrl: string): string {
  if (!referrerUrl || referrerUrl.trim() === '') return 'Direct';
  
  try {
    const url = new URL(referrerUrl);
    const host = url.hostname.toLowerCase();
    const path = url.pathname.toLowerCase();
    const search = url.search.toLowerCase();
    
    if (host.includes('google.com')) {
      // Check if referrer indicates AI Search result pages (best effort)
      if (search.includes('google_ai_overview') || path.includes('/ai-overview') || search.includes('&sxsrf=') && search.includes('google_ai')) {
        return 'Google AI Overview';
      }
      return 'Google';
    }
    if (host.includes('bing.com')) return 'Bing';
    if (host.includes('duckduckgo.com') || host.includes('ddg.gg')) return 'DuckDuckGo';
    if (host.includes('perplexity.ai')) return 'Perplexity';
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'ChatGPT';
    if (host.includes('reddit.com')) return 'Reddit';
    if (host.includes('github.com')) return 'GitHub';
    if (referrerUrl.toLowerCase() === 'direct') return 'Direct';
    
    return 'Unknown';
  } catch {
    // If referrer URL is not a parseable URL, fall back to string matching
    const refLower = referrerUrl.toLowerCase().trim();
    if (refLower.includes('google')) return 'Google';
    if (refLower.includes('bing')) return 'Bing';
    if (refLower.includes('duckduckgo') || refLower.includes('ddg')) return 'DuckDuckGo';
    if (refLower.includes('perplexity')) return 'Perplexity';
    if (refLower.includes('chatgpt') || refLower.includes('openai')) return 'ChatGPT';
    if (refLower.includes('reddit')) return 'Reddit';
    if (refLower.includes('github')) return 'GitHub';
    if (refLower === 'direct') return 'Direct';
    
    return 'Unknown';
  }
}

/**
 * Updates or creates daily statistics in the database.
 * Computes moving averages of generation latency safely in a database transaction.
 */
export async function updateDailyStatistics(success: boolean, duration: number): Promise<void> {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0); // truncate to start of UTC day

  try {
    await db.$transaction(async (tx) => {
      const stats = await tx.dailyStatistic.findUnique({
        where: { date },
      });

      if (!stats) {
        // Create new daily row
        await tx.dailyStatistic.create({
          data: {
            date,
            totalExports: 1,
            successes: success ? 1 : 0,
            failures: success ? 0 : 1,
            avgGenerationTime: success ? duration : 0.0,
          },
        });
      } else {
        // Increment and calculate average
        const newTotal = stats.totalExports + 1;
        const newSuccesses = stats.successes + (success ? 1 : 0);
        const newFailures = stats.failures + (success ? 0 : 1);
        
        let newAvgTime = stats.avgGenerationTime;
        if (success) {
          // New average: ((old_avg * old_successes) + current_duration) / new_successes
          const totalSuccessTime = stats.avgGenerationTime * stats.successes + duration;
          newAvgTime = newSuccesses > 0 ? totalSuccessTime / newSuccesses : 0;
        }

        await tx.dailyStatistic.update({
          where: { date },
          data: {
            totalExports: newTotal,
            successes: newSuccesses,
            failures: newFailures,
            avgGenerationTime: newAvgTime,
          },
        });
      }
    });
  } catch (error) {
    console.error('[Analytics engine] Failed to update daily statistics:', error);
  }
}

/**
 * Main tracking service method. Saves export event details and aggregates metrics.
 * Runs inside strict try/catch blocks so it NEVER breaks PDF delivery pipeline.
 */
export async function trackExportEvent(data: TrackingData): Promise<void> {
  try {
    const browser = detectBrowser(data.userAgent || '');
    const deviceType = detectDevice(data.userAgent || '');
    const operatingSystem = detectOS(data.userAgent || '');
    const referrer = detectReferrer(data.referrer || '');

    // Write granular export event
    await db.exportEvent.create({
      data: {
        success: data.success,
        failureReason: data.failureReason || null,
        failureStage: data.failureStage || null,
        httpStatus: data.httpStatus || null,
        pdfSize: data.pdfSize || null,
        chatSource: data.chatSource || null,
        referrer,
        browser,
        operatingSystem,
        deviceType,
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        generationDuration: data.generationDuration,
      },
    });

    // Update aggregated daily metrics
    await updateDailyStatistics(data.success, data.generationDuration);
  } catch (error) {
    console.error('[Analytics engine] Failed to save export event:', error);
  }
}
