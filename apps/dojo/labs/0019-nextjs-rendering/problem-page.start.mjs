// @ts-check
/**
 * Lesson 0019, part 2: CodeArena's problem page. For each piece in components.mjs,
 * choose server(...) or client(...), then compose ProblemPage. The checker
 * renders it with your renderer and checks what reaches the browser.
 */
import { h, server, client, use } from "./kit.mjs";
import { statement, examples, editor, submitButton, db } from "./components.mjs";
void h; void server; void client; void use; void statement; void examples; void editor; void submitButton; void db;

// export const Statement = …
// export const Examples = …
// export const Editor = …
// export const SubmitButton = …

/** The page: { slug } → the statement, the examples, an editor with the starter code, and the button. */
export const ProblemPage = server("ProblemPage", async ({ slug }) => {
  void slug;
  throw new Error("Not written yet.");
});
