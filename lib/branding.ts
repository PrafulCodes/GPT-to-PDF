const defaultSiteUrl = 'https://gpt-to-pdf-six.vercel.app';

function normalizeSiteUrl(value: string) {
	if (value.startsWith('http://') || value.startsWith('https://')) {
		return value;
	}

	return `https://${value}`;
}

export const siteUrl = normalizeSiteUrl(
	process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.VERCEL_URL ||
		defaultSiteUrl
);
export const siteHost = new URL(siteUrl).host;
export const creatorName = 'Praful Mohite';
export const creatorUrl = 'https://www.linkedin.com/in/praful-mohite/';
