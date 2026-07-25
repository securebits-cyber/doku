import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'unocss';
import { presetStarlightIcons } from 'starlight-plugin-icons/uno';

// Explizite Safelist statt Cache aus .starlight-icons/: Die Icon-Klassen stehen
// nur in astro.config.mjs bzw. werden zur Laufzeit erzeugt, UnoCSS kann sie
// nicht aus dem Content extrahieren. Der Cache existiert auf einem frischen
// CI-Build (Cloudflare) beim Config-Laden noch nicht -> Icons wuerden fehlen.
//
// Die Sidebar-Icons werden deshalb direkt aus astro.config.mjs gelesen, statt
// sie hier zu wiederholen. Die gepflegte Liste ist mehrfach vergessen worden:
// Eine neue Seite bekam ihr Icon in der Sidebar, aber keinen Eintrag hier — und
// erschien dann ohne Symbol, ohne dass irgendwo ein Fehler auftauchte.
const sidebarIcons = (): string[] => {
	const config = readFileSync(fileURLToPath(new URL('./astro.config.mjs', import.meta.url)), 'utf8');
	// icon: 'i-<sammlung>:<name>' — nur aus Zeichenketten, damit keine Treffer
	// aus Kommentaren oder Prosa mitkommen.
	return [...config.matchAll(/icon:\s*'(i-[\w-]+:[\w-]+)'/g)].map((match) => match[1]);
};

export default defineConfig({
	presets: [presetStarlightIcons()],
	safelist: [
		...new Set(sidebarIcons()),
		// Codeblock-Icons (```… title="…") — die stehen im Markdown und nicht in
		// astro.config.mjs, bleiben deshalb von Hand gepflegt.
		'i-material-icon-theme:tune', // .env
		'i-material-icon-theme:document',
		'i-material-icon-theme:settings',
		'i-material-icon-theme:console', // Shell-Bloecke
	],
});
