"use client";

import { useState } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getBlockInfo } from "@/utils/comiket-block-map";
import type { BoothPosition, ComiketIslandProps } from "./types";

const ComiketIsland = ({
	boothCount,
	block,
	highlightedBooths = [],
	boothUserMap,
	onBoothClick,
}: ComiketIslandProps) => {
	const [selectedBooth, setSelectedBooth] = useState<number | null>(null);
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

	// ブースに関連するユーザー情報を取得
	const getBoothUserData = (boothNumber: number) => {
		if (!boothUserMap || !block) return null;

		// 各ホールのブロックをチェック
		for (const [key, userData] of boothUserMap.entries()) {
			// キーは "hall-block-space" の形式（hallは空の場合もある）
			const parts = key.split("-");

			// blockの位置を特定（hallが空の場合は最初のパートが空文字列）
			if (parts.length >= 3) {
				// hallが空の場合: ["", "block", "space"]
				// hallがある場合: ["hall", "block", "space"]
				const keyBlock = parts[parts.length - 2]; // 後ろから2番目がblock
				const keySpace = parts[parts.length - 1]; // 最後がspace

				if (keyBlock === block && keySpace === String(boothNumber)) {
					return userData;
				}
			}
		}
		return null;
	};

	// ブースクリック時の処理
	const handleBoothClick = (boothNumber: number) => {
		const userData = getBoothUserData(boothNumber);
		if (userData && onBoothClick) {
			setSelectedBooth(boothNumber);
			onBoothClick(userData);
		}
	};

	// ブースセルのレンダリング
	const renderBoothCell = (booth: BoothPosition, key: string) => {
		const userData = booth.boothNumber
			? getBoothUserData(booth.boothNumber)
			: null;
		const isHighlighted =
			booth.boothNumber && highlightedBooths.includes(booth.boothNumber);
		const isSelected = booth.boothNumber === selectedBooth;

		// IDを生成する際はブロック名を正規化
		const boothId =
			isHighlighted && block && booth.boothNumber
				? `booth-${block}-${booth.boothNumber}`
				: undefined;

		const cellContent = (
			<td
				id={boothId}
				key={key}
				className={cn(
					"border border-gray-600 p-2 text-center align-middle transition-colors",
					isHighlighted
						? "bg-yellow-300 hover:bg-yellow-400"
						: "bg-white hover:bg-gray-50",
					isSelected && "ring-2 ring-blue-500",
					userData && "cursor-pointer",
				)}
				onClick={() => booth.boothNumber && handleBoothClick(booth.boothNumber)}
				onKeyDown={(e) => {
					if ((e.key === "Enter" || e.key === " ") && booth.boothNumber) {
						e.preventDefault();
						handleBoothClick(booth.boothNumber);
					}
				}}
				tabIndex={userData ? 0 : -1}
				role={userData ? "button" : undefined}
			>
				{booth.boothNumber && (
					<span
						className={cn(
							"text-xs",
							isHighlighted ? "font-bold text-gray-900" : "text-gray-700",
						)}
					>
						{booth.boothNumber}
					</span>
				)}
			</td>
		);

		// ユーザー情報がある場合はTooltipでラップ
		if (userData) {
			return (
				<TooltipProvider key={key}>
					<Tooltip>
						<TooltipTrigger asChild>{cellContent}</TooltipTrigger>
						<TooltipContent>
							<p className="font-semibold">
								{userData.twitterUser.displayName}
							</p>
							<p className="text-gray-300 text-xs">
								@{userData.twitterUser.username}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}

		return cellContent;
	};

	return (
		<div className="flex flex-col items-center">
			{/* 上部 */}
			<div>
				<table className="border-separate border-spacing-0 border-2 border-gray-800">
					<tbody>
						{upperLayout.map((row) => (
							<tr key={`upper-row-${row[1].boothNumber}`}>
								{row.map((booth) =>
									renderBoothCell(booth, `booth-${booth.row}-${booth.column}`),
								)}
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
								{row.map((booth) =>
									renderBoothCell(
										booth,
										`booth-lower-${booth.row}-${booth.column}`,
									),
								)}
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
