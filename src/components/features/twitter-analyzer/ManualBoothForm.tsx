"use client";

import { AlertCircle, Save, X } from "lucide-react";
import { useId, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TwitterUser } from "@/entities/twitter-user";
import type { ComiketInfo } from "@/utils/comiket-parser";

type ManualBoothFormProps = {
	twitterUser: TwitterUser;
	parsedInfo?: Partial<ComiketInfo>;
	onSubmit: (info: ComiketInfo) => void;
	onCancel: () => void;
};

export const ManualBoothForm = ({
	twitterUser,
	parsedInfo,
	onSubmit,
	onCancel,
}: ManualBoothFormProps) => {
	const formId = useId();
	const [date, setDate] = useState(parsedInfo?.date || "none");
	const [hall, setHall] = useState(parsedInfo?.hall || "");
	const [entrance, setEntrance] = useState(parsedInfo?.entrance || "none");
	const [block, setBlock] = useState(parsedInfo?.block || "");
	const [space, setSpace] = useState(parsedInfo?.space || "");
	const [side, setSide] = useState(parsedInfo?.side || "none");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 必須項目のバリデーション
		if (!hall || !block || !space) {
			return;
		}

		const manualInfo: ComiketInfo = {
			date: date !== "none" ? date : undefined,
			hall,
			entrance: entrance !== "none" ? entrance : undefined,
			block,
			space,
			side: side !== "none" ? side : undefined,
			raw: `${hall}${entrance !== "none" ? entrance : ""}${block}-${space}${side !== "none" ? side : ""}`,
		};

		onSubmit(manualInfo);
	};

	const isValidForm = hall && block && space;

	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertCircle className="h-5 w-5 text-orange-500" />
					手動でブース情報を入力
				</CardTitle>
				<CardDescription>
					パースできなかった情報を手動で入力してください
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Alert className="mb-4">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>{twitterUser.displayName}</strong> (@{twitterUser.username})
						<br />
						のブース情報を手動で入力してください
					</AlertDescription>
				</Alert>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						{/* 日付（オプション） */}
						<div className="col-span-2 space-y-2">
							<Label htmlFor={`${formId}-date`}>日付（オプション）</Label>
							<Select value={date} onValueChange={setDate}>
								<SelectTrigger id={`${formId}-date`}>
									<SelectValue placeholder="日付を選択" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">なし</SelectItem>
									<SelectItem value="1日目">1日目</SelectItem>
									<SelectItem value="2日目">2日目</SelectItem>
									<SelectItem value="3日目">3日目</SelectItem>
									<SelectItem value="金曜">金曜</SelectItem>
									<SelectItem value="土曜">土曜</SelectItem>
									<SelectItem value="日曜">日曜</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* ホール（必須） */}
						<div className="space-y-2">
							<Label htmlFor={`${formId}-hall`}>
								ホール <span className="text-red-500">*</span>
							</Label>
							<Select value={hall} onValueChange={setHall}>
								<SelectTrigger id={`${formId}-hall`}>
									<SelectValue placeholder="ホールを選択" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="東">東</SelectItem>
									<SelectItem value="西">西</SelectItem>
									<SelectItem value="南">南</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* 入口番号（オプション） */}
						<div className="space-y-2">
							<Label htmlFor={`${formId}-entrance`}>
								入口番号（オプション）
							</Label>
							<Select value={entrance} onValueChange={setEntrance}>
								<SelectTrigger id={`${formId}-entrance`}>
									<SelectValue placeholder="入口を選択" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">なし</SelectItem>
									<SelectItem value="1">1</SelectItem>
									<SelectItem value="2">2</SelectItem>
									<SelectItem value="3">3</SelectItem>
									<SelectItem value="4">4</SelectItem>
									<SelectItem value="5">5</SelectItem>
									<SelectItem value="6">6</SelectItem>
									<SelectItem value="7">7</SelectItem>
									<SelectItem value="8">8</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* ブロック（必須） */}
						<div className="space-y-2">
							<Label htmlFor={`${formId}-block`}>
								ブロック <span className="text-red-500">*</span>
							</Label>
							<div>
								<Input
									id={`${formId}-block`}
									value={block}
									onChange={(e) => setBlock(e.target.value)}
									placeholder="例: あ, ア, A"
									maxLength={2}
									className="text-center"
								/>
								<p className="mt-1 text-muted-foreground text-xs">
									ひらがな、カタカナ、英字1文字
								</p>
							</div>
						</div>

						{/* スペース番号（必須） */}
						<div className="space-y-2">
							<Label htmlFor={`${formId}-space`}>
								スペース番号 <span className="text-red-500">*</span>
							</Label>
							<div>
								<Input
									id={`${formId}-space`}
									value={space}
									onChange={(e) => {
										const value = e.target.value.replace(/[^0-9]/g, "");
										if (value.length <= 2) {
											setSpace(value);
										}
									}}
									placeholder="例: 23"
									maxLength={2}
									className="text-center"
								/>
								<p className="mt-1 text-muted-foreground text-xs">2桁の数字</p>
							</div>
						</div>

						{/* サイド（オプション） */}
						<div className="col-span-2 space-y-2">
							<Label htmlFor={`${formId}-side`}>サイド（オプション）</Label>
							<Select value={side} onValueChange={setSide}>
								<SelectTrigger id={`${formId}-side`}>
									<SelectValue placeholder="サイドを選択" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">なし</SelectItem>
									<SelectItem value="a">a</SelectItem>
									<SelectItem value="b">b</SelectItem>
									<SelectItem value="ab">ab</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* プレビュー */}
					{isValidForm && (
						<div className="rounded-lg border bg-muted/50 p-3">
							<p className="text-muted-foreground text-sm">プレビュー:</p>
							<p className="font-mono text-lg">
								{date !== "none" && `${date} `}
								{hall}
								{entrance !== "none" && entrance}
								{block}-{space}
								{side !== "none" && side}
							</p>
						</div>
					)}

					{/* ボタン */}
					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" onClick={onCancel}>
							<X className="h-4 w-4" />
							キャンセル
						</Button>
						<Button type="submit" disabled={!isValidForm}>
							<Save className="h-4 w-4" />
							保存
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
