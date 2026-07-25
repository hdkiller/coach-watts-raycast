import { ActionPanel, Action, Detail, Icon } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { CoachWattsApi, getWebUrl } from "./api/client";
import { getSportColor, getIntensityColor, formatDateFull } from "./utils/ui";

export { formatDateFull as formatLocalDate };

export default function TodayCommand() {
  const { isLoading, data, error, revalidate } = usePromise(() =>
    CoachWattsApi.getTodayRecommendation(),
  );

  if (error) {
    const errorMarkdown = `
# Unable to Load Today's Recommendation

**Error:** ${error.message}

Please make sure Coach Watts server is running and your API Key / Base URL settings are configured properly in Raycast Extension Preferences.
`;
    return (
      <Detail
        markdown={errorMarkdown}
        actions={
          <ActionPanel>
            <Action title="Retry" icon={Icon.Redo} onAction={revalidate} />
            <Action.OpenInBrowser title="Open Coach Watts" url={getWebUrl()} />
          </ActionPanel>
        }
      />
    );
  }

  if (!isLoading && !data) {
    const noRecMarkdown = `
# Today's Training Recommendation

No recommendation has been generated for today yet.

---

### Next Steps
- Open **Coach Watts Dashboard** to trigger recommendation generation.
- Or click **Refresh** below to check for updates.
`;
    return (
      <Detail
        markdown={noRecMarkdown}
        actions={
          <ActionPanel>
            <Action title="Refresh" icon={Icon.Redo} onAction={revalidate} />
            <Action.OpenInBrowser
              title="Open Coach Watts Dashboard"
              url={getWebUrl()}
            />
          </ActionPanel>
        }
      />
    );
  }

  const analysis = (data?.analysisJson as Record<string, unknown>) || {};
  const rec = data?.recommendation || "";
  const reasoning = data?.reasoning || "";

  const summary =
    (typeof analysis.summary === "string" ? analysis.summary : undefined) ||
    (typeof rec === "string"
      ? rec
      : typeof (rec as Record<string, unknown>)?.summary === "string"
        ? ((rec as Record<string, unknown>).summary as string)
        : undefined) ||
    "No summary provided for today's recommendation.";

  const actionableAdvice =
    (typeof analysis.actionableAdvice === "string"
      ? analysis.actionableAdvice
      : undefined) ||
    reasoning ||
    "Follow your scheduled workout or rest as recommended.";

  const sportType =
    (typeof analysis.sportType === "string" ? analysis.sportType : undefined) ||
    data?.plannedWorkout?.sportType ||
    "General";

  const intensity =
    (typeof analysis.intensity === "string" ? analysis.intensity : undefined) ||
    "Moderate";

  const durationMins =
    analysis.targetDurationMinutes ||
    (data?.plannedWorkout?.targetDurationSec
      ? Math.round(data.plannedWorkout.targetDurationSec / 60)
      : undefined);

  const durationStr = durationMins ? `${durationMins} mins` : "N/A";

  const targetTss =
    analysis.targetTss ?? data?.plannedWorkout?.targetTss ?? "N/A";

  const markdown = `
# Today's Training Recommendation

### Summary
${summary}

---

### Actionable Advice & Reasoning
${actionableAdvice}

---

### Target Metrics
- **Sport Type:** ${sportType}
- **Intensity:** ${intensity}
- **Target Duration:** ${durationStr}
- **Target TSS:** ${targetTss}
`;

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Date"
            text={formatDateFull(data?.date)}
            icon={Icon.Calendar}
          />
          <Detail.Metadata.TagList title="Sport">
            <Detail.Metadata.TagList.Item
              text={sportType}
              color={getSportColor(sportType)}
            />
          </Detail.Metadata.TagList>
          <Detail.Metadata.TagList title="Intensity">
            <Detail.Metadata.TagList.Item
              text={intensity}
              color={getIntensityColor(intensity)}
            />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label
            title="Target Duration"
            text={durationStr}
            icon={Icon.Clock}
          />
          <Detail.Metadata.Label title="Target TSS" text={String(targetTss)} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Status"
            text={data?.status || "Active"}
          />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action title="Refresh" icon={Icon.Redo} onAction={revalidate} />
          <Action.CopyToClipboard title="Copy Summary" content={summary} />
          <Action.OpenInBrowser
            title="Open Coach Watts Dashboard"
            url={getWebUrl()}
          />
        </ActionPanel>
      }
    />
  );
}
