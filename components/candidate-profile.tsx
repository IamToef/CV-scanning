"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Candidate } from "@/types"
import { Progress } from "@/components/ui/progress"
import { Brain, Star, AlertTriangle, GraduationCap, Briefcase, User, Phone, Mail } from "lucide-react"

interface CandidateProfileProps {
    candidate: Candidate
    children: React.ReactNode
}

export function CandidateProfile({ candidate, children }: CandidateProfileProps) {
    const getScoreColor = (score: number) => {
        if (score >= 8) return "bg-green-500"
        if (score >= 5) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            {/* Increased width to sm:max-w-2xl for better readability */}
            <SheetContent className="w-[90vw] sm:max-w-2xl overflow-y-auto sm:p-8">
                <SheetHeader className="mb-8 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <SheetTitle className="flex items-center gap-3 text-2xl font-bold">
                                <User className="h-6 w-6 text-primary" />
                                {candidate.name}
                            </SheetTitle>
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
                        <Badge variant="outline" className="text-base px-3 py-1 font-medium bg-muted/50">
                            {candidate.status.toUpperCase()}
                        </Badge>
                    </div>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Main Score & Status Section */}
                    <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-foreground">Số điểm phù hợp</h3>
                                <p className="text-sm text-muted-foreground">Điểm tổng mức độ phù hợp cho công việc</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-4xl font-extrabold ${candidate.score >= 8 ? 'text-green-600' : candidate.score >= 5 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {candidate.score}
                                </span>
                                <span className="text-lg text-muted-foreground font-medium">/10</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Progress value={candidate.score * 10} className="h-4 rounded-full" indicatorClassName={getScoreColor(candidate.score)} />
                            {candidate.match_level && (
                                <div className="flex justify-end">
                                    <span className="text-sm font-medium text-muted-foreground">Level: <span className="text-foreground">{candidate.match_level}</span></span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Analysis Grid: Risk vs Reward */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Analysis */}
                        {candidate.risk_analysis && (
                            <div className="p-5 rounded-xl border border-red-100 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 space-y-3">
                                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-lg">
                                    <AlertTriangle className="h-5 w-5" /> Phân tích rủi ro
                                </div>
                                <Badge variant="destructive" className="font-semibold">Level: {candidate.risk_analysis.level}</Badge>
                                {/* Increased text size to text-sm */}
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {candidate.risk_analysis.explanation}
                                </p>
                            </div>
                        )}

                        {/* Reward Analysis */}
                        {candidate.reward_analysis && (
                            <div className="p-5 rounded-xl border border-green-100 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900/50 space-y-3">
                                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-lg">
                                    <Star className="h-5 w-5" /> Phân tích thưởng
                                </div>
                                <Badge className="bg-green-600 hover:bg-green-700 font-semibold">Level: {candidate.reward_analysis.level}</Badge>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {candidate.reward_analysis.explanation}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Detailed Reasoning Scores */}
                    {candidate.reasoning && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                                <Brain className="h-5 w-5 text-primary" /> Đánh giá chi tiết
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Kinh nghiệm', value: candidate.reasoning.experience_score },
                                    { label: 'Kỹ năng', value: candidate.reasoning.skills_score },
                                    { label: 'Học vấn', value: candidate.reasoning.education_score },
                                    { label: 'Tiềm năng', value: candidate.reasoning.potential_score }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/40 border hover:bg-muted/60 transition-colors">
                                        <span className="text-sm text-muted-foreground font-medium mb-1">{item.label}</span>
                                        <span className="text-2xl font-bold tracking-tight">{item.value || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Summary */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                            <Briefcase className="h-5 w-5 text-primary" /> Tổng hợp
                        </h3>
                        {/* Increased to text-base for better readability */}
                        <div className="text-base text-muted-foreground leading-7 whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                            {candidate.summary}
                        </div>
                    </div>

                    {/* Question */}
                    {candidate.question_asked && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                                Câu hỏi phỏng vấn được đề xuất
                            </h3>
                            <ScrollArea className="h-[300px] w-full rounded-xl border p-6 bg-card text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                                {candidate.question_asked}
                            </ScrollArea>
                        </div>
                    )}

                </div>
            </SheetContent>
        </Sheet>
    )
}
