import {
  ActionPanel,
  Action,
  Form,
  Icon,
  showToast,
  Toast,
  showHUD,
  open,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";
import { CoachWattsApi, getWebUrl, type NutritionItem } from "./api/client";

export default function LogFoodCommand() {
  const [loading, setLoading] = useState(false);

  // Fetch today's current nutrition state & goals
  const {
    data: todayNutrition,
    revalidate,
    isLoading: isFetchingNutrition,
  } = usePromise(() => CoachWattsApi.getTodayNutrition());

  // Form field states
  const [aiQuery, setAiQuery] = useState("");
  const [logMode, setLogMode] = useState<"ai" | "manual">("ai");

  // Manual form field states
  const [manualName, setManualName] = useState("");
  const [manualMeal, setManualMeal] = useState("SNACK");
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualWater, setManualWater] = useState("");

  // AI Quick Log Handler
  async function handleAiSubmit() {
    if (!aiQuery || aiQuery.trim().length === 0) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter a food description",
        message: 'e.g. "2 eggs, sourdough toast with avocado, black coffee"',
      });
      return;
    }

    setLoading(true);
    showToast({
      style: Toast.Style.Animated,
      title: "Analyzing food with AI...",
    });

    try {
      const res = await CoachWattsApi.logMealByQuery(aiQuery.trim());
      setAiQuery("");
      await revalidate();

      const itemsCount = res.parsedItems?.length || 0;
      const toastTitle =
        itemsCount > 0
          ? `Logged ${itemsCount} food item${itemsCount > 1 ? "s" : ""}!`
          : "Logged meal successfully!";

      await showHUD(`🥗 ${toastTitle}`);
    } catch (err: unknown) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to log food",
        message: err instanceof Error ? err.message : "Server error",
      });
    } finally {
      setLoading(false);
    }
  }

  // Manual Form Submit Handler
  async function handleManualSubmit() {
    if (!manualName && !manualCalories && !manualWater) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter meal details or calories",
      });
      return;
    }

    setLoading(true);
    showToast({
      style: Toast.Style.Animated,
      title: "Logging nutrition...",
    });

    try {
      const todayYmd = new Date().toISOString().split("T")[0];

      // Handle hydration only log
      if (manualWater && !manualName && !manualCalories) {
        const volume = parseInt(manualWater, 10);
        if (isNaN(volume) || volume <= 0) {
          showToast({
            style: Toast.Style.Failure,
            title: "Invalid water amount",
          });
          setLoading(false);
          return;
        }
        await CoachWattsApi.quickAddHydration(volume);
        setManualWater("");
        await revalidate();
        await showHUD(`💧 Logged ${volume}ml water`);
        setLoading(false);
        return;
      }

      const newItem: NutritionItem = {
        name: manualName.trim() || "Quick Log Item",
        meal: manualMeal,
        calories: parseInt(manualCalories, 10) || 0,
        protein: parseFloat(manualProtein) || 0,
        carbs: parseFloat(manualCarbs) || 0,
        fat: parseFloat(manualFat) || 0,
        logged_at: new Date().toISOString(),
      };

      await CoachWattsApi.logNutritionItems(todayYmd, [newItem]);

      if (manualWater) {
        const volume = parseInt(manualWater, 10);
        if (!isNaN(volume) && volume > 0) {
          await CoachWattsApi.quickAddHydration(volume);
        }
      }

      setManualName("");
      setManualCalories("");
      setManualProtein("");
      setManualCarbs("");
      setManualFat("");
      setManualWater("");
      await revalidate();

      await showHUD(`✅ Logged ${newItem.name} (${newItem.calories} kcal)`);
    } catch (err: unknown) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to log entry",
        message: err instanceof Error ? err.message : "Server error",
      });
    } finally {
      setLoading(false);
    }
  }

  // Quick Hydration Button Handler
  async function handleQuickHydration(volumeMl: number) {
    setLoading(true);
    try {
      await CoachWattsApi.quickAddHydration(volumeMl);
      await revalidate();
      await showHUD(`💧 Quick Added ${volumeMl}ml Water`);
    } catch (err: unknown) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to add water",
        message: err instanceof Error ? err.message : "Server error",
      });
    } finally {
      setLoading(false);
    }
  }

  // Mobile App Deep Link Handlers
  async function openMobileApp(action: "meal" | "camera" | "water" | "log") {
    const url = `coachwatts://(app)/(tabs)/log?action=${action}`;
    try {
      await open(url);
      await showHUD(`📱 Opening Coach Watts Mobile...`);
    } catch {
      showToast({
        style: Toast.Style.Failure,
        title: "Could not open mobile app",
        message:
          "Ensure Coach Watts app is installed on your Mac / iOS device.",
      });
    }
  }

  // Progress calculations
  const loggedCal = todayNutrition?.calories || 0;
  const targetCal = todayNutrition?.targetCalories || 2200;
  const calPct = targetCal > 0 ? Math.round((loggedCal / targetCal) * 100) : 0;

  const loggedProtein = todayNutrition?.protein || 0;
  const targetProtein = todayNutrition?.targetProtein || 150;

  const loggedCarbs = todayNutrition?.carbs || 0;
  const targetCarbs = todayNutrition?.targetCarbs || 250;

  const loggedFat = todayNutrition?.fat || 0;
  const targetFat = todayNutrition?.targetFat || 70;

  const loggedWater = todayNutrition?.waterMl || 0;

  return (
    <Form
      isLoading={loading || isFetchingNutrition}
      actions={
        <ActionPanel>
          {logMode === "ai" ? (
            <Action
              title="Log Food with AI"
              icon={Icon.Stars}
              onAction={handleAiSubmit}
            />
          ) : (
            <Action
              title="Log Manual Entry"
              icon={Icon.Checkmark}
              onAction={handleManualSubmit}
            />
          )}

          <ActionPanel.Section title="Quick Hydration">
            <Action
              title="Quick Add 250ml Water"
              icon={Icon.PlusCircle}
              onAction={() => handleQuickHydration(250)}
            />
            <Action
              title="Quick Add 500ml Water"
              icon={Icon.PlusCircle}
              onAction={() => handleQuickHydration(500)}
            />
            <Action
              title="Quick Add 750ml Water"
              icon={Icon.PlusCircle}
              onAction={() => handleQuickHydration(750)}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Mobile App Integration">
            <Action
              title="Open Mobile App Log Sheet"
              icon={Icon.Mobile}
              onAction={() => openMobileApp("meal")}
            />
            <Action
              title="Open Mobile AI Camera Scanner"
              icon={Icon.Camera}
              onAction={() => openMobileApp("camera")}
            />
            <Action
              title="Open Mobile Hydration Sheet"
              icon={Icon.Bubble}
              onAction={() => openMobileApp("water")}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Dashboard">
            <Action.OpenInBrowser
              title="Open Web Nutrition Dashboard"
              url={getWebUrl("/dashboard?section=nutrition")}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    >
      <Form.Description
        title="📊 Today's Fueling Progress"
        text={`Calories: ${loggedCal} / ${targetCal} kcal (${calPct}%) | Protein: ${loggedProtein}g / ${targetProtein}g | Carbs: ${loggedCarbs}g / ${targetCarbs}g | Fat: ${loggedFat}g / ${targetFat}g | Water: ${loggedWater}ml`}
      />

      <Form.Dropdown
        id="mode"
        title="Logging Mode"
        value={logMode}
        onChange={(val) => setLogMode(val as "ai" | "manual")}
      >
        <Form.Dropdown.Item
          value="ai"
          title="✨ AI Natural Language Quick Log"
          icon={Icon.Stars}
        />
        <Form.Dropdown.Item
          value="manual"
          title="📝 Manual Macro Entry Form"
          icon={Icon.Pencil}
        />
      </Form.Dropdown>

      <Form.Separator />

      {logMode === "ai" ? (
        <>
          <Form.TextArea
            id="aiQuery"
            title="What did you eat?"
            placeholder='e.g. "2 poached eggs on sourdough toast, 1/2 avocado, black coffee"'
            value={aiQuery}
            onChange={setAiQuery}
          />
          <Form.Description text="💡 Tip: Type naturally! Coach Watts AI will calculate calories, protein, carbs, fat, and absorption speed automatically." />
        </>
      ) : (
        <>
          <Form.TextField
            id="manualName"
            title="Item / Meal Name"
            placeholder="e.g. Grilled Chicken & Quinoa"
            value={manualName}
            onChange={setManualName}
          />
          <Form.Dropdown
            id="manualMeal"
            title="Meal Slot"
            value={manualMeal}
            onChange={setManualMeal}
          >
            <Form.Dropdown.Item value="BREAKFAST" title="🍳 Breakfast" />
            <Form.Dropdown.Item value="LUNCH" title="🥗 Lunch" />
            <Form.Dropdown.Item value="DINNER" title="🍲 Dinner" />
            <Form.Dropdown.Item value="SNACK" title="🍎 Snack" />
            <Form.Dropdown.Item value="OTHER" title="🍱 Other" />
          </Form.Dropdown>
          <Form.TextField
            id="manualCalories"
            title="Calories (kcal)"
            placeholder="450"
            value={manualCalories}
            onChange={setManualCalories}
          />
          <Form.TextField
            id="manualProtein"
            title="Protein (g)"
            placeholder="35"
            value={manualProtein}
            onChange={setManualProtein}
          />
          <Form.TextField
            id="manualCarbs"
            title="Carbs (g)"
            placeholder="40"
            value={manualCarbs}
            onChange={setManualCarbs}
          />
          <Form.TextField
            id="manualFat"
            title="Fat (g)"
            placeholder="12"
            value={manualFat}
            onChange={setManualFat}
          />
          <Form.TextField
            id="manualWater"
            title="Water (ml)"
            placeholder="250"
            value={manualWater}
            onChange={setManualWater}
          />
        </>
      )}
    </Form>
  );
}
