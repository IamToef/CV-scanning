import { APP_CONFIG } from './config';
import { getDriveFileUrl } from './utils';
import { AnalysisResult, ChatMessage, Candidate, JDAnalysisResult } from '@/types';


// Helper to extract questions recursively (Shared)
function extractQuestions(data: any) {
    let technical: string[] = [];
    let soft: string[] = [];

    const add = (target: string[], source: any) => {
        if (!source) return;
        if (Array.isArray(source)) {
            source.forEach(s => {
                if (typeof s === 'string') target.push(s);
            });
        } else if (typeof source === 'string') {
            if (source.includes('\n')) {
                source.split('\n').filter(line => line.trim().length > 5).forEach(s => target.push(s));
            } else if (source.length > 5) {
                target.push(source);
            }
        }
    };

    const search = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;

        // Recursively search common nested structures first
        if (obj.json) search(obj.json);
        if (obj.output) search(obj.output);
        if (obj.data) search(obj.data);

        // Scan ALL keys using regex
        Object.keys(obj).forEach(key => {
            const lower = key.toLowerCase();
            const val = obj[key];
            if (!val) return;

            // Skip known non-question massive objects/arrays to save perf
            if (key === 'json' || key === 'output' || key === 'data') return;

            // 1. Technical Keywords
            if (/technical|technolog|hard.*skill|chuyên môn|kỹ thuật/.test(lower)) {
                // Ensure it's likely a question list (key has 'question' OR value is array OR long string)
                if (lower.includes('question') || lower.includes('câu hỏi') || Array.isArray(val)) {
                    add(technical, val);
                }
            }
            // 2. Soft Skills Keywords
            else if (/soft.*skill|behavior|social|culture|mềm|hành vi|ứng xử/.test(lower)) {
                if (lower.includes('question') || lower.includes('câu hỏi') || Array.isArray(val)) {
                    add(soft, val);
                }
            }
            // 3. Generic/Fallback Keywords
            else if (/question|interview|câu hỏi|phỏng vấn|gợi ý/.test(lower)) {
                // Heuristic: If value is array or long string context
                if (Array.isArray(val) || (typeof val === 'string' && val.length > 15)) {
                    // Avoid things like "question_id"
                    if (lower.includes('id') || lower.includes('count')) return;

                    // Fallback to soft, as it's safer for generic chats
                    add(soft, val);
                }
            }
        });
    };

    if (Array.isArray(data)) {
        data.forEach(item => search(item));
    } else {
        search(data);
    }

    return {
        technical: Array.from(new Set(technical)).filter(q => q.trim().length > 0),
        soft: Array.from(new Set(soft)).filter(q => q.trim().length > 0)
    };
}

function sanitizeQuestions(list: any[]): string[] {
    if (!Array.isArray(list)) return [];
    return list.map(q => {
        if (typeof q !== 'string') return '';
        let str = String(q).trim();

        // Filter out known garbage keys from bad JSON parsing
        // "oft_skill_questions" is a common truncated key artifact
        if (str.includes('_questions') || str.includes('":') || str.includes('"[') || str.length > 500) return '';
        if (str.startsWith('oft_skill_')) return '';

        // Safe cleaning: Remove start bullets/numbers using Regex
        // Matches:
        // 1. One or more bullets (*, -, +, •) followed by optional space
        // 2. Numbered lists (1., 1.1., etc) followed by optional space
        str = str.replace(/^([*•\-+]+|\d+(\.\d+)*\.)\s*/, '');

        // Remove wrapping quotes if present
        str = str.replace(/^["']|["']$/g, '');

        return str.trim();
    }).filter(q => q && q.length > 5);
}


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
        console.log('[API] parseCandidates raw data:', JSON.stringify(data, null, 2));
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

        const globalQuestions = extractQuestions(data);

        const candidates: Candidate[] = items.map((item: any) => {
            // Unwrap 'json', 'data', or 'output' if nested
            const raw = item.output || item.json || item.data || item;

            // Log full keys to debug missing properties
            console.log('[API] Candidate Item Keys:', Object.keys(item));
            if (item.json) console.log('[API] JSON Keys:', Object.keys(item.json));
            console.log('[API] Raw Extracted Keys:', Object.keys(raw));

            // Safe helper to get string from multiple locations
            const getStr = (key: string) => {
                const val = raw[key] || (item.json && item.json[key]) || item[key];
                return val ? String(val) : undefined;
            };


            // Parse Risk/Reward objects
            const parseAnalysis = (key: string) => {
                const val = raw[key];
                if (typeof val === 'object' && val !== null) {
                    return { level: val['mức độ'] || 'unknown', explanation: val['giải thích'] || '' };
                }
                return undefined;
            };

            // Parse detailed scores
            const detailScores = raw['Chi tiết điểm'] || {};
            const reasoning = {
                experience_score: Number(detailScores['điểm kinh nghiệm']) || Number(raw['điểm dựa trên kinh nghiệm']) || Number(raw['điểm kinh nghiệm']) || 0,
                skills_score: Number(detailScores['điểm kỹ năng']) || Number(raw['điểm kỹ năng']) || 0,
                education_score: Number(detailScores['điểm học vấn']) || Number(raw['điểm học vấn']) || 0,
                potential_score: Number(detailScores['điểm thành tích & tiềm năng']) || Number(raw['điểm thành tích & tiềm năng']) || 0
            };

            // Parse Skills (Direct Array or parsing)
            const skillsList = Array.isArray(raw['Danh sách kỹ năng']) ? raw['Danh sách kỹ năng'] : (Array.isArray(raw['skills_found']) ? raw['skills_found'] : []);
            let parsedSkills: string[] = skillsList.map(String);

            // Local extraction for this specific item (search the WHOLE item, not just unwrapped raw)
            // This ensures we catch sibling keys like 'technical_questions' alongside 'output'
            const localQuestions = extractQuestions(item);

            // Determine questions with fallback to global scan
            // Priority: Parent Item Property -> Raw Property -> Local Extract -> Global fallback
            const techQ = sanitizeQuestions(
                item.technical_questions ||
                raw.technical_questions ||
                raw.json?.technical_questions ||
                (localQuestions.technical.length > 0 ? localQuestions.technical : [])
            );

            const softQ = sanitizeQuestions(
                item.soft_skill_questions ||
                item.soft_skills_questions ||
                item.suggested_interview_questions ||
                raw.soft_skill_questions ||
                raw.soft_skills_questions ||
                raw.json?.soft_skill_questions ||
                raw.json?.soft_skills_questions ||
                (localQuestions.soft.length > 0 ? localQuestions.soft : [])
            );

            // Fallback: If local is empty, try global (only if we have 1 candidate to avoid mixing)
            const finalTechQ = (techQ.length === 0 && items.length === 1) ? globalQuestions.technical : techQ;
            const finalSoftQ = (softQ.length === 0 && items.length === 1) ? globalQuestions.soft : softQ;


            return {
                id: getStr('id') || Date.now().toString() + Math.random().toString().slice(2, 6),
                name: getStr('Họ tên ứng viên') || 'Unknown Candidate',
                email: getStr('Email') || getStr('email ứng viên') || 'No email',
                phone: getStr('SĐT') || getStr('số điện thoại ứng viên'),
                // Keep 0-10 score as requested
                score: Number(raw['Điểm tổng']) || 0,
                status: 'analyzed',
                match_level: getStr('Mức độ phù hợp'),

                // New Precise Fields
                summary: getStr('Tóm tắt') || (getStr('Lý do chấm điểm') || '') + '\n\n' + (getStr('Kết luận') || ''),
                pros: Array.isArray(raw['Ưu điểm']) ? raw['Ưu điểm'] : [],
                cons: Array.isArray(raw['Nhược điểm']) ? raw['Nhược điểm'] : [],
                scoring_reason: getStr('Lý do chấm điểm'),
                score_details: {
                    experience_score: Number(detailScores['điểm kinh nghiệm']) || 0,
                    skills_score: Number(detailScores['điểm kỹ năng']) || 0,
                    education_score: Number(detailScores['điểm học vấn']) || 0,
                    potential_score: Number(detailScores['điểm thành tích & tiềm năng']) || 0
                },

                // Backward compatibility mapping
                strengths: Array.isArray(raw['Ưu điểm']) ? raw['Ưu điểm'] : (raw['Reward Factor']?.['giải thích'] ? [raw['Reward Factor']['giải thích']] : []),
                weaknesses: Array.isArray(raw['Nhược điểm']) ? raw['Nhược điểm'] : (raw['Risk Factor']?.['giải thích'] ? [raw['Risk Factor']['giải thích']] : []),

                // Map to structured objects
                risk_analysis: parseAnalysis('Risk Factor'),
                reward_analysis: parseAnalysis('Reward Factor'),

                skills_found: parsedSkills, // Will be supplemented by markdown parsing if empty
                skills_missing: (Array.isArray(raw['Kỹ năng còn thiếu']) ? raw['Kỹ năng còn thiếu'] : (Array.isArray(raw['skills_missing']) ? raw['skills_missing'] : [])).map(String),
                experience_years: (() => {
                    const expRaw = String(raw['Số năm kinh nghiệm'] || raw['số năm kinh nghiệm'] || '');
                    const match = expRaw.match(/(\d+(?:[.,]\d+)?)/);
                    if (match) {
                        return parseFloat(match[0].replace(',', '.'));
                    }
                    return 0;
                })(),

                resume_content: getStr('resume_content') || getStr('text'),

                link_cv: getDriveFileUrl(getStr('webContentLink') || getStr('link_cv') || getStr('file_url') || getStr('webViewLink') || getStr('id')),
                file_url: getDriveFileUrl(getStr('webContentLink') || getStr('link_cv') || getStr('file_url') || getStr('webViewLink') || getStr('id')),

                technical_questions: sanitizeQuestions(finalTechQ),
                soft_skill_questions: sanitizeQuestions(finalSoftQ),

                reasoning
            } as Candidate;
        });




        // MERGE LOGIC: If we have multiple items, try to merge "Questions Only" items into "Main" items
        // This handles cases where N8N returns separate items for the same candidate key
        if (candidates.length > 1) {
            const mainCandidate = candidates.find(c => c.name !== 'Unknown Candidate' && c.score > 0);
            if (mainCandidate) {
                candidates.forEach(c => {
                    if (c !== mainCandidate) {
                        if (c.technical_questions && c.technical_questions.length > 0) {
                            mainCandidate.technical_questions = c.technical_questions;
                        }
                        if (c.soft_skill_questions && c.soft_skill_questions.length > 0) {
                            mainCandidate.soft_skill_questions = c.soft_skill_questions;
                        }
                        if (!mainCandidate.resume_content && c.resume_content) {
                            mainCandidate.resume_content = c.resume_content;
                        }
                        // Merge Link/File URL if main is missing
                        if (!mainCandidate.link_cv && c.link_cv) {
                            mainCandidate.link_cv = c.link_cv;
                        }
                        if (!mainCandidate.file_url && c.file_url) {
                            mainCandidate.file_url = c.file_url;
                        }
                    }
                });
                return { candidates: [mainCandidate] };
            }
        }

        return { candidates };
    } catch (e) {
        console.error('Error parsing candidates:', e);
        // Fail safe to empty array
        return { candidates: [] };
    }
}

export async function sendChatMessage(message: string, history: ChatMessage[] = []): Promise<ChatMessage> {
    // 1. Check if this is a "Suggest Questions" request
    if (message.toLowerCase().includes('câu hỏi phỏng vấn') || message.toLowerCase().includes('interview questions')) {
        // Try to find a candidate context
        let activeCandidate: Candidate | undefined;

        // 1a. Check if user mentioned a name
        const nameMatch = history.flatMap(h => h.candidates || []).find(c => message.toLowerCase().includes(c.name.toLowerCase()));
        if (nameMatch) activeCandidate = nameMatch;

        // 1b. Fallback to the last discussed candidate
        if (!activeCandidate && history.length > 0) {
            for (let i = history.length - 1; i >= 0; i--) {
                if (history[i].candidates && history[i].candidates!.length > 0) {
                    activeCandidate = history[i].candidates![0];
                    break;
                }
            }
        }

        if (activeCandidate && activeCandidate.resume_content) {
            console.log('[API] Routing to HR-CV for Interview Questions for:', activeCandidate.name);

            // Call HR-CV Workflow (score-cv) with resume_content
            const formData = new FormData();
            formData.append('jd', "Yêu cầu công việc Business Analyst");
            formData.append('resume_content', activeCandidate.resume_content);

            const res = await fetch('/api/n8n/score', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const json = await res.json();

                // Helper to extract questions (reuse existing or defined below)
                // Note: extractQuestions is defined inside this module, need to ensure it's accessible or move it out
                // It is currently defined inside sendChatMessage in previous version? No, likely outside based on outline. 
                // Outline says sendChatMessage.extractQuestions at line 217. It logic is inside?

                // WAIT: Outline says `sendChatMessage.extractQuestions` which implies it might be a nested function or static property if I misread, 
                // OR it is a helper defined inside. 
                // Step 295 shows: 217: sendChatMessage.extractQuestions. 
                // If it is inside, I cannot call it before it is defined if it is `const`.
                // Let's assume I need to copy or move the extraction logic OR rely on the response structure directly.

                // Simpler approach: manual extraction here to be safe, or just use `extractQuestions` if it is hoisted (function declaration).
                // Step 295 says `// Helper to extract questions` line 217. 

                const { technical, soft } = extractQuestions(json);

                return {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `Dưới đây là các câu hỏi phỏng vấn đề xuất cho ứng viên **${activeCandidate.name}**:`,
                    timestamp: Date.now(),
                    technical_questions: sanitizeQuestions(technical),
                    soft_skill_questions: sanitizeQuestions(soft),
                    candidates: [activeCandidate]
                };
            }
        }
    }
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
        const errorData = await res.json().catch(() => ({}));
        console.error('[Chat API] Error response:', errorData);
        throw new Error(`Failed to send message: ${res.status} ${res.statusText}${errorData.details ? ` - ${errorData.details}` : ''}`);
    }

    const data = await res.json();
    console.log('[API] Chat response:', data);

    // Parse AI Agent response structure
    // n8n AI Agent typically returns: { output: "message text" } or { text: "message" }
    // User Request: Include 'short_message' first, then 'answer_message'
    let content = '';

    // Helper to extract content from a single object result
    const extractContent = (obj: any) => {
        let text = '';
        if (typeof obj === 'string') return obj;

        // 1. Get partials
        const shortMsg = obj.short_message || '';
        const answerMsg = obj.answer_message || obj.output || obj.text || obj.message || '';

        // 2. Combine
        if (shortMsg && answerMsg) {
            text = `${shortMsg}\n\n${answerMsg}`;
        } else {
            text = shortMsg || answerMsg || (typeof obj === 'object' ? JSON.stringify(obj) : String(obj));
        }
        return text;
    };

    // Helper to extract questions
    // extractQuestions is now defined at module level



    if (Array.isArray(data) && data.length > 0) {
        // Handle array response: use first item
        content = extractContent(data[0]);
    } else {
        // Handle single object response
        content = extractContent(data);
    }

    // Check for candidates
    // Logic: Look for 'candidates' in the root, or in the first item of an array, or in 'json' property
    let candidates: any[] = [];

    // Helper to find candidates in an object
    const findCandidates = (obj: any) => {
        if (!obj) return [];
        if (Array.isArray(obj.candidates)) return obj.candidates;
        if (obj.json && Array.isArray(obj.json.candidates)) return obj.json.candidates;
        if (obj.body && Array.isArray(obj.body.candidates)) return obj.body.candidates;
        return [];
    }

    if (Array.isArray(data)) {
        // Try each item in the array
        for (const item of data) {
            const found = findCandidates(item);
            if (found.length > 0) {
                candidates = found;
                break;
            }
        }
    } else {
        candidates = findCandidates(data);
    }

    // Fallback: If no structured candidates found, try to parse from the markdown text
    if (candidates.length === 0 && typeof content === 'string') {
        try {
            // 1. Extract Links from "Nguồn" or "Source" section first to map to names
            const sourceSectionMatch = content.match(/(?:Nguồn|Source|Tham khảo)[:\s]*([\s\S]*)$/i);
            const sourceText = sourceSectionMatch ? sourceSectionMatch[1] : content;

            // Map Name -> Link
            const nameToLinkMap = new Map<string, string>();

            // We use a general regex to catch "Name - Link" patterns
            const mixedRegex = /([^\n\r:;\-][^\n\r:;]+?)\s*(?:[-–:]\s*|\s+)(\[.*?\]\(.*?\) |https?:\/\/[^\s;,\n]+)/gi;

            let sourceMatch;
            while ((sourceMatch = mixedRegex.exec(sourceText)) !== null) {
                let cleanName = sourceMatch[1].trim().replace(/^[*-•]\s*/, '');
                let linkPart = sourceMatch[2].trim();

                // If it's a markdown link [Text](URL), extract the URL
                const mdLinkMatch = linkPart.match(/\[.*?\]\((.*?)\)/);
                if (mdLinkMatch) {
                    linkPart = mdLinkMatch[1];
                }

                // Remove trailing punctuation from name
                cleanName = cleanName.toLowerCase().replace(/['".,]/g, '').trim();

                if (cleanName && linkPart.startsWith('http')) {
                    nameToLinkMap.set(cleanName, linkPart);
                }
            }

            // 2. Parse Candidates Block with Enhanced Regex
            const lines = content.split('\n');
            let currentCandidate: any = null;
            let currentSection: 'summary' | 'skills' | 'experience' = 'summary';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Enhanced Detection for lines like: "Tran Quoc Kiet – Link CV" or "Tran Quoc Kiet – Email:..."
                // Regex to catch:
                // 1. "**Name**"
                // 2. "Name – Link"
                // 3. "Name – Email"
                const candidateStartRegex = /^(\*\*([^*]+)\*\*|([A-Z][^–():]+?))\s*[–:\-]/i;
                const match = line.match(candidateStartRegex);

                const isBulleted = /^[-•*]/.test(line);
                const isReserved = /^(kết luận|nguồn|dựa trên|tổng kết|lưu ý|đánh giá chung)/i.test(match ? (match[2] || match[3] || line) : line);

                if (match && !isBulleted && !isReserved && line.length < 300) {
                    // Start New Candidate
                    if (currentCandidate) candidates.push(currentCandidate);

                    const rawName = match[2] || match[3];
                    const name = rawName.trim();

                    currentCandidate = {
                        id: Date.now().toString() + Math.random().toString().slice(2),
                        name: name,
                        summary: "",
                        strengths: [],
                        score: 0.85,
                        experience_years: 0,
                        skills_found: [],
                        email: "",
                        phone: ""
                    };
                    currentSection = 'summary'; // Reset state

                    // Parse inline details immediately from this line (Email/Phone)
                    // Example: "Tran Quoc Kiet – Email: ... | Phone: ... Link CV"

                    // 1. Extract Email
                    // Use a more precise email regex that excludes trailing dots/commas
                    const emailMatch = line.match(/Email:[\s\xa0]*([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
                    if (emailMatch) {
                        currentCandidate.email = emailMatch[1].trim();
                    }

                    // 2. Extract Phone
                    // Capture digits, spaces, dots, dashes. Stop before 'Link' or '|'
                    const phoneMatch = line.match(/Phone:[\s\xa0]*([0-9+.\-\s()]{4,})/i);
                    if (phoneMatch) {
                        let phoneRaw = phoneMatch[1].trim();
                        // Cleanup trailing junk if it ran into "Link" or other words not separated by pipe
                        // Example: "09090909 Link CV" -> regex above might catch "09090909 " (space)
                        const stopIndex = phoneRaw.search(/[a-zA-Z]{2,}/); // If we see 2+ letters, stop there
                        if (stopIndex > 0) {
                            phoneRaw = phoneRaw.substring(0, stopIndex).trim();
                        }
                        // Remove trailing punctuation
                        phoneRaw = phoneRaw.replace(/[|.,;]+$/, '').trim();

                        // Validate length to ensure it's a phone number
                        if (phoneRaw.length >= 7) {
                            currentCandidate.phone = phoneRaw;
                        }
                    }

                    // 3. Extract Link (Backup if not in Name Map)
                    // Support formats:
                    // - "Name - Link CV"
                    // - "Name - [Link CV](url)"
                    // - "Name ... Link CV: url"
                    const linkMatch = line.match(/(?:Link\s+CV|CV|Portfolio)[\s\-:]*(\[.*?\]\(.*?\) |https?:\/\/[^\s]+)/i);
                    // Also check for standard markdown link at the end of the line if "Link CV" text isn't explicit but implied
                    const fallbackLinkMatch = line.match(/\[(Link\s+CV|CV|View|Chi\s+tiết)\]\((https?:\/\/[^\)]+)\)/i);

                    if (linkMatch) {
                        let linkUrl = linkMatch[1];
                        const mdLink = linkUrl.match(/\[.*?\]\((.*?)\)/);
                        if (mdLink) linkUrl = mdLink[1];
                        currentCandidate.link_cv = linkUrl;
                        currentCandidate.file_url = linkUrl;
                    } else if (fallbackLinkMatch) {
                        currentCandidate.link_cv = fallbackLinkMatch[2];
                        currentCandidate.file_url = fallbackLinkMatch[2];
                    }

                } else if (currentCandidate) {
                    // Accumulate Details (Summary, Skills, Experience)

                    // Clean bullet points for value extraction
                    let contentValues = line.replace(/^[-•*]\s*/, '').trim();

                    // secondary parsing for Email/Phone if not found yet (or to remove from summary)
                    const emailMatchBody = contentValues.match(/(?:Email|E-mail):[\s\xa0]*([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
                    if (emailMatchBody) {
                        if (!currentCandidate.email) currentCandidate.email = emailMatchBody[1].trim();
                        // Remove from contentValues so it doesn't clutter summary
                        contentValues = contentValues.replace(emailMatchBody[0], '').trim();
                        currentSection = 'summary';
                    }

                    const phoneMatchBody = contentValues.match(/(?:Phone|SĐT|SDT|Mobile|Hotline|Tel):[\s\xa0]*([0-9+.\-\s()]{4,})/i);
                    if (phoneMatchBody) {
                        let phoneRaw = phoneMatchBody[1].trim();
                        const stopIndex = phoneRaw.search(/[a-zA-Z]{2,}/);
                        if (stopIndex > 0) phoneRaw = phoneRaw.substring(0, stopIndex).trim();
                        phoneRaw = phoneRaw.replace(/[|.,;]+$/, '').trim();

                        if (phoneRaw.length >= 7) {
                            if (!currentCandidate.phone) currentCandidate.phone = phoneRaw;
                            // Remove from contentValues
                            contentValues = contentValues.replace(phoneMatchBody[0], '').trim();
                            currentSection = 'summary';
                        }
                    }

                    // Cleanup leftover pipes or separators after extraction
                    contentValues = contentValues.replace(/^\|\s*|\s*\|\s*$/g, '').trim();


                    // Header Detection (including markdown removal)
                    const cleanStart = contentValues.replace(/^[*_]+/, '').replace(/[*_]+[:\s]*$/, '').trim().toLowerCase();

                    const isExperienceHeader = cleanStart.startsWith('kinh nghiệm') || cleanStart.startsWith('experience');
                    const isSkillsHeader = cleanStart.startsWith('kỹ năng') || cleanStart.startsWith('skills');

                    if (isExperienceHeader) {
                        currentSection = 'experience';
                        // If same line content exists, parse it
                        const expText = contentValues.replace(/^(?:[*_]+)?(?:Kinh nghiệm|Experience)[:\s]*/i, '').trim();
                        if (expText && expText.length > 2) {
                            currentCandidate.summary += (currentCandidate.summary ? "\n" : "") + "• Kinh nghiệm: " + expText;
                            const expMatch = expText.match(/(\d+)\s*(?:năm|year)/i);
                            if (expMatch) currentCandidate.experience_years = Math.max(currentCandidate.experience_years, parseInt(expMatch[1]));
                        }
                    } else if (isSkillsHeader) {
                        currentSection = 'skills';
                        // If same line content exists
                        const skillsText = contentValues.replace(/^(?:[*_]+)?(?:Kỹ năng|Skills)[:\s]*/i, '').trim();
                        if (skillsText && skillsText.length > 2) {
                            // Inline skills
                            const skills = skillsText.split(/[,、|]/).map(s => s.trim().replace(/^[*_]+|[*_]+$/g, '')).filter(s => s.length > 0);
                            currentCandidate.skills_found.push(...skills);
                        }
                    } else if (isBulleted && contentValues.length > 0) {
                        // It's a list item. Check Parsing State.
                        if (currentSection === 'skills') {
                            // Treat bullet as a skill or list of skills
                            const skills = contentValues.split(/[,、|]/).map(s => s.trim().replace(/^[*_]+|[*_]+$/g, '')).filter(s => s.length > 0);
                            currentCandidate.skills_found.push(...skills);
                        } else if (currentSection === 'experience') {
                            currentCandidate.summary += (currentCandidate.summary ? "\n" : "") + "• " + contentValues;
                            const expMatch = contentValues.match(/(\d+)\s*(?:năm|year)/i);
                            if (expMatch) currentCandidate.experience_years = Math.max(currentCandidate.experience_years, parseInt(expMatch[1]));
                        } else {
                            // Default summary
                            currentCandidate.summary += (currentCandidate.summary ? "\n" : "") + "• " + contentValues;
                        }
                    } else if (contentValues.length > 0) {
                        // Plain line text, append to summary
                        currentCandidate.summary += " " + contentValues;
                    }
                }
            }
            // Push last one
            if (currentCandidate) candidates.push(currentCandidate);

            // 3. Post-process: Attach Links matching Names if not found inline
            candidates.forEach(cand => {
                if (!cand.link_cv) {
                    const lowerName = cand.name.toLowerCase();
                    for (const [mapName, url] of nameToLinkMap.entries()) {
                        if (lowerName.includes(mapName) || mapName.includes(lowerName)) {
                            cand.link_cv = url;
                            cand.file_url = url;
                            break;
                        }
                    }
                }

            });

        } catch (e) {
            console.warn('Failed to parse candidates from markdown:', e);
        }
    }

    const { technical, soft } = extractQuestions(data);

    return {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
        candidates,
        technical_questions: technical,
        soft_skill_questions: soft
    };
}



export async function getInterviewQuestions(candidate: Candidate, jd: string = "Yêu cầu công việc Business Analyst"): Promise<{ technical: string[], soft: string[] }> {
    if (APP_CONFIG.useMockData) {
        return new Promise(resolve => setTimeout(() => resolve({
            technical: [
                "Bạn đã từng xử lý trường hợp yêu cầu thay đổi liên tục từ khách hàng chưa? Hãy chia sẻ cụ thể.",
                "Làm thế nào để bạn đảm bảo tính chính xác khi phân tích nghiệp vụ cho một hệ thống tài chính?"
            ],
            soft: [
                "Bạn thường làm gì khi gặp xung đột với Developer về tính khả thi của yêu cầu?",
                "Mô tả một lần bạn phải thuyết phục stakeholder khó tính."
            ]
        }), 1000));
    }

    try {
        // Call HR-CV Workflow (score-cv) with resume_content
        const formData = new FormData();
        formData.append('jd', jd);
        // Ensure we send content. Check resume_content first, then summary.
        formData.append('resume_content', candidate.resume_content || candidate.summary || "");

        const res = await fetch('/api/n8n/score', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch questions: ${res.statusText}`);
        }

        const json = await res.json();
        console.log("getInterviewQuestions API Response:", JSON.stringify(json, null, 2));

        const { technical, soft } = extractQuestions(json);
        console.log("Extracted Questions:", { technical, soft });

        return { technical: sanitizeQuestions(technical), soft: sanitizeQuestions(soft) };

    } catch (error) {
        console.error("Error getting interview questions:", error);
        return { technical: [], soft: [] };
    }
}

export async function extractRequirementsFromJD(jdText: string): Promise<JDAnalysisResult> {
    if (APP_CONFIG.useMockData) {
        return new Promise(resolve => setTimeout(() => resolve({
            summary: "- 3+ years of experience in React and TypeScript.\n- Strong understanding of server-side rendering (Next.js).\n- Experience with Tailwind CSS and UI component libraries.\n- Ability to write clean, maintainable code."
        }), 1000));
    }

    try {
        const prompt = `
Bạn là một trợ lý tuyển dụng chuyên nghiệp. Nhiệm vụ của bạn là trích xuất các yêu cầu/kỹ năng/tiêu chuẩn quan trọng từ Bản Mô Tả Công Việc (JD) dưới đây.
Hãy bỏ qua phần giới thiệu công ty, quyền lợi và các thủ tục hành chính.
Chỉ tập trung vào những gì yêu cầu ở ứng viên (số năm kinh nghiệm, kỹ năng cứng, kỹ năng mềm, học vấn, ngoại ngữ).

Định dạng kết quả dưới dạng danh sách gạch đầu dòng rõ ràng bằng TIẾNG VIỆT.

Nội dung JD:
${jdText}
        `.trim();

        const res = await fetch('/api/n8n/jd-extraction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: prompt }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to extract requirements: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const data = await res.json();
        console.log("N8N JD Extraction Response:", JSON.stringify(data, null, 2));

        let result: JDAnalysisResult = { raw_text: "" };
        const item = Array.isArray(data) ? data[0] : data;

        if (item) {
            // Priority 1: Structured JSON output from "Structured Output Parser" or Agent "json.output"
            // The workflow returns: { job_requirements: { ... } } directly or wrapped

            const rawOutput = item.output || (item.json && item.json.output) || (item.body && item.body.output) || item;

            // Try to find job_requirements in rawOutput
            if (rawOutput && typeof rawOutput === 'object') {
                if (rawOutput.job_requirements) {
                    result.job_requirements = rawOutput.job_requirements;
                }
                // Sometimes it might be directly in the root if flattened
                else if (rawOutput.technical_skills || rawOutput.years_of_experience) {
                    result.job_requirements = rawOutput as any;
                }
            }

            // Fallback: If it's a string (old prompt behavior), use it as summary
            if (typeof rawOutput === 'string') {
                try {
                    // Try parsing if it looks like JSON
                    if (rawOutput.trim().startsWith('{')) {
                        const parsed = JSON.parse(rawOutput);
                        if (parsed.job_requirements) result.job_requirements = parsed.job_requirements;
                        else result.job_requirements = parsed;
                    } else {
                        result.summary = rawOutput;
                    }
                } catch {
                    result.summary = rawOutput;
                }
            }
        }

        // Specific mapping for the new JSON format (User Request)
        // Format: [{ "Kỹ năng kỹ thuật": [], "Số năm kinh nghiệm": [], "education": [], "soft_skills": [] }]
        const itemObj = Array.isArray(data) ? data[0] : data;

        if (itemObj) {
            const rawObj = itemObj.output || itemObj.json || itemObj; // simplified access

            // flexible check for any of the known keys
            if (rawObj && (rawObj['Kỹ năng kỹ thuật'] || rawObj['technical_skills'] || rawObj['Kinh nghiệm'] || rawObj['education'])) {
                const rawExp = rawObj['Số năm kinh nghiệm'] || rawObj['Kinh nghiệm'] || rawObj['experience'] || [];
                const rawEdu = rawObj['education'] || rawObj['Học vấn'] || [];
                const rawTech = rawObj['Kỹ năng kỹ thuật'] || rawObj['technical_skills'] || [];
                const rawSoft = rawObj['soft_skills'] || rawObj['Kỹ năng mềm'] || [];

                // Parse Years from text "Từ 2 đến 3 năm..."
                let minYears = 0;
                if (Array.isArray(rawExp) && rawExp.length > 0) {
                    const match = rawExp[0].match(/(\d+)/);
                    if (match) minYears = parseInt(match[1]);
                }

                result.job_requirements = {
                    technical_skills: rawTech,
                    soft_skills: rawSoft,
                    years_of_experience: {
                        min_years: minYears,
                        description: Array.isArray(rawExp) ? rawExp.join('\n') : String(rawExp)
                    },
                    education: {
                        degree_level: "",
                        major: Array.isArray(rawEdu) ? rawEdu.join('\n') : String(rawEdu),
                        certifications: [] // We merge all into major for list display
                    }
                };
            }

            // Sanity Check / Post-Processing (Hardened)
            if (result.job_requirements) {
                const jr = result.job_requirements;
                const raw = (itemObj && (itemObj.output || itemObj.json || itemObj)) || {};

                // 1. Recover Technical Skills from Keys (with stricter exclusions)
                if ((!jr.technical_skills || jr.technical_skills.length === 0) && typeof raw === 'object') {
                    const potentialSkills = Object.keys(raw).filter(k =>
                        !['technical_skills', 'soft_skills', 'years_of_experience', 'education', 'job_requirements', 'output', 'json', 'data'].includes(k) &&
                        !k.startsWith('Kỹ năng') &&
                        !k.startsWith('Số năm') &&
                        !k.startsWith('Kinh nghiệm') && // Explicit exclusion
                        !k.match(/experience|education|skill|requirements|kinh nghiem|hoc van/i) &&
                        k.length < 50 &&
                        Array.isArray(raw[k]) && raw[k].length === 0
                    );

                    if (potentialSkills.length > 0) {
                        jr.technical_skills = potentialSkills;
                    }
                }

                // 2. Ensure Arrays
                if (!Array.isArray(jr.technical_skills)) jr.technical_skills = [];
                if (!Array.isArray(jr.soft_skills)) jr.soft_skills = [];
            }

        }

        return result;
    } catch (error) {
        console.error("Failed to extract requirements:", error);
        throw error;
    }
}
