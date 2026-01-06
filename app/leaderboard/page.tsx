"use client"

import { useCandidates } from "@/components/candidate-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud, Trophy, Medal, Crown, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CandidateProfile } from "@/components/candidate-profile"
import { cn } from "@/lib/utils"
import { Candidate } from "@/types"

export default function LeaderboardPage() {
    const { candidates } = useCandidates()

    // Process Candidates with Score Logic (Same as Dashboard)
    const processedCandidates = candidates.map(candidate => {
        const details = candidate.score_details || candidate.reasoning || {};

        const exp = Number(details.experience_score) || 0;
        const skill = Number(details.skills_score) || 0;
        const profScore = Math.round((exp + skill) / 2);

        const edu = Number(details.education_score) || 0;
        const pot = Number(details.potential_score) || 0;
        const potScore = Math.round((edu + pot) / 2);

        // Calculate Total Score
        const calculatedScore = Math.round((profScore + potScore) / 2);

        return {
            ...candidate,
            // Use calculated score if available, otherwise fallback to existing
            score: calculatedScore > 0 ? calculatedScore : (candidate.score || 0)
        };
    });

    // Sort descending by score
    const sortedCandidates = [...processedCandidates].sort((a, b) => (b.score || 0) - (a.score || 0))

    const top3 = sortedCandidates.slice(0, 3)
    const rest = sortedCandidates.slice(3)

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm pb-1 leading-relaxed">
                        Bảng Xếp Hạng Ứng Viên
                    </h1>
                    <p className="text-indigo-600/80 font-medium text-lg">
                        Top những ứng viên xuất sắc nhất cho vị trí của bạn
                    </p>
                </div>
                <Link href="/upload">
                    <Button className="bg-white text-indigo-600 hover:bg-white/90 border border-indigo-100 shadow-sm gap-2">
                        <UploadCloud className="h-4 w-4" />
                        Upload Mới
                    </Button>
                </Link>
            </div>

            {candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border rounded-3xl bg-white/50 border-dashed border-indigo-200">
                    <p className="text-indigo-400 mb-4 font-medium">Chưa có ứng viên nào để xếp hạng.</p>
                    <Link href="/upload">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">Bắt đầu Upload</Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Top 3 Podium */}
                    {top3.length > 0 && (
                        <div className="flex justify-center items-end gap-6 mb-16 relative pt-12">
                            {/* 2nd Place */}
                            {top3[1] && (
                                <div className="w-72 relative z-10 order-1 transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl animate-bounce delay-100">🥈</div>
                                    <PodiumCard
                                        candidate={top3[1]}
                                        rank={2}
                                        className="h-[360px] bg-white border-2 border-blue-100 shadow-[0_8px_30px_rgb(59,130,246,0.15)] rounded-3xl"
                                        barColor="bg-gradient-to-t from-blue-400 to-cyan-300"
                                    />
                                </div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                                <div className="w-80 relative z-20 order-2 -mt-12 transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-6xl animate-bounce">👑</div>
                                    <PodiumCard
                                        candidate={top3[0]}
                                        rank={1}
                                        className="h-[420px] bg-white border-2 border-yellow-200 shadow-[0_10px_40px_rgb(250,204,21,0.25)] ring-4 ring-yellow-100/50 rounded-3xl"
                                        barColor="bg-gradient-to-t from-yellow-400 to-amber-300"
                                    />
                                </div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                                <div className="w-72 relative z-10 order-3 transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-4xl animate-bounce delay-200">🥉</div>
                                    <PodiumCard
                                        candidate={top3[2]}
                                        rank={3}
                                        className="h-[340px] bg-white border-2 border-orange-100 shadow-[0_8px_30px_rgb(249,115,22,0.15)] rounded-3xl"
                                        barColor="bg-gradient-to-t from-orange-400 to-red-300"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Remaining List */}
                    {rest.length > 0 && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 p-2 rounded-lg">
                                        <Trophy className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">Các ứng viên tiềm năng khác</h2>
                                </div>

                                <div className="grid gap-4">
                                    {rest.map((candidate, i) => (
                                        <div
                                            key={candidate.id}
                                            className="group flex items-center justify-between p-5 bg-white border border-indigo-50 rounded-2xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {i + 4}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold">
                                                            {candidate.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{candidate.name}</h3>
                                                        <p className="text-sm text-slate-500 font-medium">
                                                            {candidate.experience_years} năm kinh nghiệm
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score & Badge */}
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right flex items-center gap-3">
                                                        <div className="flex flex-col items-end w-16">
                                                            <span className="text-xs text-slate-400 font-medium uppercase">Điểm</span>
                                                            <span className={`font-bold text-2xl ${(candidate.score || 0) >= 80 ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600' :
                                                                (candidate.score || 0) >= 50 ? 'text-amber-500' : 'text-red-500'
                                                                }`}>
                                                                {candidate.score}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100 font-semibold w-24 justify-center py-1">
                                                            {candidate.experience_years} năm KN
                                                        </Badge>
                                                    </div>
                                                    <Badge
                                                        variant={candidate.status === 'shortlisted' ? 'default' : 'secondary'}
                                                        className={`self-center px-4 py-1.5 rounded-full ${candidate.status === 'shortlisted' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-200 border-none' : 'bg-slate-100 text-slate-600'}`}
                                                    >
                                                        {candidate.status === 'shortlisted' ? 'Đã chọn' : candidate.status}
                                                    </Badge>
                                                </div>

                                                <CandidateProfile candidate={candidate}>
                                                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-full h-10 w-10">
                                                        <ChevronRight className="h-6 w-6" />
                                                    </Button>
                                                </CandidateProfile>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function PodiumCard({ candidate, rank, className, barColor }: { candidate: Candidate, rank: number, className?: string, barColor?: string }) {
    return (
        <div className={cn("relative flex flex-col p-6 items-center", className)}>
            {/* Glowing header effect */}
            <div className={`absolute top-0 left-0 right-0 h-32 opacity-20 bg-gradient-to-b ${rank === 1 ? 'from-yellow-300' : rank === 2 ? 'from-blue-300' : 'from-orange-300'
                } to-transparent rounded-t-3xl`} />

            <Avatar className={cn("h-28 w-28 border-4 shadow-xl z-10 mb-4",
                rank === 1 ? "border-yellow-100 ring-2 ring-yellow-400" :
                    rank === 2 ? "border-blue-100 ring-2 ring-blue-400" :
                        "border-orange-100 ring-2 ring-orange-400"
            )}>
                <AvatarFallback className="text-3xl font-black bg-white text-slate-800">
                    {candidate.name.charAt(0)}
                </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1 z-10 w-full mb-auto">
                <h3 className="font-bold text-xl text-slate-900 px-2 leading-tight" title={candidate.name}>
                    {candidate.name}
                </h3>
                <p className="text-slate-500 font-medium">{candidate.experience_years} năm Exp</p>
                <div className="pt-2">
                    <Badge className={cn("px-4 py-1 text-base font-bold shadow-sm border-none",
                        rank === 1 ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                            rank === 2 ? "bg-blue-50 text-blue-700 hover:bg-blue-100" :
                                "bg-orange-50 text-orange-700 hover:bg-orange-100"
                    )}>
                        {candidate.score} điểm
                    </Badge>
                </div>
            </div>

            {/* Resume Button */}
            <div className="w-full mt-6 z-10">
                <CandidateProfile candidate={candidate}>
                    <Button className={cn("w-full font-bold shadow-md hover:shadow-lg transition-all border-none h-11 rounded-xl",
                        rank === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600" :
                            rank === 2 ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-600" :
                                "bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500"
                    )}>
                        Xem hồ sơ
                    </Button>
                </CandidateProfile>
            </div>
        </div>
    )
}
