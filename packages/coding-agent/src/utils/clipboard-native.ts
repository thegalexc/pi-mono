import { createRequire } from "module";

export type ClipboardModule = {
	setText: (text: string) => Promise<void>;
	hasImage: () => boolean;
	getImageBinary: () => Promise<Array<number>>;
};

const require = createRequire(import.meta.url);
let clipboard: ClipboardModule | null | undefined;

function hasDisplay(env: NodeJS.ProcessEnv = process.env, platform: NodeJS.Platform = process.platform): boolean {
	return platform !== "linux" || Boolean(env.DISPLAY || env.WAYLAND_DISPLAY);
}

export function getClipboard(options?: {
	env?: NodeJS.ProcessEnv;
	platform?: NodeJS.Platform;
	forceReload?: boolean;
}): ClipboardModule | null {
	if (options?.forceReload) {
		clipboard = undefined;
	}

	if (clipboard !== undefined) {
		return clipboard;
	}

	const env = options?.env ?? process.env;
	const platform = options?.platform ?? process.platform;
	if (env.TERMUX_VERSION || !hasDisplay(env, platform)) {
		clipboard = null;
		return clipboard;
	}

	try {
		clipboard = require("@mariozechner/clipboard") as ClipboardModule;
	} catch {
		clipboard = null;
	}

	return clipboard;
}
