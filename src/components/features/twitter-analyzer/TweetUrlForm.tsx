"use client";

import { Loader2, Search } from "lucide-react";
import { useId, useState } from "react";
import { isValidTwitterUrl } from "@/components/shared/twitter-embed";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
		<Card>
			<CardHeader>
				<CardTitle>ツイート解析</CardTitle>
				<CardDescription>
					Twitter/X のツイートURLを入力して、内容を解析します
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor={tweetUrlInputId}>ツイートURL</Label>
						<div className="flex gap-2">
							<Input
								id={tweetUrlInputId}
								type="url"
								placeholder="https://x.com/username/status/..."
								value={url}
								onChange={(e) => {
									setUrl(e.target.value);
									setError(null);
								}}
								disabled={isLoading}
								className={error ? "border-red-500" : ""}
							/>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										解析中
									</>
								) : (
									<>
										<Search className="mr-2 h-4 w-4" />
										解析
									</>
								)}
							</Button>
						</div>
						{error && <p className="text-red-500 text-sm">{error}</p>}
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
