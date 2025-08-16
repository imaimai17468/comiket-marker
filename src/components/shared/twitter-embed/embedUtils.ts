export const generateTwitterEmbedUrl = (tweetUrl: string): string => {
	const modifiedUrl = tweetUrl.replace("x.com", "twitter.com");

	return `https://publish.twitter.com/oembed?url=${encodeURIComponent(
		modifiedUrl,
	)}&omit_script=true&dnt=true&hide_media=false&hide_thread=false&align=center&width=550`;
};

export const extractTweetId = (url: string): string | null => {
	try {
		const urlObj = new URL(url);
		const pathParts = urlObj.pathname.split("/");

		const statusIndex = pathParts.indexOf("status");
		if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
			return pathParts[statusIndex + 1].split("?")[0];
		}

		return null;
	} catch {
		return null;
	}
};

export const isValidTwitterUrl = (url: string): boolean => {
	try {
		const urlObj = new URL(url);
		return (
			(urlObj.hostname.includes("twitter.com") ||
				urlObj.hostname.includes("x.com")) &&
			urlObj.pathname.includes("/status/")
		);
	} catch {
		return false;
	}
};
