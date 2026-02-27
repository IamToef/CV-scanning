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
import { CheckCircle2, X, AlertCircle, HelpCircle, Brain, Star, AlertTriangle, Briefcase, User, Phone, Mail, MessageSquare, Sparkles, Printer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Candidate } from "@/types"
import { useCandidates } from "@/components/candidate-context"
import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Typewriter } from "@/components/ui/typewriter"
import { useReactToPrint } from "react-to-print"
import { triggerEmailWorkflow } from "@/lib/api"
import { EmailPreviewModal } from "./email-preview-modal"

interface CandidateProfileProps {
    candidate: Candidate
    children: React.ReactNode
    hideEmailButton?: boolean
}

// --- Printable Component ---
const PrintableProfile = React.forwardRef<HTMLDivElement, { candidate: Candidate }>(({ candidate }, ref) => {
    return (
        <div ref={ref} className="p-10 font-sans text-slate-900 bg-white min-h-[297mm] w-[210mm] mx-auto print:mx-0 print:w-[100%] print:p-8">
            <style type="text/css" media="print">
                {`
               @page { size: A4; margin: 10mm 15mm; }
               body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Inter', sans-serif; }
               .no-print { display: none !important; }
               * { page-break-inside: avoid; }
             `}
            </style>

            {/* Header */}
            <div className="border-b-4 border-slate-800 pb-6 mb-6 flex justify-between items-start">
                <div className="space-y-3 flex-1">
                    <h1 className="text-4xl font-black tracking-tight uppercase text-slate-900">{candidate.name}</h1>
                    <div className="flex flex-col gap-1.5 text-sm text-slate-700 font-medium pb-2">
                        {candidate.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-500" /> {candidate.email}
                            </div>
                        )}
                        {candidate.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-500" /> {candidate.phone}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="inline-flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl min-w-[120px]">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Điểm Phù Hợp</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-slate-900 leading-none">{candidate.score}</span>
                            <span className="text-lg font-bold text-slate-400">/ 100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-12 gap-10">
                {/* Left Col (Main) */}
                <div className="col-span-8 space-y-8">
                    {/* Summary */}
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-3 border-l-4 border-indigo-600 pl-3">
                            Tóm tắt hồ sơ
                        </h2>
                        <div className="text-sm leading-relaxed text-slate-800 text-justify bg-slate-50 p-5 rounded-xl border border-slate-100">
                            {candidate.summary}
                        </div>
                    </section>

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-2 gap-6">
                        <section className="bg-green-50/50 p-5 rounded-xl border border-green-100">
                            <h3 className="text-base font-bold uppercase text-green-800 mb-3 flex items-center gap-2">
                                <Star className="h-5 w-5" /> Ưu điểm
                            </h3>
                            <ul className="space-y-2.5">
                                {(candidate.pros?.length ? candidate.pros : candidate.strengths)?.map((item, i) => (
                                    <li key={i} className="text-sm text-slate-800 flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section className="bg-red-50/50 p-5 rounded-xl border border-red-100">
                            <h3 className="text-base font-bold uppercase text-red-800 mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> Nhược điểm
                            </h3>
                            <ul className="space-y-2.5">
                                {(candidate.cons?.length ? candidate.cons : candidate.weaknesses)?.map((item, i) => (
                                    <li key={i} className="text-sm text-slate-800 flex items-start gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* Interview Questions */}
                    {((candidate.technical_questions?.length ?? 0) > 0) && (
                        <section className="pt-4 mt-6 border-t-2 border-slate-100">
                            <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 mb-4 border-l-4 border-indigo-600 pl-3">
                                Đề xuất phỏng vấn
                            </h2>
                            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <div>
                                    <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        <Brain className="h-4 w-4" /> Kỹ năng chuyên môn
                                    </h4>
                                    <ul className="space-y-2">
                                        {(candidate.technical_questions || []).slice(0, 4).map((q, i) => (
                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                                                <span>{typeof q === 'string' ? q : ''}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Col (Sidebar) */}
                <div className="col-span-4 space-y-8">
                    {/* Experience */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Kinh nghiệm</h2>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
                            <div className="bg-white p-3 rounded-lg print:border print:border-indigo-200">
                                <Briefcase className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <span className="text-3xl font-black text-indigo-700 block leading-none mb-1">{candidate.experience_years}+</span>
                                <span className="text-[10px] text-indigo-600 uppercase font-black tracking-widest">Năm làm việc</span>
                            </div>
                        </div>
                    </section>

                    {/* Details Breakdown */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Chi tiết điểm</h2>
                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {Object.entries((candidate as any).score_details || {} as any).map(([key, val]) => {
                                const labelMap: Record<string, string> = {
                                    'experience_score': 'Kinh nghiệm',
                                    'skills_score': 'Kỹ năng',
                                    'education_score': 'Học vấn',
                                    'potential_score': 'Tiềm năng'
                                };
                                const label = labelMap[key] || key.replace('_score', '');
                                return (
                                    <div key={key} className="flex justify-between items-center text-sm border-b border-dashed border-slate-200 pb-2 last:border-0 last:pb-0">
                                        <span className="font-semibold text-slate-600">{label}</span>
                                        <span className="font-black text-indigo-900 bg-white px-2 py-0.5 rounded shadow-sm print:border">{String(val)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Kỹ năng tìm thấy</h2>
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills_found?.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 print:bg-white">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* File / Link Note */}
                    <section className="pt-4 border-t-2 border-slate-100">
                        <div className="text-xs text-slate-500 italic p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-center">
                            Hồ sơ gốc được lưu trữ trên hệ thống NDS.
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-2 border-slate-800 font-mono text-[10px] text-slate-500 flex justify-between uppercase tracking-widest items-end">
                <div>
                    <strong className="block text-slate-900 mb-1">Talent-IQ / NDS Vietnam</strong>
                    <span>Báo cáo phân tích ứng viên tự động</span>
                </div>
                <div className="text-right">
                    <span className="block border-b border-slate-300 pb-1 mb-1">Ngày xuất báo cáo</span>
                    <strong className="text-slate-900">{new Date().toLocaleDateString('vi-VN')}</strong>
                </div>
            </div>
        </div>
    )
});
PrintableProfile.displayName = "PrintableProfile";


export function CandidateProfile({ candidate, children, hideEmailButton = false }: CandidateProfileProps) {
    const { updateCandidateStatus, jobRequirements } = useCandidates()
    const [open, setOpen] = useState(false)
    const [showContactAlert, setShowContactAlert] = useState(false)
    const [showRejectAlert, setShowRejectAlert] = useState(false)
    const [isContacting, setIsContacting] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    // Questions Derived State
    const questions = (candidate.technical_questions?.length || candidate.soft_skill_questions?.length)
        ? { technical: candidate.technical_questions || [], soft: candidate.soft_skill_questions || [] }
        : null;

    const [showInlineQuestions, setShowInlineQuestions] = useState(false)

    // Print Logic
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Report_${candidate.name.replace(/\s+/g, '_')}`,
        onAfterPrint: () => toast.success("Đã xuất PDF thành công!")
    });


    const confirmContact = async () => {
        setIsContacting(true);
        try {
            // 1. Initial Toast
            toast.info(`Đang gửi liên hệ tới ${candidate.name}...`);

            // 2. Call API
            await triggerEmailWorkflow({
                name: candidate.name,
                email: candidate.email,
                status: 'shortlisted',
                role: 'candidate'
            });

            // 3. Success
            updateCandidateStatus(candidate.id, 'shortlisted')
            setShowContactAlert(false)
            toast.success(`Đã gửi liên hệ tới ${candidate.name}`, {
                description: <span className="text-green-900 font-semibold text-base block mt-1">Email mời phỏng vấn đã được đưa vào hàng đợi xử lý.</span>,
                duration: 4000,
                className: "bg-green-50 border-green-200 group-[.toaster]:shadow-lg group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200",
                icon: <CheckCircle2 className="h-5 w-5 text-green-600" />
            })
        } catch (error) {
            console.error("Contact failed:", error);
            toast.error("Gửi email thất bại", {
                description: "Vui lòng kiểm tra lại kết nối hoặc thông tin ứng viên."
            });
        } finally {
            setIsContacting(false);
        }
    }

    const confirmReject = async () => {
        setIsRejecting(true);
        try {
            toast.info(`Đang xử lý từ chối ứng viên ${candidate.name}...`);

            await triggerEmailWorkflow({
                name: candidate.name,
                email: candidate.email,
                status: 'rejected',
                role: 'candidate'
            });

            updateCandidateStatus(candidate.id, 'rejected')
            setShowRejectAlert(false)
            toast.error(`Đã từ chối ứng viên ${candidate.name}`, {
                description: <span className="text-red-900 font-semibold text-base block mt-1">Ứng viên đã được chuyển sang danh sách loại và email thông báo đã được gửi.</span>,
                duration: 4000,
                className: "bg-red-50 border-red-200 group-[.toaster]:shadow-lg group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200",
                icon: <AlertCircle className="h-5 w-5 text-red-600" />
            })
        } catch (error) {
            console.error("Reject failed:", error);
            toast.error("Từ chối thất bại", {
                description: "Vui lòng kiểm tra lại kết nối hoặc thử lại sau."
            });
        } finally {
            setIsRejecting(false);
        }
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
                        <div className="flex items-center gap-2 sm:gap-4">
                            {!hideEmailButton && (
                                <>
                                    <EmailPreviewModal candidate={candidate} jobPosition={jobRequirements?.job_position}>
                                        <Button variant="outline" size="sm" className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 shadow-sm hidden sm:flex">
                                            <Mail className="h-4 w-4" />
                                            Gửi Email
                                        </Button>
                                    </EmailPreviewModal>
                                    <EmailPreviewModal candidate={candidate} jobPosition={jobRequirements?.job_position}>
                                        <Button variant="outline" size="icon" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 sm:hidden">
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                    </EmailPreviewModal>
                                </>
                            )}
                            <Badge variant="outline" className="text-base px-3 py-1 font-medium bg-muted/50 hidden sm:inline-flex">
                                {(candidate.status || "NEW").toUpperCase()}
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
                    {/* PRINT BUTTON */}
                    <div className="flex-1 sm:flex-none mr-auto">
                        <Button
                            variant="secondary"
                            onClick={() => handlePrint()}
                            className="gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                            <Printer className="h-4 w-4" />
                            Export PDF
                        </Button>
                    </div>

                    <div className="flex w-full sm:justify-end gap-2">
                        <Button
                            variant="destructive"
                            className="flex-1 sm:flex-none border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setShowRejectAlert(true)}
                            disabled={candidate.status === 'rejected' || candidate.status === 'shortlisted'}
                        >
                            <X className="mr-2 h-4 w-4" /> Từ chối
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 border-0 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setShowContactAlert(true)}
                            disabled={candidate.status === 'rejected' || candidate.status === 'shortlisted'}
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
                        <AlertDialogAction onClick={confirmReject} disabled={isRejecting} className="bg-red-600 hover:bg-red-700 text-white">
                            {isRejecting ? "Đang xử lý..." : "Xác nhận từ chối"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 
               HIDDEN PRINTABLE SECTION 
               Rendered off-screen so useReactToPrint can grab it.
               Using 'absolute top-0 opacity-0 -z-50' to hide it visually but keep it in DOM.
            */}
            <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none h-0 w-0 overflow-hidden">
                <PrintableProfile ref={printRef} candidate={candidate} />
            </div>
        </Dialog>
    )
}
