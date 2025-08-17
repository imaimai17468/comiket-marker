import { cn } from "@/lib/utils";

type WallCircleProps = {
	count: number;
	startNumber: number;
	orientation: "horizontal" | "vertical";
	reverse?: boolean;
	strikethrough?: boolean;
	className?: string;
};

/**
 * 壁サークルを表示するコンポーネント
 * @param count - ブロック内のサークル数
 * @param startNumber - 開始番号
 * @param orientation - 配置方向（horizontal: 横並び, vertical: 縦並び）
 * @param reverse - 番号を逆順に表示するか
 * @param strikethrough - 斜線を表示するか
 */
const WallCircle = ({
	count,
	startNumber,
	orientation,
	reverse = false,
	strikethrough = false,
	className,
}: WallCircleProps) => {
	const circles = Array.from({ length: count }, (_, i) => startNumber + i);
	if (reverse) {
		circles.reverse();
	}

	return (
		<div
			className={cn(
				"flex gap-1",
				orientation === "horizontal" ? "flex-row" : "flex-col",
				className,
			)}
		>
			{circles.map((num) => (
				<div
					key={`wall-${num}`}
					className="relative flex h-8 w-8 items-center justify-center border border-gray-600 bg-gray-100 text-gray-700 text-xs"
				>
					{num}
					{strikethrough && (
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="h-full w-0.5 rotate-45 bg-gray-600" />
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default WallCircle;
