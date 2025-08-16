import { type NextRequest, NextResponse } from "next/server";
import {
	fetchTwitterUserFromUrl,
	isTwitterError,
} from "@/gateways/twitter-user";

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

		const result = await fetchTwitterUserFromUrl(url);

		if (isTwitterError(result)) {
			return NextResponse.json(result, { status: 400 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: "SERVER_ERROR", message: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}
