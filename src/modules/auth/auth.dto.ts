import { z } from "zod";

export const LoginRequestDto = z.object({
  email: z.string().email().max(255).endsWith("@std.stei.itb.ac.id"),
  password: z.string().min(1).max(255),
});
