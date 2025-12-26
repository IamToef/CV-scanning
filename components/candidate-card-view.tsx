import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Candidate } from "@/types"
import { CandidateProfile } from "./candidate-profile"
import { Eye, Mail, Phone, Download, Share2, ChevronDown, Sparkles } from "lucide-react"
import { useCandidates } from "@/components/candidate-context"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CandidateCardViewProps {
    candidates: Candidate[]
}

function ExpandableSummary({ text }: { text: string }) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`bg-nds-pink/50 rounded-xl p-4 space-y-2 mt-4 border border-nds-pink/20 transition-all duration-300 cursor-pointer hover:bg-nds-pink/60 relative group ${isExpanded ? '' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-nds-pink-foreground font-bold text-xs uppercase tracking-wide">
                    <Sparkles className="h-3.5 w-3.5 text-nds-pink-foreground" />
                    <span className="text-nds-pink-foreground">Tóm tắt từ AI</span>
                </div>

            </div>
            <div className="relative">
                <p className={`text-sm text-foreground/80 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {text}
                </p>
                {!isExpanded && text.length > 150 && (
                    <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-nds-pink/20 to-transparent" />
                )}
            </div>
        </div>
    )
}

export function CandidateCardView({ candidates }: CandidateCardViewProps) {
    const { sortConfig } = useCandidates()

    const sortedCandidates = [...candidates].sort((a, b) => {
        if (!sortConfig) {
            return (Number(b.score) || 0) - (Number(a.score) || 0)
        }
        const col = sortConfig.column as keyof Candidate
        const valA = a[col]
        const valB = b[col]

        // Explicitly handle strict numeric columns
        if (col === 'score' || col === 'experience_years') {
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
                <Card key={candidate.id} className="group relative overflow-hidden rounded-[1.5rem] border hover:shadow-xl transition-all duration-300 bg-card">
                    <CardContent className="p-6 space-y-6">
                        {/* Header: Name & Score */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-extrabold text-lg text-primary leading-tight">
                                    {candidate.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {candidate.experience_years > 5 ? "Senior Business Analyst" : "Business Analyst"}
                                </p>
                            </div>
                            {/* Score Badge */}
                            <div className={`
                                flex flex-col items-center justify-center w-14 h-14 rounded-2xl
                                ${candidate.score >= 80 ? 'bg-green-100 text-green-700' :
                                    candidate.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'}
                            `}>
                                <span className="text-xl font-black leading-none">{candidate.score}</span>
                                <span className="text-[10px] font-bold uppercase mt-0.5">Điểm</span>
                            </div>
                        </div>

                        {/* Action Icons Row */}
                        <TooltipProvider>
                            <div className="flex items-center gap-3">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-primary hover:border-primary" asChild>
                                            <a href={candidate.link_cv || candidate.file_url || "#"} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Tải xuống CV</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-primary hover:border-primary" onClick={() => window.open(`mailto:${candidate.email}`)}>
                                            <Mail className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{candidate.email}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-muted-foreground/20 text-muted-foreground hover:text-primary hover:border-primary">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{candidate.phone || "Không có số điện thoại"}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <CandidateProfile candidate={candidate}>
                                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-[var(--nds-pink)]/40 text-[var(--nds-pink-foreground)] hover:bg-[var(--nds-pink)] hover:border-[var(--nds-pink)]">
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
                                        <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            <span>Năng lực chuyên môn</span>
                                            <span className="text-foreground">{avg}/100</span>
                                        </div>
                                        <Progress
                                            value={avg}
                                            className="h-1.5 bg-gray-100"
                                            indicatorClassName="bg-green-500"
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
                                        <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            <span>Tiềm năng & Học vấn</span>
                                            <span className="text-foreground">{avg}/100</span>
                                        </div>
                                        <Progress
                                            value={avg}
                                            className="h-1.5 bg-gray-100"
                                            indicatorClassName="bg-yellow-500"
                                        />
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Risk & Reward Factors */}
                        {(candidate.risk_analysis || candidate.reward_analysis) && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {candidate.reward_analysis && (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-2">
                                        <Sparkles className="h-3 w-3" />
                                        Điểm cộng: {candidate.reward_analysis.level}
                                    </Badge>
                                )}
                                {candidate.risk_analysis && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 px-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500/20 flex items-center justify-center text-[8px] font-bold">!</div>
                                        Rủi ro: {candidate.risk_analysis.level}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* AI Summary Box */}
                        <ExpandableSummary text={candidate.summary} />



                    </CardContent>
                </Card>
            ))
            }
        </div >
    )
}
