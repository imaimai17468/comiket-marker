import { Image as ImageIcon, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TwitterUser } from "@/entities/twitter-user";

type TweetInfoDisplayProps = {
	tweetInfo: TwitterUser;
};

export const TweetInfoDisplay = ({ tweetInfo }: TweetInfoDisplayProps) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					ツイート情報
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">ユーザー名:</span>
						<Badge variant="secondary">@{tweetInfo.username}</Badge>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-muted-foreground text-sm">表示名:</span>
						<span className="font-medium">{tweetInfo.displayName}</span>
					</div>
				</div>

				<div className="space-y-2">
					<div className="mb-2 flex items-center gap-2">
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">ツイート内容</span>
					</div>
					<div className="rounded-lg bg-muted/50 p-4">
						<p className="whitespace-pre-wrap text-sm">
							{tweetInfo.tweetContent || "（内容を取得できませんでした）"}
						</p>
					</div>
				</div>

				{tweetInfo.tweetImages && tweetInfo.tweetImages.length > 0 && (
					<div className="space-y-2">
						<div className="mb-2 flex items-center gap-2">
							<ImageIcon className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-sm">
								画像 ({tweetInfo.tweetImages.length}枚)
							</span>
						</div>
						<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
							{tweetInfo.tweetImages.map((imageUrl) => (
								<div
									key={imageUrl}
									className="relative aspect-video overflow-hidden rounded-lg border bg-muted"
								>
									<a
										href={imageUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="group block h-full w-full"
									>
										{/* biome-ignore lint/performance/noImgElement: 外部URLの画像のため next/image は使用不可 */}
										<img
											src={imageUrl}
											alt="ツイート画像"
											className="h-full w-full bg-black/5 object-contain transition-opacity group-hover:opacity-90"
											loading="lazy"
										/>
										<div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
									</a>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
