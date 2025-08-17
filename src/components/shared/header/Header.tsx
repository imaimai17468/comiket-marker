import Link from "next/link";

export const Header = () => {
	return (
		<header className="fixed top-0 right-0 left-0 z-50">
			<div className="flex items-center justify-between px-6 py-6">
				<div>
					<h1 className="font-medium text-2xl">
						<Link href="/">コミケマーカー</Link>
					</h1>
				</div>
				<div className="flex items-center gap-5"></div>
			</div>
		</header>
	);
};
