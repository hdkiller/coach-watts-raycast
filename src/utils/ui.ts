import { Icon, Color } from "@raycast/api";
import { Workout } from "../api/client";

export function getSportIcon(type?: string): Icon {
  if (!type) return Icon.BarChart;
  const lower = type.toLowerCase();
  if (lower.includes("run")) return Icon.Person;
  if (
    lower.includes("ride") ||
    lower.includes("cycle") ||
    lower.includes("bike")
  )
    return Icon.Bike;
  if (lower.includes("swim")) return Icon.Globe;
  if (
    lower.includes("gym") ||
    lower.includes("weight") ||
    lower.includes("strength")
  )
    return Icon.Trophy;
  if (lower.includes("walk") || lower.includes("hike")) return Icon.Footprints;
  if (lower.includes("row")) return Icon.Boat;
  return Icon.BarChart;
}

export function getSportColor(type?: string): Color {
  if (!type) return Color.SecondaryText;
  const lower = type.toLowerCase();
  if (lower.includes("run")) return Color.Orange;
  if (
    lower.includes("ride") ||
    lower.includes("cycle") ||
    lower.includes("bike")
  )
    return Color.Blue;
  if (lower.includes("swim")) return Color.Purple;
  if (
    lower.includes("gym") ||
    lower.includes("weight") ||
    lower.includes("strength")
  )
    return Color.Magenta;
  if (lower.includes("walk") || lower.includes("hike")) return Color.Green;
  if (lower.includes("row")) return Color.Yellow;
  return Color.PrimaryText;
}

export function getRecoveryColor(score?: number): Color {
  if (score == null) return Color.SecondaryText;
  if (score >= 75) return Color.Green;
  if (score >= 50) return Color.Yellow;
  return Color.Red;
}

export function getIntensityColor(intensity?: string): Color {
  if (!intensity) return Color.SecondaryText;
  const lower = intensity.toLowerCase();
  if (lower.includes("high") || lower.includes("hard") || lower.includes("vo2"))
    return Color.Red;
  if (
    lower.includes("mod") ||
    lower.includes("tempo") ||
    lower.includes("sweet")
  )
    return Color.Orange;
  if (
    lower.includes("low") ||
    lower.includes("easy") ||
    lower.includes("recov") ||
    lower.includes("endurance")
  )
    return Color.Green;
  if (lower.includes("rest")) return Color.Blue;
  return Color.SecondaryText;
}

export function formatDuration(seconds?: number): string {
  if (seconds == null || seconds <= 0) return "N/A";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export function formatDistance(meters?: number): string {
  if (meters == null || meters <= 0) return "N/A";
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

export function formatPace(workout: Workout): string | undefined {
  const isRun = workout.type?.toLowerCase().includes("run");
  if (
    !isRun ||
    workout.durationSec == null ||
    workout.distanceMeters == null ||
    workout.distanceMeters <= 0
  ) {
    return undefined;
  }
  const paceSecPerKm = workout.durationSec / (workout.distanceMeters / 1000);
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.round(paceSecPerKm % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs} /km`;
}

export function normalizeDate(dateString?: string): Date {
  if (!dateString) return new Date();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ? `${dateString}T12:00:00`
    : dateString;
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatDateShort(dateString?: string): string {
  const date = normalizeDate(dateString);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function formatDateFull(dateString?: string): string {
  const date = normalizeDate(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(dateString?: string): string {
  const date = normalizeDate(dateString);
  const now = new Date();

  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (dNow.getTime() - dDate.getTime()) / (1000 * 3600 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }
  return formatDateShort(dateString);
}
