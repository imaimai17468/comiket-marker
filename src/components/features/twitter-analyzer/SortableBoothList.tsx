"use client";

import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import { useBoothStore } from "@/stores/booth-store";
import { SortableBoothItem } from "./SortableBoothItem";

type SortableBoothListProps = {
	onBoothClick: (userData: BoothUserData) => void;
	boothUserMap?: Map<string, BoothUserData>;
};

export const SortableBoothList = ({
	onBoothClick,
	boothUserMap,
}: SortableBoothListProps) => {
	const {
		getOrderedBooths,
		toggleBoothVisited,
		isBoothVisited,
		removeBoothUser,
		reorderBooths,
		boothUserMap: storeBoothUserMap,
	} = useBoothStore();

	// プロップスで渡されたマップか、storeのマップを使用
	const activeBoothUserMap = boothUserMap ?? storeBoothUserMap;

	// フィルタリングされたマップから順序付きブースを取得
	const orderedBooths = getOrderedBooths()
		.filter(([key]) => activeBoothUserMap.has(key))
		.map(
			([key]) => [key, activeBoothUserMap.get(key)!] as [string, BoothUserData],
		);
	const boothKeys = orderedBooths.map(([key]) => key);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = boothKeys.indexOf(active.id as string);
			const newIndex = boothKeys.indexOf(over.id as string);

			if (oldIndex !== -1 && newIndex !== -1) {
				const newOrder = arrayMove(boothKeys, oldIndex, newIndex);
				reorderBooths(newOrder);
			}
		}
	};

	// ブース削除ハンドラ
	const handleRemoveBooth = (key: string) => {
		if (confirm("このブース情報を削除しますか？")) {
			removeBoothUser(key);
		}
	};

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext items={boothKeys} strategy={verticalListSortingStrategy}>
				<div className="divide-y divide-border/50">
					{orderedBooths.map(([key, userData]) => (
						<SortableBoothItem
							key={key}
							id={key}
							userData={userData}
							isVisited={isBoothVisited(key)}
							onBoothClick={() => onBoothClick(userData)}
							onToggleVisited={() => toggleBoothVisited(key)}
							onRemove={() => handleRemoveBooth(key)}
						/>
					))}
				</div>
			</SortableContext>
		</DndContext>
	);
};
