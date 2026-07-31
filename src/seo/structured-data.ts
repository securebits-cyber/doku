/**
 * Schema.org-Bausteine (JSON-LD) fuer die Doku.
 *
 * Bewusst schlank gehalten: nur Typen, die Suchmaschinen und Antwort-Systeme
 * tatsaechlich auswerten (Organization/WebSite zur Entitaets-Erkennung,
 * BreadcrumbList fuer die Pfadanzeige im SERP, FAQPage fuer die Frage-Seiten).
 */

export const SITE_URL = 'https://docs.humanshield.app';

/** Kanonische URL des Projekts (Produkt-/Organisationsseite, nicht die Doku). */
const PROJECT_URL = 'https://humanshield.app';
const GITHUB_URL = 'https://github.com/HumanShield-Awareness';

type Lang = 'de' | 'en';

const abs = (path: string) => new URL(path, SITE_URL).href;

/** `@id`-Anker, damit die Knoten seitenuebergreifend dieselbe Entitaet meinen. */
const ORG_ID = `${PROJECT_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
	return {
		'@type': 'Organization',
		'@id': ORG_ID,
		name: 'HumanShield.APP',
		url: PROJECT_URL,
		logo: abs('/favicon-512.png'),
		sameAs: [GITHUB_URL],
	};
}

export function websiteSchema(lang: Lang) {
	return {
		'@type': 'WebSite',
		'@id': SITE_ID,
		url: SITE_URL,
		name: lang === 'de' ? 'HumanShield.APP Dokumentation' : 'HumanShield.APP Documentation',
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
		name: 'HumanShield.APP',
		url: PROJECT_URL,
		applicationCategory: 'SecurityApplication',
		applicationSubCategory: de
			? 'Phishing-Simulation und Security Awareness'
			: 'Phishing simulation and security awareness',
		operatingSystem: 'Linux (Docker)',
		license: 'https://www.mozilla.org/en-US/MPL/2.0/',
		softwareRequirements: 'Docker Engine 24+, Docker Compose v2',
		inLanguage: lang,
		description: de
			? 'Selbstgehostete Open-Core-Plattform fuer Phishing-Awareness: simulierte Phishing-Kampagnen planen, versenden und pro Empfaenger auswerten.'
			: 'Self-hosted open-core platform for phishing awareness: plan, send and evaluate simulated phishing campaigns per recipient.',
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

/** Reduziert Markdown auf lesbaren Fliesstext fuer `acceptedAnswer.text`. */
function markdownToText(md: string): string {
	return md
		.replace(/```[\s\S]*?```/g, ' ')
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
 * Liest die Q&A-Paare aus dem Markdown der FAQ-Seiten. Die Seiten folgen dem
 * Muster "**Frage?**" gefolgt vom Antworttext bis zur naechsten Frage, damit
 * die Auszeichnung ohne Doppelpflege mitwaechst.
 */
export function faqSchemaFromMarkdown(body: string, pageUrl: string) {
	const withoutFrontmatter = body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
	const pattern = /^\*\*(.+?)\*\*\s*$/gm;

	const questions: { q: string; start: number; end: number }[] = [];
	for (const match of withoutFrontmatter.matchAll(pattern)) {
		const start = match.index! + match[0].length;
		if (questions.length > 0) questions[questions.length - 1]!.end = match.index!;
		questions.push({ q: match[1]!.trim(), start, end: withoutFrontmatter.length });
	}

	const entities = questions
		.map(({ q, start, end }) => ({
			q,
			a: markdownToText(withoutFrontmatter.slice(start, end)),
		}))
		.filter(({ q, a }) => a.length > 0 && q.length > 0)
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
