"use client";

import { AlertCircle, List } from "lucide-react";
import { useState } from "react";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import ZoomableComiketLayoutMap from "@/components/features/comiket-layout-map/ZoomableComiketLayoutMap";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { TwitterUser } from "@/entities/twitter-user";
import { isTwitterError } from "@/gateways/twitter-user";
import {
	type ComiketInfo,
	extractComiketInfoList,
} from "@/utils/comiket-parser";
import { createHighlightData, formatErrorMessage } from "./presenter";
import { TweetUrlForm } from "./TweetUrlForm";

export const TwitterAnalyzer = () => {
	const [boothUserMap, setBoothUserMap] = useState<Map<string, BoothUserData>>(
		new Map(),
	);
	const [comiketInfoList, setComiketInfoList] = useState<ComiketInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleUrlSubmit = async (url: string) => {
		setIsLoading(true);
		setError(null);

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

			const twitterUser = data as TwitterUser;

			// displayNameからコミケ位置情報を抽出
			const infoList = extractComiketInfoList(twitterUser.displayName);

			// ブースとユーザー情報をマッピング
			const newBoothUserMap = new Map(boothUserMap);
			for (const info of infoList) {
				// blockとspaceが両方ある場合のみマッピング
				if (info.block && info.space) {
					// hallがない場合は空文字列として扱う
					const key = `${info.hall || ""}-${info.block}-${info.space}`;
					newBoothUserMap.set(key, {
						comiketInfo: info,
						twitterUser,
						tweetUrl: url,
					});
				}
			}
			setBoothUserMap(newBoothUserMap);

			// 全体のコミケ情報リストを更新
			const allInfoList = Array.from(newBoothUserMap.values()).map(
				(data) => data.comiketInfo,
			);
			setComiketInfoList(allInfoList);
		} catch (err) {
			setError(formatErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative h-[calc(100vh-72px)] w-full">
			{/* 地図を画面いっぱいに表示 */}
			<ZoomableComiketLayoutMap
				highlightedBooths={createHighlightData(comiketInfoList)}
				boothUserMap={boothUserMap}
			/>

			{/* ツイート入力フォームを左上に配置 */}
			<div className="absolute top-4 left-4 z-20 w-96 space-y-3">
				{/* リスト表示ボタン */}
				<Sheet>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							className="w-full bg-white/95 backdrop-blur"
							disabled={boothUserMap.size === 0}
						>
							<List className="mr-2 h-4 w-4" />
							リストを表示 ({boothUserMap.size}件)
						</Button>
					</SheetTrigger>
					<SheetContent className="w-[400px] sm:w-[540px]">
						<SheetHeader>
							<SheetTitle>保存済みブース一覧</SheetTitle>
							<SheetDescription>
								{boothUserMap.size}件のブース情報が保存されています
							</SheetDescription>
						</SheetHeader>
						<div className="mt-6 max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto">
							{Array.from(boothUserMap.values()).map((userData, index) => (
								<div
									key={`${userData.comiketInfo.block}-${userData.comiketInfo.space}-${index}`}
									className="space-y-2 rounded-lg border p-4"
								>
									{/* アカウント情報 */}
									<div>
										<p className="font-semibold">
											{userData.twitterUser.displayName}
										</p>
										<p className="text-muted-foreground text-sm">
											@{userData.twitterUser.username}
										</p>
									</div>

									{/* ツイート内容 */}
									{userData.twitterUser.tweetContent && (
										<p className="line-clamp-3 text-gray-600 text-sm">
											{userData.twitterUser.tweetContent}
										</p>
									)}
								</div>
							))}
						</div>
					</SheetContent>
				</Sheet>

				<TweetUrlForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
			</div>
		</div>
	);
};
