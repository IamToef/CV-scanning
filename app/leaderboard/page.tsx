"use client"

import { useCandidates } from "@/components/candidate-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud, Trophy, Medal, Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CandidateProfile } from "@/components/candidate-profile"

export default function LeaderboardPage() {
    const { candidates } = useCandidates()

    // Sort descending by score
    const sortedCandidates = [...candidates].sort((a, b) => (b.score || 0) - (a.score || 0))

    const top3 = sortedCandidates.slice(0, 3)
    const rest = sortedCandidates.slice(3)

    // Helper for Position Colors
    const getPositionStyle = (index: number) => {
        switch (index) {
            case 0: return { color: "text-yellow-500", bg: "bg-yellow-100", border: "border-yellow-200", icon: <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" /> };
            case 1: return { color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", icon: <Medal className="h-6 w-6 text-slate-400 fill-slate-400" /> };
            case 2: return { color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200", icon: <Medal className="h-6 w-6 text-amber-600 fill-amber-600" /> };
            default: return { color: "text-slate-600", bg: "bg-white", border: "", icon: null };
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bảng Xếp Hạng</h1>
                    <p className="text-muted-foreground mt-2">
                        Top ứng viên tiềm năng nhất
                    </p>
                </div>
                <Link href="/upload">
                    <Button variant="outline" className="gap-2">
                        <UploadCloud className="h-4 w-4" />
                        Upload Mới
                    </Button>
                </Link>
            </div>

            {candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-muted/10 border-dashed">
                    <p className="text-muted-foreground mb-4">Chưa có ứng viên nào để xếp hạng.</p>
                    <Link href="/upload">
                        <Button>Bắt đầu Upload</Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* PODIUM SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-center max-w-5xl mx-auto min-h-[400px]">
                        {/* 2nd Place (Left) */}
                        {top3[1] && (
                            <div className="order-2 md:order-1 flex flex-col items-center cursor-pointer">
                                <CandidateProfile candidate={top3[1]}>
                                    <div>
                                        <PodiumCard candidate={top3[1]} rank={2} style={getPositionStyle(1)} />
                                    </div>
                                </CandidateProfile>
                            </div>
                        )}

                        {/* 1st Place (Center - Biggest) */}
                        {top3[0] && (
                            <div className="order-1 md:order-2 flex flex-col items-center -mt-8 z-10 w-full md:w-auto cursor-pointer">
                                <CandidateProfile candidate={top3[0]}>
                                    <div>
                                        <PodiumCard candidate={top3[0]} rank={1} style={getPositionStyle(0)} isFirst />
                                    </div>
                                </CandidateProfile>
                            </div>
                        )}

                        {/* 3rd Place (Right) */}
                        {top3[2] && (
                            <div className="order-3 md:order-3 flex flex-col items-center cursor-pointer">
                                <CandidateProfile candidate={top3[2]}>
                                    <div>
                                        <PodiumCard candidate={top3[2]} rank={3} style={getPositionStyle(2)} />
                                    </div>
                                </CandidateProfile>
                            </div>
                        )}
                    </div>

                    {/* THE REST OF THE LIST */}
                    {rest.length > 0 && (
                        <div className="max-w-4xl mx-auto mt-12 space-y-4">
                            <h3 className="text-xl font-semibold border-b pb-2">Danh sách còn lại</h3>
                            <div className="grid gap-3">
                                {rest.map((candidate, idx) => (
                                    <CandidateProfile key={candidate.id} candidate={candidate}>
                                        <div className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer w-full text-left">
                                            <div className="flex-none font-bold text-slate-400 w-8 text-center text-lg self-center">
                                                #{idx + 4}
                                            </div>
                                            <Avatar className="h-10 w-10 border self-center">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                                                <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">{candidate.name}</div>
                                                <div className="text-sm text-muted-foreground">{candidate.email}</div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right flex flex-col justify-center h-full">
                                                    <div className="font-bold text-slate-900 text-lg leading-none">{candidate.score}/100</div>
                                                    <div className="text-xs text-muted-foreground mt-1">{candidate.experience_years} năm KN</div>
                                                </div>
                                                <Badge variant={candidate.status === 'shortlisted' ? 'default' : 'secondary'} className="self-center">
                                                    {candidate.status === 'shortlisted' ? 'Đã chọn' : candidate.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CandidateProfile>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

function PodiumCard({ candidate, rank, style, isFirst = false }: { candidate: any, rank: number, style: any, isFirst?: boolean }) {
    return (
        <Card className={`relative flex flex-col items-center text-center w-full max-w-[280px] shadow-xl border-t-4 transition-all hover:-translate-y-2 ${isFirst ? 'scale-110 border-yellow-400 bg-gradient-to-b from-yellow-50/50 to-white' : 'bg-white'}`}
            style={{ borderColor: rank === 1 ? '#eab308' : rank === 2 ? '#94a3b8' : '#d97706' }}
        >
            <div className={`absolute -top-5 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white shadow-sm ${style.color} ${style.border}`}>
                <span className="font-black text-lg">{rank}</span>
            </div>
            <CardHeader className={`pt-12 pb-2 flex flex-col items-center w-full`}>
                <div className="mb-2">
                    {style.icon}
                </div>
                <Avatar className={`${isFirst ? 'h-24 w-24' : 'h-16 w-16'} border-4 ${style.border}`}>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`} />
                    <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </CardHeader>
            <CardContent className="space-y-1 pb-6 w-full">
                <h3 className={`font-bold ${isFirst ? 'text-xl' : 'text-lg'} truncate px-2`} title={candidate.name}>
                    {candidate.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate px-4">{candidate.email}</p>
                <div className="pt-2 flex flex-col gap-1 items-center">
                    <span className={`text-3xl font-extrabold ${style.color}`}>
                        {candidate.score}<span className="text-sm text-muted-foreground font-normal">/100</span>
                    </span>
                    <Badge variant="outline" className="bg-slate-50">
                        {candidate.experience_years} năm kinh nghiệm
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}
