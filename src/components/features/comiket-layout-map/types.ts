import type { TwitterUser } from "@/entities/twitter-user";
import type { ComiketInfo } from "@/utils/comiket-parser";

export type BlockHighlights = Record<string, number[]>;

export type BoothUserData = {
	comiketInfo: ComiketInfo;
	twitterUser: TwitterUser;
	tweetUrl: string;
};

export type ComiketLayoutMapProps = {
	highlightedBooths: BlockHighlights;
	boothUserMap?: Map<string, BoothUserData>;
};
