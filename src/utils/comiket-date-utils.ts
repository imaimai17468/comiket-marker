/**
 * コミケットの日付に関するユーティリティ
 */

// 日付の種類定義
export type ComiketDayFilter = "all" | "day1" | "day2";

// 1日目として扱う日付パターン
export const DAY1_PATTERNS = ["1日目", "土曜", "土曜日", "㈯", "8/16"] as const;

// 2日目として扱う日付パターン
export const DAY2_PATTERNS = ["2日目", "日曜", "日曜日", "㈰", "8/17"] as const;

// すべての日付パターン（パース用）
export const ALL_DATE_PATTERNS = [
	...DAY1_PATTERNS,
	...DAY2_PATTERNS,
	"3日目", // レガシーサポート（実際には使わない）
	"金曜",
	"金曜日",
	"㈮",
] as const;

/**
 * 日付文字列がどの日に該当するかを判定
 * @param dateStr 日付文字列
 * @returns "day1" | "day2" | null
 */
export const getDayFromDateString = (
	dateStr: string | undefined,
): "day1" | "day2" | null => {
	if (!dateStr) return null;

	// 1日目判定
	if (DAY1_PATTERNS.some((pattern) => dateStr.includes(pattern))) {
		return "day1";
	}

	// 2日目判定
	if (DAY2_PATTERNS.some((pattern) => dateStr.includes(pattern))) {
		return "day2";
	}

	return null;
};

/**
 * 日付フィルターに基づいて日付文字列をフィルタリング
 * @param dateStr 日付文字列
 * @param filter 日付フィルター
 * @returns フィルターに一致するかどうか
 */
export const matchesDateFilter = (
	dateStr: string | undefined,
	filter: ComiketDayFilter,
): boolean => {
	if (filter === "all") return true;

	const day = getDayFromDateString(dateStr);
	return day === filter;
};

/**
 * 日付フィルターに対応する日付パターンを取得
 * @param filter 日付フィルター
 * @returns 対応する日付パターンの配列
 */
export const getDatePatternsForFilter = (
	filter: ComiketDayFilter,
): readonly string[] => {
	switch (filter) {
		case "day1":
			return DAY1_PATTERNS;
		case "day2":
			return DAY2_PATTERNS;
		case "all":
			return [...DAY1_PATTERNS, ...DAY2_PATTERNS];
	}
};

/**
 * 日付パターンの正規表現を生成（パース用）
 * @returns 正規表現パターン
 */
export const createDatePatternRegex = (): RegExp => {
	// 特殊文字をエスケープ
	const patterns = ALL_DATE_PATTERNS.map((pattern) =>
		pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
	);

	// 8/1[0-9]のようなパターンも追加
	patterns.push("8\\/1[0-9]");

	return new RegExp(`(${patterns.join("|")})`, "g");
};
