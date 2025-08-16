import {
	type TwitterError,
	type TwitterUser,
	TwitterUserSchema,
} from "@/entities/twitter-user";

const extractUsernameFromUrl = (url: string): string | null => {
	try {
		const urlObj = new URL(url);
		const pathParts = urlObj.pathname.split("/");

		if (pathParts.length >= 2 && pathParts[1] && pathParts[1] !== "i") {
			return pathParts[1];
		}

		return null;
	} catch {
		return null;
	}
};

const extractTweetContent = (html: string): string => {
	const blockquoteMatch = html.match(
		/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/,
	);
	if (!blockquoteMatch) return "";

	const blockquoteContent = blockquoteMatch[1];

	const paragraphMatch = blockquoteContent.match(/<p[^>]*>([\s\S]*?)<\/p>/);
	if (!paragraphMatch) return "";

	let tweetText = paragraphMatch[1];

	tweetText = tweetText.replace(/<a[^>]*href="[^"]*"[^>]*>([^<]*)<\/a>/g, "$1");

	tweetText = tweetText.replace(/<br\s*\/?>/gi, "\n");

	tweetText = tweetText.replace(/<[^>]+>/g, "");

	tweetText = tweetText.replace(/&amp;/g, "&");
	tweetText = tweetText.replace(/&lt;/g, "<");
	tweetText = tweetText.replace(/&gt;/g, ">");
	tweetText = tweetText.replace(/&quot;/g, '"');
	tweetText = tweetText.replace(/&#39;/g, "'");

	return tweetText.trim();
};

const scrapeTwitterData = async (url: string): Promise<TwitterUser> => {
	const modifiedUrl = url.replace("x.com", "twitter.com");

	// oEmbed APIエンドポイントを使用（hide_media=falseで画像を含める）
	const embedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
		modifiedUrl,
	)}&omit_script=true&hide_media=false`;

	const response = await fetch(embedUrl, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`);
	}

	const data = await response.json();

	const authorMatch = data.author_name?.match(/^(.+?)(?:\s*\(@?(.+?)\))?$/);
	const displayName = authorMatch?.[1] || data.author_name || "Unknown";
	const username = authorMatch?.[2] || extractUsernameFromUrl(url) || "unknown";

	const tweetContent = data.html ? extractTweetContent(data.html) : "";

	const twitterUser = {
		username: username.replace("@", ""),
		displayName,
		tweetContent,
		tweetImages: undefined,
	};

	return TwitterUserSchema.parse(twitterUser);
};

export const fetchTwitterUserFromUrl = async (
	tweetUrl: string,
): Promise<TwitterUser | TwitterError> => {
	try {
		if (!tweetUrl.includes("twitter.com") && !tweetUrl.includes("x.com")) {
			return {
				error: "INVALID_URL",
				message: "有効なTwitter/X URLではありません",
			};
		}

		const username = extractUsernameFromUrl(tweetUrl);

		if (!username) {
			return {
				error: "INVALID_URL",
				message: "URLからユーザー名を抽出できませんでした",
			};
		}

		try {
			return await scrapeTwitterData(tweetUrl);
		} catch (scrapeError) {
			console.error("Scraping error:", scrapeError);

			const fallbackUser = {
				username: username.replace("@", ""),
				displayName: username,
				tweetContent: "",
				tweetImages: undefined,
			};

			return TwitterUserSchema.parse(fallbackUser);
		}
	} catch (error) {
		console.error("Twitter gateway error:", error);
		return {
			error: "FETCH_ERROR",
			message: "ツイート情報の取得に失敗しました",
		};
	}
};

export const isTwitterError = (
	result: TwitterUser | TwitterError,
): result is TwitterError => {
	return "error" in result;
};
