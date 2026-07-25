import { describe, it, expect } from "vitest";
import {
  getSportIcon,
  getSportColor,
  getRecoveryColor,
  getIntensityColor,
  formatDuration,
  formatDistance,
  formatPace,
  formatDateShort,
  formatDateFull,
  formatRelativeDate,
} from "../src/utils/ui";
import { Icon, Color } from "@raycast/api";

describe("UI Utilities & Formatter Unit Tests", () => {
  describe("getSportIcon", () => {
    it("should return sport-specific icons", () => {
      expect(getSportIcon("Run")).toBe(Icon.Person);
      expect(getSportIcon("Ride")).toBe(Icon.Bike);
      expect(getSportIcon("Swim")).toBe(Icon.Bubble);
      expect(getSportIcon("Gym")).toBe(Icon.Trophy);
      expect(getSportIcon("Walk")).toBe(Icon.Footprints);
      expect(getSportIcon("Rowing")).toBe(Icon.Boat);
      expect(getSportIcon(undefined)).toBe(Icon.Activity);
    });
  });

  describe("getSportColor", () => {
    it("should return sport-specific colors", () => {
      expect(getSportColor("Run")).toBe(Color.Orange);
      expect(getSportColor("Ride")).toBe(Color.Blue);
      expect(getSportColor("Swim")).toBe(Color.Cyan);
      expect(getSportColor("Gym")).toBe(Color.Purple);
      expect(getSportColor(undefined)).toBe(Color.SecondaryText);
    });
  });

  describe("getRecoveryColor", () => {
    it("should map recovery scores to Green, Yellow, Red, or SecondaryText", () => {
      expect(getRecoveryColor(85)).toBe(Color.Green);
      expect(getRecoveryColor(60)).toBe(Color.Yellow);
      expect(getRecoveryColor(30)).toBe(Color.Red);
      expect(getRecoveryColor(undefined)).toBe(Color.SecondaryText);
    });
  });

  describe("getIntensityColor", () => {
    it("should map intensity text to colors", () => {
      expect(getIntensityColor("High")).toBe(Color.Red);
      expect(getIntensityColor("Moderate")).toBe(Color.Orange);
      expect(getIntensityColor("Low / Easy")).toBe(Color.Green);
      expect(getIntensityColor("Rest")).toBe(Color.Blue);
      expect(getIntensityColor(undefined)).toBe(Color.SecondaryText);
    });
  });

  describe("formatDuration", () => {
    it("should format seconds into minutes and hours", () => {
      expect(formatDuration(3600)).toBe("1h 0m");
      expect(formatDuration(5400)).toBe("1h 30m");
      expect(formatDuration(1800)).toBe("30m");
    });

    it("should return N/A for invalid, null, or 0 seconds", () => {
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

    it("should return N/A for invalid, null, or 0 meters", () => {
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

  describe("Date Formatters", () => {
    it("should format short and full date strings", () => {
      const shortStr = formatDateShort("2026-07-25");
      expect(typeof shortStr).toBe("string");
      expect(shortStr.length).toBeGreaterThan(0);

      const fullStr = formatDateFull("2026-07-25");
      expect(typeof fullStr).toBe("string");
      expect(fullStr.length).toBeGreaterThan(0);

      const relativeStr = formatRelativeDate("2026-07-25");
      expect(typeof relativeStr).toBe("string");
      expect(relativeStr.length).toBeGreaterThan(0);
    });
  });
});
