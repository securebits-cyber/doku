/**
 * Schema.org-Bausteine (JSON-LD) fuer die Doku.
 *
 * Bewusst schlank gehalten: nur Typen, die Suchmaschinen und Antwort-Systeme
 * tatsaechlich auswerten (Organization/WebSite zur Entitaets-Erkennung,
 * BreadcrumbList fuer die Pfadanzeige im SERP, FAQPage fuer die Frage-Seiten).
 */

export const SITE_URL = 'https://docs.sentrymail.de';

/** Kanonische URL des Produkts (Marketing-Auftritt, nicht die Doku). */
const PRODUCT_URL = 'https://sentrymail.de';
const GITHUB_URL = 'https://github.com/securebits-cyber';

type Lang = 'de' | 'en';

const abs = (path: string) => new URL(path, SITE_URL).href;

/** `@id`-Anker, damit die Knoten seitenuebergreifend dieselbe Entitaet meinen. */
const ORG_ID = `${PRODUCT_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
	return {
		'@type': 'Organization',
		'@id': ORG_ID,
		name: 'SentryMail',
		url: PRODUCT_URL,
		logo: abs('/favicon-512.png'),
		sameAs: [GITHUB_URL],
	};
}

export function websiteSchema(lang: Lang) {
	return {
		'@type': 'WebSite',
		'@id': SITE_ID,
		url: SITE_URL,
		name: lang === 'de' ? 'SentryMail Dokumentation' : 'SentryMail Documentation',
		inLanguage: lang,
		publisher: { '@id': ORG_ID },
	};
}

/**
 * Die Plattform selbst. Gibt Suchmaschinen die Produktkategorie, die Lizenz
 * und die Betriebsform mit — relevant fuer Vergleichs- und "self-hosted"-Suchen.
 */
export function softwareApplicationSchema(lang: Lang) {
	const de = lang === 'de';
	return {
		'@type': 'SoftwareApplication',
		name: 'SentryMail',
		url: PRODUCT_URL,
		applicationCategory: 'SecurityApplication',
		applicationSubCategory: de
			? 'Phishing-Simulation und Security Awareness'
			: 'Phishing simulation and security awareness',
		operatingSystem: 'Linux (Docker)',
		license: 'https://www.mozilla.org/en-US/MPL/2.0/',
		softwareRequirements: 'Docker Engine 24+, Docker Compose v2',
		inLanguage: lang,
		description: de
			? 'Selbstgehostete Open-Core-Plattform fuer Phishing-Awareness: simulierte Kampagnen planen, versenden und pro Empfaenger auswerten, inklusive Schulungen und Nachweisen.'
			: 'Self-hosted open-core platform for phishing awareness: plan, send and evaluate simulated campaigns per recipient, including training and evidence.',
		publisher: { '@id': ORG_ID },
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'EUR',
			description: de
				? 'Open-Core-Kern unter MPL-2.0; Business- und Enterprise-Add-ons kostenpflichtig.'
				: 'Open-core under MPL-2.0; Business and Enterprise add-ons are commercial.',
		},
	};
}

/** Home -> Seite. Zwischenebenen haben keine eigene URL und bleiben daher aussen vor. */
export function breadcrumbSchema(opts: {
	homeUrl: string;
	homeName: string;
	pageUrl: string;
	pageName: string;
}) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: opts.homeName, item: opts.homeUrl },
			{ '@type': 'ListItem', position: 2, name: opts.pageName, item: opts.pageUrl },
		],
	};
}

/** Reduziert Markdown/HTML auf lesbaren Fliesstext fuer `acceptedAnswer.text`. */
function toPlainText(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/(\*\*|__)(.*?)\1/g, '$2')
		.replace(/(^|\s)[*_]([^*_]+)[*_]/g, '$1$2')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/^\s*>\s?/gm, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Liest die Q&A-Paare aus dem Markdown der FAQ-Seiten. Die Fragen stehen dort
 * als aufklappbare `<details>`-Bloecke, die Frage im `<summary>` — daraus
 * waechst die Auszeichnung ohne Doppelpflege mit.
 */
export function faqSchemaFromMarkdown(body: string, pageUrl: string) {
	const blocks = body.matchAll(
		/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g
	);

	const entities = [...blocks]
		.map((m) => ({ q: toPlainText(m[1]!), a: toPlainText(m[2]!) }))
		.filter(({ q, a }) => q.length > 0 && a.length > 0)
		.map(({ q, a }) => ({
			'@type': 'Question',
			name: q,
			acceptedAnswer: { '@type': 'Answer', text: a },
		}));

	if (entities.length === 0) return undefined;

	return {
		'@type': 'FAQPage',
		'@id': `${pageUrl}#faq`,
		url: pageUrl,
		mainEntity: entities,
	};
}

/** Fasst mehrere Knoten zu einem `@graph` zusammen. */
export function jsonLdGraph(nodes: unknown[]) {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': nodes.filter(Boolean),
	});
}
