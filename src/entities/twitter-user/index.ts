import { z } from "zod";

export const TwitterUserSchema = z.object({
	username: z.string(),
	displayName: z.string(),
	tweetContent: z.string(),
	tweetImages: z.array(z.string()).optional(),
});

export type TwitterUser = z.infer<typeof TwitterUserSchema>;

export const TwitterErrorSchema = z.object({
	error: z.string(),
	message: z.string(),
});

export type TwitterError = z.infer<typeof TwitterErrorSchema>;
