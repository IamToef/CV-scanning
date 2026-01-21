# Product Requirement Document (PRD)
**Project:** CVs-web Enhanced Scoring
**Role:** Product Owner (Simulated)
**Status:** Draft

## 1. Problem Statement
Users currently see a "Score" (0-10) for a candidate but lack visibility into *how* that score was calculated. "Why did this candidate get an 8.5 but this one got a 7.0?" is a common question. The "Black Box" nature of AI scoring reduces trust.

## 2. Goals
- **Transparency**: Show the math. 40% Experience + 30% Skills + ... = Total Score.
- **Actionability**: Highlight exactly *which* skills are missing.
- **Visual Appeal**: Use the "Metaverse/Neon" theme to make data pop (Progress bars, Charts).

## 3. Key Features
### 3.1 Detailed Score Breakdown
Instead of just "8.5/10", show:
- **Kinh nghiệm (40%)**: 85/100 (Progress Bar)
- **Kỹ năng (30%)**: 90/100 (Progress Bar)
- **Học vấn (10%)**: 80/100
- **Dự án (10%)**: 70/100
- **Soft Skills (10%)**: 50/100

### 3.2 "Why this score?" Tooltip
Hovering over a score section shows a brief AI explanation.
*Example: "Experience score is high because candidate has 5 years vs 3 years required."*

### 3.3 Missing Skills Highlight
A dedicated "red" section showing keywords found in JD but missing in CV.

## 4. User Stories
- As a Recruiter, I want to see the component scores so I can decide if I can train a candidate on missing skills (e.g., low Tech score but high Experience/Soft Skills).
- As a Developer, I want to upload a folder of 10 CVs and get the results in < 30 seconds.

## 5. UI/UX Requirements
- **Theme**: Dark/Neon (Cyan/Purple).
- **Animation**: Scores should "count up" when results appear.
- **Layout**: Grid view of Candidate Cards, expandable to see details.
