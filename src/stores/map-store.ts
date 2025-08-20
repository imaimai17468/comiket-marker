import { create } from "zustand";
import type { ZoomableComiketLayoutMapRef } from "@/components/features/comiket-layout-map/ZoomableComiketLayoutMap";

type MapState = {
	selectedDay: "all" | "day1" | "day2";
	mapRef: ZoomableComiketLayoutMapRef | null;
	setSelectedDay: (day: "all" | "day1" | "day2") => void;
	setMapRef: (ref: ZoomableComiketLayoutMapRef | null) => void;
	centerOnBooth: (block: string, boothNumber: number) => void;
};

export const useMapStore = create<MapState>((set, get) => ({
	selectedDay: "all",
	mapRef: null,
	setSelectedDay: (day) => set({ selectedDay: day }),
	setMapRef: (ref) => set({ mapRef: ref }),
	centerOnBooth: (block, boothNumber) => {
		const { mapRef } = get();
		if (mapRef?.centerOnBooth) {
			mapRef.centerOnBooth(block, boothNumber);
		}
	},
}));
