# PRD: Export PDF Feature
## 1. Goal
Support HR/Recruiters to export the Candidate Detail View into a high-quality PDF file (A4 format) to share with stakeholders (Hiring Managers).

## 2. Requirements
*   **Trigger:** Add a "Export PDF" button in the `CandidateProfile` dialog footer (next to Contact/Reject buttons).
*   **Output Quality:**
    *   **Vector Text:** Text must be selectable and sharp (not image-based).
    *   **Layout:** A4 size, clean margins.
    *   **Content:**
        *   Header: Candidate Name, Email, Phone, Match Score.
        *   Body: Summary, Pros/Cons (2 columns), Skills (Tags), Interview Questions (if available).
    *   **Exclude:** UI elements like "Close", "Export" buttons, scrollbars, Tabs headers.
*   **UX:**
    *   Show "Generating..." state while printing.
    *   Download filename: `Report_[CandidateName].pdf`.

## 3. Scope
*   Use `react-to-print` for implementation.
*   Reuse existing UI components but apply print-specific CSS (`@media print`).

---
*Created by: Agent PO*
