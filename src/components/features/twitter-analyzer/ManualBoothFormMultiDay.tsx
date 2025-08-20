"use client";

import { AlertCircle } from "lucide-react";
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

type ManualBoothFormMultiDayProps = {
	twitterUser: TwitterUser;
	parsedInfoList?: Partial<ComiketInfo>[];
	onSubmit: (infoList: ComiketInfo[]) => void;
	onCancel: () => void;
};

const renderFormFields = (
	formId: string,
	hall: string,
	setHall: (value: string) => void,
	entrance: string,
	setEntrance: (value: string) => void,
	block: string,
	setBlock: (value: string) => void,
	space: string,
	setSpace: (value: string) => void,
	side: string,
	setSide: (value: string) => void,
) => (
	<>
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
			<Label htmlFor={`${formId}-entrance`}>入口番号（オプション）</Label>
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
	</>
);

export const ManualBoothFormMultiDay = ({
	twitterUser,
	parsedInfoList = [],
	onSubmit,
	onCancel,
}: ManualBoothFormMultiDayProps) => {
	const formId = useId();

	// 1日目のフォームステート
	const firstInfo = parsedInfoList[0] || {};
	const [hall1, setHall1] = useState(firstInfo.hall || "");
	const [entrance1, setEntrance1] = useState(firstInfo.entrance || "none");
	const [block1, setBlock1] = useState(firstInfo.block || "");
	const [space1, setSpace1] = useState(firstInfo.space || "");
	const [side1, setSide1] = useState(firstInfo.side || "none");

	// 2日目のフォームステート
	const secondInfo = parsedInfoList[1] || {};
	const [hall2, setHall2] = useState(secondInfo.hall || "");
	const [entrance2, setEntrance2] = useState(secondInfo.entrance || "none");
	const [block2, setBlock2] = useState(secondInfo.block || "");
	const [space2, setSpace2] = useState(secondInfo.space || "");
	const [side2, setSide2] = useState(secondInfo.side || "none");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// 必須項目のバリデーション
		if (!hall1 || !block1 || !space1 || !hall2 || !block2 || !space2) {
			return;
		}

		const manualInfo1: ComiketInfo = {
			date: "1日目",
			hall: hall1,
			entrance: entrance1 !== "none" ? entrance1 : undefined,
			block: block1,
			space: space1,
			side: side1 !== "none" ? side1 : undefined,
			raw: `1日目 ${hall1}${entrance1 !== "none" ? entrance1 : ""}${block1}-${space1}${side1 !== "none" ? side1 : ""}`,
		};

		const manualInfo2: ComiketInfo = {
			date: "2日目",
			hall: hall2,
			entrance: entrance2 !== "none" ? entrance2 : undefined,
			block: block2,
			space: space2,
			side: side2 !== "none" ? side2 : undefined,
			raw: `2日目 ${hall2}${entrance2 !== "none" ? entrance2 : ""}${block2}-${space2}${side2 !== "none" ? side2 : ""}`,
		};

		onSubmit([manualInfo1, manualInfo2]);
	};

	const isValidForm = hall1 && block1 && space1 && hall2 && block2 && space2;

	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<AlertCircle className="h-5 w-5 text-orange-500" />
					両日参加のブース情報を入力
				</CardTitle>
				<CardDescription>
					1日目と2日目のブース情報を入力してください
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
					<div className="space-y-4">
						{/* 1日目 */}
						<div className="rounded-lg border p-4">
							<h4 className="mb-3 font-medium text-sm">1日目（土曜）</h4>
							<div className="grid grid-cols-2 gap-4">
								{renderFormFields(
									`${formId}-day1`,
									hall1,
									setHall1,
									entrance1,
									setEntrance1,
									block1,
									setBlock1,
									space1,
									setSpace1,
									side1,
									setSide1,
								)}
							</div>
						</div>

						{/* 2日目 */}
						<div className="rounded-lg border p-4">
							<h4 className="mb-3 font-medium text-sm">2日目（日曜）</h4>
							<div className="grid grid-cols-2 gap-4">
								{renderFormFields(
									`${formId}-day2`,
									hall2,
									setHall2,
									entrance2,
									setEntrance2,
									block2,
									setBlock2,
									space2,
									setSpace2,
									side2,
									setSide2,
								)}
							</div>
						</div>
					</div>

					{/* プレビュー */}
					{isValidForm && (
						<div className="rounded-lg border bg-muted/50 p-3">
							<p className="text-muted-foreground text-sm">プレビュー:</p>
							<p className="font-mono">
								1日目: {hall1}
								{entrance1 !== "none" && entrance1}
								{block1}-{space1}
								{side1 !== "none" && side1}
							</p>
							<p className="font-mono">
								2日目: {hall2}
								{entrance2 !== "none" && entrance2}
								{block2}-{space2}
								{side2 !== "none" && side2}
							</p>
						</div>
					)}

					<div className="flex gap-2">
						<Button type="submit" disabled={!isValidForm} className="flex-1">
							登録
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="flex-1"
						>
							キャンセル
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};
