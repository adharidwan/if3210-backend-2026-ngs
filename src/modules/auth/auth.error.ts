export class InvalidCredentialsServiceError extends Error {
  constructor() { super("Invalid email or password"); }
}
export class UserNotFoundServiceError extends Error {
  constructor() { super("User not found"); }
}
