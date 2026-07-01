import React from 'react';
import Card from '../../../../components/Card';
import { checkDbStatus } from '@repo/analytics';
import { getGoogleIntegrationStatus } from '../../../../lib/google';

export const revalidate = 0;

type IntegrationNotice =
  | {
      tone: 'success';
      message: string;
    }
  | {
      tone: 'error';
      message: string;
    };

interface SettingsConsoleProps {
  integrationNotice?: IntegrationNotice | null;
}

function StatusBadge({ children, tone }: { children: React.ReactNode; tone: 'neutral' | 'success' | 'danger' }) {
  const toneClasses = {
    neutral: 'border-neutral-800 text-white bg-neutral-950/60',
    success: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40',
    danger: 'border-red-500/30 text-red-300 bg-red-950/40',
  } as const;

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-[0.24em] ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

function SettingsRow({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'success' | 'danger' }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <span className="text-neutral-500 uppercase">{label}</span>
      <StatusBadge tone={tone}>{value}</StatusBadge>
    </div>
  );
}

export default async function SettingsConsole({ integrationNotice }: SettingsConsoleProps) {
  const dbStatus = await checkDbStatus();
  const googleStatus = await getGoogleIntegrationStatus();

  const hasRedisConfig = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  const redisStatus = hasRedisConfig ? 'ACTIVE' : 'NOT_CONFIGURED';
  const isGoogleConnected = googleStatus.connectionStatus === 'CONNECTED';
  const connectLabel = isGoogleConnected ? 'Reconnect' : 'Connect';

  return (
    <div className="space-y-6 md:space-y-8 select-none">
      <div className="space-y-1">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Settings Console</h2>
        <p className="text-xs text-neutral-600 font-mono">Manage credential parameters, platform security, and admin integrations.</p>
      </div>

      {integrationNotice ? (
        <div
          className={`border rounded px-4 py-3 font-mono text-xs ${
            integrationNotice.tone === 'success'
              ? 'border-emerald-500/25 bg-emerald-950/25 text-emerald-200'
              : 'border-red-500/25 bg-red-950/25 text-red-200'
          }`}
        >
          {integrationNotice.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <span className={dbStatus === 'CONNECTED' ? 'text-white' : 'text-neutral-500'}>{dbStatus}</span>
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

        <Card className="md:col-span-2 border-neutral-900 hover:border-neutral-800">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-neutral-500 font-mono text-xs">[+]</span>
            <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Integrations</h3>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white">Google Search Console</h4>
              <p className="text-xs text-neutral-500 font-mono leading-relaxed">
                Dedicated admin OAuth foundation for Search Console access. Sync is not enabled yet.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-0 divide-y divide-neutral-900 font-mono text-xs">
              <SettingsRow
                label="Connection Status"
                value={isGoogleConnected ? 'Connected' : 'Not Connected'}
                tone={isGoogleConnected ? 'success' : 'neutral'}
              />
              <SettingsRow label="Last Sync" value={googleStatus.lastSyncLabel} />
              <SettingsRow
                label="Refresh Token Available"
                value={googleStatus.refreshTokenAvailable ? 'Yes' : 'No'}
                tone={googleStatus.refreshTokenAvailable ? 'success' : 'danger'}
              />
              <SettingsRow label="Site Property" value={googleStatus.siteProperty} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href="/api/auth/google"
              className="py-2 px-4 rounded text-xs font-mono uppercase tracking-wider transition-all focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-offset-black bg-white text-black border border-white hover:bg-neutral-200 active:bg-neutral-300"
            >
              {connectLabel}
            </a>
            <a
              href="/api/auth/google"
              className="py-2 px-4 rounded text-xs font-mono uppercase tracking-wider transition-all focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-offset-black bg-black text-neutral-300 border border-neutral-800 hover:text-white hover:bg-neutral-900 active:bg-neutral-950"
            >
              Reconnect
            </a>
            <button
              disabled
              className="py-2 px-4 rounded text-xs font-mono uppercase tracking-wider transition-all focus:outline-none focus:ring-1 focus:ring-neutral-500 focus:ring-offset-1 focus:ring-offset-black disabled:opacity-40 disabled:cursor-not-allowed text-center bg-black text-neutral-300 border border-neutral-800"
            >
              Disconnect
            </button>
          </div>
        </Card>
      </div>

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
