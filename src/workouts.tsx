import { ActionPanel, Action, List, Icon, Color } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState, useMemo } from "react";
import { CoachWattsApi, Workout, getWebUrl } from "./api/client";
import {
  getSportIcon,
  getSportColor,
  formatDuration,
  formatDistance,
  formatPace,
  formatDateFull,
  formatRelativeDate,
} from "./utils/ui";

export { formatDuration, formatDistance, formatPace };

export default function WorkoutsCommand() {
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [isShowingDetail, setIsShowingDetail] = useState<boolean>(true);

  const {
    isLoading,
    data: workouts = [],
    error,
    revalidate,
  } = usePromise(() => CoachWattsApi.getRecentWorkouts(50));

  const filteredWorkouts = useMemo(() => {
    if (selectedSport === "all") return workouts;
    return workouts.filter((w) =>
      w.type?.toLowerCase().includes(selectedSport.toLowerCase()),
    );
  }, [workouts, selectedSport]);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter workouts by title..."
      isShowingDetail={isShowingDetail && filteredWorkouts.length > 0}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Sport"
          storeValue={false}
          onChange={(newValue) => setSelectedSport(newValue)}
        >
          <List.Dropdown.Item
            title="All Sports"
            value="all"
            icon={Icon.Globe}
          />
          <List.Dropdown.Item
            title="Running"
            value="run"
            icon={{ source: Icon.Person, tintColor: Color.Orange }}
          />
          <List.Dropdown.Item
            title="Cycling"
            value="ride"
            icon={{ source: Icon.Bike, tintColor: Color.Blue }}
          />
          <List.Dropdown.Item
            title="Gym & Strength"
            value="gym"
            icon={{ source: Icon.Trophy, tintColor: Color.Purple }}
          />
          <List.Dropdown.Item
            title="Swimming"
            value="swim"
            icon={{ source: Icon.Globe, tintColor: Color.Purple }}
          />
          <List.Dropdown.Item
            title="Walking & Hike"
            value="walk"
            icon={{ source: Icon.Footprints, tintColor: Color.Green }}
          />
        </List.Dropdown>
      }
    >
      {error ? (
        <List.EmptyView
          icon={Icon.Warning}
          title="Failed to load workouts"
          description={error.message}
        />
      ) : filteredWorkouts.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.Calendar}
          title="No workouts found"
          description={
            selectedSport === "all"
              ? "Completed activities will appear here."
              : `No ${selectedSport} activities found.`
          }
        />
      ) : (
        filteredWorkouts.map((workout: Workout) => {
          const pace = formatPace(workout);
          const sportIcon = getSportIcon(workout.type);
          const sportColor = getSportColor(workout.type);

          const accessories: List.Item.Accessory[] = [];

          if (workout.tss != null && workout.tss > 0) {
            accessories.push({
              tag: {
                value: `${Math.round(workout.tss)} TSS`,
                color: Color.Orange,
              },
            });
          }

          const primaryMetric = pace
            ? pace
            : workout.durationSec && workout.durationSec > 0
              ? formatDuration(workout.durationSec)
              : undefined;

          if (primaryMetric) {
            accessories.push({
              text: primaryMetric,
            });
          }

          return (
            <List.Item
              key={workout.id}
              icon={{ source: sportIcon, tintColor: sportColor }}
              title={workout.title || "Untitled Workout"}
              subtitle={
                isShowingDetail ? undefined : formatRelativeDate(workout.date)
              }
              keywords={[workout.type || "", workout.title]}
              accessories={accessories}
              detail={
                <List.Item.Detail
                  markdown={`# ${workout.title || "Untitled Workout"}\n\n**${
                    workout.type || "Activity"
                  }** • ${formatDateFull(workout.date)} (${formatRelativeDate(workout.date)})`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.TagList title="Sport">
                        <List.Item.Detail.Metadata.TagList.Item
                          text={workout.type || "Activity"}
                          color={sportColor}
                        />
                      </List.Item.Detail.Metadata.TagList>
                      <List.Item.Detail.Metadata.Label
                        title="Date"
                        text={formatDateFull(workout.date)}
                        icon={Icon.Calendar}
                      />
                      {workout.durationSec != null &&
                        workout.durationSec > 0 && (
                          <List.Item.Detail.Metadata.Label
                            title="Duration"
                            text={formatDuration(workout.durationSec)}
                            icon={Icon.Clock}
                          />
                        )}
                      {workout.distanceMeters != null &&
                        workout.distanceMeters > 0 && (
                          <List.Item.Detail.Metadata.Label
                            title="Distance"
                            text={formatDistance(workout.distanceMeters)}
                          />
                        )}
                      {pace && (
                        <List.Item.Detail.Metadata.Label
                          title="Avg Pace"
                          text={pace}
                        />
                      )}
                      {workout.tss != null && (
                        <List.Item.Detail.Metadata.Label
                          title="TSS"
                          text={String(Math.round(workout.tss))}
                        />
                      )}
                      {workout.normalizedPower != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Normalized Power"
                          text={`${Math.round(workout.normalizedPower)} W`}
                        />
                      )}
                      {workout.averageWatts != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Avg Power"
                          text={`${Math.round(workout.averageWatts)} W`}
                        />
                      )}
                      {workout.averageHr != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Avg Heart Rate"
                          text={`${Math.round(workout.averageHr)} bpm`}
                        />
                      )}
                      {workout.maxHr != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Max Heart Rate"
                          text={`${Math.round(workout.maxHr)} bpm`}
                        />
                      )}
                      {workout.elevationGain != null &&
                        workout.elevationGain > 0 && (
                          <List.Item.Detail.Metadata.Label
                            title="Elevation Gain"
                            text={`${Math.round(workout.elevationGain)} m`}
                          />
                        )}
                      {workout.kilojoules != null && (
                        <List.Item.Detail.Metadata.Label
                          title="Energy"
                          text={`${Math.round(workout.kilojoules)} kJ`}
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
                    title="Toggle Details"
                    icon={Icon.Sidebar}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                    onAction={() => setIsShowingDetail((prev) => !prev)}
                  />
                  <Action
                    title="Refresh Workouts"
                    icon={Icon.Redo}
                    onAction={revalidate}
                  />
                  <Action.CopyToClipboard
                    title="Copy Workout Title"
                    content={workout.title || "Untitled Workout"}
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
