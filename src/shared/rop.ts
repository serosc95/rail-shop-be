export type Result<T, E> = Success<T> | Failure<E>;

export class Success<T> {
  readonly type = 'success';
  constructor(public readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<never> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return ok(fn(this.value));
  }

  mapError(): this {
    return this;
  }
}

export class Failure<E> {
  readonly type = 'failure';
  constructor(public readonly value: E) {}

  isSuccess(): this is Success<never> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }

  map(): this {
    return this;
  }

  mapError<F>(fn: (error: E) => F): Result<never, F> {
    return fail(fn(this.value));
  }
}

export function ok<T>(value: T): Result<T, never> {
  return new Success(value);
}

export function fail<E>(error: E): Result<never, E> {
  return new Failure(error);
}

export async function tryCatch<T, E = unknown>(
  fn: () => Promise<T> | T,
  onError: (e: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const result = await fn();
    return ok(result);
  } catch (e) {
    return fail(onError(e));
  }
}
