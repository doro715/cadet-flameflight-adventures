import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({ hero: z.string().max(40), pages: z.array(z.object({ text: z.string().max(600), fact: z.string().max(300) })).length(5) });

/** Rewrites story text using only supplied facts. Returns null so the client keeps the template on any failure. */
export const rewriteStory = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    try {
      const { generateResponse } = await import("@lovable.dev/ai-gateway");
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: "You rewrite a 5-page children's story (ages 5-9) to be lively and warm. Rules: keep the same events and hero name; use ONLY the facts supplied for each page; never add new science, numbers, places, equipment or safety claims. Each page 1-3 short sentences. Reply with JSON only: {\"pages\":[\"...\",\"...\",\"...\",\"...\",\"...\"]}.",
        input: JSON.stringify(data),
      });
      const text = JSON.stringify(res).match(/"text":"((?:[^"\\]|\\.)*)"/g)?.map((m) => JSON.parse(m.slice(7))).join("") ?? "";
      const parsed = z.object({ pages: z.array(z.string().min(1).max(700)).length(5) }).safeParse(JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)));
      return parsed.success ? parsed.data.pages : null;
    } catch (e) {
      console.error("rewriteStory failed", e);
      return null;
    }
  });
