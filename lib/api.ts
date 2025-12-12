import { APP_CONFIG } from './config';
import { AnalysisResult, ChatMessage, Candidate } from '@/types';

export async function uploadJDAndCVs(jd: string, files: File[]): Promise<AnalysisResult> {
    if (APP_CONFIG.useMockData) {
        console.log('[Mock API] Uploading JD:', jd.substring(0, 50) + '...');
        console.log('[Mock API] Files:', files.map(f => f.name));

        return new Promise((resolve) => setTimeout(() => resolve({
            candidates: [
                {
                    id: 'mock-1', name: 'Mock Candidate A', email: 'mock.a@example.com', score: 8,
                    status: 'shortlisted', summary: 'Excellent match based on mock analysis.',
                    strengths: ['Relevant Experience', 'Tech Stack Usage'], weaknesses: [],
                    skills_found: ['React', 'TypeScript'], skills_missing: [], experience_years: 4,
                    match_level: 'cao',
                    risk_analysis: { level: 'thấp', explanation: 'No major risks.' },
                    reward_analysis: { level: 'cao', explanation: 'High potential.' }
                }
            ]
        }), 2000));
    }

    try {
        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('jd', jd);
            formData.append('files', file);

            const res = await fetch('/api/n8n/score', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to analyze file ${file.name}: ${errorText}`);
            }

            return res.json();
        });

        const results = await Promise.all(uploadPromises);

        const allCandidates: Candidate[] = [];
        results.forEach(json => {
            console.log('[API] /score partial response:', json);
            const result = parseCandidates(json);
            allCandidates.push(...result.candidates);
        });

        return { candidates: allCandidates };

    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

function parseCandidates(data: any): AnalysisResult {
    try {
        let items: any[] = [];

        // Handle various n8n response structures
        if (Array.isArray(data)) {
            items = data;
        } else if (data.candidates && Array.isArray(data.candidates)) {
            items = data.candidates;
        } else if (data.data && Array.isArray(data.data)) {
            items = data.data;
        } else if (data.json) {
            items = [data.json];
        }

        const candidates: Candidate[] = items.map((item: any) => {
            // Unwrap 'json', 'data', or 'output' if nested
            const raw = item.output || item.json || item.data || item;

            // Safe helper to get string
            const getStr = (key: string) => raw[key] ? String(raw[key]) : undefined;

            // Parse Risk/Reward objects
            const parseAnalysis = (key: string) => {
                const val = raw[key];
                if (typeof val === 'object' && val !== null) {
                    return { level: val['mức độ'] || 'unknown', explanation: val['giải thích'] || '' };
                }
                return undefined;
            };

            // Parse detailed scores
            const reasoning = {
                experience_score: Number(raw['điểm dựa trên kinh nghiệm']) || 0,
                skills_score: Number(raw['điểm kỹ năng']) || 0,
                education_score: Number(raw['điểm học vấn']) || 0,
                potential_score: Number(raw['điểm thành tích & tiềm năng']) || 0
            };

            return {
                id: getStr('id') || Date.now().toString() + Math.random().toString().slice(2, 6),
                name: getStr('Họ tên ứng viên') || 'Unknown Candidate',
                email: getStr('email ứng viên') || 'No email',
                phone: getStr('số điện thoại ứng viên'),
                // Keep 0-10 score as requested
                score: Number(raw['Điểm tổng']) || 0,
                status: 'analyzed',
                match_level: getStr('Mức độ phù hợp'),
                summary: (getStr('Lý do chấm điểm') || '') + '\n\n' + (getStr('Kết luận') || ''),

                // Map to structured objects
                risk_analysis: parseAnalysis('Risk Factor'),
                reward_analysis: parseAnalysis('Reward Factor'),

                // Fallback for simple arrays
                strengths: raw['Reward Factor']?.['giải thích'] ? [raw['Reward Factor']['giải thích']] : [],
                weaknesses: raw['Risk Factor']?.['giải thích'] ? [raw['Risk Factor']['giải thích']] : [],

                skills_found: [],
                skills_missing: [],
                experience_years: (() => {
                    const expRaw = String(raw['số năm kinh nghiệm'] || '');
                    const match = expRaw.match(/\d+/);
                    return match ? parseInt(match[0]) : (isNaN(parseInt(raw['Lý do chấm điểm'])) ? 0 : 1);
                })(),
                question_asked: getStr('question_for_candidate'),
                reasoning
            } as Candidate;
        });

        return { candidates };
    } catch (e) {
        console.error('Error parsing candidates:', e);
        // Fail safe to empty array
        return { candidates: [] };
    }
}

export async function sendChatMessage(message: string, history: ChatMessage[] = []): Promise<ChatMessage> {
    if (APP_CONFIG.useMockData) {
        return new Promise(resolve => setTimeout(() => resolve({
            id: Date.now().toString(),
            role: 'assistant',
            content: `[Mock AI Response] You asked: "${message}". I found 2 candidates matching your query in the mock database.`,
            timestamp: Date.now()
        }), 1500));
    }

    const res = await fetch('/api/n8n/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
    });

    if (!res.ok) {
        throw new Error('Failed to send message');
    }
    return res.json();
}
