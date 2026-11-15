<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep Cadet rescue progression in a browser-safe reducer separate from its presentation so stage gates and game outcomes can be tested independently.
- Pass the Expert-mode handoff from the home page into Cadet rather than duplicating mode state, so the existing dashboard remains the single destination for real data.
- Reuse the prototype material list for Cadet equipment comparisons and keep story generation deterministic and browser-safe; label reference indices separately from NASA gas-test data to avoid implying validated spacecraft safety or live AI.

<!-- AGENT-MEMORY:BEGIN -->
- Keep the Astronaut emergency countdown and isolation transitions in a browser-safe reducer; apply scripted readings to the isolated module across console views so the demo stays consistent without claiming measured fire-suppression performance.
- Keep mission-kit scoring and story templates in browser-safe libs (cadet-kit, cadet-story); the AI story rewrite is a server function that receives only template text plus fact boxes and returns null so the client falls back to the template.
<!-- AGENT-MEMORY:END -->
