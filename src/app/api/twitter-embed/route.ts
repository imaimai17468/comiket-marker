import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { url } = body;

		if (!url) {
			return NextResponse.json(
				{ error: "MISSING_URL", message: "URLが指定されていません" },
				{ status: 400 },
			);
		}

		const modifiedUrl = url.replace("x.com", "twitter.com");
		const embedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
			modifiedUrl,
		)}&omit_script=true&dnt=true&hide_media=false&hide_thread=false&align=center&width=550`;

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
		return NextResponse.json(data);
	} catch (error) {
		console.error("Embed API error:", error);
		return NextResponse.json(
			{ error: "SERVER_ERROR", message: "埋め込み情報の取得に失敗しました" },
			{ status: 500 },
		);
	}
}
