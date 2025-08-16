"use client";

import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidTwitterUrl } from "./embedUtils";

type TwitterEmbedProps = {
	tweetUrl: string;
	className?: string;
};

type OEmbedResponse = {
	html: string;
	width: number;
	height: number | null;
	author_name: string;
	author_url: string;
};

export const TwitterEmbed = ({
	tweetUrl,
	className = "",
}: TwitterEmbedProps) => {
	const [embedHtml, setEmbedHtml] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchEmbed = async () => {
			if (!isValidTwitterUrl(tweetUrl)) {
				setError("無効なTwitter URLです");
				setIsLoading(false);
				return;
			}

			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch("/api/twitter-embed", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ url: tweetUrl }),
				});

				if (!response.ok) {
					throw new Error("ツイートの取得に失敗しました");
				}

				const data: OEmbedResponse = await response.json();
				setEmbedHtml(data.html);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "予期しないエラーが発生しました",
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEmbed();
	}, [tweetUrl]);

	useEffect(() => {
		if (embedHtml && window.twttr) {
			window.twttr.widgets.load();
		}
	}, [embedHtml]);

	if (isLoading) {
		return (
			<Card className={`p-4 ${className}`}>
				<div className="space-y-3">
					<div className="flex items-center space-x-3">
						<Skeleton className="h-12 w-12 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-4 w-48" />
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className={className}>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	if (!embedHtml) {
		return null;
	}

	return (
		<div
			className={`twitter-embed-container ${className}`}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Twitter oEmbed APIから取得した安全なHTMLを表示するため
			dangerouslySetInnerHTML={{ __html: embedHtml }}
		/>
	);
};
