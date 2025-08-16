import { TwitterAnalyzer } from "@/components/features/twitter-analyzer";

export default function Home() {
	return (
		<div className="my-[10%] space-y-12">
			<div className="space-y-2">
				<h1 className="font-bold text-4xl">コミケットマーカー</h1>
				<p className="text-lg text-muted-foreground">
					ツイート情報からコミケ位置を自動抽出
				</p>
			</div>

			<TwitterAnalyzer />
		</div>
	);
}
