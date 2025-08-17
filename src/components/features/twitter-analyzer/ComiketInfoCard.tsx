import type { ComiketInfo } from "@/utils/comiket-parser";
import { createComiketInfoCardData } from "./presenter";

type ComiketInfoCardProps = {
	info: ComiketInfo;
};

export const ComiketInfoCard = ({ info }: ComiketInfoCardProps) => {
	const cardData = createComiketInfoCardData(info);

	return (
		<div className="rounded-lg bg-secondary/50 p-3">
			<div className="mb-2 flex items-center justify-between">
				<span className="font-semibold text-sm">{cardData.formatted}</span>
			</div>

			<div className="grid grid-cols-2 gap-1 text-xs">
				{cardData.date && (
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">日程:</span>
						<span>{cardData.date}</span>
					</div>
				)}

				{cardData.hall && (
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">ホール:</span>
						<span>
							{cardData.hall}
							{cardData.entrance ? cardData.entrance : ""}
						</span>
					</div>
				)}

				{cardData.block && (
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">列:</span>
						<span>{cardData.block}</span>
					</div>
				)}

				{cardData.space && (
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">スペース:</span>
						<span>{cardData.space}</span>
					</div>
				)}

				{cardData.side && (
					<div className="flex items-center gap-1">
						<span className="text-muted-foreground">サイド:</span>
						<span>{cardData.side}</span>
					</div>
				)}
			</div>
		</div>
	);
};
