# Product Requirement Document (PRD)
**Project:** Dark Mode Enhancement
**Role:** Product Owner (Simulated)
**Status:** Approved

## 1. Problem
The current Dark Mode toggle is hidden behind a Dropdown Menu (requires 2 clicks). It feels "Corporate/Standard" (ShadCN default). We want "Cyberpunk/Premium".

## 2. Goals
- **One-Click Toggle**: Click the icon to switch immediately (Light <-> Dark).
- **Visuals**:
  - Light Mode: Sun Icon, Clean look.
  - Dark Mode: Moon Icon, **Neon Glow** effect (Purple/Cyan shadow).
- **Feedback**: Smooth transition animation.

## 3. Requirements
- Remove `DropdownMenu`.
- Use a single `Button`.
- When in Dark Mode, the button should have a subtle glow: `shadow-[0_0_15px_rgba(168,85,247,0.5)]` (Purple glow).

## 4. User Story
- As a user, I want to tap the moon icon once to switch to dark mode instantly.
