export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone?: string;
    score: number; // 0-10
    match_level?: string;
    status: 'new' | 'analyzed' | 'shortlisted' | 'rejected';
    summary: string;
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
    reasoning?: {
        experience_score?: number;
        skills_score?: number;
        education_score?: number;
        potential_score?: number;
    };
    question_asked?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    sources?: Candidate[]; // For RAG citations
}

export interface AnalysisResult {
    candidates: Candidate[];
}
