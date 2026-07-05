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
    neutral: 'bg-neutral-900 text-neutral-400',
    success: 'bg-emerald-500/10 text-emerald-400',
    danger: 'bg-red-500/10 text-red-400',
  } as const;

  return (
    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

function SettingsRow({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'success' | 'danger' }) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-sm text-neutral-400">{label}</span>
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
    <div className="space-y-6">
      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-semibold text-white tracking-tight">Settings</h2>
        <p className="text-sm text-neutral-500">
          Manage system configurations, external integrations, and security controls.
        </p>
      </div>

      {integrationNotice ? (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            integrationNotice.tone === 'success'
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border border-red-500/20 bg-red-500/10 text-red-300'
          }`}
        >
          {integrationNotice.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="System Diagnostics" subtitle="SYS_INFO">
          <div className="divide-y divide-neutral-900/60 text-sm mt-4">
            <div className="flex justify-between py-3">
              <span className="text-neutral-400">Console Version</span>
              <span className="text-neutral-200 font-medium">v1.1.0-alpha</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-neutral-400">Web Engine</span>
              <span className="text-neutral-200 font-medium">NextJS v15.5.18</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-neutral-400">Deploy Environment</span>
              <span className="text-neutral-200 font-medium capitalize">{process.env.NODE_ENV || 'production'}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-neutral-400">Database Status</span>
              <span className={dbStatus === 'CONNECTED' ? 'text-emerald-400 font-medium' : 'text-neutral-500 font-medium'}>{dbStatus}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-neutral-400">Abuse Redis Engine</span>
              <span className={hasRedisConfig ? 'text-emerald-400 font-medium' : 'text-neutral-500 font-medium'}>{redisStatus}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-neutral-400">Telemetry Engine</span>
              <span className="text-emerald-400 font-medium">Active (isolated)</span>
            </div>
          </div>
        </Card>

        <Card title="Security Credentials" subtitle="CRED_MGMT">
          <div className="space-y-4 text-sm text-neutral-400 mt-4 leading-relaxed">
            <p>
              Admin secrets, dashboard credentials, and database connection strings are read securely from host environment variables.
            </p>
            <p>
              Future capabilities will support:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              <li>Dashboard password rotation tokens.</li>
              <li>Multi-tier developer CLI tokens.</li>
              <li>API webhook signing keys.</li>
            </ul>
            <div className="mt-6 rounded-lg bg-neutral-900/50 p-4 border border-neutral-800">
              <p className="text-xs text-center text-neutral-500 font-medium">
                Client-side secret storage is currently disabled.
              </p>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2">
          <div className="space-y-1 mb-6">
            <h3 className="text-base font-semibold text-white">Integrations</h3>
            <p className="text-sm text-neutral-500">
              Connect external services to enrich your dashboard telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 bg-[#0a0a0a] rounded-xl border border-neutral-900/80 p-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google Search Console
              </h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Dedicated admin OAuth foundation for Search Console access. Sync is not enabled yet.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-0 divide-y divide-neutral-900/60">
              <SettingsRow
                label="Connection Status"
                value={isGoogleConnected ? 'Connected' : 'Not Connected'}
                tone={isGoogleConnected ? 'success' : 'neutral'}
              />
              <SettingsRow label="Last Sync" value={googleStatus.lastSyncLabel} />
              <SettingsRow
                label="Refresh Token"
                value={googleStatus.refreshTokenAvailable ? 'Available' : 'Unavailable'}
                tone={googleStatus.refreshTokenAvailable ? 'success' : 'danger'}
              />
              <SettingsRow label="Site Property" value={googleStatus.siteProperty} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href="/api/auth/google"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-4 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              {connectLabel}
            </a>
            {isGoogleConnected && (
              <button
                disabled
                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-4 text-sm font-medium text-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disconnect
              </button>
            )}
          </div>
        </Card>
      </div>

      <Card className="border-red-500/20 bg-red-500/5">
        <div className="space-y-1 mb-6">
          <h3 className="text-base font-semibold text-red-400">Danger Zone</h3>
          <p className="text-sm text-neutral-500">
            Actions performed here are permanent and cannot be undone. Exercise caution.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-900/30 bg-red-950/20 px-4 text-sm font-medium text-red-400/50 cursor-not-allowed transition-colors"
          >
            Flush Event Table
          </button>
          <button
            disabled
            className="inline-flex h-9 items-center justify-center rounded-lg border border-red-900/30 bg-red-950/20 px-4 text-sm font-medium text-red-400/50 cursor-not-allowed transition-colors"
          >
            Reset Daily Statistics
          </button>
          <button
            disabled
            className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 px-4 text-sm font-medium text-neutral-500 cursor-not-allowed transition-colors"
          >
            Download Database Backup
          </button>
        </div>
      </Card>
    </div>
  );
}
