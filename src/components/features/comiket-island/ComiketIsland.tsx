import { cn } from "@/lib/utils";
import { getBlockInfo } from "@/utils/comiket-block-map";
import type { BoothPosition, ComiketIslandProps } from "./types";

const ComiketIsland = ({
	boothCount,
	block,
	highlightedBooths = [],
}: ComiketIslandProps) => {
	// ブロック名が指定されている場合はブロック情報から取得
	const actualBoothCount = (() => {
		if (block) {
			const blockInfo = getBlockInfo(block);
			return blockInfo?.boothCount ?? 66;
		}
		return boothCount ?? 66;
	})();
	const createBoothLayout = (count: number): BoothPosition[][] => {
		const rows = Math.ceil(count / 2);
		const layout: BoothPosition[][] = [];

		for (let row = 0; row < rows; row++) {
			const currentRow: BoothPosition[] = [];

			// 右列：下から上へ（1, 2, 3, ...）
			const rightBoothNumber = rows - row;

			// 左列：上から下へ（rows+1, rows+2, ...）
			// ただし、全体のブース数を超えない
			const leftBoothNumber = rows + row + 1 <= count ? rows + row + 1 : null;

			currentRow.push({
				row,
				column: 0,
				boothNumber: leftBoothNumber,
			});

			currentRow.push({
				row,
				column: 1,
				boothNumber: rightBoothNumber,
			});

			layout.push(currentRow);
		}

		return layout;
	};

	// 全体のレイアウトを作成
	const fullLayout = createBoothLayout(actualBoothCount);

	// 上部と下部に分割するための行数を計算（下部が同じか多くなるように）
	const totalRows = fullLayout.length;
	const upperRows = Math.floor(totalRows / 2);
	const _lowerRows = totalRows - upperRows;

	// レイアウトを上下に分割
	const upperLayout = fullLayout.slice(0, upperRows);
	const lowerLayout = fullLayout.slice(upperRows);

	return (
		<div className="flex flex-col items-center">
			{/* 上部 */}
			<div>
				<table className="border-separate border-spacing-0 border-2 border-gray-800">
					<tbody>
						{upperLayout.map((row) => (
							<tr key={`upper-row-${row[1].boothNumber}`}>
								{row.map((booth) => (
									<td
										key={`booth-${booth.row}-${booth.column}`}
										className={cn(
											"border border-gray-600 p-2 text-center align-middle transition-colors",
											booth.boothNumber &&
												highlightedBooths.includes(booth.boothNumber)
												? "bg-yellow-300 hover:bg-yellow-400"
												: "bg-white hover:bg-gray-50",
										)}
									>
										{booth.boothNumber && (
											<span
												className={cn(
													"text-xs",
													highlightedBooths.includes(booth.boothNumber)
														? "font-bold text-gray-900"
														: "text-gray-700",
												)}
											>
												{booth.boothNumber}
											</span>
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* ブロック名 */}
			<div className="flex items-center justify-center py-1">
				<span className="font-bold text-sm">
					{block ? getBlockInfo(block)?.block || block : ""}
				</span>
			</div>

			{/* 下部 */}
			<div>
				<table className="border-separate border-spacing-0 border-2 border-gray-800">
					<tbody>
						{lowerLayout.map((row) => (
							<tr key={`lower-row-${row[1].boothNumber}`}>
								{row.map((booth) => (
									<td
										key={`booth-${booth.row}-${booth.column}`}
										className={cn(
											"border border-gray-600 p-2 text-center align-middle transition-colors",
											booth.boothNumber &&
												highlightedBooths.includes(booth.boothNumber)
												? "bg-yellow-300 hover:bg-yellow-400"
												: "bg-white hover:bg-gray-50",
										)}
									>
										{booth.boothNumber && (
											<span
												className={cn(
													"text-xs",
													highlightedBooths.includes(booth.boothNumber)
														? "font-bold text-gray-900"
														: "text-gray-700",
												)}
											>
												{booth.boothNumber}
											</span>
										)}
									</td>
								))}
							</tr>
						))}
						{/* 48ブースの場合、高さ調整用の透明文字入り行を1行追加 */}
						{actualBoothCount === 48 && (
							<tr>
								<td className="border border-transparent p-2 text-transparent">
									_
								</td>
								<td className="border border-transparent p-2 text-transparent">
									_
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ComiketIsland;
