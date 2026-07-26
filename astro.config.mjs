// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import UnoCSS from 'unocss/astro';
import Icons from 'starlight-plugin-icons';
import starlightVideos from 'starlight-videos';
import starlightScrollToTop from 'starlight-scroll-to-top';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.sentrymail.de',
	output: 'static',
	// Die Seite hiess bis Juli 2026 „NIS2 und BSI"; seit sie auch DSGVO und
	// ISO 27001 abdeckt, passt der alte Pfad nicht mehr. Er bleibt als
	// Weiterleitung bestehen — die URL ist extern verlinkt.
	redirects: {
		'/reference/nis2-und-bsi': '/reference/compliance/',
		'/en/reference/nis2-und-bsi': '/en/reference/compliance/',
	},
	integrations: [
		// mermaid muss vor Starlight stehen (verarbeitet ```mermaid-Bloecke zuerst)
		mermaid({ autoTheme: true }),
		UnoCSS(),
		// Icons() wrappt die Starlight-Integration (starlight-plugin-icons)
		Icons({
			sidebar: true,
			codeblock: true,
			extractSafelist: true,
			starlight: {
				title: 'SentryMail Docs',
				favicon: '/favicon.svg',
				head: [
					{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/favicon-180.png' } },
					{ tag: 'meta', attrs: { name: 'theme-color', content: '#F0591F' } },
				],
				customCss: ['./src/styles/custom.css'],
				components: {
					SiteTitle: './src/components/SiteTitle.astro',
					Footer: './src/components/Footer.astro',
				},
				plugins: [starlightVideos(), starlightScrollToTop()],
				social: [
					{ icon: 'github', label: 'GitHub', href: 'https://github.com/securebits-cyber' },
				],
				defaultLocale: 'root',
				locales: {
					root: { label: 'Deutsch', lang: 'de' },
					en: { label: 'English', lang: 'en' },
				},
				// Sidebar explizit statt autogenerate: die Icons des Plugins lassen
				// sich nur an konkreten Eintraegen setzen. Labels kommen weiterhin
				// lokalisiert aus dem Frontmatter der Seiten.
				sidebar: [
					{
						label: 'Erste Schritte',
						translations: { en: 'Getting Started' },
						items: [
							{ icon: 'i-ph:rocket-launch-duotone', slug: 'guides/installation' },
							{ icon: 'i-ph:sliders-duotone', slug: 'guides/konfiguration' },
							{ icon: 'i-ph:paper-plane-tilt-duotone', slug: 'guides/zustellung' },
							{ icon: 'i-ph:list-checks-duotone', slug: 'guides/preflight' },
							{ icon: 'i-ph:graduation-cap-duotone', slug: 'guides/schulungsmodul' },
							{ icon: 'i-ph:shield-checkered-duotone', slug: 'guides/offline-updates' },
						],
					},
					{
						label: 'Referenz',
						translations: { en: 'Reference' },
						items: [
							{ icon: 'i-ph:squares-four-duotone', slug: 'reference/funktionen' },
							{ icon: 'i-ph:stack-duotone', slug: 'reference/architektur' },
							{ icon: 'i-ph:shield-check-duotone', slug: 'reference/sicherheit' },
							{ icon: 'i-ph:certificate-duotone', slug: 'reference/sicherheitsueberblick' },
							{ icon: 'i-ph:user-circle-check-duotone', slug: 'reference/datenschutz' },
							{ icon: 'i-ph:link-simple-duotone', slug: 'reference/nachweiskette' },
							{ icon: 'i-ph:siren-duotone', slug: 'reference/meldung-analyse' },
							{ icon: 'i-ph:device-mobile-duotone', slug: 'reference/weitere-kanaele' },
							{ icon: 'i-ph:seal-check-duotone', slug: 'reference/compliance' },
							{ icon: 'i-ph:question-duotone', slug: 'reference/faq' },
							{ icon: 'i-ph:wrench-duotone', slug: 'reference/fehlerbehebung' },
							{ icon: 'i-ph:map-trifold-duotone', slug: 'reference/roadmap' },
						],
					},
				],
			},
		}),
	],
});
