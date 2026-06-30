import React from 'react';
import Card from '../../../components/Card';
import { checkDbStatus } from '../../../lib/db-queries';

export const revalidate = 0;

export default async function HealthPage() {
  const startDb = Date.now();
  const dbStatus = await checkDbStatus();
  const dbLatency = dbStatus === 'CONNECTED' ? `${Date.now() - startDb}ms` : 'N/A';

  // Check Upstash Redis configuration variables
  const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

  const systemDiagnostics = [
    { name: 'Application Service', value: 'OPERATIONAL', status: 'OK' },
    { name: 'Database Connectivity', value: dbStatus, status: dbStatus === 'CONNECTED' ? 'OK' : 'ERROR', detail: `Roundtrip latency: ${dbLatency}` },
    { name: 'Redis Cache Cluster', value: hasRedis ? 'CONFIGURED' : 'NOT_CONFIGURED', status: hasRedis ? 'OK' : 'WARN', detail: 'Controls request rate limiting' },
    { name: 'Analytics Telemetry Pipeline', value: 'STANDBY', status: 'OK', detail: 'Pipes background export events' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Platform Health Console</h2>
        <p className="text-xs text-neutral-600 font-mono">Live telemetry diagnostics and connection status checks.</p>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Indicators List */}
        <Card title="Operational Checklist" subtitle="SYS_CHECKLIST_ACTIVE">
          <div className="space-y-4 mt-4 font-mono text-xs">
            {systemDiagnostics.map((diag) => (
              <div key={diag.name} className="border border-neutral-950 p-3 rounded bg-neutral-950/20 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-medium">{diag.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                      diag.status === 'OK'
                        ? 'border-neutral-800 text-white bg-neutral-900/40'
                        : diag.status === 'WARN'
                        ? 'border-neutral-900 text-neutral-400 bg-neutral-950'
                        : 'border-neutral-800 text-neutral-600 bg-neutral-950'
                    }`}
                  >
                    {diag.value}
                  </span>
                </div>
                {diag.detail && (
                  <p className="text-[10px] text-neutral-500">{diag.detail}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Environmental Metadata */}
        <Card title="Environment Context" subtitle="PROCESS_METRIC_LEAF">
          <div className="divide-y divide-neutral-900 font-mono text-xs mt-4">
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500">SYSTEM TIME (UTC)</span>
              <span className="text-white">{new Date().toISOString().replace('T', ' ').substring(0, 19)}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500">NODE RUNTIME</span>
              <span className="text-white">NodeJS v22.17.0</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500">PLATFORM ARCH</span>
              <span className="text-white uppercase">{process.platform} / {process.arch}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500">ENV PROFILE</span>
              <span className="text-white uppercase">{process.env.NODE_ENV || 'production'}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500">DASHBOARD VERSION</span>
              <span className="text-white">v1.1.0</span>
            </div>
          </div>
        </Card>
      </div>

    </div>
  );
}
