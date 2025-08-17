"use client";

import { useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import ComiketIsland from "@/components/features/comiket-island/ComiketIsland";
import WallCircleContainer from "@/components/features/wall-circle/WallCircleContainer";
import { TwitterEmbed } from "@/components/shared/twitter-embed";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ALL_BLOCKS_ORDER } from "@/utils/comiket-block-map";
import type { BoothUserData, ComiketLayoutMapProps } from "./types";
import { ZoomControls } from "./ZoomControls";

/**
 * 拡大縮小可能なコミケ島配置マップコンポーネント
 * マウスホイール、ピンチ操作、コントロールボタンでの操作に対応
 */
const ZoomableComiketLayoutMap = ({
	highlightedBooths,
	boothUserMap,
}: ComiketLayoutMapProps) => {
	const [selectedBooth, setSelectedBooth] = useState<BoothUserData | null>(
		null,
	);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// 右から（イ側から）: 4, 8, 8, 5, 8, 4個のグループ
	const groupSizes = [4, 8, 8, 5, 8, 4];

	const handleBoothClick = (userData: BoothUserData) => {
		setSelectedBooth(userData);
		setIsDialogOpen(true);
	};

	const renderIslandGroups = () => {
		let index = 0;

		return groupSizes.map((size) => {
			const groupBlocks = ALL_BLOCKS_ORDER.slice(index, index + size);
			index += size;

			return (
				<div
					key={`group-${groupBlocks[0]}-${groupBlocks[groupBlocks.length - 1]}`}
					className="inline-flex items-center gap-4"
				>
					{groupBlocks.map((block) => (
						<ComiketIsland
							key={block}
							block={block}
							highlightedBooths={highlightedBooths[block] || []}
							boothUserMap={boothUserMap}
							onBoothClick={handleBoothClick}
						/>
					))}
				</div>
			);
		});
	};

	return (
		<div className="relative h-full w-full overflow-hidden bg-gray-50">
			<TransformWrapper
				initialScale={0.6}
				minScale={0.3}
				maxScale={2.5}
				wheel={{ step: 0.1 }}
				doubleClick={{ mode: "reset" }}
				centerOnInit
				limitToBounds={false}
			>
				<ZoomControls />
				<TransformComponent
					wrapperStyle={{
						width: "100%",
						height: "100%",
					}}
					contentStyle={{
						width: "100%",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<div className="inline-block bg-white p-8">
						<WallCircleContainer>
							<div className="inline-flex items-center gap-12 pb-2">
								{renderIslandGroups()}
							</div>
						</WallCircleContainer>
					</div>
				</TransformComponent>
			</TransformWrapper>

			{/* 操作説明 */}
			<div className="absolute right-4 bottom-4 rounded bg-black/70 px-3 py-2 text-white text-xs">
				<p>マウス: ホイールで拡大縮小・ドラッグで移動</p>
				<p>タッチ: ピンチで拡大縮小・ドラッグで移動</p>
				<p>ダブルクリック: リセット</p>
			</div>

			{/* Twitter埋め込みダイアログ */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="flex max-h-[80vh] max-w-2xl flex-col p-0">
					<DialogHeader className="border-b px-6 pt-6 pb-4">
						<DialogTitle>
							{selectedBooth && (
								<div>
									<span className="font-bold">
										{selectedBooth.twitterUser.displayName}
									</span>
									<span className="ml-2 text-gray-400 text-sm">
										@{selectedBooth.twitterUser.username}
									</span>
								</div>
							)}
						</DialogTitle>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto px-6 py-4">
						{selectedBooth && (
							<TwitterEmbed tweetUrl={selectedBooth.tweetUrl} />
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ZoomableComiketLayoutMap;
