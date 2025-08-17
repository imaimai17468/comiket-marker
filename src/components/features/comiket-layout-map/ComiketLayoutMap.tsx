import ComiketIsland from "@/components/features/comiket-island/ComiketIsland";
import WallCircleContainer from "@/components/features/wall-circle/WallCircleContainer";
import { ALL_BLOCKS_ORDER } from "@/utils/comiket-block-map";
import type { ComiketLayoutMapProps } from "./types";

/**
 * コミケ島配置マップコンポーネント
 * 島配置と壁サークルを統合して表示
 */
const ComiketLayoutMap = ({ highlightedBooths }: ComiketLayoutMapProps) => {
	// 右から（イ側から）: 4, 8, 8, 5, 8, 4個のグループ
	const groupSizes = [4, 8, 8, 5, 8, 4];

	const renderIslandGroups = () => {
		let index = 0;

		return groupSizes.map((size) => {
			const groupBlocks = ALL_BLOCKS_ORDER.slice(index, index + size);
			index += size;

			return (
				<div
					key={`group-${groupBlocks[0]}-${groupBlocks[groupBlocks.length - 1]}`}
					className="inline-flex items-center gap-4"
				>
					{groupBlocks.map((block) => (
						<ComiketIsland
							key={block}
							block={block}
							highlightedBooths={highlightedBooths[block] || []}
						/>
					))}
				</div>
			);
		});
	};

	return (
		<WallCircleContainer>
			<div className="inline-flex items-center gap-12 pb-2">
				{renderIslandGroups()}
			</div>
		</WallCircleContainer>
	);
};

export default ComiketLayoutMap;
