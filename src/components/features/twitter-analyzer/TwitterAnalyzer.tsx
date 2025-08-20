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
	type ComiketDayFilter,
	getDatePatternsForFilter,
	matchesDateFilter,
} from "@/utils/comiket-date-utils";
import {
	type ComiketInfo,
	extractComiketInfoList,
} from "@/utils/comiket-parser";
import { ManualBoothForm } from "./ManualBoothForm";
import { ManualBoothFormMultiDay } from "./ManualBoothFormMultiDay";
import { createHighlightData, formatErrorMessage } from "./presenter";
import { TweetUrlForm } from "./TweetUrlForm";

// ブース位置情報を文字列にフォーマットするヘルパー関数
const formatBoothLocation = (info: ComiketInfo): string => {
	const parts: string[] = [];

	// 日付
	if (info.date) {
		parts.push(info.date);
	}

	// ホール情報（東1、西2など）
	if (info.hall) {
		let hallStr = info.hall;
		if (info.entrance) {
			hallStr += info.entrance;
		}
		parts.push(hallStr);
	}

	// ブロックとスペース（あ-32a など）
	if (info.block && info.space) {
		let locationStr = `${info.block}-${info.space}`;
		if (info.side) {
			locationStr += info.side;
		}
		parts.push(locationStr);
	} else if (info.block) {
		parts.push(info.block);
	} else if (info.space) {
		let spaceStr = info.space;
		if (info.side) {
			spaceStr += info.side;
		}
		parts.push(spaceStr);
	}

	return parts.join(" ");
};

// 選択中の日付フィルターに基づいて最適なエントリーを選択するヘルパー関数
const findBestEntryToFocus = (
	entries: Array<[string, BoothUserData]>,
	selectedDay: ComiketDayFilter,
): [string, BoothUserData] | undefined => {
	if (entries.length === 0) return undefined;

	// 日付フィルターが「すべて」の場合は最初のエントリーを返す
	if (selectedDay === "all") {
		return entries[0];
	}

	// 選択された日に対応するエントリーを探す
	const targetDates = getDatePatternsForFilter(selectedDay);

	for (const entry of entries) {
		const date = entry[1].comiketInfo.date;
		if (date && targetDates.some((d) => date.includes(d))) {
			return entry;
		}
	}

	// 対応する日付が見つからない場合は最初のエントリーを返す
	return entries[0];
};

export const TwitterAnalyzer = () => {
	const { boothUserMap, addMultipleBoothUsers } = useBoothStore();
	const { selectedDay, setMapRef } = useMapStore();
	const [comiketInfoList, setComiketInfoList] = useState<ComiketInfo[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showManualForm, setShowManualForm] = useState(false);
	const [showManualFormMultiDay, setShowManualFormMultiDay] = useState(false);
	const [pendingTwitterUser, setPendingTwitterUser] =
		useState<TwitterUser | null>(null);
	const [pendingTweetUrl, setPendingTweetUrl] = useState<string>("");
	const [parsedPartialInfo, setParsedPartialInfo] = useState<
		Partial<ComiketInfo> | undefined
	>();
	const [parsedPartialInfoList, setParsedPartialInfoList] = useState<
		Partial<ComiketInfo>[]
	>([]);
	const [lastSelectedDay, setLastSelectedDay] = useState(selectedDay);
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

	// 日付フィルターが変更された時、適切なブースにズーム
	useEffect(() => {
		if (selectedDay !== lastSelectedDay && boothUserMap.size > 0) {
			const allEntries = Array.from(boothUserMap.entries());
			const entryToFocus = findBestEntryToFocus(allEntries, selectedDay);

			if (entryToFocus && mapRef.current) {
				const info = entryToFocus[1].comiketInfo;
				if (info.block && info.space) {
					setTimeout(() => {
						if (info.block && info.space) {
							mapRef.current?.centerOnBooth(info.block, Number(info.space));
						}
					}, 100);
				}
			}
			setLastSelectedDay(selectedDay);
		}
	}, [selectedDay, lastSelectedDay, boothUserMap]);

	// 日付をフィルタリングする関数
	const filterByDay = (infoList: ComiketInfo[]) => {
		if (selectedDay === "all") return infoList;

		return infoList.filter((info) => {
			return matchesDateFilter(info.date, selectedDay);
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

			// 位置情報が全く検出されない場合
			if (infoList.length === 0) {
				// 手動入力フォームを表示
				setPendingTwitterUser(twitterUser);
				setPendingTweetUrl(url);
				setParsedPartialInfo(undefined);
				setParsedPartialInfoList([]);
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

			// すべてのブース情報が不完全な場合
			if (validInfoList.length === 0 && incompleteInfoList.length > 0) {
				// 複数の不完全な情報がある場合は、複数日フォームを表示
				if (incompleteInfoList.length >= 2) {
					setPendingTwitterUser(twitterUser);
					setPendingTweetUrl(url);
					setParsedPartialInfoList(incompleteInfoList);
					setShowManualFormMultiDay(true);
					toast.warning("複数日のブース情報が不完全です", {
						description: "両日分のブース情報を手動で入力してください。",
					});
				} else {
					// 単一の不完全な情報の場合
					const info = incompleteInfoList[0];
					setPendingTwitterUser(twitterUser);
					setPendingTweetUrl(url);
					setParsedPartialInfo(info);
					setParsedPartialInfoList([]);
					setShowManualForm(true);

					const missing: string[] = [];
					if (!info.hall) missing.push("ホール");
					if (!info.block) missing.push("ブロック");
					if (!info.space) missing.push("スペース番号");

					toast.warning("コミケ位置情報が不完全です", {
						description: `${missing.join("、")}が不足しています。手動で入力してください。`,
					});
				}
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
				// ブース位置の文字列を生成
				const boothLocations = newEntries
					.map(([_, data]) => formatBoothLocation(data.comiketInfo))
					.join("、");

				toast.success(`${newEntries.length}件のブース情報を追加しました`, {
					description: `${twitterUser.displayName}\n${boothLocations}`,
				});

				// 選択中の日付に対応するブースにマップを中心移動
				const entryToFocus = findBestEntryToFocus(newEntries, selectedDay);
				if (entryToFocus && mapRef.current) {
					const info = entryToFocus[1].comiketInfo;
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
			const errorMessage = formatErrorMessage(err);
			setError(errorMessage);

			// APIエラーの場合、手動入力を促す
			if (
				errorMessage.includes("制限") ||
				errorMessage.includes("403") ||
				errorMessage.includes("失敗")
			) {
				toast.error("自動取得に失敗しました", {
					description: "手動でブース情報を入力することもできます",
					action: {
						label: "手動入力",
						onClick: () => {
							setPendingTwitterUser({
								username: "unknown",
								displayName: "手動入力",
								tweetContent: "",
							});
							setPendingTweetUrl(url);
							setShowManualForm(true);
						},
					},
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	// 手動入力フォームの送信処理（単日）
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
		const boothLocation = formatBoothLocation(manualInfo);
		toast.success("ブース情報を手動で追加しました", {
			description: `${pendingTwitterUser.displayName}\n${boothLocation}`,
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

	// 手動入力フォームの送信処理（複数日）
	const handleManualSubmitMultiDay = (manualInfoList: ComiketInfo[]) => {
		if (!pendingTwitterUser || !pendingTweetUrl) {
			return;
		}

		// 複数日のブース情報をマッピング
		const newEntries: Array<[string, BoothUserData]> = [];
		for (const manualInfo of manualInfoList) {
			if (manualInfo.hall && manualInfo.block && manualInfo.space) {
				const key = `${manualInfo.hall}-${manualInfo.block}-${manualInfo.space}`;
				newEntries.push([
					key,
					{
						comiketInfo: manualInfo,
						twitterUser: pendingTwitterUser,
						tweetUrl: pendingTweetUrl,
					},
				]);
			}
		}

		// Zustand storeに保存
		addMultipleBoothUsers(newEntries);

		// 全体のコミケ情報リストを更新
		const updatedMap = new Map(boothUserMap);
		for (const [key, data] of newEntries) {
			updatedMap.set(key, data);
		}
		const allInfoList = Array.from(updatedMap.values()).map(
			(data) => data.comiketInfo,
		);
		setComiketInfoList(allInfoList);

		// 成功通知を表示
		const boothLocations = newEntries
			.map(([_, data]) => formatBoothLocation(data.comiketInfo))
			.join("、");

		toast.success(`${newEntries.length}件のブース情報を手動で追加しました`, {
			description: `${pendingTwitterUser.displayName}\n${boothLocations}`,
		});

		// 選択中の日付に対応するブースにマップを中心移動
		const entryToFocus = findBestEntryToFocus(newEntries, selectedDay);
		if (entryToFocus && mapRef.current) {
			const info = entryToFocus[1].comiketInfo;
			if (info.block && info.space) {
				setTimeout(() => {
					if (info.block && info.space) {
						mapRef.current?.centerOnBooth(info.block, Number(info.space));
					}
				}, 100);
			}
		}

		// フォームをリセット
		setShowManualFormMultiDay(false);
		setPendingTwitterUser(null);
		setPendingTweetUrl("");
		setParsedPartialInfoList([]);
	};

	// 手動入力フォームのキャンセル処理
	const handleManualCancel = () => {
		setShowManualForm(false);
		setShowManualFormMultiDay(false);
		setPendingTwitterUser(null);
		setPendingTweetUrl("");
		setParsedPartialInfo(undefined);
		setParsedPartialInfoList([]);
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

				{/* 手動入力フォーム（単日） */}
				{showManualForm && pendingTwitterUser && (
					<ManualBoothForm
						twitterUser={pendingTwitterUser}
						parsedInfo={parsedPartialInfo}
						onSubmit={handleManualSubmit}
						onCancel={handleManualCancel}
					/>
				)}

				{/* 手動入力フォーム（複数日） */}
				{showManualFormMultiDay && pendingTwitterUser && (
					<ManualBoothFormMultiDay
						twitterUser={pendingTwitterUser}
						parsedInfoList={parsedPartialInfoList}
						onSubmit={handleManualSubmitMultiDay}
						onCancel={handleManualCancel}
					/>
				)}
			</div>
		</div>
	);
};
