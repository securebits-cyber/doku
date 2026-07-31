/**
 * Starlight Route Middleware — ergaenzt den <head> um SEO-Tags, die Starlight
 * selbst nicht liefert: Social-Card-Bild, Robots-Direktiven und JSON-LD.
 *
 * Bewusst hier statt als Component-Override: `routeMiddleware` ist die
 * dokumentierte Starlight-API dafuer und bleibt bei Updates stabil.
 */
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import {
	SITE_URL,
	breadcrumbSchema,
	faqSchemaFromMarkdown,
	jsonLdGraph,
	organizationSchema,
	softwareApplicationSchema,
	websiteSchema,
} from './seo/structured-data';

type Lang = 'de' | 'en';

/** Social-Card je Sprache — 1200x630, liegt in `public/`. */
const OG_IMAGE: Record<Lang, string> = {
	de: '/og-de.png',
	en: '/og-en.png',
};

const OG_IMAGE_ALT: Record<Lang, string> = {
	de: 'HumanShield.APP Dokumentation – Phishing-Awareness, selbst gehostet',
	en: 'HumanShield.APP documentation – phishing awareness, self-hosted',
};

const HOME_NAME: Record<Lang, string> = {
	de: 'HumanShield.APP Dokumentation',
	en: 'HumanShield.APP Documentation',
};

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	const { head, entry, id } = route;

	const lang: Lang = route.lang?.startsWith('en') ? 'en' : 'de';
	const isHome = id === '' || id === 'en' || id === 'index' || id === 'en/index';

	// Kanonische URL: bevorzugt die, die Starlight bereits berechnet hat.
	const canonical =
		head.find((tag) => tag.tag === 'link' && tag.attrs?.rel === 'canonical')?.attrs?.href ??
		new URL(context.url.pathname, SITE_URL).href;
	const pageUrl = String(canonical);
	const homeUrl = new URL(lang === 'en' ? '/en/' : '/', SITE_URL).href;

	// --- Social Card -------------------------------------------------------
	// Starlight setzt `twitter:card: summary_large_image`, liefert aber kein
	// Bild; ohne og:image bliebe die Karte leer.
	const imageUrl = new URL(OG_IMAGE[lang], SITE_URL).href;
	head.push(
		{ tag: 'meta', attrs: { property: 'og:image', content: imageUrl } },
		{ tag: 'meta', attrs: { property: 'og:image:type', content: 'image/png' } },
		{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
		{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
		{ tag: 'meta', attrs: { property: 'og:image:alt', content: OG_IMAGE_ALT[lang] } },
		{ tag: 'meta', attrs: { name: 'twitter:image', content: imageUrl } },
		{ tag: 'meta', attrs: { name: 'twitter:image:alt', content: OG_IMAGE_ALT[lang] } }
	);

	// --- Crawler-Direktiven ------------------------------------------------
	// `max-image-preview:large` schaltet grosse Vorschaubilder frei, die
	// beiden `max-*`-Werte heben die Standardkuerzung von Snippets auf.
	head.push({
		tag: 'meta',
		attrs: {
			name: 'robots',
			content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
		},
	});

	// --- JSON-LD -----------------------------------------------------------
	const nodes: unknown[] = [organizationSchema(), websiteSchema(lang)];

	if (isHome) {
		nodes.push(softwareApplicationSchema(lang));
	} else {
		nodes.push(
			breadcrumbSchema({
				homeUrl,
				homeName: HOME_NAME[lang],
				pageUrl,
				pageName: entry.data.title,
			})
		);
	}

	if (id.endsWith('reference/faq') && typeof entry.body === 'string') {
		const faq = faqSchemaFromMarkdown(entry.body, pageUrl);
		if (faq) nodes.push(faq);
	}

	head.push({
		tag: 'script',
		attrs: { type: 'application/ld+json' },
		content: jsonLdGraph(nodes),
	});
});
