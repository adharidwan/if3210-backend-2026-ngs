export class LivestreamNotFoundServiceError extends Error {
  constructor(message = "Livestream not found") {
    super(message);
  }
}

export class LivestreamForbiddenServiceError extends Error {
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class LivestreamConflictServiceError extends Error {
  constructor(message = "Conflict") {
    super(message);
  }
}

export class LivestreamValidationServiceError extends Error {
  constructor(message = "Invalid livestream request") {
    super(message);
  }
}

export class LivestreamConfigurationServiceError extends Error {
  constructor(message = "Livestream configuration is missing") {
    super(message);
  }
}
