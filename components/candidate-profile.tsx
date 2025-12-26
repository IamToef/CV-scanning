"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Candidate } from "@/types"
import { Progress } from "@/components/ui/progress"
import { Brain, Star, AlertTriangle, GraduationCap, Briefcase, User, Phone, Mail, MessageSquare } from "lucide-react"

interface CandidateProfileProps {
    candidate: Candidate
    children: React.ReactNode
}

export function CandidateProfile({ candidate, children }: CandidateProfileProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-500"
        if (score >= 50) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                                <User className="h-6 w-6 text-primary" />
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
                        <Badge variant="outline" className="text-base px-3 py-1 font-medium bg-muted/50">
                            {candidate.status.toUpperCase()}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-0">
                    <div className="space-y-8 pr-4">
                        {/* Main Score & Status Section */}
                        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4 mt-2">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg text-foreground">Số điểm phù hợp</h3>
                                    <p className="text-sm text-muted-foreground">Điểm tổng mức độ phù hợp cho công việc</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-4xl font-extrabold ${candidate.score >= 80 ? 'text-green-600' : candidate.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {candidate.score}
                                    </span>
                                    <span className="text-lg text-muted-foreground font-medium">/100</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Progress value={candidate.score} className="h-4 rounded-full" indicatorClassName={getScoreColor(candidate.score)} />
                                {candidate.match_level && (
                                    <div className="flex justify-end">
                                        <span className="text-sm font-medium text-muted-foreground">Mức độ: <span className="text-foreground">{candidate.match_level}</span></span>
                                    </div>
                                )}
                            </div>
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
                                        <div key={i} className="flex flex-col items-center justify-between p-4 rounded-lg bg-muted/40 border hover:bg-muted/60 transition-colors h-[110px]">
                                            <div className="text-sm text-muted-foreground font-medium text-center flex items-center justify-center leading-tight px-1 w-full whitespace-nowrap">
                                                {item.label}
                                            </div>
                                            <span className="text-3xl font-extrabold tracking-tight text-foreground">{item.value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Analysis Grid: Risk vs Reward */}


                        {/* Pros & Cons Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pros */}
                            {(candidate.pros?.length ? candidate.pros : candidate.strengths)?.length > 0 && (
                                <div className="p-5 rounded-xl border border-green-100 bg-green-50/50 space-y-3">
                                    <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                                        <Star className="h-5 w-5" /> Ưu điểm
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-1">
                                        {(candidate.pros?.length ? candidate.pros : candidate.strengths).map((item, i) => (
                                            <li key={i} className="text-sm text-foreground/80 leading-relaxed pl-1">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Cons */}
                            {(candidate.cons?.length ? candidate.cons : candidate.weaknesses)?.length > 0 && (
                                <div className="p-5 rounded-xl border border-red-100 bg-red-50/50 space-y-3">
                                    <div className="flex items-center gap-2 text-red-700 font-bold text-lg">
                                        <AlertTriangle className="h-5 w-5" /> Nhược điểm
                                    </div>
                                    <ul className="list-disc list-outside ml-4 space-y-1">
                                        {(candidate.cons?.length ? candidate.cons : candidate.weaknesses).map((item, i) => (
                                            <li key={i} className="text-sm text-foreground/80 leading-relaxed pl-1">{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Skills Section */}
                        {candidate.skills_found && candidate.skills_found.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                                    <GraduationCap className="h-5 w-5 text-primary" /> Kỹ năng nổi bật
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.skills_found.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                            {skill}
                                        </Badge>
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
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
