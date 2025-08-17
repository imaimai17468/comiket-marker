"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ExternalLink, GripVertical, Trash2 } from "lucide-react";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortableBoothItemProps = {
	id: string;
	userData: BoothUserData;
	isVisited: boolean;
	onBoothClick: () => void;
	onToggleVisited: () => void;
	onRemove: () => void;
};

export const SortableBoothItem = ({
	id,
	userData,
	isVisited,
	onBoothClick,
	onToggleVisited,
	onRemove,
}: SortableBoothItemProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"group relative cursor-pointer px-4 py-2 transition-colors duration-200 hover:bg-muted/30 sm:px-6",
				isVisited && "bg-green-50",
				isDragging && "opacity-50",
			)}
			onClick={onBoothClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					onBoothClick();
				}
			}}
			// biome-ignore lint/a11y/useSemanticElements: ネストしたボタンを避けるため
			role="button"
			tabIndex={0}
		>
			{/* ドラッグハンドル */}
			<div
				{...attributes}
				{...listeners}
				className="-translate-y-1/2 absolute top-1/2 left-1 cursor-move p-1 text-gray-400 hover:text-gray-600"
			>
				<GripVertical className="h-4 w-4" />
			</div>

			<div className="space-y-2 pr-24 pl-6">
				{/* アカウント情報 */}
				<div>
					<p className="font-semibold">{userData.twitterUser.displayName}</p>
					<p className="text-muted-foreground text-sm">
						@{userData.twitterUser.username}
					</p>
				</div>

				{/* ツイート内容 */}
				{userData.twitterUser.tweetContent && (
					<p className="line-clamp-3 text-gray-600 text-sm">
						{userData.twitterUser.tweetContent}
					</p>
				)}
			</div>

			{/* アクションボタン */}
			<div className="absolute top-3 right-4 flex gap-1 opacity-100 transition-opacity duration-200 sm:right-6">
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"h-6 w-6 p-0",
						isVisited ? "text-green-600 hover:bg-green-100" : "hover:bg-accent",
					)}
					onClick={(e) => {
						e.stopPropagation();
						onToggleVisited();
					}}
					aria-label={isVisited ? "訪問済み" : "未訪問"}
				>
					<Check className="h-3.5 w-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 hover:bg-accent"
					onClick={(e) => {
						e.stopPropagation();
						window.open(userData.tweetUrl, "_blank");
					}}
					aria-label="ツイートを見る"
				>
					<ExternalLink className="h-3.5 w-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
					aria-label="このブースを削除"
				>
					<Trash2 className="h-3.5 w-3.5" />
				</Button>
			</div>
		</div>
	);
};
