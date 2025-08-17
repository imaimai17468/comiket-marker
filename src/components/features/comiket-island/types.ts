import type { BoothUserData } from "@/components/features/comiket-layout-map/types";

export type ComiketIslandProps = {
	boothCount?: number;
	block?: string;
	highlightedBooths?: number[];
	boothUserMap?: Map<string, BoothUserData>;
	onBoothClick?: (userData: BoothUserData) => void;
};

export type BoothPosition = {
	row: number;
	column: number;
	boothNumber: number | null;
};
