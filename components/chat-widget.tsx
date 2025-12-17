"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat-interface"
import { MessageCircle, X } from "lucide-react"

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 p-0 hover:scale-105 transition-transform"
                size="icon"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[450px] h-[600px] max-h-[80vh] max-w-[90vw] bg-background border rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                    <div className="p-3 border-b bg-muted/30 flex justify-between items-center backdrop-blur-sm">
                        <h3 className="font-semibold text-sm">Trợ lý Tuyển dụng AI</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-hidden bg-background">
                        <ChatInterface />
                    </div>
                </div>
            )}
        </>
    )
}
