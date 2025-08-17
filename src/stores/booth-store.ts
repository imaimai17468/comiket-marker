import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";

type BoothStore = {
	// State
	boothUserMap: Map<string, BoothUserData>;

	// Actions
	addBoothUser: (key: string, data: BoothUserData) => void;
	addMultipleBoothUsers: (entries: Array<[string, BoothUserData]>) => void;
	removeBoothUser: (key: string) => void;
	clearAllBooths: () => void;
	getBoothUser: (key: string) => BoothUserData | undefined;
};

export const useBoothStore = create<BoothStore>()(
	persist(
		(set, get) => ({
			// Initial state
			boothUserMap: new Map(),

			// Actions
			addBoothUser: (key, data) =>
				set((state) => {
					const newMap = new Map(state.boothUserMap);
					newMap.set(key, data);
					return { boothUserMap: newMap };
				}),

			addMultipleBoothUsers: (entries) =>
				set((state) => {
					const newMap = new Map(state.boothUserMap);
					for (const [key, data] of entries) {
						newMap.set(key, data);
					}
					return { boothUserMap: newMap };
				}),

			removeBoothUser: (key) =>
				set((state) => {
					const newMap = new Map(state.boothUserMap);
					newMap.delete(key);
					return { boothUserMap: newMap };
				}),

			clearAllBooths: () => set(() => ({ boothUserMap: new Map() })),

			getBoothUser: (key) => {
				const state = get();
				return state.boothUserMap.get(key);
			},
		}),
		{
			name: "comiket-booth-storage", // localStorage内のキー名
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					const parsed = JSON.parse(str);
					// MapをJSONから復元
					return {
						...parsed,
						state: {
							...parsed.state,
							boothUserMap: new Map(parsed.state.boothUserMap),
						},
					};
				},
				setItem: (name, value) => {
					// MapをJSONに変換
					const stringified = JSON.stringify({
						...value,
						state: {
							...value.state,
							boothUserMap: Array.from(value.state.boothUserMap.entries()),
						},
					});
					localStorage.setItem(name, stringified);
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
);
