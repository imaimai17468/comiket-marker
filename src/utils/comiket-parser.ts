export type ComiketInfo = {
	date?: string; // 日付情報（土曜日、日曜日、1日目、2日目、8/15など）
	hall?: string; // ホール（東、西、南）
	entrance?: string; // 入口番号（1, 2, 3, 4など）
	block?: string; // 列/ブロック（ひらがな、カタカナ、アルファベット）
	space?: string; // スペース番号（23, 42など）
	side?: string; // サイド（a, b, ab）
	raw: string; // 元のテキスト
};

/**
 * テキストからコミケ位置情報を柔軟に抽出する（複数対応）
 * @param text 解析対象のテキスト
 * @returns 抽出されたコミケ情報の配列
 */
export const extractComiketInfoList = (text: string): ComiketInfo[] => {
	// 「&」や「、」で区切られている可能性があるので分割
	const segments = text.split(/[&、,]/);
	const results: ComiketInfo[] = [];

	for (const segment of segments) {
		const info = extractSingleComiketInfo(segment);
		// 少なくともホールかスペース番号があれば有効とみなす
		if (info.hall || info.space) {
			results.push(info);
		}
	}

	return results;
};

/**
 * テキストから単一のコミケ位置情報を抽出する
 * @param text 解析対象のテキスト
 * @returns 抽出されたコミケ情報
 */
const extractSingleComiketInfo = (text: string): ComiketInfo => {
	const info: ComiketInfo = {
		raw: text,
	};

	// 日付の抽出
	const datePatterns = [
		// 曜日記号形式（㈰㈯㈮など）を最優先
		{ pattern: /㈰/g, value: "日曜" },
		{ pattern: /㈯/g, value: "土曜" },
		{ pattern: /㈮/g, value: "金曜" },
		{ pattern: /㈪/g, value: "月曜" },
		{ pattern: /㈫/g, value: "火曜" },
		{ pattern: /㈬/g, value: "水曜" },
		{ pattern: /㈭/g, value: "木曜" },
		// 日目形式（優先度高）
		{
			pattern: /([1-3１-３])日目/g,
			extract: (m: RegExpMatchArray) => {
				const day = m[1].replace(/[１-３]/g, (s) =>
					String.fromCharCode(s.charCodeAt(0) - 0xfee0),
				);
				return `${day}日目`;
			},
		},
		// 曜日形式（括弧内も含む）
		{ pattern: /[（(](?:土曜日?|土|saturday|sat)[）)]/gi, value: "土曜" },
		{ pattern: /[（(](?:日曜日?|日|sunday|sun)[）)]/gi, value: "日曜" },
		{ pattern: /[（(](?:金曜日?|金|friday|fri)[）)]/gi, value: "金曜" },
		// 曜日形式（括弧なし）
		{ pattern: /(?:土曜日?|saturday|sat)/gi, value: "土曜" },
		{ pattern: /(?:日曜日?|sunday|sun)/gi, value: "日曜" },
		{ pattern: /(?:金曜日?|friday|fri)/gi, value: "金曜" },
		// 日付形式 (8/15, 8月15日など)
		{
			pattern: /(\d{1,2})[/月](\d{1,2})日?/g,
			extract: (m: RegExpMatchArray) => `${m[1]}/${m[2]}`,
		},
	];

	for (const { pattern, value, extract } of datePatterns) {
		const matches = [...text.matchAll(pattern)];
		if (matches.length > 0) {
			info.date = extract ? extract(matches[0]) : value;
			break;
		}
	}

	// ホールの抽出
	const hallMatch = text.match(/[東西南]/);
	if (hallMatch) {
		info.hall = hallMatch[0];
	}

	// 入口番号の抽出（東1、西2、南3など）
	const entranceMatch = text.match(/[東西南]\s*([1-9１-９])/);
	if (entranceMatch) {
		info.entrance = entranceMatch[1].replace(/[１-９]/g, (s) =>
			String.fromCharCode(s.charCodeAt(0) - 0xfee0),
		);
	}

	// ブロック（列）の抽出
	// ひらがな、カタカナ、アルファベット（半角・全角）1文字で、スペース番号の前にあるもの
	const blockPatterns = [
		// カギ括弧内のブロック（「ニ24ab」のような形式）
		/「([あ-んア-ンa-zA-Zａ-ｚＡ-Ｚ])\d{2}/,
		// ホールと入口の後のブロック（東5ニ24のような形式）
		/[東西南]\d([あ-んア-ンa-zA-Zａ-ｚＡ-Ｚ])\d{2}/,
		// ホール+入口番号の後のブロック（西1 め-21のような形式）
		/[東西南]\d\s+([あ-んア-ンa-zA-Zａ-ｚＡ-Ｚ])[-－ー\s]*\d{2}/,
		// ホールの後のブロック（南ｐ-29ab、南a-42aのような形式）
		/[東西南]\s*([あ-んア-ンa-zA-Zａ-ｚＡ-Ｚ])[-－ー\s]*\d{2}/,
		// ハイフンの前のブロック（r-01aのような形式）
		/\b([あ-んア-ンa-zA-Zａ-ｚＡ-Ｚ])[-－ー]\d{2}/,
	];

	for (const pattern of blockPatterns) {
		const match = text.match(pattern);
		if (match) {
			// 全角英字を半角に変換
			let block = match[1];
			if (/[ａ-ｚＡ-Ｚ]/.test(block)) {
				block = block.replace(/[ａ-ｚＡ-Ｚ]/g, (s) =>
					String.fromCharCode(s.charCodeAt(0) - 0xfee0),
				);
			}
			info.block = block;
			break;
		}
	}

	// スペース番号の抽出（2桁の数字を探す）
	// ホールの後、かつサイド文字の前にある2桁の数字を優先
	const spacePatterns = [
		// カギ括弧内の番号を優先（「ニ24ab」のような形式）
		/「[^」]*?(\d{2})[ab]*」/,
		// ホール関連の後の番号
		/[東西南][^0-9]*?(\d{2})(?:[ab\s]|$)/,
		// ハイフンの後の番号
		/[-－ー]\s*(\d{2})(?:[ab\s]|$)/,
		// 単独の2桁数字
		/\b(\d{2})(?:[ab\s]|$)/,
	];

	for (const pattern of spacePatterns) {
		const match = text.match(pattern);
		if (match) {
			info.space = match[1];
			break;
		}
	}

	// サイドの抽出（a, b, ab）
	// スペース番号の直後にあるものを優先
	if (info.space) {
		const sidePattern = new RegExp(`${info.space}\\s*([ab]{1,2})\\b`, "i");
		const sideMatch = text.match(sidePattern);
		if (sideMatch) {
			info.side = sideMatch[1].toLowerCase();
		}
	} else {
		// スペース番号がない場合は、単独で探す
		const sideMatch = text.match(/\b([ab]{1,2})\b/);
		if (sideMatch) {
			info.side = sideMatch[1].toLowerCase();
		}
	}

	return info;
};

/**
 * 抽出したコミケ情報を表示用にフォーマット
 * @param info コミケ情報
 * @returns フォーマットされた文字列
 */
export const formatComiketInfo = (info: ComiketInfo): string => {
	const parts: string[] = [];

	if (info.date) {
		parts.push(info.date);
	}

	if (info.hall) {
		let hallStr = info.hall;
		if (info.entrance) {
			hallStr += info.entrance;
		}
		parts.push(hallStr);
	}

	if (info.block) {
		parts.push(info.block);
	}

	if (info.space) {
		let spaceStr = info.space;
		if (info.side) {
			spaceStr += info.side;
		}
		parts.push(spaceStr);
	}

	return parts.join(" ");
};
