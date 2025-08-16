"use client";

import Script from "next/script";

declare global {
	interface Window {
		twttr: {
			widgets: {
				load: () => void;
			};
		};
	}
}

export const TwitterScriptLoader = () => {
	return (
		// biome-ignore lint/nursery/useUniqueElementIds: Twitter widgetsスクリプトは一度だけ読み込まれるため静的IDで問題ない
		<Script
			src="https://platform.twitter.com/widgets.js"
			strategy="lazyOnload"
			id="twitter-widgets"
		/>
	);
};
