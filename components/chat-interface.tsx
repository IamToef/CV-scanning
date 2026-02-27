"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"

// ... imports


import { toast } from "sonner"
import { useChat } from "@/components/chat-context"
import { useCandidates } from "@/components/candidate-context"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChatCandidateCard } from "@/components/chat-candidate-card"
import { ChatSidebar } from "@/components/chat-sidebar"

export function ChatInterface() {
    const { messages, isLoading, sendMessage } = useChat()
    const { candidates: allCandidates } = useCandidates() // Get full candidate list
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    // ... existing scroll effect ...

    // Helper to merge chat candidate with full data
    const getEnrichedCandidate = (chatCandidate: any) => {
        // Normalize helper: remove accents, lowercase, trim
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

        const chatName = normalize(chatCandidate.name);

        // Find matching candidate by name (fuzzy match)
        const fullCandidate = allCandidates.find(c => {
            const dbName = normalize(c.name);
            return dbName === chatName || dbName.includes(chatName) || chatName.includes(dbName);
        });

        if (!fullCandidate) return { ...chatCandidate, status: 'new' };

        // Calculate Score dynamically (like in CandidateTable)
        const details = fullCandidate.score_details || fullCandidate.reasoning || {};
        const exp = Number(details.experience_score) || 0;
        const skill = Number(details.skills_score) || 0;
        const edu = Number(details.education_score) || 0;
        const pot = Number(details.potential_score) || 0;

        const prof = Math.round((exp + skill) / 2);
        const potential = Math.round((edu + pot) / 2);
        const displayScore = Math.round((prof + potential) / 2);

        const finalScore = displayScore > 0 ? displayScore : (fullCandidate.score || 0);

        // Merge: Prioritize chat properties for summary/analysis as that's what the user just asked for
        return {
            ...fullCandidate, // Base is the real data

            // Use calculated score
            score: finalScore,

            summary: fullCandidate.summary || chatCandidate.summary,

            // Fix CV Link: If DB has file_url great, else use what we just parsed
            link_cv: fullCandidate.file_url || fullCandidate.link_cv || chatCandidate.link_cv,

            // Ensure ID matches full candidate to allow actions
            id: fullCandidate.id
        };
    }

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return
        sendMessage(input)
        setInput("")
    }

    const suggestions = [
        { label: "Ứng viên có trên 4 năm kinh nghiệm", icon: "💼" },
        { label: "Ứng viên có kỹ năng về AI/LLM", icon: "🤖" }
    ]

    const isInitialState = messages.length === 0


    return (
        <div className="flex w-full h-full bg-background overflow-hidden relative">
            <ChatSidebar className="hidden md:flex h-full w-[260px] border-r" />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Card className="flex flex-col h-full border-0 shadow-none bg-background rounded-none">
                    <CardContent className="flex-1 overflow-hidden p-0 relative flex flex-col">
                        {isInitialState ? (
                            <div className="flex-1 flex flex-col justify-center px-4 w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent inline-block pb-1">
                                            Xin chào
                                        </span>
                                    </h1>
                                    <p className="text-lg font-medium text-muted-foreground/60">
                                        Chúng ta nên bắt đầu từ đâu nhỉ?
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 w-full">
                                    {suggestions.map((item, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className="h-auto py-3 px-4 rounded-xl text-sm font-medium justify-start w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                                            onClick={() => sendMessage(item.label)}
                                            disabled={isLoading}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="mr-3 text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                                            <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 z-10 text-left line-clamp-1">{item.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ScrollArea className="h-full px-4 pt-6" ref={scrollRef}>
                                <div className="max-w-4xl mx-auto space-y-8 py-6">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className="flex flex-col w-full">
                                            <div className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'assistant' && (
                                                    <div className="h-8 w-8 rounded-full bg-transparent flex items-center justify-center shrink-0 mt-1">
                                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                )}
                                                <div
                                                    className={`max-w-[85%] text-sm leading-relaxed ${msg.role === 'user'
                                                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-3 py-2 rounded-[2rem] rounded-tr-sm shadow-md'
                                                        : 'bg-transparent px-0 py-0 text-foreground'
                                                        }`}
                                                >
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            a: ({ node, ...props }) => (
                                                                <a
                                                                    {...props}
                                                                    className={`underline font-medium break-all ${msg.role === 'user' ? 'text-white hover:text-white/90' : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                />
                                                            ),
                                                            p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0 whitespace-pre-wrap" />,
                                                            ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 mb-2" />,
                                                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 mb-2" />,
                                                            li: ({ node, ...props }) => <li {...props} className="mb-0.5" />,
                                                            strong: ({ node, ...props }) => <span {...props} className="font-bold text-indigo-600 dark:text-indigo-400 block mt-4 mb-1" />
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            {/* Interview Questions Section */}
                                            {(msg.technical_questions?.length) ? (
                                                <div className="pl-12 mt-3 w-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    {msg.technical_questions && msg.technical_questions.length > 0 && (
                                                        <Card className="bg-white/50 dark:bg-slate-800/50 border-purple-100 dark:border-slate-700 shadow-sm">
                                                            <CardHeader className="py-3 px-4 bg-purple-50/50 dark:bg-purple-900/10 border-b border-purple-100 dark:border-slate-700 mb-2">
                                                                <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                                                    <Sparkles className="h-4 w-4" />
                                                                    Câu hỏi chuyên môn (Hard Skills)
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="px-4 pb-3 pt-0">
                                                                <ul className="space-y-2">
                                                                    {msg.technical_questions.map((q, idx) => (
                                                                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
                                                                            <span className="text-purple-500 dark:text-purple-400 font-bold">•</span>
                                                                            {q}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </CardContent>
                                                        </Card>
                                                    )}


                                                </div>
                                            ) : null}

                                            {msg.candidates && msg.candidates.length > 0 && (
                                                <div className="pl-12 mt-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {msg.candidates.map((candidate, idx) => (
                                                            <div key={idx} className="w-full">
                                                                <ChatCandidateCard candidate={getEnrichedCandidate(candidate)} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-4 justify-start animate-pulse">
                                            <div className="h-8 w-8 rounded-full bg-transparent flex items-center justify-center shrink-0 mt-1">
                                                <Sparkles className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="pt-2">
                                                <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                    <CardFooter className="p-2 flex-col items-center gap-3 bg-gradient-to-t from-background via-background/95 to-transparent pb-8 pt-4 z-10">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex w-full max-w-4xl gap-2 relative">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Nhập câu hỏi về ứng viên..."
                                disabled={isLoading}
                                className="pr-14 pl-6 py-6 text-base rounded-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-2xl dark:shadow-none ring-1 ring-slate-100/50 dark:ring-slate-800 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] transition-all focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <Button type="submit" size="icon" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-md hover:shadow-lg transition-all hover:scale-105 border-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
