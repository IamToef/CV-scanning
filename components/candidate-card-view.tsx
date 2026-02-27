import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Candidate } from "@/types"
import { CandidateProfile } from "./candidate-profile"
import { Eye, Mail, Phone, Download, Share2, ChevronDown, Sparkles, X } from "lucide-react"
import { useCandidates } from "@/components/candidate-context"
import { cn, getDriveFileUrl } from "@/lib/utils"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { EmailPreviewModal } from "./email-preview-modal"

interface CandidateCardViewProps {
    candidates: Candidate[]
}

function ExpandableSummary({ text }: { text: string }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2 mt-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs tracking-wide">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                        Lí do chấm điểm
                    </span>
                </div>
            </div>
            <div className="relative">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    )
}

export function CandidateCardView({ candidates }: CandidateCardViewProps) {
    const { sortConfig, deleteCandidate, jobRequirements } = useCandidates()




    // 1. Calculate scores and extend candidate objects
    const processedCandidates = candidates.map(candidate => {
        const details = candidate.score_details || candidate.reasoning || {};

        const exp = Number(details.experience_score) || 0;
        const skill = Number(details.skills_score) || 0;
        const profScore = Math.round((exp + skill) / 2);

        const edu = Number(details.education_score) || 0;
        const pot = Number(details.potential_score) || 0;
        const potScore = Math.round((edu + pot) / 2);

        // New Total Score Calculation: Average of the two main categories
        const calculatedScore = Math.round((profScore + potScore) / 2);

        return {
            ...candidate,
            profScore,
            potScore,
            displayScore: calculatedScore
        };
    });

    const sortedCandidates = [...processedCandidates].sort((a, b) => {
        if (!sortConfig) {
            return (b.displayScore - a.displayScore)
        }
        const col = sortConfig.column as keyof Candidate

        // Handle sorting by calculated score if 'score' column is selected
        if (col === 'score') {
            return sortConfig.direction === 'asc'
                ? a.displayScore - b.displayScore
                : b.displayScore - a.displayScore
        }

        const valA = a[col]
        const valB = b[col]

        // Explicitly handle strict numeric columns
        if (col === 'experience_years') {
            const numA = Number(valA) || 0
            const numB = Number(valB) || 0
            return sortConfig.direction === 'asc' ? numA - numB : numB - numA
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'asc' ? valA - valB : valB - valA
        }

        const strA = String(valA || "").toLowerCase()
        const strB = String(valB || "").toLowerCase()
        return sortConfig.direction === 'asc'
            ? strA.localeCompare(strB)
            : strB.localeCompare(strA)
    })

    if (sortedCandidates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border border-dashed rounded-xl">
                <p>Chưa có dữ liệu ứng viên.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCandidates.map((candidate) => (
                <Card key={candidate.id} className="group relative overflow-hidden rounded-[2rem] border-0 bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] dark:hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)] transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900 pointer-events-none transition-colors" />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 z-20 h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Ứng viên này sẽ bị xóa vĩnh viễn khỏi danh sách.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCandidate(candidate.id);
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Xóa
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <CardContent className="p-7 space-y-6 relative z-10">
                        {/* Header: Name & Score */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h3 className="font-black text-xl text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {candidate.name}
                                </h3>
                                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-semibold border-transparent">
                                    {candidate.applied_role || "Business Analyst"} • {candidate.experience_years} năm
                                </Badge>
                            </div>
                            {/* Score Badge */}
                            <div className={`
                                flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-lg text-white border-0 transform transition-transform group-hover:scale-105
                                ${candidate.displayScore >= 80 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-200' :
                                    candidate.displayScore >= 50 ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-100' :
                                        'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-100'}
                            `}>
                                <span className="text-2xl font-black leading-none">{candidate.displayScore}</span>
                                <span className="text-[9px] font-bold uppercase mt-1 opacity-90 tracking-wider">Điểm</span>
                            </div>
                        </div>

                        {/* Action Icons Row */}
                        <TooltipProvider>
                            <div className="flex items-center gap-3">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30" asChild>
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
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tải xuống CV</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <EmailPreviewModal candidate={candidate} jobPosition={jobRequirements?.job_position}>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                    </EmailPreviewModal>
                                    <TooltipContent>
                                        <p>{candidate.email}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{candidate.phone || "Không có số điện thoại"}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <CandidateProfile candidate={candidate}>
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </CandidateProfile>
                            </div>
                        </TooltipProvider>

                        {/* Stats: Grouped Scores */}
                        <div className="space-y-4 pt-2">
                            {/* Group 1: Professional Competency (Skills + Experience) */}
                            {(() => {
                                const details = candidate.score_details || candidate.reasoning || {};
                                const exp = Number(details.experience_score) || 0;
                                const skill = Number(details.skills_score) || 0;
                                const avg = Math.round((exp + skill) / 2);

                                return (
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                                            <span>Năng lực chuyên môn</span>
                                            <span className={`font-bold ${avg >= 80 ? 'text-indigo-600 dark:text-indigo-400' :
                                                avg >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-red-600 dark:text-red-400'
                                                }`}>{avg}/100</span>
                                        </div>
                                        <Progress
                                            value={avg}
                                            className="h-1.5 bg-slate-100 dark:bg-slate-800"
                                            indicatorClassName={`bg-gradient-to-r ${avg >= 80 ? 'from-indigo-600 to-blue-600' :
                                                avg >= 50 ? 'from-amber-500 to-orange-500' :
                                                    'from-red-600 to-rose-600'
                                                }`}
                                        />
                                    </div>
                                );
                            })()}

                            {/* Group 2: Potential & Education */}
                            {(() => {
                                const details = candidate.score_details || candidate.reasoning || {};
                                const edu = Number(details.education_score) || 0;
                                const pot = Number(details.potential_score) || 0;
                                const avg = Math.round((edu + pot) / 2);

                                return (
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide">
                                            <span>Tiềm năng & Học vấn</span>
                                            <span className={`font-bold ${avg >= 80 ? 'text-indigo-600 dark:text-indigo-400' :
                                                avg >= 50 ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-red-600 dark:text-red-400'
                                                }`}>{avg}/100</span>
                                        </div>
                                        <Progress
                                            value={avg}
                                            className="h-1.5 bg-slate-100 dark:bg-slate-800"
                                            indicatorClassName={`bg-gradient-to-r ${avg >= 80 ? 'from-indigo-600 to-blue-600' :
                                                avg >= 50 ? 'from-amber-500 to-orange-500' :
                                                    'from-red-600 to-rose-600'
                                                }`}
                                        />
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Risk & Reward Factors */}
                        {(candidate.risk_analysis || candidate.reward_analysis) && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {candidate.reward_analysis && (
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1 px-2">
                                        <Sparkles className="h-3 w-3" />
                                        Điểm cộng: {candidate.reward_analysis.level}
                                    </Badge>
                                )}
                                {candidate.risk_analysis && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 px-2">
                                        <div className="h-3 w-3 rounded-full bg-red-100 flex items-center justify-center text-[8px] font-bold">!</div>
                                        Rủi ro: {candidate.risk_analysis.level}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Scoring Reason Box */}
                        <ExpandableSummary text={candidate.scoring_reason || candidate.summary} />

                    </CardContent>
                </Card>
            ))
            }
        </div >
    )
}
