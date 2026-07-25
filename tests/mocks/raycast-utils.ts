import { vi } from "vitest";

export function usePromise(fn: () => Promise<any>) {
  return {
    isLoading: false,
    data: undefined,
    error: undefined,
    revalidate: vi.fn(),
  };
}
