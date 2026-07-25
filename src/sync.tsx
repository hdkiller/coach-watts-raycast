import { showHUD, showToast, Toast } from "@raycast/api";
import { CoachWattsApi } from "./api/client";

export default async function SyncCommand() {
  await showToast({ style: Toast.Style.Animated, title: "Triggering Coach Watts Data Sync..." });

  try {
    const res = await CoachWattsApi.triggerSync();
    await showHUD(res?.message || "✅ Coach Watts data sync triggered successfully!");
  } catch (err: any) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Data Sync Failed",
      message: err.message || "Unable to reach Coach Watts server",
    });
  }
}
