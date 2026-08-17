export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginatedMeta;
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, message, data };
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginatedMeta,
  message?: string,
): PaginatedResponse<T> {
  return { success: true, message, data, meta };
}
