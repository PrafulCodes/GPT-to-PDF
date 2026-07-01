export const GOOGLE_SEARCH_CONSOLE_API_BASE_URL = 'https://searchconsole.googleapis.com/webmasters/v3';

export interface GoogleSearchConsoleSiteProperty {
  siteUrl: string;
  permissionLevel?: string;
}

export function normalizeGoogleSearchConsoleProperty(property: string): string {
  return property.trim();
}

export function buildGoogleSearchConsoleSiteResource(property: string): string {
  return `${GOOGLE_SEARCH_CONSOLE_API_BASE_URL}/sites/${encodeURIComponent(normalizeGoogleSearchConsoleProperty(property))}`;
}
