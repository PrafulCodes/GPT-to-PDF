import React from 'react';
import Card from '../../../components/Card';
import BreakdownChart from '../../../components/charts/BreakdownChart';
import { getDimensionBreakdown } from '../../../lib/db-queries';

export const revalidate = 0;

export default async function AnalyticsPage() {
  // Query all breakdowns in parallel on the server
  const [browsers, devices, operatingSystems, referrers, countries, cities] = await Promise.all([
    getDimensionBreakdown('browser'),
    getDimensionBreakdown('deviceType'),
    getDimensionBreakdown('operatingSystem'),
    getDimensionBreakdown('referrer'),
    getDimensionBreakdown('country'),
    getDimensionBreakdown('city')
  ]);

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Analytics Console</h2>
        <p className="text-xs text-neutral-600 font-mono">Conversion traffic dimensions and origin profiles.</p>
      </div>

      {/* Grid: 3 Columns for Browser, OS, Device */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <BreakdownChart data={browsers} title="Browsers" />
        </Card>
        <Card>
          <BreakdownChart data={operatingSystems} title="Operating Systems" />
        </Card>
        <Card>
          <BreakdownChart data={devices} title="Device Form Factors" />
        </Card>
      </div>

      {/* Grid: 2 Columns for Referrers and Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <BreakdownChart data={referrers} title="Traffic Sources (Referrers)" />
        </Card>
        <Card className="lg:col-span-1">
          <BreakdownChart data={countries} title="Countries of Origin" />
        </Card>
        <Card className="lg:col-span-1">
          <BreakdownChart data={cities} title="Cities of Origin" />
        </Card>
      </div>

    </div>
  );
}
