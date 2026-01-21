
export interface CVData {
    experience_years: number;
    skills: string[];
    education: string[]; // List of strings from CV education section
    projects: string[];
    soft_skills: string[];
}

export interface JDRequirements {
    required_experience_years: number;
    required_skills: string[]; // Critical skills
    nice_to_have_skills: string[]; // Optional
    education_keywords: string[]; // ["Bachelor", "Đại học", etc.]
    soft_skills: string[];
}

export interface ScoreResult {
    overallScore: number;
    breakdown: {
        experience: number;  // Weight 40%
        techStack: number;   // Weight 30%
        education: number;   // Weight 10%
        projects: number;    // Weight 10%
        softSkills: number;  // Weight 10%
    };
    explanation: string[];
}

const WEIGHTS = {
    EXPERIENCE: 0.40,
    TECH_SKILLS: 0.30,
    EDUCATION: 0.10,
    PROJECTS: 0.10,
    SOFT_SKILLS: 0.10,
};

/**
 * Normalizes strings for comparison (lowercase, trim, remove special chars)
 */
function normalize(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9\s#+]/g, "").trim();
}

/**
 * Fuzzy check if a skill exists in a list
 * e.g. "ReactJS" matches "React"
 */
function hasMatch(target: string, list: string[]): boolean {
    const nTarget = normalize(target);
    return list.some(item => {
        const nItem = normalize(item);
        return nItem.includes(nTarget) || nTarget.includes(nItem);
    });
}

/**
 * Primary Scoring Function
 */
export function calculateCVScore(cv: CVData, jd: JDRequirements): ScoreResult {
    const explanation: string[] = [];

    // --- 1. EXPERIENCE SCORE (40%) ---
    let expScore = 0;
    if (jd.required_experience_years <= 0) {
        expScore = 100; // No requirements
        explanation.push("Experience: N/A (Full Score)");
    } else {
        const ratio = cv.experience_years / jd.required_experience_years;
        // Cap at 1.0 (100%) for strictly linear scoring, or allow bonus?
        // PRD says: (CandidateYears / RequiredYears) * 100. Max 100.
        expScore = Math.min(ratio, 1) * 100;

        explanation.push(`Experience: ${cv.experience_years}/${jd.required_experience_years} years (${Math.round(expScore)}%)`);
    }

    // --- 2. TECH SKILLS SCORE (30%) ---
    let techScore = 0;
    if (jd.required_skills.length === 0) {
        techScore = 100;
        explanation.push("Tech Skills: No hard requirements (Full Score)");
    } else {
        let matchCount = 0;
        const missing: string[] = [];

        jd.required_skills.forEach(req => {
            if (hasMatch(req, cv.skills)) {
                matchCount++;
            } else {
                missing.push(req);
            }
        });

        techScore = (matchCount / jd.required_skills.length) * 100;
        explanation.push(`Tech Stack: Matched ${matchCount}/${jd.required_skills.length}. Missing: ${missing.slice(0, 3).join(", ")}`);
    }

    // --- 3. EDUCATION SCORE (10%) ---
    let eduScore = 0;
    // Heuristic: If CV mentions any of the JD education keywords
    if (jd.education_keywords.length === 0) {
        eduScore = 100; // Generic
    } else {
        const hasEduMatch = jd.education_keywords.some(key => hasMatch(key, cv.education));
        // Also give points if CV has general degree terms even if not exact match match
        const genericDegree = ["bachelor", "master", "engineer", "đại học", "cao đẳng", "kỹ sư", "cử nhân"];
        const hasGeneric = genericDegree.some(key => hasMatch(key, cv.education));

        if (hasEduMatch) {
            eduScore = 100;
            explanation.push("Education: Direct match");
        } else if (hasGeneric) {
            eduScore = 70; // Generic degree found but not exact keyword
            explanation.push("Education: Related degree found");
        } else {
            eduScore = 0;
            explanation.push("Education: No degree info found");
        }
    }

    // --- 4. PROJECTS SCORE (10%) ---
    // Simple heuristic: If projects array has items -> points.
    let projectScore = 0;
    if (cv.projects.length > 0) {
        projectScore = 100; // Base score for having projects
        // Can add more logic here to scan project descriptions for keywords
        explanation.push(`Projects: ${cv.projects.length} project(s) listed`);
    } else {
        explanation.push("Projects: No details provided");
    }

    // --- 5. SOFT SKILLS SCORE (10%) ---
    let softScore = 0;
    if (jd.soft_skills.length === 0) {
        softScore = 100;
    } else {
        let matches = 0;
        jd.soft_skills.forEach(sk => {
            if (hasMatch(sk, cv.soft_skills) || hasMatch(sk, cv.skills)) { // Check both lists
                matches++;
            }
        });
        softScore = (matches / jd.soft_skills.length) * 100;
        explanation.push(`Soft Skills: Matched ${matches}/${jd.soft_skills.length}`);
    }

    // --- CALCULATE TOTAL ---
    const overallScore =
        (expScore * WEIGHTS.EXPERIENCE) +
        (techScore * WEIGHTS.TECH_SKILLS) +
        (eduScore * WEIGHTS.EDUCATION) +
        (projectScore * WEIGHTS.PROJECTS) +
        (softScore * WEIGHTS.SOFT_SKILLS);

    return {
        overallScore: Math.round(overallScore * 100) / 100,
        breakdown: {
            experience: Math.round(expScore),
            techStack: Math.round(techScore),
            education: Math.round(eduScore),
            projects: Math.round(projectScore),
            softSkills: Math.round(softScore)
        },
        explanation
    };
}
