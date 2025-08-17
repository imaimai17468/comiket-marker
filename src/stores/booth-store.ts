import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";

type BoothStore = {
	// State
	boothUserMap: Map<string, BoothUserData>;
	visitedBooths: Set<string>; // 訪問済みブースのキー

	// Actions
	addBoothUser: (key: string, data: BoothUserData) => void;
	addMultipleBoothUsers: (entries: Array<[string, BoothUserData]>) => void;
	removeBoothUser: (key: string) => void;
	clearAllBooths: () => void;
	getBoothUser: (key: string) => BoothUserData | undefined;
	toggleBoothVisited: (key: string) => void;
	isBoothVisited: (key: string) => boolean;
	clearVisitedBooths: () => void;
};

export const useBoothStore = create<BoothStore>()(
	persist(
		(set, get) => ({
			// Initial state
			boothUserMap: new Map(),
			visitedBooths: new Set(),

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
					const newVisited = new Set(state.visitedBooths);
					newMap.delete(key);
					newVisited.delete(key); // 削除時に訪問済み状態も削除
					return { boothUserMap: newMap, visitedBooths: newVisited };
				}),

			clearAllBooths: () =>
				set(() => ({
					boothUserMap: new Map(),
					visitedBooths: new Set(),
				})),

			getBoothUser: (key) => {
				const state = get();
				return state.boothUserMap.get(key);
			},

			toggleBoothVisited: (key) =>
				set((state) => {
					const newVisited = new Set(state.visitedBooths);
					if (newVisited.has(key)) {
						newVisited.delete(key);
					} else {
						newVisited.add(key);
					}
					return { visitedBooths: newVisited };
				}),

			isBoothVisited: (key) => {
				const state = get();
				return state.visitedBooths.has(key);
			},

			clearVisitedBooths: () => set(() => ({ visitedBooths: new Set() })),
		}),
		{
			name: "comiket-booth-storage", // localStorage内のキー名
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					const parsed = JSON.parse(str);
					// MapとSetをJSONから復元
					return {
						...parsed,
						state: {
							...parsed.state,
							boothUserMap: new Map(parsed.state.boothUserMap),
							visitedBooths: new Set(parsed.state.visitedBooths || []),
						},
					};
				},
				setItem: (name, value) => {
					// MapとSetをJSONに変換
					const stringified = JSON.stringify({
						...value,
						state: {
							...value.state,
							boothUserMap: Array.from(value.state.boothUserMap.entries()),
							visitedBooths: Array.from(value.state.visitedBooths),
						},
					});
					localStorage.setItem(name, stringified);
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
);
