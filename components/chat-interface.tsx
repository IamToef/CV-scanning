"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useChat } from "@/components/chat-context"
import { useCandidates } from "@/components/candidate-context"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChatCandidateCard } from "@/components/chat-candidate-card"

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

        if (!fullCandidate) return chatCandidate;

        // Merge: Prioritize chat properties for summary/analysis as that's what the user just asked for
        return {
            ...fullCandidate, // Base is the real data

            // CRITICAL FIX: Prioritize the immediate AI summary from the chat response
            // The DB summary might be old or empty. The chat response just generated a fresh summary.
            summary: chatCandidate.summary || fullCandidate.summary,

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

    return (
        <Card className="flex flex-col h-full border-0 shadow-none">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>Trò chuyện với AI (RAG)</CardTitle>
                </div>
                <CardDescription>Đặt câu hỏi về ứng viên của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4 pb-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col w-full">
                                <div className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 text-sm overflow-hidden break-words ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground ml-10'
                                            : 'bg-muted mr-10'
                                            }`}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a
                                                        {...props}
                                                        className="text-blue-500 underline hover:text-blue-600 font-medium break-all"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    />
                                                ),
                                                p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0 leading-relaxed" />,
                                                ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 mb-1" />,
                                                ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 mb-1" />,
                                                li: ({ node, ...props }) => <li {...props} className="mb-0.5" />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                                {msg.candidates && msg.candidates.length > 0 && (
                                    <div className="flex flex-row flex-wrap gap-4 pl-10 pr-4 mt-2 mb-4 w-full">
                                        {msg.candidates.map((candidate, idx) => (
                                            <div key={idx} className="flex-1 min-w-[300px] max-w-[350px]">
                                                <ChatCandidateCard candidate={getEnrichedCandidate(candidate)} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 justify-start">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <div className="bg-muted rounded-lg p-3 flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm">Đang suy nghĩ...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t flex-col items-start gap-3">
                {messages.length === 1 && (
                    <div className="flex flex-col gap-2 w-full px-4 pb-2">
                        <p className="text-xs text-muted-foreground text-center mb-2">Gợi ý câu hỏi:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                                "Ai là ứng viên tốt nhất?",
                                "Tìm ứng viên có kinh nghiệm React",
                                "So sánh các ứng viên",
                                "Ai có tiềm năng lãnh đạo?"
                            ].map((text, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs justify-start h-auto py-2 px-3 text-left whitespace-normal"
                                    onClick={() => sendMessage(text)}
                                    disabled={isLoading}
                                >
                                    {text}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex w-full gap-2">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Tìm ứng viên theo kỹ năng, kinh nghiệm..."
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card >
    )
}
