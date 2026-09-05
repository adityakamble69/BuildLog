/**
 * Thin server-side Gemini wrapper (docs/architecture.md #9, docs/rules.md #11).
 *
 * - This module reads `GEMINI_API_KEY` and must only ever be imported from
 *   Server Actions/Components (e.g. `app/actions/ai.ts`), never from a
 *   client component — the same convention already used for `lib/db`.
 *   (Not using the `server-only` package here to avoid adding a dependency
 *   per docs/rules.md #17; this file has no client-safe exports.)
 * - `GEMINI_API_KEY` never leaves this module.
 * - Callers get a single `AiServiceError` for every failure mode (missing
 *   key, network failure, bad status, unparsable output) so that
 *   `app/actions/ai.ts` can degrade gracefully per docs/PRD.md #8 without
 *   needing to know why the AI call failed.
 *
 * Provider decision: OpenAI → Gemini (docs/memory.md, docs/rules.md #20).
 */

// Non-versioned alias, per Gemini's model docs — always resolves to the
// current flash model instead of a dated version string that eventually
// gets retired (which is what a 404 here usually means). Pin to a dated
// model only if reproducible output across upgrades becomes a requirement.
const DEFAULT_MODEL = "gemini-flash-latest";

function generateContentUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiServiceError(
      "AI features are not configured on this server."
    );
  }

  let response: Response;
  try {
    response = await fetch(generateContentUrl(DEFAULT_MODEL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        // Gemini has no separate "system" role in a chat array the way
        // OpenAI does — systemInstruction is a dedicated top-level field.
        systemInstruction: {
          parts: [{ text: params.system }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: params.user }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
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
    // A 404 here specifically means the model name/endpoint isn't valid
    // for this API key (e.g. a dated model id that's since been retired) —
    // logged server-side so it's diagnosable without exposing it to the UI.
    if (response.status === 404) {
      console.error(
        `[lib/ai/client] Gemini returned 404 for model "${DEFAULT_MODEL}" — the model id may be retired. Check https://ai.google.dev/gemini-api/docs/models for current model names.`
      );
    }
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
    payload as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: unknown }> };
      }>;
    }
  )?.candidates?.[0]?.content?.parts?.[0]?.text;

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
