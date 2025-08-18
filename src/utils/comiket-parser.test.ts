import { describe, expect, it } from "vitest";
import { extractComiketInfoList, formatComiketInfo } from "./comiket-parser";

describe("extractComiketInfoList", () => {
	it("様々な形式のコミケ位置情報を抽出できる", () => {
		const testCases = [
			{
				input: "白山たえ*日曜東5「ニ24ab」C106",
				expected: [
					{
						date: "日曜",
						hall: "東",
						entrance: "5",
						block: "ニ",
						space: "24",
						side: "ab",
					},
				],
			},
			{
				input: "荻pote@1日目南a-42a",
				expected: [
					{
						date: "1日目",
						hall: "南",
						block: "a",
						space: "42",
						side: "a",
					},
				],
			},
			{
				input: "藤原浩一@夏コミ「免罪符屋」2日目 東タ66b",
				expected: [
					{
						date: "2日目",
						hall: "東",
						block: "タ",
						space: "66",
						side: "b",
					},
				],
			},
			{
				input: "jonsun@C106日曜日南 r-01a",
				expected: [
					{
						date: "日曜",
						hall: "南",
						block: "r",
						space: "01",
						side: "a",
					},
				],
			},
		];

		for (const testCase of testCases) {
			const result = extractComiketInfoList(testCase.input);
			expect(result.length).toBe(testCase.expected.length);

			for (let i = 0; i < result.length; i++) {
				const actual = result[i];
				const expected = testCase.expected[i];

				// rawフィールドは除外して比較
				expect(actual.date).toBe(expected.date);
				expect(actual.hall).toBe(expected.hall);
				if ("entrance" in expected) {
					expect(actual.entrance).toBe(expected.entrance);
				}
				expect(actual.block).toBe(expected.block);
				expect(actual.space).toBe(expected.space);
				expect(actual.side).toBe(expected.side);
			}
		}
	});

	it("複数の位置情報を抽出できる", () => {
		const input = "にゅむ＠C106 1日目南a-03b & 2日目南j-10a";
		const result = extractComiketInfoList(input);

		expect(result.length).toBe(2);

		expect(result[0].date).toBe("1日目");
		expect(result[0].hall).toBe("南");
		expect(result[0].space).toBe("03");
		expect(result[0].side).toBe("b");

		expect(result[1].date).toBe("2日目");
		expect(result[1].hall).toBe("南");
		expect(result[1].space).toBe("10");
		expect(result[1].side).toBe("a");
	});

	it("日付形式をサポート", () => {
		const testCases = [
			{ input: "8/15 東A-23a", expectedDate: "8/15" },
			{ input: "8月16日 西2-45b", expectedDate: "8/16" },
			{ input: "土曜日 南1-12ab", expectedDate: "土曜" },
			{ input: "日曜 東3-34", expectedDate: "日曜" },
		];

		for (const testCase of testCases) {
			const result = extractComiketInfoList(testCase.input);
			expect(result[0].date).toBe(testCase.expectedDate);
		}
	});

	it("曜日記号（㈰㈯㈮など）を正しく認識する", () => {
		const testCases = [
			{ input: "すいみゃ🍉C106㈰東ア-85ab", expectedDate: "日曜" },
			{ input: "テスト㈯西1あ-23a", expectedDate: "土曜" },
			{ input: "C106㈮南ｐ-29ab", expectedDate: "金曜" },
			{ input: "コミケ㈪東5ニ24", expectedDate: "月曜" },
			{ input: "サークル㈫西め-21b", expectedDate: "火曜" },
			{ input: "㈬東r-01a", expectedDate: "水曜" },
			{ input: "㈭南a-42", expectedDate: "木曜" },
		];

		for (const testCase of testCases) {
			const result = extractComiketInfoList(testCase.input);
			expect(result).toHaveLength(1);
			expect(result[0].date).toBe(testCase.expectedDate);
			// ブース情報も正しく抽出されることを確認
			expect(result[0].hall).toBeDefined();
			expect(result[0].space).toBeDefined();
		}
	});

	it("全角英字のブロックを半角に変換", () => {
		const testCases = [
			{ input: "Riko@C106(土)南ｐ-29ab", expectedBlock: "p" },
			{ input: "ユーザー@C106(日)東Ｒ-18b", expectedBlock: "R" },
			{ input: "作家名@1日目西ｍ-32a", expectedBlock: "m" },
			{ input: "名前@2日目南Ｋ-15ab", expectedBlock: "K" },
		];

		for (const testCase of testCases) {
			const result = extractComiketInfoList(testCase.input);
			expect(result[0].block).toBe(testCase.expectedBlock);
		}
	});

	it("ホール+入口番号の後のブロックを抽出できる", () => {
		const testCases = [
			{ input: "2日目西1 め-21ab", expectedBlock: "め" },
			{ input: "東3 ホ-15a", expectedBlock: "ホ" },
			{ input: "南2 ケ-33b", expectedBlock: "ケ" },
			{ input: "1日目東2 A-08ab", expectedBlock: "A" },
		];

		for (const testCase of testCases) {
			const result = extractComiketInfoList(testCase.input);
			expect(result[0].block).toBe(testCase.expectedBlock);
		}
	});

	it("formatComiketInfoが正しくフォーマットする", () => {
		const info = {
			date: "日曜",
			hall: "東",
			entrance: "5",
			block: "ニ",
			space: "24",
			side: "ab",
			raw: "test",
		};

		const formatted = formatComiketInfo(info);
		expect(formatted).toBe("日曜 東5 ニ 24ab");
	});
});
