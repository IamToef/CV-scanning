"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Candidate } from "@/types"
import { CandidateProfile } from "./candidate-profile"

function getScoreColor(score: number) {
    if (score >= 8) return "bg-green-500"
    if (score >= 5) return "bg-yellow-500"
    return "bg-red-500"
}

interface CandidateTableProps {
    candidates: Candidate[]
}

export function CandidateTable({ candidates }: CandidateTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[250px]">Ứng viên</TableHead>
                        <TableHead>Số điểm phù hợp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Kinh nghiệm</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                Không tìm thấy ứng viên. Tải CV để bắt đầu.
                            </TableCell>
                        </TableRow>
                    ) : (
                        candidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                                            <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold">{candidate.name}</div>
                                            <div className="text-xs text-muted-foreground">{candidate.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium">{candidate.score}/10</span>
                                        </div>
                                        {/* Scale 0-10 to 0-100 for Progress component */}
                                        <Progress value={candidate.score * 10} className="h-2" indicatorClassName={getScoreColor(candidate.score)} />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        candidate.status === 'shortlisted' ? 'default' :
                                            candidate.status === 'rejected' ? 'destructive' :
                                                'secondary'
                                    }>
                                        {candidate.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {candidate.experience_years} năm
                                </TableCell>
                                <TableCell className="text-right">
                                    <CandidateProfile candidate={candidate}>
                                        <Badge variant="outline" className="cursor-pointer hover:bg-muted">View Profile</Badge>
                                    </CandidateProfile>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
