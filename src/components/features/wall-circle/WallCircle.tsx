"use client";

import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import { cn } from "@/lib/utils";
import { useBoothStore } from "@/stores/booth-store";

type WallCircleProps = {
	count: number;
	startNumber: number;
	orientation: "horizontal" | "vertical";
	reverse?: boolean;
	strikethrough?: boolean;
	className?: string;
	highlightedBooths?: number[];
	boothUserMap?: Map<string, BoothUserData>;
	onBoothClick?: (userData: BoothUserData) => void;
};

/**
 * 壁サークルを表示するコンポーネント
 * @param count - ブロック内のサークル数
 * @param startNumber - 開始番号
 * @param orientation - 配置方向（horizontal: 横並び, vertical: 縦並び）
 * @param reverse - 番号を逆順に表示するか
 * @param strikethrough - 斜線を表示するか
 */
const WallCircle = ({
	count,
	startNumber,
	orientation,
	reverse = false,
	strikethrough = false,
	className,
	highlightedBooths = [],
	boothUserMap,
	onBoothClick,
}: WallCircleProps) => {
	const { isBoothVisited } = useBoothStore();

	const circles = Array.from({ length: count }, (_, i) => startNumber + i);
	if (reverse) {
		circles.reverse();
	}

	const handleClick = (num: number) => {
		if (!onBoothClick || !boothUserMap) return;

		// 壁サークルは「ア」ブロックとして扱う
		const key = `東-ア-${num.toString().padStart(2, "0")}`;
		const userData = boothUserMap.get(key);
		if (userData) {
			onBoothClick(userData);
		}
	};

	return (
		<div
			className={cn(
				"flex gap-1",
				orientation === "horizontal" ? "flex-row" : "flex-col",
				className,
			)}
		>
			{circles.map((num) => {
				const isHighlighted = highlightedBooths.includes(num);
				const boothKey = `東-ア-${num.toString().padStart(2, "0")}`;
				const hasUser = boothUserMap?.has(boothKey);
				const isVisited = isBoothVisited(boothKey);

				if (hasUser) {
					return (
						<button
							key={`wall-${num}`}
							id={`booth-ア-${num}`}
							className={cn(
								"relative flex h-8 w-8 cursor-pointer items-center justify-center border border-gray-600 text-xs transition-colors",
								isVisited
									? "bg-green-300 hover:bg-green-400"
									: isHighlighted
										? "bg-yellow-300 hover:bg-yellow-400"
										: "bg-white hover:bg-gray-50",
							)}
							type="button"
							onClick={() => handleClick(num)}
							title="クリックしてツイートを開く"
						>
							{num}
							{strikethrough && (
								<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
									<div className="h-full w-0.5 rotate-45 bg-gray-600" />
								</div>
							)}
						</button>
					);
				}

				return (
					<div
						key={`wall-${num}`}
						id={`booth-ア-${num}`}
						className={cn(
							"relative flex h-8 w-8 items-center justify-center border border-gray-600 text-xs transition-colors",
							isVisited
								? "bg-green-300 hover:bg-green-400"
								: isHighlighted
									? "bg-yellow-300 hover:bg-yellow-400"
									: "bg-white hover:bg-gray-50",
						)}
					>
						{num}
						{strikethrough && (
							<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
								<div className="h-full w-0.5 rotate-45 bg-gray-600" />
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default WallCircle;
