import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import WallCircle from "./WallCircle";

type WallCircleContainerProps = {
	children: React.ReactNode;
	highlightedBooths?: number[];
	boothUserMap?: Map<string, BoothUserData>;
	onBoothClick?: (userData: BoothUserData) => void;
};

/**
 * 壁サークルを配置するコンテナ
 * 左、上、右に壁サークルを配置し、中央に島配置を表示
 * 番号は右→上→左の順に継承
 */
const WallCircleContainer = ({
	children,
	highlightedBooths = [],
	boothUserMap,
	onBoothClick,
}: WallCircleContainerProps) => {
	// 右側の壁サークル配置（下から順に3, 3, 4, 4, 3, 3、下から1が開始）
	let currentNumber = 1;
	const rightWallGroups = [
		{ count: 3, startNumber: currentNumber, strikethrough: false }, // 一番下
	];
	currentNumber += 3;
	rightWallGroups.push({
		count: 3,
		startNumber: currentNumber,
		strikethrough: true,
	}); // 2番目（斜線あり）
	currentNumber += 3;
	rightWallGroups.push({
		count: 4,
		startNumber: currentNumber,
		strikethrough: false,
	});
	currentNumber += 4;
	rightWallGroups.push({
		count: 4,
		startNumber: currentNumber,
		strikethrough: false,
	});
	currentNumber += 4;
	rightWallGroups.push({
		count: 3,
		startNumber: currentNumber,
		strikethrough: false,
	});
	currentNumber += 3;
	rightWallGroups.push({
		count: 3,
		startNumber: currentNumber,
		strikethrough: false,
	}); // 一番上
	currentNumber += 3; // 右側の最後の番号の次

	// 上側の壁サークル配置（右から順に7, 3, 7, 7, 3, 7, 7, 3, 7、右から左に数が増えていく）
	const topWallGroups = [
		{ count: 7, startNumber: currentNumber }, // 一番右
	];
	currentNumber += 7;
	topWallGroups.push({ count: 3, startNumber: currentNumber });
	currentNumber += 3;
	topWallGroups.push({ count: 7, startNumber: currentNumber });
	currentNumber += 7;
	topWallGroups.push({ count: 7, startNumber: currentNumber });
	currentNumber += 7;
	topWallGroups.push({ count: 3, startNumber: currentNumber });
	currentNumber += 3;
	topWallGroups.push({ count: 7, startNumber: currentNumber });
	currentNumber += 7;
	topWallGroups.push({ count: 7, startNumber: currentNumber });
	currentNumber += 7;
	topWallGroups.push({ count: 3, startNumber: currentNumber });
	currentNumber += 3;
	topWallGroups.push({ count: 7, startNumber: currentNumber }); // 一番左
	currentNumber += 7; // 上側の最後の番号の次

	// 左側の壁サークル配置（上から順に3, 3, 4, 4, 3, 3、上から下に数が増えてく）
	const leftWallGroups = [
		{ count: 3, startNumber: currentNumber }, // 一番上
	];
	currentNumber += 3;
	leftWallGroups.push({ count: 3, startNumber: currentNumber });
	currentNumber += 3;
	leftWallGroups.push({ count: 4, startNumber: currentNumber });
	currentNumber += 4;
	leftWallGroups.push({ count: 4, startNumber: currentNumber });
	currentNumber += 4;
	leftWallGroups.push({ count: 3, startNumber: currentNumber });
	currentNumber += 3;
	leftWallGroups.push({ count: 3, startNumber: currentNumber }); // 一番下

	return (
		<div className="inline-block">
			{/* 上側の壁サークル - 広く分散配置、右から左へ表示 */}
			<div className="mb-12">
				<div className="flex flex-row-reverse justify-around">
					{topWallGroups.map((group) => (
						<WallCircle
							key={`top-wall-${group.startNumber}`}
							count={group.count}
							startNumber={group.startNumber}
							orientation="horizontal"
							reverse={true}
							highlightedBooths={highlightedBooths}
							boothUserMap={boothUserMap}
							onBoothClick={onBoothClick}
						/>
					))}
				</div>
			</div>

			<div className="flex gap-12">
				{/* 左側の壁サークル */}
				<div className="flex flex-col justify-between gap-2">
					{leftWallGroups.map((group) => (
						<WallCircle
							key={`left-wall-${group.startNumber}`}
							count={group.count}
							startNumber={group.startNumber}
							orientation="vertical"
							highlightedBooths={highlightedBooths}
							boothUserMap={boothUserMap}
							onBoothClick={onBoothClick}
						/>
					))}
				</div>

				{/* 中央の島配置 */}
				<div>{children}</div>

				{/* 右側の壁サークル - 下から上へ配置 */}
				<div className="flex flex-col-reverse justify-between gap-2">
					{rightWallGroups.map((group) => (
						<WallCircle
							key={`right-wall-${group.startNumber}`}
							count={group.count}
							startNumber={group.startNumber}
							orientation="vertical"
							reverse={true}
							strikethrough={group.strikethrough}
							highlightedBooths={highlightedBooths}
							boothUserMap={boothUserMap}
							onBoothClick={onBoothClick}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default WallCircleContainer;
