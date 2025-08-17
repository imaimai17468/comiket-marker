import type { BlockHighlights } from "@/components/features/comiket-layout-map/types";
import type { TwitterUser } from "@/entities/twitter-user";
import type { ComiketInfo } from "@/utils/comiket-parser";
import { formatComiketInfo } from "@/utils/comiket-parser";
import { getHighlightedBoothsByBlock } from "./comiketHighlightCalculator";

/**
 * コミケ情報からハイライトデータを生成
 */
export const createHighlightData = (
	comiketInfoList: ComiketInfo[],
): BlockHighlights => {
	return getHighlightedBoothsByBlock(comiketInfoList);
};

/**
 * コミケ情報カードの表示データを生成
 */
export const createComiketInfoCardData = (info: ComiketInfo) => {
	return {
		formatted: formatComiketInfo(info) || "位置情報",
		date: info.date,
		hall: info.hall,
		entrance: info.entrance,
		block: info.block,
		space: info.space,
		side: info.side,
	};
};

/**
 * エラーメッセージの整形
 */
export const formatErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return "予期しないエラーが発生しました";
};

/**
 * ツイート情報の表示可否判定
 */
export const shouldShowTweetInfo = (
	tweetInfo: TwitterUser | null,
	isLoading: boolean,
	error: string | null,
): boolean => {
	return !isLoading && !error && tweetInfo !== null;
};

/**
 * コミケ情報セクションの表示可否判定
 */
export const shouldShowComiketSection = (
	comiketInfoList: ComiketInfo[],
): boolean => {
	return comiketInfoList.length > 0;
};
