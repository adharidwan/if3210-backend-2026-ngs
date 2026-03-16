import { findUserById, updateUserFullName } from "./profile.repository";
import { ProfileNotFoundServiceError } from "./profile.error";

export async function getProfile(userId: number) {
  const user = await findUserById(userId);
  if (!user) throw new ProfileNotFoundServiceError();
  return user;
}

export async function updateProfile(userId: number, fullName: string) {
  const user = await updateUserFullName(userId, fullName);
  if (!user) throw new ProfileNotFoundServiceError();
  return user;
}
