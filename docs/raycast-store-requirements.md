# Raycast Store Submission & Quality Standards

This document outlines the official Raycast Store submission checklist, technical requirements, Code Quality & UX standards, and local verification commands for the **Coach Watts** Raycast extension.

---

## 1. Store Submission Requirements Checklist

Before publishing to the Raycast Store, ensure the extension meets all requirements in `package.json`, assets, and code quality.

### A. `package.json` Metadata
- **`name`**: `coach-watts` (Kebab-case, unique slug).
- **`title`**: `Coach Watts` (Title Case per Apple Style Guide).
- **`description`**: Clear, concise explanation of extension capabilities.
- **`icon`**: Must point to a 512x512px PNG/SVG image (`command-icon.png`).
- **`author`**: Must match your registered handle on [Raycast.com](https://www.raycast.com) (e.g. `https://www.raycast.com/api/v1/users/{author}`).
- **`categories`**: Must contain valid Raycast categories (e.g., `Productivity`, `Developer Tools`, `Other`).
- **`license`**: Must be set to `"MIT"`.
- **`commands`**:
  - `name`: Command slug (e.g., `today`, `workouts`, `wellness`, `ask-coach`, `sync`).
  - `title`: Apple Title Case (e.g., `Today's Training`, `Wellness & Biometrics`).
  - `description`: Detailed action description.
  - `mode`: `"view"` or `"no-view"`.
- **`package-lock.json`**: Must be committed to ensure deterministic CI builds.

### B. Visual Assets & Icon Guidelines
- **Extension Icon**: 512x512px PNG image (`command-icon.png`).
- **Contrast & Transparency**: Icon must be legible on both Light and Dark macOS / Raycast themes.
- **Command Icons**: Use `@raycast/api` standard `Icon` enum or custom 64x64 PNG assets.

---

## 2. Code Quality & UX Standards

### A. Code & Type Safety
1. **Strict TypeScript**: No implicit or explicit `any` types allowed. Use `unknown`, interface definitions, or type guards.
2. **ESLint & Prettier**: Code must pass `ray lint` without warnings or style issues.
3. **Clean Architecture**: Decouple API calls into modular clients (`src/api/client.ts`, `src/api/oauth.ts`).

### B. User Experience (UX) Standards
1. **Loading States**: All async commands must set `isLoading={isLoading}` on Raycast `<List>`, `<Detail>`, or `<Form>` components.
2. **Error Toasts**: API failures or network errors must display standard Raycast Toasts:
   ```ts
   showToast({
     style: Toast.Style.Failure,
     title: "Failed to load workouts",
     message: error instanceof Error ? error.message : "Unknown error",
   });
   ```
3. **Empty & Fallback States**: When data is missing, display informative `<List.EmptyView>` or markdown fallbacks with direct action triggers (e.g., `Refresh` or `Open in Browser`).
4. **Action Panels**:
   - Primary action (e.g., `View Details`, `Submit`) mapped to `enter`.
   - Secondary actions (e.g., `Refresh`, `Copy Summary`, `Open in Web`) with appropriate keyboard shortcuts.

### C. Security & Credentials
- **No Embedded Secrets**: Never store API tokens or client secrets in the codebase.
- **Preferences**: Use Raycast preferences (`type: "password"` or `"textfield"`) for user configurable settings (e.g., `baseUrl`, `apiKey`).
- **OAuth 2.0 PKCE**: Use `@raycast/api` `OAuth.PKCEClient` for standard web authentication.

---

## 3. Pre-Submission Local Verification Workflow

Use the following npm helper commands to verify your project before submitting:

| Command | Action |
| :--- | :--- |
| `npm run lint` | Runs `ray lint` to validate `package.json`, ESLint rules, and Prettier code style. |
| `npm run fix-lint` | Automatically fixes Prettier formatting and safe ESLint issues. |
| `npm run typecheck` | Runs `tsc --noEmit` to ensure zero TypeScript errors. |
| `npm run test` | Runs unit tests via Vitest. |
| `npm run build` | Compiles production assets with `ray build -e dist`. |
| `npm run verify` | Runs `lint`, `typecheck`, `test`, and `build` in sequence. |

### Run Full Pre-Submission Verification
```bash
npm run verify
```

---

## 4. Publishing to the Raycast Store

Once `npm run verify` completes with 0 errors:

1. **Automated Submission**:
   ```bash
   npm run publish
   ```
   *This command runs `npx @raycast/api publish`, which handles authenticating with GitHub, forking `raycast/extensions`, staging files, and opening a Pull Request.*

2. **Pull Request Review**:
   - The Raycast GitHub Actions CI will run lint, build, and validation checks automatically.
   - Raycast maintainers will review the PR for UX consistency, icon clarity, and code quality.
   - Address any review comments promptly. Once merged, the extension is live in the Raycast Store!
