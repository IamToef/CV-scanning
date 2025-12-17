"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Candidate } from "@/types"
import { CandidateProfile } from "./candidate-profile"
import { Eye, UserCheck, UserX, Briefcase, Mail } from "lucide-react"

function getScoreColor(score: number) {
    if (score >= 8) return "bg-green-500"
    if (score >= 5) return "bg-yellow-500"
    return "bg-red-500"
}

function getScoreBorderColor(score: number) {
    if (score >= 8) return "border-green-200 dark:border-green-800"
    if (score >= 5) return "border-yellow-200 dark:border-yellow-800"
    return "border-red-200 dark:border-red-800"
}

interface CandidateCardViewProps {
    candidates: Candidate[]
}

export function CandidateCardView({ candidates }: CandidateCardViewProps) {
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

    const handleStatusUpdate = async (candidateId: string, newStatus: 'shortlisted' | 'rejected') => {
        setUpdatingStatus(candidateId)
        // TODO: Implement actual API call to update status
        // For now, just simulate delay
        await new Promise(resolve => setTimeout(resolve, 500))
        setUpdatingStatus(null)
    }

    if (candidates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Chưa có ứng viên</h3>
                <p className="text-muted-foreground max-w-md">
                    Tải lên CV để bắt đầu phân tích và đánh giá ứng viên.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
                <Card
                    key={candidate.id}
                    className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${getScoreBorderColor(candidate.score)} border-2`}
                >
                    <CardHeader className="pb-3">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                                <AvatarFallback className="text-lg font-bold">
                                    {candidate.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg leading-tight mb-1 truncate">
                                    {candidate.name}
                                </h3>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="break-all line-clamp-2" title={candidate.email}>{candidate.email}</span>
                                </div>
                                <Badge variant={
                                    candidate.status === 'shortlisted' ? 'default' :
                                        candidate.status === 'rejected' ? 'destructive' :
                                            'secondary'
                                } className="text-xs">
                                    {candidate.status === 'shortlisted' ? 'Đã chọn' :
                                        candidate.status === 'rejected' ? 'Từ chối' :
                                            candidate.status === 'analyzed' ? 'Đã phân tích' : 'Mới'}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pb-3">
                        {/* Score Section */}
                        <div className="space-y-2">
                            <div className="flex items-end justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Điểm phù hợp
                                </span>
                                <span className={`text-2xl font-extrabold ${candidate.score >= 8 ? 'text-green-600' :
                                    candidate.score >= 5 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    {candidate.score}<span className="text-sm text-muted-foreground">/10</span>
                                </span>
                            </div>
                            <Progress
                                value={candidate.score * 10}
                                className="h-2"
                                indicatorClassName={getScoreColor(candidate.score)}
                            />
                        </div>

                        {/* Experience */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Kinh nghiệm</span>
                            <span className="font-semibold">{candidate.experience_years} năm</span>
                        </div>

                        {/* Match Level */}
                        {candidate.match_level && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Mức độ</span>
                                <Badge variant="outline" className="font-medium">
                                    {candidate.match_level}
                                </Badge>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2 pt-3 border-t">
                        <CandidateProfile candidate={candidate}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full group-hover:border-primary/50 transition-colors"
                            >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                <span className="text-xs">Xem chi tiết</span>
                            </Button>
                        </CandidateProfile>

                        <div className="flex gap-2 w-full">
                            {candidate.status !== 'shortlisted' && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(candidate.id, 'shortlisted')}
                                    disabled={updatingStatus === candidate.id}
                                    className="flex-1"
                                >
                                    <UserCheck className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-xs">Liên hệ</span>
                                </Button>
                            )}

                            {candidate.status !== 'rejected' && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(candidate.id, 'rejected')}
                                    disabled={updatingStatus === candidate.id}
                                    className="flex-1"
                                >
                                    <UserX className="h-3.5 w-3.5 mr-1" />
                                    <span className="text-xs">Từ chối</span>
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
