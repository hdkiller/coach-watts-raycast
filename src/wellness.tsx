import { ActionPanel, Action, List, Icon } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { CoachWattsApi, WellnessRecord, getWebUrl } from "./api/client";
import {
  getRecoveryColor,
  formatDateFull,
  formatRelativeDate,
} from "./utils/ui";

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
      searchBarPlaceholder="Filter wellness logs by date..."
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
          const recoveryScore =
            log.recoveryScore ?? log.readinessScore ?? log.readiness;
          const recoveryColor = getRecoveryColor(recoveryScore);

          const hrv = log.hrv ?? log.hrvSdnn;
          const rhr = log.rhr ?? log.restingHr ?? log.avgSleepingHr;

          const sleepHours =
            log.sleepHours ??
            (log.sleepSecs != null ? log.sleepSecs / 3600 : undefined);

          const tsb =
            log.tsb ??
            (log.ctl != null && log.atl != null
              ? Math.round(log.ctl - log.atl)
              : undefined);

          const notes = log.notes || log.comments;

          const accessories: List.Item.Accessory[] = [];

          if (recoveryScore != null) {
            accessories.push({
              tag: {
                value: `${Math.round(recoveryScore)}%`,
                color: recoveryColor,
              },
            });
          }

          if (hrv != null) {
            accessories.push({
              text: `HRV: ${Math.round(hrv)}ms`,
            });
          } else if (sleepHours != null) {
            accessories.push({
              text: `Sleep: ${sleepHours.toFixed(1)}h`,
            });
          }

          return (
            <List.Item
              key={log.id || log.date}
              icon={{ source: Icon.Heart, tintColor: recoveryColor }}
              title={formatRelativeDate(log.date)}
              subtitle={formatDateFull(log.date)}
              keywords={[log.date]}
              accessories={accessories}
              detail={
                <List.Item.Detail
                  markdown={`# 📊 Biometrics & Recovery\n\n**Date:** ${formatDateFull(
                    log.date,
                  )}\n\n${
                    notes
                      ? `> ${notes}`
                      : "*No additional notes logged for this day.*"
                  }`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      {recoveryScore != null && (
                        <List.Item.Detail.Metadata.TagList title="Recovery Status">
                          <List.Item.Detail.Metadata.TagList.Item
                            text={`${Math.round(recoveryScore)}%`}
                            color={recoveryColor}
                          />
                        </List.Item.Detail.Metadata.TagList>
                      )}
                      {hrv != null && (
                        <List.Item.Detail.Metadata.Label
                          title="HRV (rMSSD)"
                          text={`${Math.round(hrv)} ms`}
                        />
                      )}
                      {rhr != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Resting Heart Rate"
                          text={`${Math.round(rhr)} bpm`}
                        />
                      )}
                      {sleepHours != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Sleep Duration"
                          text={`${sleepHours.toFixed(1)} hours`}
                          icon={Icon.Moon}
                        />
                      )}
                      {log.sleepScore != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Sleep Score"
                          text={`${Math.round(log.sleepScore)}%`}
                        />
                      )}
                      {log.stress != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Stress Level"
                          text={`${Math.round(log.stress)}`}
                        />
                      )}
                      {log.weight != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Weight"
                          text={`${log.weight.toFixed(1)} kg`}
                        />
                      )}
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.Label
                        title="Fitness (CTL)"
                        text={
                          log.ctl != null ? String(Math.round(log.ctl)) : "N/A"
                        }
                      />
                      <List.Item.Detail.Metadata.Label
                        title="Fatigue (ATL)"
                        text={
                          log.atl != null ? String(Math.round(log.atl)) : "N/A"
                        }
                      />
                      <List.Item.Detail.Metadata.Label
                        title="Form (TSB)"
                        text={tsb != null ? String(tsb) : "N/A"}
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
