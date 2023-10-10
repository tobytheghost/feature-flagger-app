import { z } from "zod";

export const flagSchema = z.object({
  name: z.string().max(144),
  description: z.string().max(288),
});

export const toggleFlagSchema = z.object({
  id: z.number(),
  development: z.boolean().optional(),
  staging: z.boolean().optional(),
  production: z.boolean().optional(),
});
