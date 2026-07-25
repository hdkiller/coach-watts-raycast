import { ActionPanel, Action, List, Icon } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { CoachWattsApi, WellnessRecord } from "./api/client";

export default function WellnessCommand() {
  const { isLoading, data: logs = [], error, revalidate } = usePromise(() => CoachWattsApi.getWellnessHistory(14));

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter by date..." isShowingDetail={logs.length > 0}>
      {error ? (
        <List.EmptyView
          icon={Icon.Warning}
          title="Failed to load wellness metrics"
          description={error.message}
        />
      ) : logs.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Heart}
          title="No wellness data found"
          description="Daily recovery logs and biometrics will be listed here."
        />
      ) : (
        logs.map((log: WellnessRecord) => {
          const dateStr = new Date(log.date).toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

          const recoveryScore = log.recoveryScore ?? log.readinessScore;
          const scoreText = recoveryScore !== undefined ? `Recovery: ${recoveryScore}%` : undefined;

          return (
            <List.Item
              key={log.id || log.date}
              title={dateStr}
              subtitle={scoreText}
              accessories={[
                { text: log.hrv ? `HRV: ${Math.round(log.hrv)}ms` : undefined },
                { text: log.rhr ? `RHR: ${Math.round(log.rhr)}` : undefined },
                { text: log.sleepHours ? `Sleep: ${log.sleepHours.toFixed(1)}h` : undefined },
              ]}
              detail={
                <List.Item.Detail
                  markdown={`# 📊 Biometrics for ${dateStr}\n\n${log.notes ? `> ${log.notes}` : "*No additional notes for this day.*"}`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      {recoveryScore !== undefined && (
                        <List.Item.Detail.Metadata.Label title="Recovery Score" text={`${recoveryScore}%`} />
                      )}
                      {log.hrv !== undefined && (
                        <List.Item.Detail.Metadata.Label title="HRV (rMSSD)" text={`${Math.round(log.hrv)} ms`} />
                      )}
                      {log.rhr !== undefined && (
                        <List.Item.Detail.Metadata.Label title="Resting Heart Rate" text={`${Math.round(log.rhr)} bpm`} />
                      )}
                      {log.sleepHours !== undefined && (
                        <List.Item.Detail.Metadata.Label title="Sleep Duration" text={`${log.sleepHours.toFixed(1)} hours`} />
                      )}
                      {log.sleepScore !== undefined && (
                        <List.Item.Detail.Metadata.Label title="Sleep Score" text={`${log.sleepScore}%`} />
                      )}
                      {log.weight !== undefined && (
                        <List.Item.Detail.Metadata.Label title="Weight" text={`${log.weight.toFixed(1)} kg`} />
                      )}
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label title="Fitness (CTL)" text={log.ctl ? String(Math.round(log.ctl)) : "N/A"} />
                      <List.Item.Detail.Metadata.Label title="Fatigue (ATL)" text={log.atl ? String(Math.round(log.atl)) : "N/A"} />
                      <List.Item.Detail.Metadata.Label title="Form (TSB)" text={log.tsb ? String(Math.round(log.tsb)) : "N/A"} />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <Action title="Refresh Wellness" icon={Icon.Redo} onAction={revalidate} />
                  <Action.OpenInBrowser title="Open Fitness & Wellness Page" url="http://localhost:3000/fitness" />
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
