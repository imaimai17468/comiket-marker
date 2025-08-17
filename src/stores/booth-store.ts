import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoothUserData } from "@/components/features/comiket-layout-map/types";

type BoothStore = {
	// State
	boothUserMap: Map<string, BoothUserData>;
	visitedBooths: Set<string>; // 訪問済みブースのキー
	boothOrder: string[]; // ブースの表示順序

	// Actions
	addBoothUser: (key: string, data: BoothUserData) => void;
	addMultipleBoothUsers: (entries: Array<[string, BoothUserData]>) => void;
	removeBoothUser: (key: string) => void;
	clearAllBooths: () => void;
	getBoothUser: (key: string) => BoothUserData | undefined;
	toggleBoothVisited: (key: string) => void;
	isBoothVisited: (key: string) => boolean;
	clearVisitedBooths: () => void;
	reorderBooths: (newOrder: string[]) => void;
	getOrderedBooths: () => Array<[string, BoothUserData]>;
};

export const useBoothStore = create<BoothStore>()(
	persist(
		(set, get) => ({
			// Initial state
			boothUserMap: new Map(),
			visitedBooths: new Set(),
			boothOrder: [],

			// Actions
			addBoothUser: (key, data) =>
				set((state) => {
					const newMap = new Map(state.boothUserMap);
					newMap.set(key, data);
					const newOrder = [...state.boothOrder];
					if (!newOrder.includes(key)) {
						newOrder.push(key);
					}
					return { boothUserMap: newMap, boothOrder: newOrder };
				}),

			addMultipleBoothUsers: (entries) =>
				set((state) => {
					const newMap = new Map(state.boothUserMap);
					const newOrder = [...state.boothOrder];
					for (const [key, data] of entries) {
						newMap.set(key, data);
						if (!newOrder.includes(key)) {
							newOrder.push(key);
						}
					}
					return { boothUserMap: newMap, boothOrder: newOrder };
				}),

			removeBoothUser: (key) =>
				set((state) => {
					const newMap = new Map(state.boothUserMap);
					const newVisited = new Set(state.visitedBooths);
					const newOrder = state.boothOrder.filter((k) => k !== key);
					newMap.delete(key);
					newVisited.delete(key); // 削除時に訪問済み状態も削除
					return {
						boothUserMap: newMap,
						visitedBooths: newVisited,
						boothOrder: newOrder,
					};
				}),

			clearAllBooths: () =>
				set(() => ({
					boothUserMap: new Map(),
					visitedBooths: new Set(),
					boothOrder: [],
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

			reorderBooths: (newOrder) => set(() => ({ boothOrder: newOrder })),

			getOrderedBooths: () => {
				const state = get();
				const orderedEntries: Array<[string, BoothUserData]> = [];

				// boothOrderが空の場合は、MapのエントリーからboothOrderを初期化
				if (state.boothOrder.length === 0 && state.boothUserMap.size > 0) {
					const newOrder = Array.from(state.boothUserMap.keys());
					set({ boothOrder: newOrder });

					// 初期化したorderで返す
					for (const [key, data] of state.boothUserMap.entries()) {
						orderedEntries.push([key, data]);
					}
					return orderedEntries;
				}

				// 順序配列に従って並べる
				for (const key of state.boothOrder) {
					const data = state.boothUserMap.get(key);
					if (data) {
						orderedEntries.push([key, data]);
					}
				}

				// 順序配列にないエントリーも追加（念のため）
				for (const [key, data] of state.boothUserMap.entries()) {
					if (!state.boothOrder.includes(key)) {
						orderedEntries.push([key, data]);
					}
				}

				return orderedEntries;
			},
		}),
		{
			name: "comiket-booth-storage", // localStorage内のキー名
			storage: {
				getItem: (name) => {
					const str = localStorage.getItem(name);
					if (!str) return null;
					const parsed = JSON.parse(str);
					// Map、Set、配列をJSONから復元
					return {
						...parsed,
						state: {
							...parsed.state,
							boothUserMap: new Map(parsed.state.boothUserMap),
							visitedBooths: new Set(parsed.state.visitedBooths || []),
							boothOrder: parsed.state.boothOrder || [],
						},
					};
				},
				setItem: (name, value) => {
					// Map、Set、配列をJSONに変換
					const stringified = JSON.stringify({
						...value,
						state: {
							...value.state,
							boothUserMap: Array.from(value.state.boothUserMap.entries()),
							visitedBooths: Array.from(value.state.visitedBooths),
							boothOrder: value.state.boothOrder,
						},
					});
					localStorage.setItem(name, stringified);
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		},
	),
);
