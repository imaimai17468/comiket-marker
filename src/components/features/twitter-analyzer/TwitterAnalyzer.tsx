"use client";

import { AlertCircle, ExternalLink, List, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import ZoomableComiketLayoutMap, {
	type ZoomableComiketLayoutMapRef,
} from "@/components/features/comiket-layout-map/ZoomableComiketLayoutMap";
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
import { useBoothStore } from "@/stores/booth-store";
import {
	type ComiketInfo,
	extractComiketInfoList,
} from "@/utils/comiket-parser";
import { createHighlightData, formatErrorMessage } from "./presenter";
import { TweetUrlForm } from "./TweetUrlForm";

export const TwitterAnalyzer = () => {
	const {
		boothUserMap,
		addMultipleBoothUsers,
		removeBoothUser,
		clearAllBooths,
	} = useBoothStore();
	const [comiketInfoList, setComiketInfoList] = useState<ComiketInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const mapRef = useRef<ZoomableComiketLayoutMapRef>(null);

	// 初回マウント時にstoreから既存のコミケ情報リストを復元
	useEffect(() => {
		const allInfoList = Array.from(boothUserMap.values()).map(
			(data) => data.comiketInfo,
		);
		setComiketInfoList(allInfoList);
	}, [boothUserMap]);

	// ブース削除ハンドラ
	const handleRemoveBooth = (key: string) => {
		if (confirm("このブース情報を削除しますか？")) {
			removeBoothUser(key);
			// 削除後の状態を反映
			const updatedMap = new Map(boothUserMap);
			updatedMap.delete(key);
			const allInfoList = Array.from(updatedMap.values()).map(
				(data) => data.comiketInfo,
			);
			setComiketInfoList(allInfoList);
		}
	};

	// ブースをクリックしてズーム
	const handleBoothClick = (userData: BoothUserData) => {
		const info = userData.comiketInfo;
		if (info.block && info.space && mapRef.current) {
			// ハイライト時と同じように、ひらがなはそのまま、カタカナはそのまま使用
			console.log("Centering on booth from list:", info.block, info.space);
			mapRef.current.centerOnBooth(info.block, Number(info.space));
		}
	};

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
			const newEntries: Array<[string, BoothUserData]> = [];
			for (const info of infoList) {
				// blockとspaceが両方ある場合のみマッピング
				if (info.block && info.space) {
					// hallがない場合は空文字列として扱う
					const key = `${info.hall || ""}-${info.block}-${info.space}`;
					newEntries.push([
						key,
						{
							comiketInfo: info,
							twitterUser,
							tweetUrl: url,
						},
					]);
				}
			}

			// Zustand storeに保存
			addMultipleBoothUsers(newEntries);

			// 全体のコミケ情報リストを更新（新しいMapを作成して取得）
			const updatedMap = new Map(boothUserMap);
			for (const [key, data] of newEntries) {
				updatedMap.set(key, data);
			}
			const allInfoList = Array.from(updatedMap.values()).map(
				(data) => data.comiketInfo,
			);
			setComiketInfoList(allInfoList);

			// 成功通知を表示
			if (newEntries.length > 0) {
				toast.success(`${newEntries.length}件のブース情報を追加しました`, {
					description: twitterUser.displayName,
				});

				// 最初のブースにマップを中心移動
				const firstEntry = newEntries[0];
				if (firstEntry && mapRef.current) {
					const info = firstEntry[1].comiketInfo;
					if (info.block && info.space) {
						setTimeout(() => {
							mapRef.current?.centerOnBooth(info.block, Number(info.space));
						}, 100);
					}
				}
			} else {
				toast.info("ブース情報が見つかりませんでした");
			}
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
				ref={mapRef}
				highlightedBooths={createHighlightData(comiketInfoList)}
				boothUserMap={boothUserMap}
			/>

			{/* ツイート入力フォームを左上に配置 */}
			<div className="absolute top-4 left-4 z-20 space-y-2">
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
					<SheetContent className="w-full sm:w-[400px] md:w-[540px]">
						<SheetHeader>
							<SheetTitle>保存済みブース一覧</SheetTitle>
							<SheetDescription>
								{boothUserMap.size}件のブース情報が保存されています
							</SheetDescription>
						</SheetHeader>
						{boothUserMap.size > 0 && (
							<div className="flex items-center justify-between px-4 sm:px-6">
								<div className="text-muted-foreground text-xs">
									合計 {boothUserMap.size} 件
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										if (confirm("すべてのブース情報を削除しますか？")) {
											clearAllBooths();
											setComiketInfoList([]);
										}
									}}
									className="h-7 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
								>
									<Trash2 className="mr-1.5 h-3.5 w-3.5" />
									すべて削除
								</Button>
							</div>
						)}
						<div className="mt-2 max-h-[calc(100vh-180px)] overflow-y-auto">
							<div className="divide-y divide-border/50">
								{Array.from(boothUserMap.entries()).map(
									([key, userData], _index) => (
										<div
											key={key}
											className="group relative cursor-pointer px-4 py-2 transition-colors duration-200 hover:bg-muted/30 sm:px-6"
											onClick={() => handleBoothClick(userData)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													handleBoothClick(userData);
												}
											}}
											// biome-ignore lint/a11y/useSemanticElements: ネストしたボタンを避けるため
											role="button"
											tabIndex={0}
										>
											<div className="space-y-2 pr-8">
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

											{/* アクションボタン */}
											<div className="absolute top-3 right-4 flex gap-1 opacity-100 transition-opacity duration-200 sm:right-6 sm:opacity-0 sm:group-hover:opacity-100">
												<Button
													variant="ghost"
													size="sm"
													className="h-6 w-6 p-0 hover:bg-accent"
													onClick={(e) => {
														e.stopPropagation();
														window.open(userData.tweetUrl, "_blank");
													}}
													aria-label="ツイートを見る"
												>
													<ExternalLink className="h-3.5 w-3.5" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveBooth(key);
													}}
													aria-label="このブースを削除"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
										</div>
									),
								)}
							</div>
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
