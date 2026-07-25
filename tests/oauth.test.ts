import { describe, it, expect } from "vitest";
import { mockPreferences } from "./mocks/raycast-api";
import { getBaseUrl, getWebUrl, getAuthHeader } from "../src/api/oauth";

describe("OAuth & Preferences Utility Unit Tests", () => {
  it("should normalize getBaseUrl by stripping trailing slashes", () => {
    mockPreferences.baseUrl = "https://coachwatts.com/";
    expect(getBaseUrl()).toBe("https://coachwatts.com");

    mockPreferences.baseUrl = "http://localhost:3000";
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("should format getWebUrl with paths correctly", () => {
    mockPreferences.baseUrl = "https://coachwatts.com";
    expect(getWebUrl()).toBe("https://coachwatts.com");
    expect(getWebUrl("/fitness")).toBe("https://coachwatts.com/fitness");
    expect(getWebUrl("chat")).toBe("https://coachwatts.com/chat");
  });

  it("should generate X-API-Key and Bearer headers when apiKey preference is present", async () => {
    mockPreferences.apiKey = "cw_test_key_abc";
    const headers = await getAuthHeader();
    expect(headers["X-API-Key"]).toBe("cw_test_key_abc");
    expect(headers["Authorization"]).toBe("Bearer cw_test_key_abc");
  });
});
