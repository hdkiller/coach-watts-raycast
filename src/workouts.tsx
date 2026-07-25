import { ActionPanel, Action, List, Icon, Color } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { CoachWattsApi, Workout, getWebUrl } from "./api/client";

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "N/A";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function formatDistance(meters?: number): string {
  if (!meters || meters <= 0) return "N/A";
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

function formatPace(workout: Workout): string | undefined {
  const isRun = workout.type?.toLowerCase() === "run";
  if (
    !isRun ||
    !workout.durationSec ||
    !workout.distanceMeters ||
    workout.distanceMeters <= 0
  ) {
    return undefined;
  }
  const paceSecPerKm = workout.durationSec / (workout.distanceMeters / 1000);
  const mins = Math.floor(paceSecPerKm / 60);
  const secs = Math.round(paceSecPerKm % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs} /km`;
}

export default function WorkoutsCommand() {
  const {
    isLoading,
    data: workouts = [],
    error,
    revalidate,
  } = usePromise(() => CoachWattsApi.getRecentWorkouts(50));

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter workouts by title or sport..."
      isShowingDetail={workouts.length > 0}
    >
      {error ? (
        <List.EmptyView
          icon={Icon.Warning}
          title="Failed to load workouts"
          description={error.message}
        />
      ) : workouts.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Calendar}
          title="No recent workouts found"
          description="Completed activities will appear here."
        />
      ) : (
        workouts.map((workout: Workout) => {
          const dateNormalized = /^\d{4}-\d{2}-\d{2}$/.test(workout.date)
            ? `${workout.date}T12:00:00`
            : workout.date;
          const formattedDate = new Date(dateNormalized).toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric",
              year: "numeric",
            },
          );

          const pace = formatPace(workout);

          return (
            <List.Item
              key={workout.id}
              title={workout.title || "Untitled Workout"}
              subtitle={formattedDate}
              keywords={[workout.type || "", workout.title]}
              accessories={[
                {
                  text: workout.tss
                    ? `${Math.round(workout.tss)} TSS`
                    : undefined,
                },
                {
                  text: pace
                    ? `Pace: ${pace}`
                    : formatDuration(workout.durationSec),
                },
              ]}
              detail={
                <List.Item.Detail
                  markdown={`# ${workout.title || "Untitled Workout"}\n\n**Date:** ${formattedDate}\n**Sport:** ${
                    workout.type || "Activity"
                  }`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label
                        title="Duration"
                        text={formatDuration(workout.durationSec)}
                      />
                      <List.Item.Detail.Metadata.Label
                        title="Distance"
                        text={formatDistance(workout.distanceMeters)}
                      />
                      {pace !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Avg Pace"
                          text={pace}
                        />
                      )}
                      {workout.tss !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="TSS"
                          text={String(Math.round(workout.tss))}
                        />
                      )}
                      {workout.normalizedPower !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Normalized Power"
                          text={`${workout.normalizedPower} W`}
                        />
                      )}
                      {workout.averageWatts !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Avg Power"
                          text={`${workout.averageWatts} W`}
                        />
                      )}
                      {workout.averageHr !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Avg Heart Rate"
                          text={`${workout.averageHr} bpm`}
                        />
                      )}
                      {workout.elevationGain !== undefined && (
                        <List.Item.Detail.Metadata.Label
                          title="Elevation Gain"
                          text={`${workout.elevationGain} m`}
                        />
                      )}
                      <List.Item.Detail.Metadata.Separator />
                      <List.Item.Detail.Metadata.TagList title="Source">
                        <List.Item.Detail.Metadata.TagList.Item
                          text={workout.source || "Coach Watts"}
                          color={Color.Green}
                        />
                      </List.Item.Detail.Metadata.TagList>
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <Action
                    title="Refresh Workouts"
                    icon={Icon.Redo}
                    onAction={revalidate}
                  />
                  <Action.CopyToClipboard
                    title="Copy Workout Title"
                    content={workout.title}
                  />
                  <Action.OpenInBrowser
                    title="Open in Coach Watts"
                    url={getWebUrl("/activities")}
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
