import { z } from "zod";

export const walletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address");

export const emailSchema = z.string().email("Invalid email address");

export const userPreferencesSchema = z.object({
  theme: z.literal("dark"),
  skipIntro: z.boolean().default(false),
  preferredAnalysisDepth: z.enum(["quick", "standard", "deep"]).default("standard"),
});

export const sessionSchema = z.object({
  walletAddress: walletAddressSchema,
  email: emailSchema,
  preferences: userPreferencesSchema.optional(),
});