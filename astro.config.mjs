// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import UnoCSS from 'unocss/astro';
import Icons from 'starlight-plugin-icons';
import starlightVideos from 'starlight-videos';
import starlightScrollToTop from 'starlight-scroll-to-top';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.humanshield.app',
	output: 'static',
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
				title: 'HumanShield.APP Docs',
				favicon: '/favicon.svg',
				head: [
					{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/favicon-180.png' } },
					{ tag: 'meta', attrs: { name: 'theme-color', content: '#F0591F' } },
				],
				customCss: ['./src/styles/custom.css'],
				components: {
					SiteTitle: './src/components/SiteTitle.astro',
				},
				// Ergaenzt og:image, Robots-Direktiven und JSON-LD (siehe Datei).
				routeMiddleware: './src/starlightRouteData.ts',
				plugins: [starlightVideos(), starlightScrollToTop()],
				social: [
					{ icon: 'github', label: 'GitHub', href: 'https://github.com/HumanShield-Awareness' },
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
						],
					},
					{
						label: 'Referenz',
						translations: { en: 'Reference' },
						items: [
							{ icon: 'i-ph:squares-four-duotone', slug: 'reference/funktionen' },
							{ icon: 'i-ph:stack-duotone', slug: 'reference/architektur' },
							{ icon: 'i-ph:shield-check-duotone', slug: 'reference/sicherheit' },
							{ icon: 'i-ph:seal-check-duotone', slug: 'reference/nis2-und-bsi' },
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
