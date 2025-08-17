import type { BlockHighlights } from "@/components/features/comiket-layout-map/types";
import { normalizeBlockName } from "@/utils/comiket-block-map";
import type { ComiketInfo } from "@/utils/comiket-parser";

/**
 * コミケ情報からブロックごとのブース番号を抽出
 * @param infoList コミケ情報のリスト
 * @returns ブロック名をキー、ブース番号の配列を値とするオブジェクト
 */
export const getHighlightedBoothsByBlock = (
	infoList: ComiketInfo[],
): BlockHighlights => {
	const result: BlockHighlights = {};

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
