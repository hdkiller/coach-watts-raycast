import { vi } from "vitest";

export const mockPreferences = {
  baseUrl: process.env.TEST_BASE_URL || "https://coachwatts.com",
  apiKey:
    process.env.TEST_API_KEY ||
    "cw_cff72395831b1bd527d10b5b49075471692ebbaf82d52101d902bd58d93a6de8",
};

export function getPreferenceValues() {
  return mockPreferences;
}

export function MockPKCEClient() {
  return {
    getTokens: vi.fn().mockResolvedValue(null),
    authorizationRequest: vi.fn(),
    authorize: vi.fn(),
    setTokens: vi.fn(),
    removeTokens: vi.fn(),
  };
}

export const OAuth = {
  PKCEClient: MockPKCEClient,
  RedirectMethod: { Web: "web" },
};

export const Icon = {
  Redo: "redo",
  Warning: "warning",
  Calendar: "calendar",
  Heart: "heart",
  Airplane: "airplane",
  Message: "message",
  Paperplane: "paperplane",
};

export const Color = {
  Blue: "blue",
  Orange: "orange",
  Green: "green",
  Red: "red",
};

export const ActionPanel = () => null;
export const Action = () => null;
export const Detail = () => null;
export const List = () => null;
export const Form = () => null;
export const showToast = vi.fn();
export const showHUD = vi.fn();
export const Toast = { Style: { Animated: "animated", Success: "success", Failure: "failure" } };
