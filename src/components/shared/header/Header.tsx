"use client";

import { Calendar, List, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";
import { SortableBoothList } from "@/components/features/twitter-analyzer/SortableBoothList";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBoothStore } from "@/stores/booth-store";
import { useMapStore } from "@/stores/map-store";
import { matchesDateFilter } from "@/utils/comiket-date-utils";

export const Header = () => {
	const { boothUserMap, clearAllBooths } = useBoothStore();
	const { selectedDay, setSelectedDay, centerOnBooth } = useMapStore();
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	// フィルタリングされたブースマップ
	const filteredBoothUserMap = new Map(
		Array.from(boothUserMap.entries()).filter(([_, data]) => {
			return matchesDateFilter(data.comiketInfo.date, selectedDay);
		}),
	);

	// ブースをクリックしてズーム
	const handleBoothClick = (userData: BoothUserData) => {
		const info = userData.comiketInfo;
		if (info.block && info.space) {
			centerOnBooth(info.block, Number(info.space));
			setIsSheetOpen(false);
		}
	};

	return (
		<header className="sticky top-0 z-50 border-b bg-white">
			<div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
				<div>
					<h1 className="font-medium text-xl sm:text-2xl">
						<Link href="/">
							<span className="sm:hidden">
								コミケ
								<br />
								マーカー
							</span>
							<span className="hidden sm:inline">コミケマーカー</span>
						</Link>
					</h1>
				</div>
				<div className="flex items-center gap-2 sm:gap-3">
					{/* 日付フィルター */}
					<div className="flex items-center gap-1 sm:gap-2">
						<Calendar className="hidden h-4 w-4 text-muted-foreground sm:block" />
						<ToggleGroup
							type="single"
							value={selectedDay}
							onValueChange={(value) => {
								if (value) setSelectedDay(value as "all" | "day1" | "day2");
							}}
							className="flex gap-1"
						>
							<ToggleGroupItem
								value="all"
								className="h-8 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
								aria-label="すべて表示"
							>
								すべて
							</ToggleGroupItem>
							<ToggleGroupItem
								value="day1"
								className="h-8 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
								aria-label="1日目（土曜）"
							>
								1日目
							</ToggleGroupItem>
							<ToggleGroupItem
								value="day2"
								className="h-8 px-2 text-xs sm:h-8 sm:px-3 sm:text-sm"
								aria-label="2日目（日曜）"
							>
								2日目
							</ToggleGroupItem>
						</ToggleGroup>
					</div>

					{/* リスト表示ボタン */}
					<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
						<SheetTrigger asChild>
							<Button
								variant="outline"
								disabled={boothUserMap.size === 0}
								size="sm"
								className="px-2 sm:px-3"
							>
								<Menu className="h-4 w-4 sm:hidden" />
								<List className="hidden h-4 w-4 sm:block" />
								<span className="hidden sm:inline">
									リスト ({filteredBoothUserMap.size}/{boothUserMap.size})
								</span>
							</Button>
						</SheetTrigger>
						<SheetContent className="w-full gap-2">
							<SheetHeader>
								<SheetTitle>保存済みブース一覧</SheetTitle>
								<div className="text-muted-foreground text-xs">
									{selectedDay !== "all" && (
										<>
											{selectedDay === "day1"
												? "1日目（土曜）"
												: "2日目（日曜）"}
											:{filteredBoothUserMap.size} /
										</>
									)}
									合計 {boothUserMap.size} 件
								</div>
							</SheetHeader>
							{boothUserMap.size > 0 && (
								<div className="flex justify-end">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											if (confirm("すべてのブース情報を削除しますか？")) {
												clearAllBooths();
											}
										}}
										className="h-7 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive"
									>
										すべて削除
									</Button>
								</div>
							)}
							<div className="mt-2 max-h-[calc(100vh-180px)] overflow-y-auto">
								<SortableBoothList
									onBoothClick={handleBoothClick}
									boothUserMap={filteredBoothUserMap}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
};
