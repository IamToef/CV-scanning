# Technical Specifications (SPECS)
**Project:** CVs-web Enhanced Scoring
**Role:** Technical Lead (Simulated)
**ref:** `docs/PRD.md`

## 1. Architecture Review
The PRD requires granular scoring data. Currently:
- `lib/api.ts` parses raw N8N JSON into a `Candidate` object.
- `services/cv-scorer.ts` defines a `ScoreResult` interface.
- **Issue**: There is a mismatch between the *local* scoring logic in `cv-scorer.ts` and the *production* API parsing in `lib/api.ts`. The API might return varying structures.

## 2. Data Contract (Types)
We must standardize the `Candidate` interface in `types/index.ts` to strictly enforce the presence of `score_details`.

```typescript
// Proposed structure
interface ScoreDetails {
  experience: number; // 0-100
  skills: number;
  education: number;
  projects: number;
  soft_skills: number;
  potential: number; // N8N specific
}

interface Candidate {
  // ... existing fields
  score_details: ScoreDetails;
  scoring_reasoning: string; // "Why this score?"
}
```

## 3. Implementation Plan
### 3.1 Backend/API (`lib/api.ts`)
- Ensure `parseCandidates` robustly extracts sub-scores.
- Handle `NaN` or missing keys gracefully (Default to 0).
- **Optimization**: Do not re-run full AI analysis if we just need to re-calculate weighted averages (Client-side recalculation possible if weights change?). *Decision: Keep server-side for now to ensure consistency/trust.*

### 3.2 Frontend (`CandidateCard.tsx` / `UploadZone`)
- Create a new component `ScoreBreakdown.tsx`.
- Use `shadcn/ui` Progress component.
- **Performance**: Render lists virtuously if > 50 candidates (unlikely, but good practice). Stick to pagination/limit 20 for V1.

## 4. Security & Validation
- **Input Validation**: `zod` schema for `JobRequirements` is partially there. Need to validate the *Output* from AI before rendering to prevent UI crashes on malformed JSON.
- **Sanitization**: Ensure `explanation` text from AI doesn't contain HTML injection (React handles this, but watch out for markdown-to-html libraries).

## 5. Risk Assessment
- **N8N Latency**: Detailed scoring might increase latency.
- **Mitigation**: Optimistic UI updates. Show "Analyzing details..." while showing the main score if possible (Stream response?). *Decision: Simple await for V1.* 
