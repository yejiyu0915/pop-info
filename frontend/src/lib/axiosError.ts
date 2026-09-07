import { AxiosError } from 'axios';

export function isNotFoundError(err: unknown): boolean {
  return err instanceof AxiosError && err.response?.status === 404;
}
