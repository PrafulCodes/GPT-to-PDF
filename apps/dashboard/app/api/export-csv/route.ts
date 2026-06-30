import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@repo/db';
import { verifySession } from '../../../lib/session';
import { logAudit, logError } from '../../../lib/logger';

export const runtime = 'nodejs';

/**
 * Escapes standard cell values for CSV formatting (RFC-4180 compliant).
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const escaped = str.replace(/"/g, '""');
  // Wrap cells containing commas, double quotes, or newlines in double quotes
  if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') || escaped.includes('\r')) {
    return `"${escaped}"`;
  }
  return escaped;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown';
  
  // 1. Authorize requested session
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      logAudit('CSV_EXPORT_UNAUTHORIZED', ip, { reason: 'Missing session cookie token.' });
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload || payload.role !== 'admin') {
      logAudit('CSV_EXPORT_UNAUTHORIZED', ip, { reason: 'Session validation token signature is invalid.' });
      return new Response('Unauthorized', { status: 401 });
    }
  } catch (error) {
    logError('CSV_EXPORT_AUTH_EXCEPTION', error, ip);
    return new Response('Internal Server Error', { status: 500 });
  }

  // 2. Parse active query parameters
  const { searchParams } = req.nextUrl;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const device = searchParams.get('device') || 'all';
  const browser = searchParams.get('browser') || 'all';
  const dateRange = searchParams.get('date') || 'all';

  try {
    // 3. Compile filters identical to the exports page
    const where: any = {};

    if (status === 'success') where.success = true;
    if (status === 'failed') where.success = false;

    if (device !== 'all') {
      where.deviceType = { equals: device, mode: 'insensitive' };
    }

    if (browser !== 'all') {
      where.browser = { equals: browser, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { referrer: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { failureReason: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateRange !== 'all') {
      const now = new Date();
      if (dateRange === 'today') {
        const startOfToday = new Date(now);
        startOfToday.setUTCHours(0, 0, 0, 0);
        where.timestamp = { gte: startOfToday };
      } else if (dateRange === '7d') {
        const startOf7d = new Date(now);
        startOf7d.setUTCDate(now.getUTCDate() - 7);
        startOf7d.setUTCHours(0, 0, 0, 0);
        where.timestamp = { gte: startOf7d };
      } else if (dateRange === '30d') {
        const startOf30d = new Date(now);
        startOf30d.setUTCDate(now.getUTCDate() - 30);
        startOf30d.setUTCHours(0, 0, 0, 0);
        where.timestamp = { gte: startOf30d };
      }
    }

    // Query event rows (limited to 5000 rows for memory protection)
    const events = await db.exportEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 5000
    });

    // 4. Construct CSV Body
    const headers = [
      'ID',
      'Timestamp (UTC)',
      'Success',
      'FailureReason',
      'FailureStage',
      'HTTPStatus',
      'PDFSize (Bytes)',
      'ChatSource',
      'Referrer',
      'Browser',
      'OS',
      'DeviceType',
      'Country',
      'City',
      'Latency (Seconds)'
    ];

    const csvRows = [headers.join(',')];

    for (const ev of events) {
      const row = [
        ev.id,
        ev.timestamp.toISOString(),
        ev.success ? 'TRUE' : 'FALSE',
        ev.failureReason || '',
        ev.failureStage || '',
        ev.httpStatus || '',
        ev.pdfSize || '',
        ev.chatSource || '',
        ev.referrer,
        ev.browser,
        ev.operatingSystem,
        ev.deviceType,
        ev.country,
        ev.city,
        ev.generationDuration
      ];
      csvRows.push(row.map(escapeCsv).join(','));
    }

    const csvString = csvRows.join('\r\n');

    logAudit('CSV_EXPORT_DOWNLOADED', ip, {
      filters: { search, status, device, browser, dateRange },
      recordsCount: events.length
    });

    // Return the response file
    return new Response(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="export_events.csv"',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    logError('CSV_EXPORT_QUERY_EXCEPTION', error, ip);
    return new Response('Error compiling CSV document.', { status: 500 });
  }
}
