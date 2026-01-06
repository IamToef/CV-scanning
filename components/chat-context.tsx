"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ChatMessage } from "@/types"
import { sendChatMessage } from "@/lib/api"
import { toast } from "sonner"

interface ChatContextType {
    messages: ChatMessage[]
    isLoading: boolean
    sendMessage: (content: string) => Promise<void>
    clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content,
            timestamp: Date.now()
        }

        // Optimistic update
        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        try {
            const response = await sendChatMessage(userMsg.content, [...messages, userMsg])
            setMessages(prev => [...prev, response])
        } catch (error: any) {
            console.error(error)
            if (error.message && error.message.includes("workflow must be active")) {
                toast.error("Process Failed: Please activate the n8n workflow in your editor.")
            } else {
                toast.error("Failed to get response from AI agent")
            }

            // Optional: Remove the user message if failed? Or show error state?
            // For now, we keep it but maybe we should add an error message from system
        } finally {
            setIsLoading(false)
        }
    }

    const clearMessages = () => {
        setMessages([])
    }

    return (
        <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearMessages }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider")
    }
    return context
}
