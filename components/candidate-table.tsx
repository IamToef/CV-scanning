"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Candidate } from "@/types"
import { CandidateProfile } from "./candidate-profile"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"


interface CandidateTableProps {
    candidates: Candidate[]
}

export function CandidateTable({ candidates }: CandidateTableProps) {
    return (
        <div className="space-y-4">
            {/* Header Section matches Image 1 */}
            <div>
                <h2 className="text-2xl font-bold text-foreground">Danh sách ứng viên</h2>
                <p className="text-muted-foreground">Quản lý và theo dõi kết quả phân tích</p>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-[var(--background)] border-b-2 border-[var(--primary)]/10">
                        <TableRow className="hover:bg-transparent border-b-input">
                            <TableHead className="w-[250px] font-semibold text-foreground">Ứng viên</TableHead>
                            <TableHead className="font-semibold text-foreground">Điểm phù hợp</TableHead>
                            <TableHead className="font-semibold text-foreground">Kinh nghiệm</TableHead>
                            <TableHead className="w-[300px] font-semibold text-foreground">Kỹ năng</TableHead>
                            <TableHead className="font-semibold text-foreground">Tóm tắt</TableHead>
                            <TableHead className="text-right font-semibold text-foreground">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy ứng viên phù hợp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Sort by Score Descending
                            [...candidates].sort((a, b) => b.score - a.score).map((candidate) => (
                                <CandidateRow key={candidate.id} candidate={candidate} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function CandidateRow({ candidate }: { candidate: Candidate }) {
    const [isExpanded, setIsExpanded] = React.useState(false)

    return (
        <TableRow className="group hover:bg-muted/20 border-b-muted/50 last:border-0">
            {/* Candidate Name & Role */}
            <TableCell className="py-4">
                <div className="space-y-1">
                    <div className="font-bold text-base text-primary group-hover:underline decoration-2 underline-offset-2">
                        {candidate.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                        {candidate.experience_years > 5 ? "Senior Business Analyst" : "Business Analyst"}
                    </div>
                </div>
            </TableCell>

            {/* Match Score */}
            <TableCell>
                <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-black ${candidate.score >= 80 ? 'text-green-600' :
                        candidate.score >= 50 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                        {candidate.score}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/ 100</span>
                </div>
            </TableCell>

            {/* Experience */}
            <TableCell>
                <div className="space-y-1">
                    <div className="text-sm font-bold">{candidate.experience_years} năm</div>
                </div>
            </TableCell>

            {/* Skills */}
            <TableCell>
                <div className="flex flex-wrap gap-1.5 transition-all">
                    {(isExpanded ? candidate.skills_found : candidate.skills_found.slice(0, 3)).map((skill, i) => (
                        <Badge
                            key={i}
                            className="bg-nds-pink text-nds-pink-foreground hover:bg-nds-pink/80 border-nds-pink/20 rounded-md px-2 py-0.5 text-[10px] uppercase font-bold"
                        >
                            {skill}
                        </Badge>
                    ))}
                    {!isExpanded && candidate.skills_found.length > 3 && (
                        <Badge
                            variant="outline"
                            className="border-dashed text-[10px] text-muted-foreground hover:bg-muted cursor-pointer hover:text-foreground"
                            onClick={() => setIsExpanded(true)}
                        >
                            +{candidate.skills_found.length - 3}
                        </Badge>
                    )}
                    {isExpanded && candidate.skills_found.length > 3 && (
                        <Badge
                            variant="outline"
                            className="border-dashed text-[10px] text-muted-foreground hover:bg-muted cursor-pointer hover:text-foreground"
                            onClick={() => setIsExpanded(false)}
                        >
                            Thu gọn
                        </Badge>
                    )}
                </div>
            </TableCell>

            {/* Summary */}
            <TableCell className="max-w-[300px]">
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" title={candidate.summary}>
                    {candidate.summary}
                </p>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <CandidateProfile candidate={candidate}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--secondary)]/70 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-full transition-colors">
                        <Eye className="h-4 w-4" />
                    </Button>
                </CandidateProfile>
            </TableCell>
        </TableRow>
    )
}
