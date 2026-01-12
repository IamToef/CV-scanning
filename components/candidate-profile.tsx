"use client"

import {
    Dialog,
    DialogContent,
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
import { CheckCircle2, X, AlertCircle, HelpCircle, Brain, Star, AlertTriangle, Briefcase, User, Phone, Mail, MessageSquare, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Candidate } from "@/types"
import { useCandidates } from "@/components/candidate-context"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Typewriter } from "@/components/ui/typewriter"

interface CandidateProfileProps {
    candidate: Candidate
    children: React.ReactNode
}

export function CandidateProfile({ candidate, children }: CandidateProfileProps) {
    const { updateCandidateStatus } = useCandidates()
    const [open, setOpen] = useState(false)
    const [showContactAlert, setShowContactAlert] = useState(false)
    const [showRejectAlert, setShowRejectAlert] = useState(false)

    // Questions Derived State
    const questions = (candidate.technical_questions?.length || candidate.soft_skill_questions?.length)
        ? { technical: candidate.technical_questions || [], soft: candidate.soft_skill_questions || [] }
        : null;

    const [showInlineQuestions, setShowInlineQuestions] = useState(false)


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





    const handleSuggestQuestionsClick = () => {
        setShowInlineQuestions(!showInlineQuestions);
    };


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
                <DialogHeader className="p-6 pb-2 shrink-0 pr-20">
                    <div className="flex items-start justify-between w-full">
                        <div className="space-y-1 flex-1">
                            {/* Score directly next to Name */}
                            <div className="flex items-center gap-3">
                                <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                                    <User className="h-6 w-6 text-purple-600" />
                                    {candidate.name}
                                </DialogTitle>
                                {(() => {
                                    const score = (candidate as any).displayScore ?? candidate.score;
                                    return (
                                        <div className={cn(
                                            "flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold border-0 text-white bg-gradient-to-r ml-2 shadow-sm",
                                            score >= 80 ? "from-indigo-500 to-purple-600" :
                                                score >= 50 ? "from-amber-400 to-orange-500" :
                                                    "from-red-500 to-rose-600"
                                        )}>
                                            {score} điểm
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center text-muted-foreground gap-2 sm:gap-4 text-sm mt-1">
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

                        {/* Status (Right Side) */}
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-base px-3 py-1 font-medium bg-muted/50">
                                {candidate.status.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b shrink-0 bg-white dark:bg-slate-900 z-10">
                        <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="profile"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 rounded-none h-full px-4 text-base font-medium text-slate-500 dark:text-slate-400"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Hồ sơ ứng viên
                            </TabsTrigger>

                        </TabsList>
                    </div>

                    <TabsContent value="profile" className="flex-1 overflow-hidden p-0 m-0 data-[state=inactive]:hidden h-full">
                        <ScrollArea className="h-full">
                            <div className="p-6 pt-6 space-y-6">
                                {/* Summary Section - Refined & Brief */}
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 text-primary">
                                                <Briefcase className="h-4 w-4" />
                                                <h3 className="font-semibold text-lg">Tóm tắt hồ sơ</h3>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                                {candidate.summary}
                                            </p>
                                        </div>
                                    </div>

                                </div>


                                {/* 3-Column Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pb-6">
                                    {/* Column 1: Pros */}
                                    <div className="flex flex-col h-full bg-green-50/30 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 p-5">
                                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-lg mb-4">
                                            <Star className="h-5 w-5" /> Ưu điểm
                                        </div>
                                        <ul className="space-y-3 flex-1">
                                            {(candidate.pros?.length ? candidate.pros : candidate.strengths)?.length > 0 ? (
                                                (candidate.pros?.length ? candidate.pros : candidate.strengths).map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                                                        <span className="text-green-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-muted-foreground italic">Chưa có thông tin</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Column 2: Cons */}
                                    <div className="flex flex-col h-full bg-red-50/30 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 p-5">
                                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-lg mb-4">
                                            <AlertTriangle className="h-5 w-5" /> Nhược điểm
                                        </div>
                                        <ul className="space-y-3 flex-1">
                                            {(candidate.cons?.length ? candidate.cons : candidate.weaknesses)?.length > 0 ? (
                                                (candidate.cons?.length ? candidate.cons : candidate.weaknesses).map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                                                        <span className="text-red-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-muted-foreground italic">Chưa có thông tin</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Column 3: Skills (Matching & Missing) */}
                                    <div className="flex flex-col h-full gap-4">
                                        {/* Matching Skills */}
                                        <div className="bg-green-50/30 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 p-4 flex-1">
                                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-base mb-3">
                                                <CheckCircle2 className="h-4 w-4" /> Kỹ năng phù hợp
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.skills_found && candidate.skills_found.length > 0 ? (
                                                    candidate.skills_found.slice(0, 5).map((skill, index) => (
                                                        <Badge key={index} variant="secondary" className="bg-white dark:bg-slate-800 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900 shadow-sm hover:bg-green-50 dark:hover:bg-green-900/50">
                                                            {skill}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">--</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Missing Skills */}
                                        <div className="bg-orange-50/30 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 p-4 flex-1">
                                            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-base mb-3">
                                                <AlertCircle className="h-4 w-4" /> Kỹ năng còn thiếu
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.skills_missing && candidate.skills_missing.length > 0 ? (
                                                    candidate.skills_missing.map((skill, index) => (
                                                        <Badge key={index} variant="outline" className="bg-white dark:bg-slate-800 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900 shadow-sm">
                                                            {skill}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">--</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Suggest Questions Trigger (Moved to Bottom) */}
                                <div className="space-y-4 pb-6">
                                    <div className="flex items-center gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSuggestQuestionsClick}
                                            className={cn(
                                                "gap-2 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-slate-800 border-purple-200 dark:border-slate-700 hover:bg-purple-100 dark:hover:bg-slate-700 hover:border-purple-300 transition-all",
                                                showInlineQuestions && "bg-purple-100 dark:bg-slate-800 border-purple-300 dark:border-purple-900"
                                            )}
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            {showInlineQuestions ? "Ẩn gợi ý câu hỏi" : "Gợi ý câu hỏi phỏng vấn"}
                                        </Button>
                                    </div>

                                    {/* Inline Questions Display */}
                                    {showInlineQuestions && (
                                        <div className="p-5 rounded-xl border border-purple-100 dark:border-slate-700 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-slate-800/50 shadow-md animate-in fade-in zoom-in-95 duration-200">
                                            {questions ? (
                                                <div className="space-y-8">
                                                    {/* Technical */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-purple-700 dark:text-purple-400 border-b border-purple-100 dark:border-slate-700 pb-2">
                                                            <Brain className="h-5 w-5" />
                                                            <h4 className="font-bold text-base">Câu hỏi chuyên môn</h4>
                                                        </div>
                                                        <div className="grid gap-3 pl-1">
                                                            {questions.technical.length > 0 ? questions.technical.map((q, i) => {
                                                                if (typeof q !== 'string' || q.includes('_questions') || q.includes('":') || q.length > 500) return null;
                                                                const cleanQ = q.trim();
                                                                return (
                                                                    <div key={`tech-${i}`} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 items-start group">
                                                                        <span className="text-purple-400 font-bold shrink-0 leading-relaxed mt-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">•</span>
                                                                        <span className="leading-relaxed bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg block w-full">
                                                                            {cleanQ}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }) : <span className="text-sm text-muted-foreground italic">Không có đề xuất.</span>}
                                                        </div>
                                                    </div>

                                                    {/* Soft Skills */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-pink-700 border-b border-pink-100 pb-2">
                                                            <MessageSquare className="h-5 w-5" />
                                                            <h4 className="font-bold text-base">Câu hỏi kỹ năng mềm</h4>
                                                        </div>
                                                        <div className="grid gap-3 pl-1">
                                                            {questions.soft.length > 0 ? questions.soft.map((q, i) => {
                                                                if (typeof q !== 'string' || q.includes('_questions') || q.includes('":') || q.length > 500) return null;
                                                                const cleanQ = q.trim();
                                                                return (
                                                                    <div key={`soft-${i}`} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 items-start group">
                                                                        <span className="text-pink-400 font-bold shrink-0 leading-relaxed mt-0.5 group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors">•</span>
                                                                        <span className="leading-relaxed bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg block w-full">
                                                                            {cleanQ}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            }) : <span className="text-sm text-muted-foreground italic">Không có đề xuất.</span>}
                                                        </div>
                                                    </div>


                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-slate-400 italic">
                                                    Chưa có dữ liệu câu hỏi từ lần phân tích gần nhất.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </ScrollArea>
                    </TabsContent>


                </Tabs>

                <DialogFooter className="p-4 border-t bg-muted/10 dark:bg-slate-900 shrink-0 gap-2 sm:gap-2 z-20">
                    <div className="flex w-full sm:justify-end gap-2">
                        <Button
                            variant="destructive"
                            className="flex-1 sm:flex-none border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border shadow-sm"
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
