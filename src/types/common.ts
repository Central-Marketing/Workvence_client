export interface ApiResponse<T = any> {
  error?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SelectOption<T = string | number> {
  label: string;
  value: T;
}
