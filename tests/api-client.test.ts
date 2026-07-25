import { describe, it, expect, vi } from "vitest";

const TEST_API_KEY =
  process.env.TEST_API_KEY ||
  "cw_cff72395831b1bd527d10b5b49075471692ebbaf82d52101d902bd58d93a6de8";
const TEST_BASE_URL = process.env.TEST_BASE_URL || "https://coachwatts.com";

vi.mock("@raycast/api", () => {
  function MockPKCEClient() {
    return {
      getTokens: vi.fn().mockResolvedValue(null),
      authorizationRequest: vi.fn(),
      authorize: vi.fn(),
      setTokens: vi.fn(),
      removeTokens: vi.fn(),
    };
  }

  return {
    getPreferenceValues: () => ({
      baseUrl: TEST_BASE_URL,
      apiKey: TEST_API_KEY,
    }),
    OAuth: {
      PKCEClient: MockPKCEClient,
      RedirectMethod: { Web: "web" },
    },
  };
});

import { CoachWattsApi } from "../src/api/client";

describe("Coach Watts API Integration & E2E Suite", () => {
  it("should fetch today's recommendation or return null safely", async () => {
    const res = await CoachWattsApi.getTodayRecommendation();
    if (res !== null) {
      expect(typeof res).toBe("object");
    } else {
      expect(res).toBeNull();
    }
  });

  it("should fetch recent workouts with valid schema", async () => {
    const workouts = await CoachWattsApi.getRecentWorkouts(10);
    expect(Array.isArray(workouts)).toBe(true);

    if (workouts.length > 0) {
      const first = workouts[0];
      expect(typeof first.id).toBe("string");
      expect(typeof first.date).toBe("string");
      expect(typeof first.title).toBe("string");
    }
  });

  it("should fetch wellness history with valid biometrics schema", async () => {
    const wellness = await CoachWattsApi.getWellnessHistory(10);
    expect(Array.isArray(wellness)).toBe(true);

    if (wellness.length > 0) {
      const first = wellness[0];
      expect(typeof first.id).toBe("string");
      expect(typeof first.date).toBe("string");
    }
  });

  it(
    "should execute AI Coach chat flow end-to-end (room creation -> turn dispatch -> polling)",
    async () => {
      const reply = await CoachWattsApi.askCoach("Suggest a 15 minute recovery mobility routine");
      expect(typeof reply).toBe("string");
      expect(reply.trim().length).toBeGreaterThan(0);
    },
    30000,
  );

  it("should trigger full sync endpoint without crashing", async () => {
    const res = await CoachWattsApi.triggerSync();
    expect(typeof res).toBe("object");
  });
});
