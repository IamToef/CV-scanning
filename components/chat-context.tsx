"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { ChatMessage } from "@/types"
import { sendChatMessage } from "@/lib/api"
import { toast } from "sonner"

export interface ChatSession {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: number
}

interface ChatContextType {
    sessions: ChatSession[]
    currentSessionId: string | null
    messages: ChatMessage[]
    isLoading: boolean
    sendMessage: (content: string) => Promise<void>
    createSession: () => void
    switchSession: (id: string) => void
    deleteSession: (id: string) => void
    renameSession: (id: string, newTitle: string) => void
    clearCurrentSession: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    // Derived state for current messages
    const currentSession = sessions.find(s => s.id === currentSessionId)
    const messages = currentSession?.messages || []

    // Load from local storage on mount (including migration)
    useEffect(() => {
        const savedSessions = localStorage.getItem('chat_sessions')
        const legacyHistory = localStorage.getItem('chat_history')

        let loadedSessions: ChatSession[] = []

        if (savedSessions) {
            try {
                loadedSessions = JSON.parse(savedSessions)
            } catch (e) {
                console.error("Failed to parse chat sessions", e)
            }
        }

        // Migration: If no sessions but legacy history exists, migrate it
        if (loadedSessions.length === 0 && legacyHistory) {
            try {
                const legacyMessages = JSON.parse(legacyHistory)
                if (legacyMessages.length > 0) {
                    const firstMsgContent = legacyMessages[0].content;
                    // Use first message as title, truncated if too long
                    const title = firstMsgContent.length > 40 ? firstMsgContent.substring(0, 40) + '...' : firstMsgContent;

                    const migratedSession: ChatSession = {
                        id: Date.now().toString(),
                        title: title,
                        messages: legacyMessages,
                        createdAt: Date.now()
                    }
                    loadedSessions = [migratedSession]
                    // Clear legacy to avoid double migration
                    localStorage.removeItem('chat_history')
                }
            } catch (e) {
                console.error("Failed to migrate legacy history", e)
            }
        }

        // If still empty, create default session
        if (loadedSessions.length === 0) {
            const newSession: ChatSession = {
                id: Date.now().toString(),
                title: "Cuộc trò chuyện mới",
                messages: [],
                createdAt: Date.now()
            }
            loadedSessions = [newSession]
        }

        setSessions(loadedSessions)
        // Set current session to the most recent one (first one usually if sorted, or just the first created)
        // Ideally we sort by createdAt desc or last updated. For now let's pick the first one (migrated or new)
        setCurrentSessionId(loadedSessions[0]?.id || null)
        setIsInitialized(true)
    }, [])

    // Save to local storage whenever sessions change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('chat_sessions', JSON.stringify(sessions))
        }
    }, [sessions, isInitialized])

    const createSession = () => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: "Cuộc trò chuyện mới",
            messages: [],
            createdAt: Date.now()
        }
        setSessions(prev => [newSession, ...prev])
        setCurrentSessionId(newSession.id)
    }

    const switchSession = (id: string) => {
        setCurrentSessionId(id)
    }

    const deleteSession = (id: string) => {
        setSessions(prev => {
            const newSessions = prev.filter(s => s.id !== id)
            // If we deleted the current session, switch to another one
            if (currentSessionId === id) {
                setCurrentSessionId(newSessions.length > 0 ? newSessions[0].id : null)
            }
            // If we deleted the last session, create a new one immediately so we never have 0
            if (newSessions.length === 0) {
                const newSession: ChatSession = {
                    id: Date.now().toString(),
                    title: "Cuộc trò chuyện mới",
                    messages: [],
                    createdAt: Date.now()
                }
                setTimeout(() => setCurrentSessionId(newSession.id), 0)
                return [newSession]
            }
            return newSessions
        })
    }

    const clearCurrentSession = () => {
        if (!currentSessionId) return
        setSessions(prev => prev.map(s =>
            s.id === currentSessionId ? { ...s, messages: [] } : s
        ))
    }

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading || !currentSessionId) return

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content,
            timestamp: Date.now()
        }

        // Optimistic update
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                // Update title if it's the first message and title is default
                const isFirst = s.messages.length === 0
                const newTitle = isFirst ? (content.length > 30 ? content.substring(0, 30) + '...' : content) : s.title
                return { ...s, title: newTitle, messages: [...s.messages, userMsg] }
            }
            return s
        }))

        setIsLoading(true)

        try {
            // Context needs the messages from CURRENT session
            const currentHistory = sessions.find(s => s.id === currentSessionId)?.messages || []
            const response = await sendChatMessage(userMsg.content, [...currentHistory, userMsg])

            setSessions(prev => prev.map(s =>
                s.id === currentSessionId ? { ...s, messages: [...s.messages, response] } : s
            ))
        } catch (error: any) {
            console.error(error)
            if (error.message && error.message.includes("workflow must be active")) {
                toast.error("Process Failed: Please activate the n8n workflow in your editor.")
            } else {
                toast.error("Failed to get response from AI agent")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const renameSession = (id: string, newTitle: string) => {
        setSessions(prev => prev.map(s =>
            s.id === id ? { ...s, title: newTitle } : s
        ))
    }

    return (
        <ChatContext.Provider value={{
            sessions,
            currentSessionId,
            messages, // compatibility shim
            isLoading,
            sendMessage,
            createSession,
            switchSession,
            deleteSession,
            renameSession,
            clearCurrentSession // Maps to old clearMessages concept
        }}>
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
