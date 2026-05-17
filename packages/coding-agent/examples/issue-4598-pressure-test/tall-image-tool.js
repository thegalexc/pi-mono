import { readFile } from "node:fs/promises";

export default function (pi) {
	pi.registerTool({
		name: "tall_image",
		label: "Tall Image",
		description: "Return a local tall PNG as a tool-result image.",
		parameters: {
			type: "object",
			properties: {},
			required: [],
			additionalProperties: false,
		},
		execute: async () => {
			const png = await readFile(new URL("./tall-390x2400.png", import.meta.url));
			return {
				content: [{ type: "image", mimeType: "image/png", data: png.toString("base64") }],
				details: { width: 390, height: 2400 },
			};
		},
	});
}
