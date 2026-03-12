export type ID = string;

export interface ApiSuccess<T> {
  status: 200 | 201;
  body: T;
}

export interface ApiError {
  status: number;
  body: { error: string };
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

