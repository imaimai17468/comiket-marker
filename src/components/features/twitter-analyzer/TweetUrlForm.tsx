"use client";

import { Loader2, Search } from "lucide-react";
import { useId, useState } from "react";
import { isValidTwitterUrl } from "@/components/shared/twitter-embed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type TweetUrlFormProps = {
	onSubmit: (url: string) => void;
	isLoading?: boolean;
};

export const TweetUrlForm = ({
	onSubmit,
	isLoading = false,
}: TweetUrlFormProps) => {
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const tweetUrlInputId = useId();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!url.trim()) {
			setError("URLを入力してください");
			return;
		}

		if (!isValidTwitterUrl(url)) {
			setError("有効なTwitter/X のツイートURLを入力してください");
			return;
		}

		onSubmit(url);
	};

	return (
		<Card className="gap-1 bg-white/95 py-2 backdrop-blur">
			<CardHeader>
				<CardTitle className="text-sm sm:text-base">
					ツイートからブースを保存
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit}>
					<div className="space-y-2">
						<div className="flex gap-2">
							<Input
								id={tweetUrlInputId}
								type="url"
								placeholder="URLを入力"
								value={url}
								onChange={(e) => {
									setUrl(e.target.value);
									setError(null);
								}}
								disabled={isLoading}
								className={error ? "border-red-500" : ""}
							/>
							<Button type="submit" disabled={isLoading} className="shrink-0">
								{isLoading ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										追加中
									</>
								) : (
									<>
										<Search className="h-4 w-4" />
										追加
									</>
								)}
							</Button>
						</div>
						<p className="text-muted-foreground text-xs">
							例: https://x.com/username/status/1234567890
						</p>
						{error && <p className="text-red-500 text-sm">{error}</p>}
						<p className="text-muted-foreground text-xs">
							※ 取得できない場合は手動入力も可能です
						</p>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
