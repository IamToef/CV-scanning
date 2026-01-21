# SPECS: Export PDF (Client-Side)

## 1. Solution Choice
**Library:** `react-to-print`
*   **Reason:** Allows printing a React component directly to the browser's print dialog (which saves as PDF).
*   **Pros:** Preserves CSS (vector text), easy to implement, no backend requirement.
*   **Cons:** Relies on browser's print engine (Chrome/Edge is good, Safari varied).

## 2. Implementation Strategy

### 2.1. Wrapper Component (`PrintableProfile`)
Instead of printing the entire `CandidateProfile` dialog (which has scrollbars, tabs, fixed headers), we will create a **hidden** `div` that contains a simplified, print-optimized version of the profile.

**Structure:**
```tsx
<div style={{ display: 'none' }}>
  <div ref={componentRef}>
     {/* Print Only Content */}
     <div className="p-8 print:block">
        <Header />
        <Summary />
        <GridCols2>
            <Pros />
            <Cons />
        </GridCols2>
        <Skills />
     </div>
  </div>
</div>
```

### 2.2. CSS Strategy
Use Tailwind's `print:` modifier or a global `@media print` block.
*   `print:text-black` (Avoid gray text issues).
*   `print:hidden` (Hide buttons/dialog overlays if they leak).
*   Page break avoidance: `break-inside-avoid`.

### 2.3. Workflow
1.  User clicks "Export PDF".
2.  `react-to-print` triggers.
3.  Browser opens Print Preview -> User selects "Save as PDF".

## 3. Tasks
1.  Install `react-to-print`.
2.  Modify `components/candidate-profile.tsx`.
3.  Add `useReactToPrint` hook.
4.  Create the printable structure inside the existing component (hidden by default).

---
*Created by: Agent TechLead*
