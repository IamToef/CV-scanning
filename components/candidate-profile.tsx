"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CheckCircle2, X, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Candidate } from "@/types"
import { Progress } from "@/components/ui/progress"
import { Brain, Star, AlertTriangle, GraduationCap, Briefcase, User, Phone, Mail, MessageSquare } from "lucide-react"
import { useCandidates } from "@/components/candidate-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CandidateProfileProps {
    candidate: Candidate
    children: React.ReactNode
}

export function CandidateProfile({ candidate, children }: CandidateProfileProps) {
    const { updateCandidateStatus } = useCandidates()
    const [open, setOpen] = useState(false)
    const [showContactAlert, setShowContactAlert] = useState(false)
    const [showRejectAlert, setShowRejectAlert] = useState(false)

    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
        if (score >= 50) return "bg-yellow-500"
        return "bg-red-500"
    }

    const confirmContact = () => {
        updateCandidateStatus(candidate.id, 'shortlisted')
        setShowContactAlert(false)
        toast.success(`Đã gửi liên hệ tới ${candidate.name}`, {
            description: <span className="text-green-900 font-semibold text-base block mt-1">Email mời phỏng vấn đã được đưa vào hàng đợi xử lý.</span>,
            duration: 4000,
            className: "bg-green-50 border-green-200 group-[.toaster]:shadow-lg group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200",
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />
        })
    }

    const confirmReject = () => {
        updateCandidateStatus(candidate.id, 'rejected')
        setShowRejectAlert(false)
        toast.error(`Đã từ chối ứng viên ${candidate.name}`, {
            description: <span className="text-red-900 font-semibold text-base block mt-1">Ứng viên đã được chuyển sang danh sách loại.</span>,
            duration: 4000,
            className: "bg-red-50 border-red-200 group-[.toaster]:shadow-lg group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200",
            icon: <AlertCircle className="h-5 w-5 text-red-600" />
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw] h-[90vh] p-0 overflow-hidden flex flex-col gap-0"
                onInteractOutside={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('.toaster') || target.closest('[data-sonner-toaster]')) {
                        e.preventDefault();
                    }
                }}
            >
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                                <User className="h-6 w-6 text-purple-600" />
                                {candidate.name}
                            </DialogTitle>
                            <div className="flex flex-col sm:flex-row sm:items-center text-muted-foreground gap-2 sm:gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    {candidate.email}
                                </div>
                                {candidate.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" />
                                        {candidate.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Badge variant="outline" className="text-base px-3 py-1 font-medium bg-muted/50 mr-8">
                            {candidate.status.toUpperCase()}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-0">
                    <div className="space-y-8 pr-4">
                        {/* Main Score & Status Section - Refactored */}
                        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm mt-2 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-foreground">Số điểm phù hợp</h3>
                                <p className="text-sm text-muted-foreground mt-1">Điểm tổng mức độ phù hợp cho công việc</p>
                            </div>

                            {/* Score Box */}
                            <div className={cn(
                                "rounded-2xl h-24 w-24 flex flex-col items-center justify-center",
                                candidate.score >= 80 ? "bg-green-100 text-green-700" :
                                    candidate.score >= 50 ? "bg-yellow-100 text-yellow-700" :
                                        "bg-red-100 text-red-700"
                            )}>
                                <span className="text-4xl font-bold tracking-tight">
                                    {candidate.score}
                                </span>
                                <span className="text-[10px] font-extrabold uppercase mt-1">
                                    ĐIỂM
                                </span>
                            </div>
                        </div>

                        {/* Summary - Moved to Top */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                                <Briefcase className="h-5 w-5 text-purple-600" /> Tóm tắt
                            </h3>
                            <div className="text-base text-slate-600 leading-7 whitespace-pre-wrap bg-purple-50/30 p-5 rounded-xl border-l-4 border-purple-500 shadow-sm">
                                {candidate.summary}
                            </div>
                        </div>

                        {/* 3-Column Layout: Pros | Cons | Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1: Pros */}
                            <div className="flex flex-col h-full space-y-3">
                                <div className="p-5 rounded-xl border border-green-100 bg-green-50/50 space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                                        <Star className="h-5 w-5" /> Ưu điểm
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-3">
                                        {(candidate.pros?.length ? candidate.pros : candidate.strengths)?.length > 0 ? (
                                            (candidate.pros?.length ? candidate.pros : candidate.strengths).map((item, i) => (
                                                <li key={i} className="text-sm text-foreground/80 leading-relaxed pl-1">{item}</li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-muted-foreground italic list-none">Chưa có thông tin</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Column 2: Cons */}
                            <div className="flex flex-col h-full space-y-3">
                                <div className="p-5 rounded-xl border border-red-100 bg-red-50/50 space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-red-700 font-bold text-lg">
                                        <AlertTriangle className="h-5 w-5" /> Nhược điểm
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-3">
                                        {(candidate.cons?.length ? candidate.cons : candidate.weaknesses)?.length > 0 ? (
                                            (candidate.cons?.length ? candidate.cons : candidate.weaknesses).map((item, i) => (
                                                <li key={i} className="text-sm text-foreground/80 leading-relaxed pl-1">{item}</li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-muted-foreground italic list-none">Chưa có thông tin</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Column 3: Skills - Moved here */}
                            <div className="flex flex-col h-full space-y-3">
                                <div className="p-5 rounded-xl border border-pink-100 bg-pink-50/30 space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-pink-700 font-bold text-lg">
                                        <GraduationCap className="h-5 w-5" /> Kỹ năng nổi bật
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.skills_found && candidate.skills_found.length > 0 ? (
                                            candidate.skills_found.map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="bg-white text-pink-700 hover:bg-pink-100 border border-pink-200 shadow-sm py-1.5 px-3">
                                                    {skill}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">Chưa có thông tin kỹ năng</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/10 shrink-0 gap-2 sm:gap-2">
                    <div className="flex w-full sm:justify-end gap-2">
                        <Button
                            variant="destructive"
                            className="flex-1 sm:flex-none border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 border shadow-sm"
                            onClick={() => setShowRejectAlert(true)}
                        >
                            <X className="mr-2 h-4 w-4" /> Từ chối
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 border-0 text-white shadow-md hover:shadow-lg transition-all"
                            onClick={() => setShowContactAlert(true)}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Liên hệ phỏng vấn
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>

            {/* Confirmation Dialogs */}
            <AlertDialog open={showContactAlert} onOpenChange={setShowContactAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận liên hệ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn gửi email mời phỏng vấn cho ứng viên <strong>{candidate.name}</strong> không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmContact} className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0">
                            Gửi lời mời
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showRejectAlert} onOpenChange={setShowRejectAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn từ chối ứng viên <strong>{candidate.name}</strong>? Hành động này sẽ cập nhật trạng thái ứng viên.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmReject} className="bg-red-600 hover:bg-red-700 text-white">
                            Xác nhận từ chối
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}
