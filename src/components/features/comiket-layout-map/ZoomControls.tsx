"use client";

import { Minus, Plus, RotateCcw } from "lucide-react";
import { useControls } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";

/**
 * ズーム操作用のコントロールボタン
 */
export const ZoomControls = () => {
	const { zoomIn, zoomOut, resetTransform } = useControls();

	return (
		<div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2 sm:top-4 sm:bottom-auto">
			<Button
				onClick={() => zoomIn(0.3)}
				size="icon"
				variant="secondary"
				className="h-10 w-10 shadow-lg"
				aria-label="拡大"
			>
				<Plus className="h-5 w-5" />
			</Button>
			<Button
				onClick={() => zoomOut(0.3)}
				size="icon"
				variant="secondary"
				className="h-10 w-10 shadow-lg"
				aria-label="縮小"
			>
				<Minus className="h-5 w-5" />
			</Button>
			<Button
				onClick={() => resetTransform()}
				size="icon"
				variant="secondary"
				className="h-10 w-10 shadow-lg"
				aria-label="リセット"
			>
				<RotateCcw className="h-5 w-5" />
			</Button>
		</div>
	);
};
