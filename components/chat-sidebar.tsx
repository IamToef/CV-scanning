"use client"

import { useState } from "react"
import { useChat, ChatSession } from "@/components/chat-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Trash2, X, MoreVertical, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function ChatSidebar({ className }: { className?: string }) {
    const { sessions, currentSessionId, createSession, switchSession, deleteSession, renameSession } = useChat()
    const [editingSession, setEditingSession] = useState<ChatSession | null>(null)
    const [newTitle, setNewTitle] = useState("")

    const handleEditClick = (session: ChatSession) => {
        setEditingSession(session)
        setNewTitle(session.title)
    }

    const handleSaveTitle = () => {
        if (editingSession && newTitle.trim()) {
            renameSession(editingSession.id, newTitle)
            setEditingSession(null)
        }
    }

    return (
        <>
            <div className={cn("flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 w-64 shrink-0", className)}>
                <div className="p-4">
                    <Button
                        onClick={createSession}
                        className="w-full justify-start gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
                        variant="outline"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Cuộc trò chuyện mới</span>
                    </Button>
                </div>

                <div className="px-4 pb-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gần đây</h3>
                </div>

                <ScrollArea className="flex-1 px-2">
                    <div className="space-y-1 pb-4">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "group flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors",
                                    session.id === currentSessionId
                                        ? "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                                onClick={() => switchSession(session.id)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                    <MessageSquare className={cn(
                                        "h-4 w-4 shrink-0",
                                        session.id === currentSessionId ? "text-purple-500" : "text-slate-400"
                                    )} />
                                    <span className="truncate max-w-[140px]">{session.title || "Cuộc trò chuyện mới"}</span>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <MoreVertical className="h-3.5 w-3.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditClick(session)
                                        }}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Đổi tên</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteSession(session.id)
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Xóa</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                        {sessions.length === 0 && (
                            <div className="text-center py-8 text-xs text-slate-400">
                                Chưa có lịch sử trò chuyện
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
                        <DialogDescription>
                            Nhập tên mới cho cuộc trò chuyện này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Nhập tên mới..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle()
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSession(null)}>Hủy</Button>
                        <Button onClick={handleSaveTitle}>Lưu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
