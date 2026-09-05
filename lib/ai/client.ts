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

const PRIMARY_MODEL = "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-flash-lite-latest";

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
 * body of its response. Includes automatic backoff retries and model fallback
 * to handle transient Google server capacity spikes (503/429).
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

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: unknown = null;
  let lastStatus: number | null = null;

  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        // Wait 1.5s with backoff before retry
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      let response: Response;
      try {
        response = await fetch(generateContentUrl(model), {
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
        lastError = error;
        continue;
      }

      if (response.ok) {
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

      lastStatus = response.status;
      // If 503 (high demand) or 429 (rate limit), retry or try fallback model
      if (response.status === 503 || response.status === 429) {
        console.warn(
          `[lib/ai/client] Gemini model ${model} returned ${response.status} on attempt ${attempt + 1}. Retrying...`
        );
        continue;
      }

      // If other status code, break to try fallback model
      break;
    }
  }

  if (lastStatus === 503) {
    throw new AiServiceError(
      "The AI service is experiencing high demand. Please click Regenerate in a few moments."
    );
  }

  if (lastStatus) {
    throw new AiServiceError(
      `The AI service returned an error (status ${lastStatus}).`
    );
  }

  throw new AiServiceError("Could not reach the AI service.", {
    cause: lastError,
  });
}
