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
		<Card className="gap-2 bg-white/95 backdrop-blur">
			<CardHeader className="px-3 pt-3 pb-0 sm:px-6 sm:pt-6 sm:pb-0">
				<CardTitle className="text-base sm:text-lg">
					ツイートからブースを保存
				</CardTitle>
			</CardHeader>
			<CardContent className="px-3 pt-2 pb-3 sm:px-6 sm:pt-0 sm:pb-6">
				<form onSubmit={handleSubmit} className="space-y-3">
					<div className="space-y-2">
						<div className="flex flex-col gap-2 sm:flex-row">
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
