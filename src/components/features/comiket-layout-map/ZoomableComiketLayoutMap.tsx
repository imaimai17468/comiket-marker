"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
	type ReactZoomPanPinchRef,
	TransformComponent,
	TransformWrapper,
} from "react-zoom-pan-pinch";
import ComiketIsland from "@/components/features/comiket-island/ComiketIsland";
import WallCircleContainer from "@/components/features/wall-circle/WallCircleContainer";
import { ALL_BLOCKS_ORDER } from "@/utils/comiket-block-map";
import type { BoothUserData, ComiketLayoutMapProps } from "./types";
import { ZoomControls } from "./ZoomControls";

export type ZoomableComiketLayoutMapRef = {
	centerOnBooth: (block: string, boothNumber: number) => void;
};

/**
 * 拡大縮小可能なコミケ島配置マップコンポーネント
 * マウスホイール、ピンチ操作、コントロールボタンでの操作に対応
 */
const ZoomableComiketLayoutMap = forwardRef<
	ZoomableComiketLayoutMapRef,
	ComiketLayoutMapProps
>(({ highlightedBooths, boothUserMap }, ref) => {
	const transformRef = useRef<ReactZoomPanPinchRef>(null);

	// 右から（イ側から）: 4, 8, 5, 8, 8, 4個のグループ
	// ニとナの間が境目になるように調整
	const groupSizes = [4, 8, 5, 8, 8, 4];

	const handleBoothClick = (userData: BoothUserData) => {
		// ツイートを新しいタブで開く
		window.open(userData.tweetUrl, "_blank");
	};

	// ブースの位置を計算して中心に移動
	useImperativeHandle(ref, () => ({
		centerOnBooth: (block: string, boothNumber: number) => {
			if (!transformRef.current) return;

			// DOM要素を直接取得
			setTimeout(() => {
				const boothId = `booth-${block}-${boothNumber}`;
				const boothElement = document.getElementById(boothId);

				if (!boothElement) {
					if (transformRef.current) {
						// 要素が見つからない場合は、全体を表示
						transformRef.current.resetTransform();
					}
					return;
				}

				if (boothElement && transformRef.current) {
					// zoomToElementメソッドを使用（もし利用可能なら）
					if (transformRef.current.zoomToElement) {
						transformRef.current.zoomToElement(boothElement, 1.5, 500);
					} else {
						// フォールバック: centerViewを使用してから微調整
						transformRef.current.centerView(1.5, 300, "easeOut");

						setTimeout(() => {
							if (!transformRef.current) return;

							// 要素の位置を取得
							const rect = boothElement.getBoundingClientRect();
							const wrapper = document.querySelector(
								".react-transform-wrapper",
							);
							if (!wrapper) return;

							const wrapperRect = wrapper.getBoundingClientRect();

							// 現在のトランスフォーム状態を取得
							const state = transformRef.current.instance.transformState;

							// 要素の中心とビューポートの中心の差を計算
							const elementCenterX = rect.left + rect.width / 2;
							const elementCenterY = rect.top + rect.height / 2;
							const viewportCenterX = wrapperRect.left + wrapperRect.width / 2;
							const viewportCenterY = wrapperRect.top + wrapperRect.height / 2;

							// 差分を計算
							const diffX = viewportCenterX - elementCenterX;
							const diffY = viewportCenterY - elementCenterY;

							// 現在の位置に差分を加える
							transformRef.current.setTransform(
								state.positionX + diffX,
								state.positionY + diffY,
								state.scale,
								300,
								"easeOut",
							);
						}, 350); // centerViewのアニメーション完了を待つ
					}
				}
			}, 200); // DOM更新待ち
		},
	}));

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
				ref={transformRef}
				initialScale={0.6}
				minScale={0.3}
				maxScale={2.5}
				wheel={{ step: 0.2, smoothStep: 0.02 }}
				doubleClick={{ mode: "reset" }}
				centerOnInit
				limitToBounds={false}
				smooth={true}
				velocityAnimation={{
					sensitivity: 1,
					animationTime: 200,
					animationType: "easeOut",
				}}
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
						<WallCircleContainer
							highlightedBooths={highlightedBooths.ア || []}
							boothUserMap={boothUserMap}
							onBoothClick={handleBoothClick}
						>
							<div className="inline-flex items-center gap-12 pb-2">
								{renderIslandGroups()}
							</div>
						</WallCircleContainer>
					</div>
				</TransformComponent>
			</TransformWrapper>
		</div>
	);
});

ZoomableComiketLayoutMap.displayName = "ZoomableComiketLayoutMap";

export default ZoomableComiketLayoutMap;
