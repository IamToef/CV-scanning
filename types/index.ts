export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone?: string;
    score: number; // 0-100
    match_level?: string;
    status: 'new' | 'analyzed' | 'shortlisted' | 'rejected';
    summary: string;
    pros?: string[]; // Ưu điểm
    cons?: string[]; // Nhược điểm
    scoring_reason?: string; // Lý do chấm điểm
    score_details?: {
        experience_score: number;
        skills_score: number;
        education_score: number;
        potential_score: number;
    };
    strengths: string[]; // Keep for backward compatibility or simple list
    weaknesses: string[]; // Keep for backward compatibility or simple list
    risk_analysis?: {
        level: string;
        explanation: string;
    };
    reward_analysis?: {
        level: string;
        explanation: string;
    };
    skills_found: string[];
    skills_missing: string[];
    experience_years: number;
    applied_role?: string;
    file_url?: string;
    link_cv?: string;
    reasoning?: {
        experience_score?: number;
        skills_score?: number;
        education_score?: number;
        potential_score?: number;
    };
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    sources?: Candidate[]; // For RAG citations
    candidates?: any[]; // Simplified candidate info from chat
}

export interface SortConfig {
    column: string;
    direction: 'asc' | 'desc';
}

export type FilterState = Record<string, Set<string>>;

export interface NumericFilterCondition {
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
    value: number;
}

export type NumericFilterState = Record<string, NumericFilterCondition | null>;

export interface AnalysisResult {
    candidates: Candidate[];
}

export interface JobRequirements {
    technical_skills: string[];
    soft_skills: string[];
    years_of_experience: {
        min_years: number | null;
        description: string;
    };
    education: {
        degree_level: string;
        major: string;
        certifications: string[];
    };
    soft_skills_list?: string[]; // fallback
}

export interface JDAnalysisResult {
    job_requirements?: JobRequirements;
    summary?: string; // fallback
    raw_text?: string;
}
