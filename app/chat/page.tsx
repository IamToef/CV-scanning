import { ChatInterface } from "@/components/chat-interface"

export default function ChatPage() {
    return (
        <div className="container mx-auto h-[calc(100vh-4rem)] py-6">
            <div className="h-full border rounded-xl shadow-sm overflow-hidden bg-background">
                <ChatInterface />
            </div>
        </div>
    )
}
