"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import ZoomableComiketLayoutMap, {
	type ZoomableComiketLayoutMapRef,
} from "@/components/features/comiket-layout-map/ZoomableComiketLayoutMap";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TwitterUser } from "@/entities/twitter-user";
import { isTwitterError } from "@/gateways/twitter-user";
import { useBoothStore } from "@/stores/booth-store";
import { useMapStore } from "@/stores/map-store";
import {
	type ComiketInfo,
	extractComiketInfoList,
} from "@/utils/comiket-parser";
import { ManualBoothForm } from "./ManualBoothForm";
import { createHighlightData, formatErrorMessage } from "./presenter";
import { TweetUrlForm } from "./TweetUrlForm";

export const TwitterAnalyzer = () => {
	const { boothUserMap, addMultipleBoothUsers } = useBoothStore();
	const { selectedDay, setMapRef } = useMapStore();
	const [comiketInfoList, setComiketInfoList] = useState<ComiketInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showManualForm, setShowManualForm] = useState(false);
	const [pendingTwitterUser, setPendingTwitterUser] =
		useState<TwitterUser | null>(null);
	const [pendingTweetUrl, setPendingTweetUrl] = useState<string>("");
	const [parsedPartialInfo, setParsedPartialInfo] = useState<
		Partial<ComiketInfo> | undefined
	>();
	const mapRef = useRef<ZoomableComiketLayoutMapRef>(null);

	// 初回マウント時にstoreから既存のコミケ情報リストを復元
	useEffect(() => {
		const allInfoList = Array.from(boothUserMap.values()).map(
			(data) => data.comiketInfo,
		);
		setComiketInfoList(allInfoList);
	}, [boothUserMap]);

	// mapRefをstoreに登録
	useEffect(() => {
		if (mapRef.current) {
			setMapRef(mapRef.current);
		}
	}, [setMapRef]);

	// 日付をフィルタリングする関数
	const filterByDay = (infoList: ComiketInfo[]) => {
		if (selectedDay === "all") return infoList;

		return infoList.filter((info) => {
			if (!info.date) return false;

			// 土曜・8/16を1日目として扱う
			if (selectedDay === "day1") {
				return (
					info.date === "1日目" || info.date === "土曜" || info.date === "8/16"
				);
			}
			// 日曜・8/17を2日目として扱う
			if (selectedDay === "day2") {
				return (
					info.date === "2日目" || info.date === "日曜" || info.date === "8/17"
				);
			}
			return false;
		});
	};

	// フィルタリングされたコミケ情報リスト
	const filteredInfoList = filterByDay(comiketInfoList);

	// フィルタリングされたブースマップ
	const filteredBoothUserMap = new Map(
		Array.from(boothUserMap.entries()).filter(([_, data]) => {
			if (selectedDay === "all") return true;

			const info = data.comiketInfo;
			if (!info.date) return false;

			if (selectedDay === "day1") {
				return (
					info.date === "1日目" || info.date === "土曜" || info.date === "8/16"
				);
			}
			if (selectedDay === "day2") {
				return (
					info.date === "2日目" || info.date === "日曜" || info.date === "8/17"
				);
			}
			return false;
		}),
	);

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

			// 位置情報が全く検出されない、または不完全な場合
			if (infoList.length === 0) {
				// 手動入力フォームを表示
				setPendingTwitterUser(twitterUser);
				setPendingTweetUrl(url);
				setParsedPartialInfo(undefined);
				setShowManualForm(true);
				toast.warning("コミケ位置情報が見つかりません", {
					description: "手動でブース情報を入力してください。",
					action: {
						label: "手動入力",
						onClick: () => {},
					},
				});
				setIsLoading(false);
				return;
			}

			// 必須情報のチェック
			const validInfoList = infoList.filter(
				(info) => info.hall && info.block && info.space,
			);

			// 不足情報のチェック
			const incompleteInfoList = infoList.filter(
				(info) => !info.hall || !info.block || !info.space,
			);

			// 不足情報がある場合は手動入力フォームを表示
			if (incompleteInfoList.length > 0 && validInfoList.length === 0) {
				const info = incompleteInfoList[0];
				// 部分的にパースできた情報を保持
				setPendingTwitterUser(twitterUser);
				setPendingTweetUrl(url);
				setParsedPartialInfo(info);
				setShowManualForm(true);

				const missing: string[] = [];
				if (!info.hall) missing.push("ホール");
				if (!info.block) missing.push("ブロック");
				if (!info.space) missing.push("スペース番号");

				toast.warning("コミケ位置情報が不完全です", {
					description: `${missing.join("、")}が不足しています。手動で入力してください。`,
				});
				setIsLoading(false);
				return;
			} else if (incompleteInfoList.length > 0) {
				// 一部情報は取得できたが、不完全なものがある場合は警告
				toast.warning("一部のコミケ位置情報が不完全です", {
					description: `完全な情報のみ登録されました。「東あ23」のような形式で記載してください。`,
				});
			}

			// ブースとユーザー情報をマッピング
			const newEntries: Array<[string, BoothUserData]> = [];
			for (const info of validInfoList) {
				// hall, block, spaceが全て揃っている場合のみマッピング
				if (info.hall && info.block && info.space) {
					const key = `${info.hall}-${info.block}-${info.space}`;
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
							if (info.block && info.space) {
								mapRef.current?.centerOnBooth(info.block, Number(info.space));
							}
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

	// 手動入力フォームの送信処理
	const handleManualSubmit = (manualInfo: ComiketInfo) => {
		if (!pendingTwitterUser || !pendingTweetUrl) {
			return;
		}

		// 手動入力したブース情報を使用してマッピング
		const key = `${manualInfo.hall}-${manualInfo.block}-${manualInfo.space}`;
		const newEntry: [string, BoothUserData] = [
			key,
			{
				comiketInfo: manualInfo,
				twitterUser: pendingTwitterUser,
				tweetUrl: pendingTweetUrl,
			},
		];

		// Zustand storeに保存
		addMultipleBoothUsers([newEntry]);

		// 全体のコミケ情報リストを更新
		const updatedMap = new Map(boothUserMap);
		updatedMap.set(key, newEntry[1]);
		const allInfoList = Array.from(updatedMap.values()).map(
			(data) => data.comiketInfo,
		);
		setComiketInfoList(allInfoList);

		// 成功通知を表示
		toast.success("ブース情報を手動で追加しました", {
			description: pendingTwitterUser.displayName,
		});

		// マップを中心移動
		if (mapRef.current && manualInfo.block && manualInfo.space) {
			setTimeout(() => {
				if (manualInfo.block && manualInfo.space) {
					mapRef.current?.centerOnBooth(
						manualInfo.block,
						Number(manualInfo.space),
					);
				}
			}, 100);
		}

		// フォームをリセット
		setShowManualForm(false);
		setPendingTwitterUser(null);
		setPendingTweetUrl("");
		setParsedPartialInfo(undefined);
	};

	// 手動入力フォームのキャンセル処理
	const handleManualCancel = () => {
		setShowManualForm(false);
		setPendingTwitterUser(null);
		setPendingTweetUrl("");
		setParsedPartialInfo(undefined);
	};

	return (
		<div className="relative h-[calc(100vh-72px)] w-full">
			{/* 地図を画面いっぱいに表示 */}
			<ZoomableComiketLayoutMap
				ref={mapRef}
				highlightedBooths={createHighlightData(filteredInfoList)}
				boothUserMap={filteredBoothUserMap}
			/>

			{/* ツイート入力フォームを左上に配置 */}
			<div className="absolute top-4 left-4 z-20 space-y-2">
				<TweetUrlForm onSubmit={handleUrlSubmit} isLoading={isLoading} />

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{/* 手動入力フォーム */}
				{showManualForm && pendingTwitterUser && (
					<ManualBoothForm
						twitterUser={pendingTwitterUser}
						parsedInfo={parsedPartialInfo}
						onSubmit={handleManualSubmit}
						onCancel={handleManualCancel}
					/>
				)}
			</div>
		</div>
	);
};
