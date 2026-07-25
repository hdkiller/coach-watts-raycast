import { describe, it, expect } from "vitest";
import { formatDuration, formatDistance, formatPace } from "../src/workouts";
import { formatLocalDate } from "../src/today";

describe("Data Formatter & Utility Unit Tests", () => {
  describe("formatDuration", () => {
    it("should format seconds into minutes and hours", () => {
      expect(formatDuration(3600)).toBe("1h 0m");
      expect(formatDuration(5400)).toBe("1h 30m");
      expect(formatDuration(1800)).toBe("30m");
    });

    it("should return N/A for invalid or 0 seconds", () => {
      expect(formatDuration(0)).toBe("N/A");
      expect(formatDuration(undefined)).toBe("N/A");
      expect(formatDuration(-10)).toBe("N/A");
    });
  });

  describe("formatDistance", () => {
    it("should format meters to kilometers with 1 decimal place", () => {
      expect(formatDistance(10000)).toBe("10.0 km");
      expect(formatDistance(5430)).toBe("5.4 km");
    });

    it("should return N/A for invalid or 0 meters", () => {
      expect(formatDistance(0)).toBe("N/A");
      expect(formatDistance(undefined)).toBe("N/A");
    });
  });

  describe("formatPace", () => {
    it("should calculate running pace in min:sec /km", () => {
      const runWorkout = {
        id: "w1",
        title: "5k Run",
        date: "2026-07-25",
        type: "Run",
        durationSec: 1500, // 25 mins
        distanceMeters: 5000, // 5 km -> 5:00 /km
      };
      expect(formatPace(runWorkout)).toBe("5:00 /km");
    });

    it("should return undefined for non-running activities or missing metrics", () => {
      const bikeWorkout = {
        id: "w2",
        title: "Bike Ride",
        date: "2026-07-25",
        type: "Ride",
        durationSec: 3600,
        distanceMeters: 30000,
      };
      expect(formatPace(bikeWorkout)).toBeUndefined();
    });
  });

  describe("formatLocalDate", () => {
    it("should format ISO date strings into local date strings", () => {
      const formatted = formatLocalDate("2026-07-25");
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
