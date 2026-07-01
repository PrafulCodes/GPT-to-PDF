import SettingsConsole from '../_components/SettingsConsole';

export const revalidate = 0;

interface PageProps {
  searchParams?: Promise<{
    google?: string;
    reason?: string;
  }>;
}

export default async function SettingsIntegrationsPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {};

  const integrationNotice =
    params.google === 'connected'
      ? {
          tone: 'success' as const,
          message: 'Google Search Console connected successfully. Refresh token stored securely.',
        }
      : params.google === 'error'
        ? {
            tone: 'error' as const,
            message: `Google Search Console connection failed. ${params.reason ? `Reason: ${params.reason}.` : ''}`.trim(),
          }
        : null;

  return <SettingsConsole integrationNotice={integrationNotice} />;
}
