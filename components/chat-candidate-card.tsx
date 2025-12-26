"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, FileText, User, X, Eye, Mail, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useCandidates } from "@/components/candidate-context"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface ChatCandidateCardProps {
    candidate: any
}

export function ChatCandidateCard({ candidate }: ChatCandidateCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [actionType, setActionType] = useState<'contact' | 'reject' | null>(null)

    const { candidates, setCandidates } = useCandidates()

    // Normalize data fields
    const rawScore = candidate.score || candidate.max_score || 0;
    const normalizedScore = rawScore > 1 ? rawScore / 10 : rawScore;
    const percentage = Math.round(normalizedScore * 100);

    // Determine colors based on score
    const scoreColor = percentage >= 80 ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
    const scoreTextColor = percentage >= 80 ? "text-green-600" : percentage >= 50 ? "text-yellow-600" : "text-red-600";

    const summary = candidate.summary || candidate.highlight || "";

    // Status can be updated locally for instant feedback if not found in global context, 
    // but ideally we sync with global.
    const [localStatus, setLocalStatus] = useState(candidate.status)

    const initiateAction = (type: 'contact' | 'reject') => {
        setActionType(type)
        setShowConfirm(true)
    }

    const handleConfirm = () => {
        if (!actionType) return

        if (actionType === 'reject') {
            // Update Global State
            const updatedCandidates = candidates.map(c =>
                c.id === candidate.id ? { ...c, status: 'rejected' as const } : c
            )
            setCandidates(updatedCandidates)
            setLocalStatus('rejected')
            toast.success(`Đã từ chối ứng viên ${candidate.name}`, {
                description: "Ứng viên đã được chuyển sang trạng thái bị loại.",
                icon: <X className="h-4 w-4 text-red-500" />
            })
        } else if (actionType === 'contact') {
            // For contact, we usually just show a success message or update status to 'shortlisted'
            // Requirement says "Second chance", implies confirming the action.
            const updatedCandidates = candidates.map(c =>
                c.id === candidate.id ? { ...c, status: 'shortlisted' as const } : c
            )
            setCandidates(updatedCandidates)
            setLocalStatus('shortlisted')
            toast.success(`Đã gửi liên hệ tới ${candidate.name}`, {
                description: "Email mời phỏng vấn đã được đưa vào hàng đợi.",
                icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
            })
        }

        setShowConfirm(false)
        setActionType(null)
    }

    // If rejected, maybe dim the card or show badge?
    const isRejected = localStatus === 'rejected'

    return (
        <>
            <Card className={cn("h-full flex flex-col w-full bg-white hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden rounded-xl", isRejected && "opacity-60 grayscale-[0.5]")}>
                <CardContent className="p-5 space-y-4 flex-1">
                    {/* Header: Name & Role */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <h3 className="font-bold text-lg text-slate-900 leading-tight line-clamp-1" title={candidate.name}>
                                {candidate.name}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">Junior Business Analyst</p>
                        </div>
                        {isRejected && (
                            <Badge variant="destructive" className="text-[10px] px-2 h-5">Đã loại</Badge>
                        )}
                    </div>

                    {/* Match Score */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-slate-700">Độ phù hợp</span>
                            <span className="text-sm font-bold text-slate-900">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2 bg-slate-100" indicatorClassName={scoreColor} />
                    </div>

                    {/* Collapsible AI Summary Section */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100/50">
                        {/* Contact Info (if available) - Show always if present */}
                        {(candidate.email || candidate.phone) && (
                            <div className="mb-3 space-y-1.5 pb-3 border-b border-slate-200/60">
                                {candidate.email && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate" title={candidate.email}>{candidate.email}</span>
                                    </div>
                                )}
                                {candidate.phone && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <span>{candidate.phone}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className="flex items-center justify-between cursor-pointer mb-2"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tóm tắt AI</span>
                            </div>
                            {isExpanded ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
                        </div>

                        <div className={cn("text-sm text-slate-600 leading-relaxed whitespace-pre-line", !isExpanded && "line-clamp-3")}>
                            {summary ? summary : "Chưa có thông tin chi tiết."}
                        </div>

                        {/* Expanded Extras: Pros, Skills */}
                        {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                {/* Highlights */}
                                {candidate.strengths && candidate.strengths.length > 0 && (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Điểm mạnh</span>
                                        </div>
                                        <div className="space-y-1 pl-1">
                                            {candidate.strengths.map((str: string, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                                                    <span>{str}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Default Highlights if empty strengths but have exp */}
                                {(!candidate.strengths || candidate.strengths.length === 0) && (
                                    <div className="space-y-1 pl-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                            <span>Kinh nghiệm {candidate.experience_years ? `${candidate.experience_years} năm` : "phù hợp"}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Skills Tokens */}
                                {candidate.skills_found && candidate.skills_found.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Kỹ năng</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {candidate.skills_found.map((skill: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 grid grid-cols-3 gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 px-0"
                        onClick={() => initiateAction('contact')}
                        disabled={isRejected}
                    >
                        Liên hệ
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs h-8 px-0"
                        onClick={() => initiateAction('reject')}
                        disabled={isRejected}
                    >
                        Từ chối
                    </Button>
                    {candidate.link_cv ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-700 hover:bg-white text-xs h-8 px-0"
                            asChild
                        >
                            <a href={candidate.link_cv} target="_blank" rel="noopener noreferrer">
                                Xem CV
                            </a>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled className="text-xs h-8 px-0 opacity-50">
                            No CV
                        </Button>
                    )}
                </div>
            </Card>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {actionType === 'reject' ? (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Xác nhận từ chối
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Xác nhận liên hệ
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            {actionType === 'reject'
                                ? `Bạn có chắc chắn muốn từ chối ứng viên ${candidate.name}? Hành động này sẽ cập nhật trạng thái ứng viên thành "Từ chối".`
                                : `Bạn có chắc chắn muốn gửi yêu cầu liên hệ tới ứng viên ${candidate.name}?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>
                            Hủy
                        </Button>
                        <Button
                            variant={actionType === 'reject' ? "destructive" : "default"}
                            onClick={handleConfirm}
                            className={actionType === 'contact' ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                            {actionType === 'reject' ? "Xác nhận từ chối" : "Gửi liên hệ"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
