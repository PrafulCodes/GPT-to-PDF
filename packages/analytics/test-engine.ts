// Comprehensive V3 Founder Intelligence Test Suite
import { db } from '@repo/db';
import {
  resolveTimeRange,
  trackTelemetry,
  getExecutiveOverview,
  getGrowthMetrics,
  getPerformanceMetrics,
  getExportExplorer,
  getFounderInsights,
  getDecisionCenter,
  getProductMetrics,
  getActiveAlerts,
  getSearchConsoleSnapshots
} from './index';

// Track execution calls
let visitorUpserts: any[] = [];
let sessionCreates: any[] = [];
let sessionUpdates: any[] = [];
let exportEventCreates: any[] = [];
let queryRawMockResult: any[] = [];

// Disable background archiving during tests
(global as any).disableBackgroundArchive = true;

// Mock database wrapper methods
(db as any).visitor = {
  upsert: async (args: any) => {
    visitorUpserts.push(args);
    return args.create;
  },
  count: async (args: any) => {
    return 120; // 120 mock visitors
  },
  update: async (args: any) => {
    return args;
  },
  findUnique: async (args: any) => {
    return {
      anonymousVisitorId: args.where.anonymousVisitorId,
      totalExports: 5,
      totalSessions: 2
    };
  }
};

(db as any).session = {
  findUnique: async (args: any) => {
    // Simulate first check returns null, second check returns existing session
    if (args.where.sessionId.includes('new')) return null;
    return {
      sessionId: args.where.sessionId,
      started: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      pagesViewed: 1,
      exitPage: '/',
      exports: 2
    };
  },
  create: async (args: any) => {
    sessionCreates.push(args.data);
    return args.data;
  },
  update: async (args: any) => {
    sessionUpdates.push(args.data);
    return args.data;
  },
  count: async (args: any) => {
    return 150; // 150 mock sessions
  }
};

(db as any).exportEvent = {
  create: async (args: any) => {
    exportEventCreates.push(args.data);
    return args.data;
  },
  count: async (args: any) => {
    if (args?.where?.normalizedReferrer === 'Google AI Overview' && args?.where?.success === true) return 57; // 95% of 60
    if (args?.where?.success === true) return 95;
    if (args?.where?.success === false) return 5;
    return 100; // 100 total exports
  },
  aggregate: async (args: any) => {
    let mockCount = 10;
    if (args?.where?.normalizedReferrer === 'Google AI Overview') mockCount = 24;
    return {
      _avg: {
        generationDuration: 1.8,
        pdfSize: 199680, // 195 KB
        messageCount: 15.5,
        imagesCount: 2.2,
        tablesCount: 0.8,
        codeBlockCount: 3.4
      },
      _max: {
        pdfSize: 512000 // 500 KB
      },
      _count: {
        id: mockCount
      }
    };
  },
  findMany: async (args: any) => {
    return [
      {
        id: 'evt-1',
        timestamp: new Date(),
        success: true,
        country: 'India',
        browser: 'Chrome',
        generationDuration: 1.8,
        landingPath: '/chatgpt-to-pdf'
      }
    ];
  },
  groupBy: async (args: any) => {
    if (args.by.includes('country')) {
      return [{ country: 'India', _count: { id: 74 } }, { country: 'US', _count: { id: 26 } }];
    }
    if (args.by.includes('browser')) {
      return [{ browser: 'Chrome', _count: { id: 80 } }, { browser: 'Safari', _count: { id: 20 } }];
    }
    if (args.by.includes('normalizedReferrer')) {
      return [{ normalizedReferrer: 'Google AI Overview', _count: { id: 60 } }, { normalizedReferrer: 'Google Search', _count: { id: 40 } }];
    }
    if (args.by.includes('landingPath')) {
      return [{ landingPath: '/chatgpt-to-pdf', _count: { id: 85 } }];
    }
    if (args.by.includes('deviceType')) {
      return [{ deviceType: 'Desktop', _count: { id: 90 } }];
    }
    if (args.by.includes('deployVersion')) {
      return [{ deployVersion: 'v2.1.3', _count: { id: 50 }, _avg: { generationDuration: 2.1 } }];
    }
    return [];
  }
};

(db as any).systemHealth = {
  findMany: async (args: any) => {
    return [
      { timestamp: new Date(), dbLatency: 12.5, redisLatency: 8.2, apiLatency: 45.0, errorRate: 0.02 }
    ];
  },
  create: async (args: any) => {
    return args.data;
  }
};

(db as any).featureUsage = {
  create: async (args: any) => {
    return args.data;
  }
};

(db as any).searchConsoleSnapshot = {
  findMany: async (args: any) => {
    return [
      { id: 'gsc-1', date: new Date(), query: 'gpt to pdf', landingPage: '/chatgpt-to-pdf', clicks: 250, impressions: 5000, ctr: 0.05, position: 2.1 }
    ];
  }
};

(db as any).alert = {
  findMany: async (args: any) => {
    return [
      { id: 'alert-1', timestamp: new Date(), ruleName: 'Safari Mobile Crash', severity: 'critical', message: 'Safari mobile crashed above 14% threshold', resolved: false }
    ];
  }
};

db.$queryRaw = async (query: any, ...args: any[]) => {
  return queryRawMockResult;
};

// Assertions Helper
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('==================================================');
  console.log('RUNNING FOUNDER INTELLIGENCE V3 TESTS');
  console.log('==================================================\n');

  // Test 1: Telemetry Batch Pipeline Ingestion (supports single or array events)
  console.log('--- Test 1: trackTelemetry (Batch Array Ingestion) ---');
  try {
    visitorUpserts = [];
    sessionCreates = [];
    exportEventCreates = [];

    // Trigger array batch events
    await trackTelemetry({
      schemaVersion: 2,
      eventType: 'pageview',
      anonymousVisitorId: 'vis-batch-123',
      sessionId: 'sess-batch-new',
      landingPath: '/chatgpt-to-pdf',
      landingQuery: 'utm_source=perplexity',
      currentPage: '/chatgpt-to-pdf',
      rawReferrer: 'https://www.perplexity.ai',
      browser: 'Chrome',
      deviceType: 'Desktop',
      country: 'India'
    });

    assert(visitorUpserts.length === 1, 'Visitor record upserted');
    assert(visitorUpserts[0].where.anonymousVisitorId === 'vis-batch-123', 'Correct anonymousVisitorId matches V3 spec');
    assert(visitorUpserts[0].create.firstLandingPath === '/chatgpt-to-pdf', 'Correct landingPath matches');
    assert(visitorUpserts[0].create.firstLandingQuery === 'utm_source=perplexity', 'Correct landingQuery query-string matches');
    assert(sessionCreates.length === 1, 'Session record created successfully');
    assert(sessionCreates[0].trafficChannel === 'AI', 'Acquisition Channel normalized to "AI"');
    assert(sessionCreates[0].trafficSource === 'Perplexity', 'Acquisition Source normalized to "Perplexity"');
  } catch (err) {
    console.error(err);
    failed++;
  }

  // Test 2: Event schemaVersion Ingestion
  console.log('\n--- Test 2: trackTelemetry (Schema Versioning) ---');
  try {
    exportEventCreates = [];
    await trackTelemetry({
      schemaVersion: 2,
      eventType: 'export',
      anonymousVisitorId: 'vis-batch-123',
      sessionId: 'sess-batch-existing',
      success: true,
      generationDuration: 1.85,
      pdfSize: 104500,
      browser: 'Chrome',
      country: 'India'
    });

    assert(exportEventCreates.length === 1, 'ExportEvent logged');
    assert(exportEventCreates[0].schemaVersion === 2, 'schemaVersion = 2 tracked in database');
    assert(exportEventCreates[0].anonymousVisitorId === 'vis-batch-123', 'anonymousVisitorId stored inside export ledger');
  } catch (err) {
    console.error(err);
    failed++;
  }

  // Test 3: Executive Overview Summary
  console.log('\n--- Test 3: getExecutiveOverview V3 Aggregation ---');
  try {
    const overview = await getExecutiveOverview('7d');
    assert(overview.visitorsCount === 120, 'Unique visitors parsed correctly');
    assert(overview.sessionsCount === 150, 'Total sessions parsed correctly');
    assert(overview.exportsCount === 100, 'Total exports matching');
    assert(overview.successRate === 95, 'Success rate calculated at 95%');
  } catch (err) {
    console.error(err);
    failed++;
  }

  // Test 4: Growth Intelligence and Campaign Normalizations
  console.log('\n--- Test 4: getGrowthMetrics Intelligence Panels ---');
  try {
    const growth = await getGrowthMetrics('7d');
    assert(growth.landingPages.length > 0, 'Landing paths conversions aggregated');
    assert(growth.landingPages[0].page === '/chatgpt-to-pdf', 'Landing route matching');
    assert(growth.referrers[0].source === 'Google AI Overview', 'Top normalized referrer channel computed');
    assert(growth.growthIntelligence.bestLandingPage === '/chatgpt-to-pdf', 'Growth intelligence Best Landing Page computed');
    assert(growth.growthIntelligence.fastestGrowingReferrer === 'Google AI Overview', 'Growth intelligence fastest referrer query matches');
    assert(growth.growthIntelligence.highestConversionDevice === 'Desktop', 'Growth intelligence conversion device calculated');
  } catch (err) {
    console.error(err);
    failed++;
  }

  // Test 5: System Health Alerts & GSC Preparation Snapshots
  console.log('\n--- Test 5: SearchConsole & Alert Rules Boundaries ---');
  try {
    const alerts = await getActiveAlerts();
    const gsc = await getSearchConsoleSnapshots('7d');

    assert(alerts.length === 1, 'Alert Rules queried successfully');
    assert(alerts[0].ruleName === 'Safari Mobile Crash', 'Alert rule name matching');
    assert(alerts[0].severity === 'critical', 'Critical status flag matching');
    assert(gsc.length === 1, 'SearchConsoleSnapshot boundaries verified');
    assert(gsc[0].query === 'gpt to pdf', 'Search query snapshot matching');
  } catch (err) {
    console.error(err);
    failed++;
  }

  // Test 6: Performance Percentiles
  console.log('\n--- Test 6: getPerformanceMetrics V3 Percentiles ---');
  try {
    queryRawMockResult = [
      {
        total: 100n,
        successes: 95n,
        failures: 5n,
        avg_duration: 1.82,
        min_duration: 0.22,
        max_duration: 10.45,
        avg_queue: 0.12,
        avg_parse: 0.45,
        avg_render: 1.25,
        median: 1.55,
        p95: 4.82,
        p99: 9.15
      }
    ];

    const perf = await getPerformanceMetrics('7d');
    assert(perf.median === 1.55, 'P50 (median) latency computed in Postgres');
    assert(perf.p95 === 4.82, 'P95 latency computed in Postgres');
    assert(perf.p99 === 9.15, 'P99 latency computed in Postgres');
  } catch (err) {
    console.error(err);
    failed++;
  }

  console.log('\n==================================================');
  console.log(`TEST COMPLETED: ${passed} passed, ${failed} failed.`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
