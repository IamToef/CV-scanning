"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { ChatMessage } from "@/types"
import { sendChatMessage } from "@/lib/api"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export function ChatInterface() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Xin chào! Tôi là TalentIQ Agent. Tôi có thể giúp bạn lọc ứng viên hoặc trả lời câu hỏi về CV. Ví dụ: "Ai có kinh nghiệm React?"',
            timestamp: Date.now()
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        }

        // Optimistic update
        setMessages(prev => [...prev, userMsg])
        const currentHistory = [...messages, userMsg]
        setInput("")
        setIsLoading(true)

        try {
            const response = await sendChatMessage(userMsg.content, messages)
            setMessages(prev => [...prev, response])
        } catch (error) {
            console.error(error)
            toast.error("Failed to get response from AI agent")
        } finally {
            setIsLoading(false)
        }
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
                            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
            <CardFooter className="p-4 border-t">
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
        </Card>
    )
}
