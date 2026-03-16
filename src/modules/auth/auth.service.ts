import { findUserByEmail } from "./auth.repository";
import { signToken } from "../../shared/auth/jwt";
import { InvalidCredentialsServiceError } from "./auth.error";

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) throw new InvalidCredentialsServiceError();

  const valid = await Bun.password.verify(password, user.passwordHash);
  if (!valid) throw new InvalidCredentialsServiceError();

  const { token, expiresAt } = await signToken({ sub: user.id, email: user.email });
  return {
    token,
    expiresAt: expiresAt.toISOString(),
    user: { id: user.id, nim: user.nim, email: user.email, fullName: user.fullName },
  };
}
