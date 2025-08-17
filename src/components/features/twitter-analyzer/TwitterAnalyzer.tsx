"use client";

import { AlertCircle, MapPin } from "lucide-react";
import { useState } from "react";
import ComiketIsland from "@/components/features/comiket-island/ComiketIsland";
import WallCircleContainer from "@/components/features/wall-circle/WallCircleContainer";
import { TwitterEmbed } from "@/components/shared/twitter-embed";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TwitterUser } from "@/entities/twitter-user";
import { isTwitterError } from "@/gateways/twitter-user";
import {
	ALL_BLOCKS_ORDER,
	normalizeBlockName,
} from "@/utils/comiket-block-map";
import {
	type ComiketInfo,
	extractComiketInfoList,
	formatComiketInfo,
} from "@/utils/comiket-parser";
import { TweetInfoDisplay } from "./TweetInfoDisplay";
import { TweetUrlForm } from "./TweetUrlForm";

export const TwitterAnalyzer = () => {
	const [tweetUrl, setTweetUrl] = useState<string | null>(null);
	const [tweetInfo, setTweetInfo] = useState<TwitterUser | null>(null);
	const [comiketInfoList, setComiketInfoList] = useState<ComiketInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// コミケ情報からブロックごとのブース番号を抽出
	const getHighlightedBoothsByBlock = (
		infoList: ComiketInfo[],
	): Record<string, number[]> => {
		const result: Record<string, number[]> = {};
		for (const info of infoList) {
			if (info.block && info.space) {
				const normalizedBlock = normalizeBlockName(info.block);
				const match = info.space.match(/\d+/);
				if (match) {
					const boothNumber = Number.parseInt(match[0], 10);
					if (!result[normalizedBlock]) {
						result[normalizedBlock] = [];
					}
					result[normalizedBlock].push(boothNumber);
				}
			}
		}
		return result;
	};

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
			setError(
				err instanceof Error ? err.message : "予期しないエラーが発生しました",
			);
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

			{tweetInfo && (
				<div className="space-y-6">
					<div className="grid gap-6 lg:grid-cols-2">
						<TweetInfoDisplay tweetInfo={tweetInfo} />

						{tweetUrl && (
							<div className="space-y-4">
								<h3 className="font-semibold text-lg">埋め込みプレビュー</h3>
								<TwitterEmbed tweetUrl={tweetUrl} />
							</div>
						)}
					</div>

					{comiketInfoList.length > 0 && (
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
									<WallCircleContainer>
										<div className="inline-flex items-center gap-12 pb-2">
											{(() => {
												const highlightedByBlock =
													getHighlightedBoothsByBlock(comiketInfoList);
												// 右から（イ側から）: 4, 8, 8, 5, 8, 4個のグループ
												const groupSizes = [4, 8, 8, 5, 8, 4];
												let index = 0;

												return groupSizes.map((size, _groupIndex) => {
													const groupBlocks = ALL_BLOCKS_ORDER.slice(
														index,
														index + size,
													);
													index += size;

													return (
														<div
															key={`group-${groupBlocks[0]}-${groupBlocks[groupBlocks.length - 1]}`}
															className="inline-flex items-center gap-4"
														>
															{groupBlocks.map((block) => (
																<ComiketIsland
																	key={block}
																	block={block}
																	highlightedBooths={
																		highlightedByBlock[block] || []
																	}
																/>
															))}
														</div>
													);
												});
											})()}
										</div>
									</WallCircleContainer>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const ComiketInfoCard = ({ info }: { info: ComiketInfo }) => {
	const formatted = formatComiketInfo(info);

	return (
		<div className="space-y-3 rounded-lg bg-secondary/50 p-4">
			<div className="flex items-center justify-between">
				<span className="font-bold text-lg">{formatted || "位置情報"}</span>
			</div>

			<div className="grid grid-cols-2 gap-2 text-sm">
				{info.date && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">日程:</span>
						<span className="font-medium">{info.date}</span>
					</div>
				)}

				{info.hall && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">ホール:</span>
						<span className="font-medium">
							{info.hall}
							{info.entrance ? info.entrance : ""}
						</span>
					</div>
				)}

				{info.block && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">列:</span>
						<span className="font-medium">{info.block}</span>
					</div>
				)}

				{info.space && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">スペース:</span>
						<span className="font-medium">{info.space}</span>
					</div>
				)}

				{info.side && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">サイド:</span>
						<span className="font-medium">{info.side}</span>
					</div>
				)}
			</div>
		</div>
	);
};
