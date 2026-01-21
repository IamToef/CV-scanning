# Technical Specifications (SPECS)
**Project:** Dark Mode Enhancement
**Role:** Tech Lead (Simulated)
**ref:** `docs/PRD_DarkMode.md`

## 1. Implementation Logic
- Current: `DropdownMenu` with `setTheme("light" | "dark" | "system")`.
- New: Direct Button.
  - **Logic**: `onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}`.
  - **System Theme Handling**: If `theme` is 'system' or undefined, we check `resolvedTheme` (provided by `next-themes`) to decide the next state.
  - *Recommendation*: Simplify to 2-state toggle for better UX, or 3-state cycle if strictly needed. PRD implies 2-state (Light <-> Dark).

## 2. Component Changes
### `components/mode-toggle.tsx`
- **Remove**: `DropdownMenu` imports.
- **Keep**: `Button`, `Sun`, `Moon` icons.
- **Add**: `shadow` utility classes conditionally based on theme (or just group-hover effects).

## 3. Accessibility
- Ensure `aria-label="Toggle theme"` is present.
- Keyboard navigation (Enter key) must work.

## 4. Risk
- **Hydration Mismatch**: `next-themes` handles this, but ensure we don't render the icon until mounted to avoid "Flicker".
- *Mitigation*: Use `effectiveTheme` state or just rely on `suppressHydrationWarning` in layout (which is already there).
