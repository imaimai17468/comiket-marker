"use client";

import { AlertCircle, MapPin } from "lucide-react";
import { useState } from "react";
import ComiketLayoutMap from "@/components/features/comiket-layout-map/ComiketLayoutMap";
import { TwitterEmbed } from "@/components/shared/twitter-embed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TwitterUser } from "@/entities/twitter-user";
import { isTwitterError } from "@/gateways/twitter-user";
import {
	type ComiketInfo,
	extractComiketInfoList,
} from "@/utils/comiket-parser";
import { ComiketInfoCard } from "./ComiketInfoCard";
import {
	createHighlightData,
	formatErrorMessage,
	shouldShowComiketSection,
	shouldShowTweetInfo,
} from "./presenter";
import { TweetInfoDisplay } from "./TweetInfoDisplay";
import { TweetUrlForm } from "./TweetUrlForm";

export const TwitterAnalyzer = () => {
	const [tweetUrl, setTweetUrl] = useState<string | null>(null);
	const [tweetInfo, setTweetInfo] = useState<TwitterUser | null>(null);
	const [comiketInfoList, setComiketInfoList] = useState<ComiketInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleUrlSubmit = async (url: string) => {
		setIsLoading(true);
		setError(null);
		setTweetInfo(null);
		setTweetUrl(url);

		try {
			const response = await fetch("/api/twitter-scraper", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "ツイート情報の取得に失敗しました",
				);
			}

			const data = await response.json();

			if (isTwitterError(data)) {
				throw new Error(data.message);
			}

			setTweetInfo(data as TwitterUser);

			// displayNameからコミケ位置情報を抽出
			const infoList = extractComiketInfoList(data.displayName);
			setComiketInfoList(infoList);
		} catch (err) {
			setError(formatErrorMessage(err));
			setTweetUrl(null);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<TweetUrlForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{shouldShowTweetInfo(tweetInfo, isLoading, error) && (
				<div className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						<TweetInfoDisplay tweetInfo={tweetInfo as TwitterUser} />

						{tweetUrl && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg">埋め込みプレビュー</h3>
								<TwitterEmbed tweetUrl={tweetUrl} />
							</div>
						)}
					</div>

					{shouldShowComiketSection(comiketInfoList) && (
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="h-5 w-5" />
										コミケ位置情報 ({comiketInfoList.length}件)
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{comiketInfoList.map((info, index) => (
										<ComiketInfoCard
											key={`${info.hall}-${info.space}-${index}`}
											info={info}
										/>
									))}
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>島配置マップ</CardTitle>
								</CardHeader>
								<CardContent className="overflow-x-auto">
									<ComiketLayoutMap
										highlightedBooths={createHighlightData(comiketInfoList)}
									/>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
