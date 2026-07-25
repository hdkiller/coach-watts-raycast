import { ActionPanel, Action, Form, Detail, Icon, showToast, Toast } from "@raycast/api";
import { useState } from "react";
import { CoachWattsApi } from "./api/client";

export default function AskCoachCommand() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");

  async function handleSubmit(values: { prompt: string }) {
    if (!values.prompt || values.prompt.trim().length === 0) {
      showToast({ style: Toast.Style.Failure, title: "Please enter a question" });
      return;
    }

    setLoading(true);
    setQuestion(values.prompt);
    showToast({ style: Toast.Style.Animated, title: "Asking Coach Watts AI..." });

    try {
      const result = await CoachWattsApi.askCoach(values.prompt);
      setResponse(result);
      showToast({ style: Toast.Style.Success, title: "Response Received" });
    } catch (err: any) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to get AI response",
        message: err.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  }

  if (response) {
    return (
      <Detail
        markdown={`# 💬 Question\n> ${question}\n\n---\n\n# 🤖 Coach Watts Response\n\n${response}`}
        actions={
          <ActionPanel>
            <Action
              title="Ask Another Question"
              icon={Icon.Message}
              onAction={() => {
                setResponse(null);
                setQuestion("");
              }}
            />
            <Action.CopyToClipboard title="Copy Response" content={response} />
            <Action.OpenInBrowser title="Open Coach Watts Chat" url="http://localhost:3000/chat" />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <Form
      isLoading={loading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Ask Coach" icon={Icon.Airplane} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="prompt"
        title="Question / Prompt"
        placeholder="e.g. How should I adjust my training based on my current fatigue? Or suggest a workout for today."
        enableMarkdown
      />
    </Form>
  );
}
