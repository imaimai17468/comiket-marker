import type { Metadata } from "next";
import "./globals.css";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/shared/header/Header";
import { TwitterScriptLoader } from "@/components/shared/twitter-embed";
import { Toaster } from "@/components/ui/sonner";

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

const zenKakuGothicNew = localFont({
	src: [
		{
			path: "../../public/fonts/ZenKakuGothicNew-Light.ttf",
			weight: "300",
			style: "normal",
		},
		{
			path: "../../public/fonts/ZenKakuGothicNew-Regular.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/ZenKakuGothicNew-Medium.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/ZenKakuGothicNew-Bold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../public/fonts/ZenKakuGothicNew-Black.ttf",
			weight: "900",
			style: "normal",
		},
	],
	variable: "--font-zen-kaku-gothic-new",
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
	),
	title: "コミケマーカー - Comiket Marker",
	description:
		"コミケのブース位置をTwitter/Xの名前欄から自動抽出して地図上に表示するツール。サークル情報を視覚的に管理できます。",
	keywords: "コミケ, Comiket, C104, ブース, サークル, 地図, マップ, Twitter",
	authors: [{ name: "Comiket Marker Team" }],
	icons: {
		icon: "/app-icon.png",
		apple: "/app-icon.png",
	},
	openGraph: {
		title: "コミケマーカー - Comiket Marker",
		description: "コミケのブース位置をTwitter/Xから自動抽出して地図上に表示",
		type: "website",
		locale: "ja_JP",
		images: [
			{
				url: "/app-ogp.png",
				width: 1200,
				height: 630,
				alt: "コミケマーカー",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "コミケマーカー - Comiket Marker",
		description: "コミケのブース位置をTwitter/Xから自動抽出して地図上に表示",
		images: ["/app-ogp.png"],
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body
				className={`antialiased ${geistMono.variable} ${zenKakuGothicNew.variable} ${zenKakuGothicNew.className}`}
			>
				<Header />
				<main className="min-h-screen w-full pt-[72px]">{children}</main>
				<TwitterScriptLoader />
				<Toaster />
			</body>
		</html>
	);
}
