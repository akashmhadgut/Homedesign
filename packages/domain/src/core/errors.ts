export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class InvalidGeometryError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_GEOMETRY');
  }
}

export class ConstraintViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'CONSTRAINT_VIOLATION');
  }
}

export class RoomOverlapError extends DomainError {
  constructor(message: string) {
    super(message, 'ROOM_OVERLAP');
  }
}

export class InvalidOpeningError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_OPENING');
  }
}
