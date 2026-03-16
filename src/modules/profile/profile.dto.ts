import { z } from "zod";

export const UpdateMeRequestDto = z.object({
  fullName: z.string().trim().min(1).max(255),
});
