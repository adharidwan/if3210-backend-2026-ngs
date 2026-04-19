import { z } from "zod";

export const CreateFamilyRequestDto = z.object({
  name: z.string().trim().min(1).max(255),
  iconUrl: z.string().trim().min(1).max(255),
});

export const JoinFamilyRequestDto = z.object({
  familyId: z.number().int().positive(),
  familyCode: z.string().regex(/^[A-Z]{6}$/),
});

export const LeaveFamilyRequestDto = z.object({
  familyId: z.number().int().positive(),
});
