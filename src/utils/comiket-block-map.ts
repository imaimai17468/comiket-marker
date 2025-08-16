export type BlockInfo = {
	block: string;
	boothCount: number;
};

export const COMIKET_BLOCK_MAP: Record<string, BlockInfo> = {
	// 66ブース
	ウ: { block: "ウ", boothCount: 66 },
	エ: { block: "エ", boothCount: 66 },
	キ: { block: "キ", boothCount: 66 },
	ク: { block: "ク", boothCount: 66 },
	ケ: { block: "ケ", boothCount: 66 },
	コ: { block: "コ", boothCount: 66 },
	サ: { block: "サ", boothCount: 66 },
	タ: { block: "タ", boothCount: 66 },
	チ: { block: "チ", boothCount: 66 },
	ツ: { block: "ツ", boothCount: 66 },
	テ: { block: "テ", boothCount: 66 },
	ト: { block: "ト", boothCount: 66 },
	ヌ: { block: "ヌ", boothCount: 66 },
	ネ: { block: "ネ", boothCount: 66 },
	ヘ: { block: "ヘ", boothCount: 66 },
	ホ: { block: "ホ", boothCount: 66 },
	マ: { block: "マ", boothCount: 66 },
	ミ: { block: "ミ", boothCount: 66 },
	ム: { block: "ム", boothCount: 66 },
	ヤ: { block: "ヤ", boothCount: 66 },
	ユ: { block: "ユ", boothCount: 66 },

	// 62ブース
	オ: { block: "オ", boothCount: 62 },
	カ: { block: "カ", boothCount: 62 },
	シ: { block: "シ", boothCount: 62 },
	ソ: { block: "ソ", boothCount: 62 },
	ナ: { block: "ナ", boothCount: 62 },
	ニ: { block: "ニ", boothCount: 62 },
	ノ: { block: "ノ", boothCount: 62 },
	フ: { block: "フ", boothCount: 62 },
	メ: { block: "メ", boothCount: 62 },
	モ: { block: "モ", boothCount: 62 },

	// 54ブース
	イ: { block: "イ", boothCount: 54 },
	ヨ: { block: "ヨ", boothCount: 54 },

	// 48ブース
	ス: { block: "ス", boothCount: 48 },
	セ: { block: "セ", boothCount: 48 },
	ハ: { block: "ハ", boothCount: 48 },
	ヒ: { block: "ヒ", boothCount: 48 },
};

/**
 * すべてのブロックを順番に並べた配列（ヨからイへ）
 */
export const ALL_BLOCKS_ORDER = [
	"ヨ",
	"ユ",
	"ヤ",
	"モ",
	"メ",
	"ム",
	"ミ",
	"マ",
	"ホ",
	"ヘ",
	"フ",
	"ヒ",
	"ハ",
	"ノ",
	"ネ",
	"ヌ",
	"ニ",
	"ナ",
	"ト",
	"テ",
	"ツ",
	"チ",
	"タ",
	"ソ",
	"セ",
	"ス",
	"シ",
	"サ",
	"コ",
	"ケ",
	"ク",
	"キ",
	"カ",
	"オ",
	"エ",
	"ウ",
	"イ",
] as const;

/**
 * ひらがなをカタカナに変換
 */
export const hiraganaToKatakana = (str: string): string => {
	return str.replace(/[\u3041-\u3096]/g, (match) => {
		const code = match.charCodeAt(0) + 0x60;
		return String.fromCharCode(code);
	});
};

/**
 * ブロック名からブロック情報を取得
 * ひらがなの場合は自動的にカタカナに変換
 */
export const getBlockInfo = (blockName: string): BlockInfo | undefined => {
	const katakanaBlock = hiraganaToKatakana(blockName);
	return COMIKET_BLOCK_MAP[katakanaBlock];
};

/**
 * ブロック名の正規化（ひらがな→カタカナ、小文字→大文字）
 */
export const normalizeBlockName = (blockName: string): string => {
	// ひらがなをカタカナに変換
	let normalized = hiraganaToKatakana(blockName);

	// アルファベットを大文字に変換
	normalized = normalized.toUpperCase();

	return normalized;
};
