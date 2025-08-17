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
		<Card className="bg-white/95 backdrop-blur">
			<CardHeader className="px-2 pt-1.5 pb-0 sm:px-3 sm:pt-2 sm:pb-1">
				<CardTitle className="text-sm sm:text-base">
					ツイートからブースを保存
				</CardTitle>
			</CardHeader>
			<CardContent className="px-2 pt-0 pb-1.5 sm:px-3 sm:pt-0 sm:pb-2">
				<form onSubmit={handleSubmit} className="space-y-1">
					<div className="space-y-0.5">
						<div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
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
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full sm:w-auto"
							>
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
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
