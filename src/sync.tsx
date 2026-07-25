import { showHUD } from "@raycast/api";
import { CoachWattsApi } from "./api/client";

export default async function SyncCommand() {
  try {
    const res = await CoachWattsApi.triggerSync();
    await showHUD(res?.message || "Data sync triggered successfully");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unable to reach server";
    await showHUD(`Data sync failed: ${message}`);
  }
}
