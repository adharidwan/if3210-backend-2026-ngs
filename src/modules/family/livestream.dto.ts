import { z } from "zod";

export const LivestreamActorRequestDto = z.object({
  hostUserId: z.coerce.number().int().positive().optional(),
});

export const LivestreamTokenRequestDto = z.object({
  role: z.enum(["host", "viewer"]),
  hostUserId: z.coerce.number().int().positive().optional(),
});
