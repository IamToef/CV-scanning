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
            // ... (existing map logic) ...
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
            const detailScores = raw['Chi tiết điểm'] || {};
            const reasoning = {
                experience_score: Number(detailScores['điểm kinh nghiệm']) || Number(raw['điểm dựa trên kinh nghiệm']) || Number(raw['điểm kinh nghiệm']) || 0,
                skills_score: Number(detailScores['điểm kỹ năng']) || Number(raw['điểm kỹ năng']) || 0,
                education_score: Number(detailScores['điểm học vấn']) || Number(raw['điểm học vấn']) || 0,
                potential_score: Number(detailScores['điểm thành tích & tiềm năng']) || Number(raw['điểm thành tích & tiềm năng']) || 0
            };

            // Parse Skills (Direct Array or parsing)
            const rawSkills = raw['Danh sách kỹ năng'] || raw['skills_found'] || [];
            let parsedSkills: string[] = [];
            if (Array.isArray(rawSkills)) {
                parsedSkills = rawSkills.map(String);
            }

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
                skills_missing: [],
                experience_years: (() => {
                    const expRaw = String(raw['Số năm kinh nghiệm'] || raw['số năm kinh nghiệm'] || '');
                    const match = expRaw.match(/(\d+(?:[.,]\d+)?)/);
                    if (match) {
                        return parseFloat(match[0].replace(',', '.'));
                    }
                    return 0;
                })(),

                reasoning
            } as Candidate;
        });

        // MERGE LOGIC: If we have multiple items, try to merge "Questions Only" items into "Main" items
        // This handles cases where N8N returns separate items for the same candidate key
        if (candidates.length > 1) {
            const mainCandidate = candidates.find(c => c.name !== 'Unknown Candidate' && c.score > 0);

        }

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

                // Final score adjustment based on exp (Example logic, mostly for mock)
                // if (cand.experience_years >= 4) cand.score = 92;
            });

        } catch (e) {
            console.warn('Failed to parse candidates from markdown:', e);
        }
    }

    return {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: Date.now(),
        candidates
    };
}

export async function extractRequirementsFromJD(jdText: string): Promise<string> {
    if (APP_CONFIG.useMockData) {
        return new Promise(resolve => setTimeout(() => resolve(
            "- 3+ years of experience in React and TypeScript.\n- Strong understanding of server-side rendering (Next.js).\n- Experience with Tailwind CSS and UI component libraries.\n- Ability to write clean, maintainable code."
        ), 1000));
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

        let content = "No content extracted";
        const item = Array.isArray(data) ? data[0] : data;

        if (item) {
            // Priority 1: Simple output fields
            if (item.output) content = item.output;
            else if (item.text) content = item.text;
            else if (item.message) content = item.message;

            // Priority 2: Chatbot specific fields (answer_message, short_message)
            else if (item.answer_message) content = item.answer_message;
            else if (item.short_message) content = item.short_message;

            // Priority 3: Nested JSON or Body
            else if (item.json && item.json.output) content = item.json.output;
            else if (item.body && item.body.output) content = item.body.output;
        }

        return content;

    } catch (error) {
        console.error("Failed to extract requirements:", error);
        throw error;
    }
}
