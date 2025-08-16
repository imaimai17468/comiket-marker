export type ComiketIslandProps = {
	boothCount?: number;
	block?: string;
	highlightedBooths?: number[];
};

export type BoothPosition = {
	row: number;
	column: number;
	boothNumber: number | null;
};
