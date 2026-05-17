import { NextResponse } from 'next/server';
import { getPdfGeneratedCount } from '../../../lib/pdf-stats';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pdfGeneratedCount = await getPdfGeneratedCount();

    return NextResponse.json({ pdfGeneratedCount }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ pdfGeneratedCount: 0 }, { headers: { 'Cache-Control': 'no-store' } });
  }
}