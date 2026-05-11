import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => {
	return {
		requireClipboard: vi.fn(),
	};
});

vi.mock("module", () => {
	return {
		createRequire: () => mocks.requireClipboard,
	};
});

import { getClipboard } from "../src/utils/clipboard-native.js";

describe("getClipboard", () => {
	beforeEach(() => {
		mocks.requireClipboard.mockReset();
	});

	test("does not load the native clipboard addon during module import", () => {
		expect(mocks.requireClipboard).not.toHaveBeenCalled();
	});

	test("loads the native clipboard addon lazily on first access", () => {
		const nativeClipboard = {
			setText: vi.fn(),
			hasImage: vi.fn(),
			getImageBinary: vi.fn(),
		};
		mocks.requireClipboard.mockReturnValue(nativeClipboard);

		const clipboard = getClipboard({ forceReload: true, platform: "darwin", env: {} });

		expect(mocks.requireClipboard).toHaveBeenCalledWith("@mariozechner/clipboard");
		expect(clipboard).toBe(nativeClipboard);
	});

	test("skips native clipboard loading when no display is available", () => {
		const clipboard = getClipboard({ forceReload: true, platform: "linux", env: {} });

		expect(mocks.requireClipboard).not.toHaveBeenCalled();
		expect(clipboard).toBeNull();
	});

	test("returns null on Termux", () => {
		const clipboard = getClipboard({
			forceReload: true,
			platform: "linux",
			env: { TERMUX_VERSION: "0.118" },
		});

		expect(mocks.requireClipboard).not.toHaveBeenCalled();
		expect(clipboard).toBeNull();
	});

	test("returns null when the native addon throws during require", () => {
		mocks.requireClipboard.mockImplementation(() => {
			throw new Error("dlopen failed");
		});

		const clipboard = getClipboard({ forceReload: true, platform: "darwin", env: {} });

		expect(mocks.requireClipboard).toHaveBeenCalledWith("@mariozechner/clipboard");
		expect(clipboard).toBeNull();
	});

	test("caches the loaded native clipboard module across calls", () => {
		const nativeClipboard = {
			setText: vi.fn(),
			hasImage: vi.fn(),
			getImageBinary: vi.fn(),
		};
		mocks.requireClipboard.mockReturnValue(nativeClipboard);

		getClipboard({ forceReload: true, platform: "darwin", env: {} });
		const second = getClipboard({ platform: "darwin", env: {} });

		expect(mocks.requireClipboard).toHaveBeenCalledTimes(1);
		expect(second).toBe(nativeClipboard);
	});
});
