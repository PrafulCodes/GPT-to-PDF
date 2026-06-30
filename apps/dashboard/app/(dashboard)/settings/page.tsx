import React from 'react';
import Card from '../../../components/Card';
import { checkDbStatus } from '../../../lib/db-queries';

export const revalidate = 0;

export default async function SettingsPage() {
  const dbStatus = await checkDbStatus();

  // Check Redis variables configuration
  const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  const redisStatus = hasRedisConfig ? 'ACTIVE' : 'NOT_CONFIGURED';

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Settings Console</h2>
        <p className="text-xs text-neutral-600 font-mono">Manage credential parameters and platform security.</p>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* System Version Matrix */}
        <Card title="System Diagnostics" subtitle="SYS_INFO_LEAF">
          <div className="divide-y divide-neutral-900 font-mono text-xs mt-4">
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500 uppercase">Console Version</span>
              <span className="text-white">v1.1.0-alpha</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500 uppercase">Web Engine</span>
              <span className="text-white">NextJS v15.5.18</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500 uppercase">Deploy Environment</span>
              <span className="text-white uppercase">{process.env.NODE_ENV || 'production'}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500 uppercase">Database Status</span>
              <span className={dbStatus === 'CONNECTED' ? 'text-white' : 'text-neutral-500'}>
                {dbStatus}
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500 uppercase">Abuse Redis Engine</span>
              <span className="text-white">{redisStatus}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-neutral-500 uppercase">Telemetry Engine</span>
              <span className="text-white">ACTIVE (try/catch isolated)</span>
            </div>
          </div>
        </Card>

        {/* Future API Keys placeholder */}
        <Card title="Security Credentials" subtitle="CRED_MGMT">
          <div className="space-y-4 text-xs font-mono text-neutral-500 mt-4 leading-relaxed">
            <p>
              Admin secrets, dashboard credentials, and database connection strings are read securely from host environment variables.
            </p>
            <p>
              Future capabilities will support:
              <br />• Dashboard password rotation tokens.
              <br />• Multi-tier developer CLI tokens.
              <br />• API webhook signing keys.
            </p>
            <div className="border border-dashed border-neutral-800 p-2.5 rounded text-[10px] text-center uppercase tracking-widest text-neutral-600">
              SECRET_STORAGE_UNSUPPORTED_ON_CLIENT
            </div>
          </div>
        </Card>
      </div>

      {/* Danger Zone placeholder */}
      <Card className="border-neutral-900 hover:border-neutral-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-neutral-500 font-mono text-xs">[!]</span>
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Danger Zone</h3>
        </div>
        <p className="text-xs text-neutral-500 font-mono mb-4">
          Actions performed here are permanent and cannot be undone. Exercise caution.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="px-3 py-1.5 text-[10px] font-mono uppercase border border-neutral-900 text-neutral-600 rounded bg-black cursor-not-allowed"
          >
            Flush Event Table
          </button>
          <button
            disabled
            className="px-3 py-1.5 text-[10px] font-mono uppercase border border-neutral-900 text-neutral-600 rounded bg-black cursor-not-allowed"
          >
            Reset Daily Statistics
          </button>
          <button
            disabled
            className="px-3 py-1.5 text-[10px] font-mono uppercase border border-neutral-900 text-neutral-600 rounded bg-black cursor-not-allowed"
          >
            Download Database Backup
          </button>
        </div>
      </Card>

    </div>
  );
}
