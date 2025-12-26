"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatInterface } from "@/components/chat-interface"
import { MessageCircle, X, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    if (pathname === '/chat') return null

    return (
        <>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 p-0 hover:scale-105 transition-transform bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 border-0 text-white"
                size="icon"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>

            <div className={cn(
                "fixed bottom-24 right-6 w-[380px] h-[480px] max-h-[80vh] max-w-[90vw] bg-background border rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right",
                isOpen ? "scale-100 opacity-100 translate-y-0 pointer-events-auto" : "scale-95 opacity-0 translate-y-4 pointer-events-none"
            )}>
                <div className="p-3 border-b bg-muted/30 flex justify-between items-center backdrop-blur-sm">
                    <h3 className="font-semibold text-sm">Trợ lý Tuyển dụng AI</h3>
                    <div className="flex items-center gap-1">
                        <Link href="/chat">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-muted"
                                title="Mở rộng"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-muted"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-background">
                    <ChatInterface />
                </div>
            </div>
        </>
    )
}
