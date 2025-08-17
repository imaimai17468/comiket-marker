import type { ComiketInfo } from "@/utils/comiket-parser";
import { createComiketInfoCardData } from "./presenter";

type ComiketInfoCardProps = {
	info: ComiketInfo;
};

export const ComiketInfoCard = ({ info }: ComiketInfoCardProps) => {
	const cardData = createComiketInfoCardData(info);

	return (
		<div className="space-y-3 rounded-lg bg-secondary/50 p-4">
			<div className="flex items-center justify-between">
				<span className="font-bold text-lg">{cardData.formatted}</span>
			</div>

			<div className="grid grid-cols-2 gap-2 text-sm">
				{cardData.date && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">日程:</span>
						<span className="font-medium">{cardData.date}</span>
					</div>
				)}

				{cardData.hall && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">ホール:</span>
						<span className="font-medium">
							{cardData.hall}
							{cardData.entrance ? cardData.entrance : ""}
						</span>
					</div>
				)}

				{cardData.block && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">列:</span>
						<span className="font-medium">{cardData.block}</span>
					</div>
				)}

				{cardData.space && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">スペース:</span>
						<span className="font-medium">{cardData.space}</span>
					</div>
				)}

				{cardData.side && (
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground">サイド:</span>
						<span className="font-medium">{cardData.side}</span>
					</div>
				)}
			</div>
		</div>
	);
};
