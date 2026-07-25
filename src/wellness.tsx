import { ActionPanel, Action, List, Icon } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { CoachWattsApi, WellnessRecord, getWebUrl } from "./api/client";

export default function WellnessCommand() {
  const {
    isLoading,
    data: logs = [],
    error,
    revalidate,
  } = usePromise(() => CoachWattsApi.getWellnessHistory(14));

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter by date..."
      isShowingDetail={logs.length > 0}
    >
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
          const dateNormalized = /^\d{4}-\d{2}-\d{2}$/.test(log.date)
            ? `${log.date}T12:00:00`
            : log.date;
          const dateStr = new Date(dateNormalized).toLocaleDateString(
            undefined,
            {
              weekday: "short",
              month: "short",
              day: "numeric",
            },
          );

          const recoveryScore =
            log.recoveryScore ?? log.readinessScore ?? log.readiness;
          const scoreText =
            recoveryScore !== undefined
              ? `Recovery: ${recoveryScore}%`
              : undefined;

          const hrv = log.hrv ?? log.hrvSdnn;
          const rhr = log.rhr ?? log.restingHr ?? log.avgSleepingHr;

          const sleepHours =
            log.sleepHours ??
            (log.sleepSecs ? log.sleepSecs / 3600 : undefined);

          const tsb =
            log.tsb ??
            (log.ctl !== undefined && log.atl !== undefined
              ? Math.round(log.ctl - log.atl)
              : undefined);

          const notes = log.notes || log.comments;

          return (
            <List.Item
              key={log.id || log.date}
              title={dateStr}
              subtitle={scoreText}
              accessories={[
                { text: hrv ? `HRV: ${Math.round(hrv)}ms` : undefined },
                { text: rhr ? `RHR: ${Math.round(rhr)}` : undefined },
                {
                  text: sleepHours
                    ? `Sleep: ${sleepHours.toFixed(1)}h`
                    : undefined,
                },
              ]}
              detail={
                <List.Item.Detail
                  markdown={`# 📊 Biometrics for ${dateStr}\n\n${notes ? `> ${notes}` : "*No additional notes for this day.*"}`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      {recoveryScore !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Recovery Score"
                          text={`${recoveryScore}%`}
                        />
                      )}
                      {hrv !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="HRV (rMSSD)"
                          text={`${Math.round(hrv)} ms`}
                        />
                      )}
                      {rhr !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Resting Heart Rate"
                          text={`${Math.round(rhr)} bpm`}
                        />
                      )}
                      {sleepHours !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Sleep Duration"
                          text={`${sleepHours.toFixed(1)} hours`}
                        />
                      )}
                      {log.sleepScore !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Sleep Score"
                          text={`${log.sleepScore}%`}
                        />
                      )}
                      {log.weight !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Weight"
                          text={`${log.weight.toFixed(1)} kg`}
                        />
                      )}
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label
                        title="Fitness (CTL)"
                        text={log.ctl ? String(Math.round(log.ctl)) : "N/A"}
                      />
                      <List.Item.Detail.Metadata.Label
                        title="Fatigue (ATL)"
                        text={log.atl ? String(Math.round(log.atl)) : "N/A"}
                      />
                      <List.Item.Detail.Metadata.Label
                        title="Form (TSB)"
                        text={tsb !== undefined ? String(tsb) : "N/A"}
                      />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <Action
                    title="Refresh Wellness"
                    icon={Icon.Redo}
                    onAction={revalidate}
                  />
                  <Action.OpenInBrowser
                    title="Open Fitness & Wellness Page"
                    url={getWebUrl("/fitness")}
                  />
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
