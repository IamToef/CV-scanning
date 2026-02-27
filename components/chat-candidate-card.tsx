"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, ChevronUp, Sparkles, CheckCircle2, FileText, User, X, Eye, Mail, AlertTriangle, Download, Phone } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn, getDriveFileUrl } from "@/lib/utils"
import { useCandidates } from "@/components/candidate-context"
import { toast } from "sonner"
import {
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { triggerEmailWorkflow } from "@/lib/api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EmailPreviewModal } from "./email-preview-modal"



interface ChatCandidateCardProps {
    candidate: any
}

export function ChatCandidateCard({ candidate }: ChatCandidateCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { updateCandidateStatus, jobRequirements } = useCandidates()
    const [isApproveLoading, setIsApproveLoading] = useState(false)
    const [isRejectLoading, setIsRejectLoading] = useState(false)
    const [showApproveAlert, setShowApproveAlert] = useState(false)
    const [showRejectAlert, setShowRejectAlert] = useState(false)

    // Build comprehensive summary from available fields
    const buildSummary = () => {
        let parts: string[] = [];

        // Add main summary/highlight
        if (candidate.summary || candidate.highlight) {
            parts.push(candidate.summary || candidate.highlight || "");
        }

        // Add experience info
        if (candidate.experience_years && candidate.experience_years > 0) {
            parts.push(`Kinh nghiệm: ${candidate.experience_years} năm`);
        }

        // Add skills info
        if (candidate.skills_found && candidate.skills_found.length > 0) {
            const skillsList = candidate.skills_found.slice(0, 5).join(', ');
            parts.push(`Kỹ năng: ${skillsList}${candidate.skills_found.length > 5 ? ', ...' : ''}`);
        }

        return parts.filter(p => p.trim()).join('\n\n') || "Chưa có thông tin chi tiết.";
    };

    const summary = buildSummary();

    // If rejected, maybe dim the card or show badge?
    const isRejected = candidate.status === 'rejected'

    const handleApprove = async () => {
        setIsApproveLoading(true);
        try {
            toast.info(`Đang gửi liên hệ tới ${candidate.name}...`);
            await triggerEmailWorkflow({
                name: candidate.name,
                email: candidate.email,
                status: 'shortlisted',
                role: 'candidate'
            });
            updateCandidateStatus(candidate.id, 'shortlisted');
            setShowApproveAlert(false);
            toast.success(`Đã phê duyệt ${candidate.name}`, {
                description: "Email mời phỏng vấn đã được gửi đi.",
                icon: <Sparkles className="h-5 w-5 text-indigo-600" />
            });
        } catch (error) {
            console.error("Approve failed:", error);
            toast.error("Phê duyệt thất bại", { description: "Vui lòng thử lại sau." });
        } finally {
            setIsApproveLoading(false);
        }
    };

    const handleReject = async () => {
        setIsRejectLoading(true);
        try {
            toast.info(`Đang xử lý từ chối ${candidate.name}...`);
            await triggerEmailWorkflow({
                name: candidate.name,
                email: candidate.email,
                status: 'rejected',
                role: 'candidate'
            });
            updateCandidateStatus(candidate.id, 'rejected');
            setShowRejectAlert(false);
            toast.success(`Đã từ chối ${candidate.name}`);
        } catch (error) {
            console.error("Reject failed:", error);
            toast.error("Từ chối thất bại");
        } finally {
            setIsRejectLoading(false);
        }
    };


    return (
        <Card className={cn("h-full flex flex-col w-full bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden rounded-xl", isRejected && "opacity-60 grayscale-[0.5]")}>
            <CardContent className="p-5 space-y-4 flex-1">
                {/* Header: Name & Role */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight line-clamp-1" title={candidate.name}>
                            {candidate.name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {(candidate.applied_role || "Business Analyst").replace(/\b(Junior|Senior|Fresher|Intern|Jr|Sr)\b/gi, "").trim()}
                        </p>
                    </div>
                    {isRejected && (
                        <Badge variant="destructive" className="text-[10px] px-2 h-5">Đã loại</Badge>
                    )}
                </div>



                {/* Collapsible AI Summary Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100/50 dark:border-slate-700/50">
                    {/* Contact Info (if available) - Show always if present */}
                    {(candidate.email || candidate.phone) && (
                        <div className="mb-3 space-y-1.5 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                            {candidate.email && (
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span className="truncate" title={candidate.email}>{candidate.email}</span>
                                </div>
                            )}
                            {candidate.phone && (
                                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                    <User className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
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
                            <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Tóm tắt AI</span>
                        </div>
                        {isExpanded ? <ChevronUp className="h-3 w-3 text-slate-400" /> : <ChevronDown className="h-3 w-3 text-slate-400" />}
                    </div>

                    <div className={cn("text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line", !isExpanded && "line-clamp-3")}>
                        {summary ? summary : "Chưa có thông tin chi tiết."}
                    </div>

                    {/* Expanded Extras: Pros, Skills */}
                    {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            {/* Highlights */}
                            {candidate.strengths && candidate.strengths.length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Điểm mạnh</span>
                                    </div>
                                    <div className="space-y-1 pl-1">
                                        {candidate.strengths.map((str: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
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
                                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                                        <span>Kinh nghiệm {candidate.experience_years ? `${candidate.experience_years} năm` : "phù hợp"}</span>
                                    </div>
                                </div>
                            )}

                            {/* Skills Tokens */}
                            {candidate.skills_found && candidate.skills_found.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Kỹ năng</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {candidate.skills_found.slice(0, 5).map((skill: string, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="px-1.5 py-0 h-5 text-[10px] bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
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
            {/* Footer Actions - Overview Style */}
            {/* Footer Actions - Updated Design */}
            {/* Footer Actions - Single Row Layout */}
            <div className="p-4 pt-0 flex gap-2">
                {/* APPROVE - "Liên hệ" */}
                {/* Now triggers the new EmailPreviewModal instead of the direct contact alert */}
                <EmailPreviewModal candidate={candidate} jobPosition={jobRequirements?.job_position}>
                    <Button
                        className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 hover:from-indigo-600 hover:via-purple-600 hover:to-orange-600 text-white border-0 shadow-sm px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Liên hệ phỏng vấn / Gửi Email"
                        disabled={candidate.status === 'rejected' || candidate.status === 'shortlisted'}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Liên hệ
                    </Button>
                </EmailPreviewModal>

                {/* REJECT - "Từ chối" */}
                <AlertDialog open={showRejectAlert} onOpenChange={setShowRejectAlert}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex-1 border-red-100 text-red-600 bg-red-50/50 hover:bg-red-50 hover:border-red-200 dark:bg-red-900/10 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Từ chối"
                            disabled={candidate.status === 'rejected' || candidate.status === 'shortlisted'}
                        >
                            <X className="h-4 w-4 mr-1.5" />
                            Từ chối
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white dark:bg-slate-900 border-red-100 dark:border-red-900">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">Xác nhận từ chối</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn từ chối ứng viên <strong>{candidate.name}</strong>? Email thông báo sẽ được gửi đi.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReject} disabled={isRejectLoading} className="bg-red-600 hover:bg-red-700 text-white border-0">
                                {isRejectLoading ? "Đang xử lý..." : "Xác nhận"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* View CV Button */}
                <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 px-3 whitespace-nowrap" asChild>
                    <a
                        href={getDriveFileUrl(candidate.link_cv || candidate.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            const link = candidate.link_cv || candidate.file_url;
                            if (!link || link === '#' || link.trim() === '') {
                                e.preventDefault();
                                toast.error("Không tìm thấy link CV của ứng viên này");
                            }
                        }}
                    >
                        Xem CV
                    </a>
                </Button>
            </div>
        </Card>
    )
}
