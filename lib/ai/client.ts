/**
 * Thin server-side OpenAI wrapper (docs/architecture.md #9, docs/rules.md #11).
 *
 * - This module reads `OPENAI_API_KEY` and must only ever be imported from
 *   Server Actions/Components (e.g. `app/actions/ai.ts`), never from a
 *   client component — the same convention already used for `lib/db`.
 *   (Not using the `server-only` package here to avoid adding a dependency
 *   per docs/rules.md #17; this file has no client-safe exports.)
 * - `OPENAI_API_KEY` never leaves this module.
 * - Callers get a single `AiServiceError` for every failure mode (missing
 *   key, network failure, bad status, unparsable output) so that
 *   `app/actions/ai.ts` can degrade gracefully per docs/PRD.md #8 without
 *   needing to know why the AI call failed.
 */

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

// Small, inexpensive model — sufficient for short structured analysis of
// a single dev log or a handful of recent tasks/logs. Revisit if output
// quality becomes a problem (docs/memory.md).
const DEFAULT_MODEL = "gpt-4o-mini";

export class AiServiceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "AiServiceError";
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

/**
 * Sends a system/user prompt pair to the model and returns the parsed JSON
 * body of its response. Throws `AiServiceError` on any failure — the AI
 * being unavailable must never look like a successful empty result, and it
 * must never corrupt or block unrelated project data (docs/PRD.md #8).
 */
export async function callAiForJson(params: {
  system: string;
  user: string;
}): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiServiceError(
      "AI features are not configured on this server."
    );
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user },
        ],
      }),
    });
  } catch (error) {
    throw new AiServiceError("Could not reach the AI service.", {
      cause: error,
    });
  }

  if (!response.ok) {
    // Never surface the response body — it may contain provider-side
    // diagnostic detail that shouldn't reach the client (docs/rules.md #12).
    throw new AiServiceError(
      `The AI service returned an error (status ${response.status}).`
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw new AiServiceError("The AI service returned an invalid response.", {
      cause: error,
    });
  }

  const content = (
    payload as { choices?: Array<{ message?: { content?: unknown } }> }
  )?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim().length === 0) {
    throw new AiServiceError("The AI service returned an empty response.");
  }

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new AiServiceError("Could not parse the AI service response.", {
      cause: error,
    });
  }
}
