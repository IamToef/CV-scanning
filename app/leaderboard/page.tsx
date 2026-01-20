"use client"

import { useCandidates } from "@/components/candidate-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud, Trophy, Medal, Crown, ChevronRight, Download } from "lucide-react"
import ExcelJS from "exceljs"
import { saveAs } from "file-saver"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CandidateProfile } from "@/components/candidate-profile"
import { cn } from "@/lib/utils"
import { Candidate } from "@/types"
import { PipelineInsights } from "@/components/pipeline-insights"


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

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Candidates");

        // Define columns
        worksheet.columns = [
            { header: "Tên", key: "name", width: 25 },
            { header: "Vị trí", key: "position", width: 25 },
            { header: "Email", key: "email", width: 30 },
            { header: "SĐT", key: "phone", width: 15 },
            { header: "Link CV", key: "cv_link", width: 40 },
            { header: "Điểm", key: "score", width: 10 },
            { header: "Kinh nghiệm (năm)", key: "experience", width: 15 },
            { header: "Trạng thái", key: "status", width: 15 },
            { header: "Kỹ năng", key: "skills", width: 50 },
            { header: "Tóm tắt", key: "summary", width: 80 },
        ];

        // Add rows
        sortedCandidates.forEach(c => {
            worksheet.addRow({
                name: c.name,
                position: (c.experience_years || 0) > 5 ? "Senior Business Analyst" : "Business Analyst",
                email: c.email || "",
                phone: c.phone || "",
                cv_link: c.link_cv || "",
                score: c.score,
                experience: c.experience_years,
                status: c.status === 'shortlisted' ? 'Phù hợp' : c.status === 'rejected' ? 'Đã loại' : 'Mới',
                skills: c.skills_found.join(", "),
                summary: c.scoring_reason || c.summary
            });
        });

        // Apply styles (Wrap text)
        worksheet.getColumn('skills').alignment = { wrapText: true, vertical: 'top' };
        worksheet.getColumn('summary').alignment = { wrapText: true, vertical: 'top' };

        // Header style
        worksheet.getRow(1).font = { bold: true };

        // Generate and download file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, "Danh_sach_ung_vien.xlsx");
    };

    return (
        // Main Container
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 space-y-10 transition-colors duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100 mb-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                            Bảng Xếp Hạng Tuyển Dụng AI
                        </span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        Xếp hạng thời gian thực dựa trên phân tích AI
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <Link href="/upload">
                        <Button className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-white/90 dark:hover:bg-slate-700 border border-indigo-100 dark:border-slate-700 shadow-sm gap-2 w-full">
                            <UploadCloud className="h-4 w-4" />
                            Upload Mới
                        </Button>
                    </Link>
                    <Button onClick={handleExport} variant="outline" className="bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 border border-indigo-100 dark:border-slate-700 shadow-sm gap-2 w-full">
                        <Download className="h-4 w-4" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* AI Pipeline Insights Widget */}
            {processedCandidates.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <PipelineInsights candidates={processedCandidates} />
                </div>
            )}

            {candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border rounded-3xl bg-white/50 dark:bg-slate-900/50 border-dashed border-indigo-200 dark:border-slate-800">
                    <p className="text-indigo-400 dark:text-indigo-300 mb-4 font-medium">Chưa có ứng viên nào để xếp hạng.</p>
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
                                        className="h-[360px] bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/50 shadow-[0_8px_30px_rgb(59,130,246,0.15)] rounded-3xl"
                                        barColor="bg-gradient-to-t from-blue-400 to-cyan-300"
                                    />
                                </div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                                <div className="w-80 relative z-20 order-2 -mt-16 transform hover:-translate-y-2 transition-transform duration-300">
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-6xl animate-bounce">👑</div>
                                    <PodiumCard
                                        candidate={top3[0]}
                                        rank={1}
                                        className="h-[360px] bg-white dark:bg-slate-900 border-2 border-yellow-200 dark:border-yellow-900/50 shadow-[0_10px_40px_rgb(250,204,21,0.25)] ring-4 ring-yellow-100/50 dark:ring-yellow-900/30 rounded-3xl"
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
                                        className="h-[360px] bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-orange-900/50 shadow-[0_8px_30px_rgb(249,115,22,0.15)] rounded-3xl"
                                        barColor="bg-gradient-to-t from-orange-400 to-red-300"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Remaining List */}
                    {rest.length > 0 && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 dark:border-slate-800 shadow-xl space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                                        <Trophy className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Các ứng viên tiềm năng khác</h2>
                                </div>

                                <div className="grid gap-4">
                                    {rest.map((candidate, i) => (
                                        <div
                                            key={candidate.id}
                                            className="group flex items-center justify-between p-5 bg-white dark:bg-slate-800 border border-indigo-50 dark:border-slate-700 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {i + 4}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-14 w-14 border-2 border-white dark:border-slate-600 shadow-sm">
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 font-bold">
                                                            {candidate.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{candidate.name}</h3>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
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
                                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase">Điểm</span>
                                                            <span className={`font-bold text-2xl ${(candidate.score || 0) >= 80 ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500' :
                                                                (candidate.score || 0) >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-red-500 dark:text-red-400'
                                                                }`}>
                                                                {candidate.score}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800 font-semibold w-24 justify-center py-1">
                                                            {candidate.experience_years} năm KN
                                                        </Badge>
                                                    </div>
                                                    <Badge
                                                        variant={candidate.status === 'shortlisted' ? 'default' : 'secondary'}
                                                        className={`self-center px-4 py-1.5 rounded-full ${candidate.status === 'shortlisted' ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-200 dark:shadow-none border-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                                                    >
                                                        {candidate.status === 'shortlisted' ? 'Đã chọn' : candidate.status}
                                                    </Badge>
                                                </div>

                                                <CandidateProfile candidate={candidate}>
                                                    <Button variant="ghost" size="icon" className="text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all rounded-full h-10 w-10">
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
                rank === 1 ? "border-yellow-100 dark:border-yellow-900/50 ring-2 ring-yellow-400 dark:ring-yellow-500" :
                    rank === 2 ? "border-blue-100 dark:border-blue-900/50 ring-2 ring-blue-400 dark:ring-blue-500" :
                        "border-orange-100 dark:border-orange-900/50 ring-2 ring-orange-400 dark:ring-orange-500"
            )}>
                <AvatarFallback className="text-3xl font-black bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                    {candidate.name.charAt(0)}
                </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1 z-10 w-full mb-auto">
                <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 px-2 leading-tight" title={candidate.name}>
                    {candidate.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{candidate.experience_years} năm Exp</p>
                <div className="pt-2">
                    <Badge className={cn("px-4 py-1 text-base font-bold shadow-sm border-none",
                        rank === 1 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50" :
                            rank === 2 ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50" :
                                "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50"
                    )}>
                        {candidate.score} điểm
                    </Badge>
                </div>
            </div>

            {/* Resume Button */}
            <div className="w-full mt-6 z-10">
                <CandidateProfile candidate={candidate}>
                    <Button className={cn("w-full font-bold shadow-md hover:shadow-lg transition-all border-none h-11 rounded-xl",
                        rank === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-white hover:from-amber-500 hover:to-yellow-600 shadow-yellow-500/20" :
                            rank === 2 ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-600 shadow-blue-500/20" :
                                "bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 shadow-orange-500/20"
                    )}>
                        Xem hồ sơ
                    </Button>
                </CandidateProfile>
            </div>
        </div>
    )
}
