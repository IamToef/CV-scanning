"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Candidate } from "@/types"
import { BrainCircuit, TrendingUp, AlertTriangle, Clock, Target, Sparkles, Users } from "lucide-react"
import { useMemo } from "react"

interface PipelineInsightsProps {
    candidates: Candidate[]
}

export function PipelineInsights({ candidates }: PipelineInsightsProps) {

    // 1. Calculate Statistics
    const stats = useMemo(() => {
        if (candidates.length === 0) return null;

        const total = candidates.length;
        const avgScore = Math.round(candidates.reduce((acc, c) => acc + (c.score || 0), 0) / total);
        const avgExp = (candidates.reduce((acc, c) => acc + (c.experience_years || 0), 0) / total).toFixed(1);

        // Skill Aggregation
        const skillCounts: Record<string, number> = {};
        candidates.forEach(c => {
            c.skills_found?.forEach(skill => {
                skillCounts[skill] = (skillCounts[skill] || 0) + 1;
            });
        });

        // Convert to array and sort
        const topSkills = Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, percentage: Math.round((count / total) * 100) }));

        // Simple "Time to Hire" Simulation
        let timeToHire = 45;
        candidates.forEach(c => {
            const s = c.score || 0;
            if (s >= 90) timeToHire -= 5;
            else if (s >= 80) timeToHire -= 2;
        });
        timeToHire = Math.max(5, timeToHire);

        // Confidence Level
        const confidence = avgScore >= 80 ? "Cao" : avgScore >= 60 ? "Trung bình" : "Thấp";

        return {
            total,
            avgScore,
            avgExp,
            topSkills,
            timeToHire,
            confidence
        };

    }, [candidates]);

    if (!stats) return null;

    // Dynamic font size for Confidence text to prevent truncation
    const confidenceFontSize = stats.confidence.length > 5 ? "text-2xl" : "text-4xl";

    return (
        <Card className="border-none shadow-xl bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-slate-900/50 relative overflow-hidden ring-1 ring-indigo-100 dark:ring-slate-800 mb-20 animate-in fade-in zoom-in duration-500">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <BrainCircuit className="w-64 h-64 text-indigo-600 dark:text-indigo-400" />
            </div>

            <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-black uppercase tracking-tight">
                            <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                            Sức khỏe Nguồn Tuyển dụng (AI Pipeline Health)
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                            Phân tích tổng quan chất lượng ứng viên và dự báo tuyển dụng
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white/60 dark:bg-slate-800/60 backdrop-blur text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-sm px-3 py-1">
                        Live Analysis
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 space-y-8">

                {/* Top Row: Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Quality Score */}
                    <div className="bg-white/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-indigo-50 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-1 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Chất lượng Pool</div>
                        <div className="text-4xl font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {stats.avgScore}
                            <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1">avg</span>
                        </div>
                        <Progress value={stats.avgScore} className="h-1.5 w-20 bg-slate-100 dark:bg-slate-700 mt-2" indicatorClassName={stats.avgScore >= 80 ? "bg-green-500" : stats.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"} />
                    </div>

                    {/* Time to Hire */}
                    <div className="bg-white/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-indigo-50 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-1 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Time-to-Hire
                        </div>
                        <div className="text-4xl font-black text-slate-800 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            ~{stats.timeToHire}
                            <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1">ngày</span>
                        </div>
                        <Badge variant="secondary" className="mt-1 text-[10px] h-5 px-2 bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-300">Dự báo</Badge>
                    </div>

                    {/* Avg Experience */}
                    <div className="bg-white/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-indigo-50 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-1 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Kinh nghiệm TB</div>
                        <div className="text-4xl font-black text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {stats.avgExp}
                            <span className="text-base font-medium text-slate-400 dark:text-slate-500 ml-1">năm</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            <Users className="w-3 h-3" /> {stats.total} ứng viên
                        </div>
                    </div>

                    {/* Success Probability */}
                    <div className="bg-white/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-indigo-50 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-1 group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                        <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <Target className="w-3 h-3" /> Khả năng Tuyển dụng
                        </div>
                        <div className={`font-black bg-clip-text text-transparent bg-gradient-to-br ${stats.confidence === 'Cao' ? 'from-green-500 to-emerald-700 dark:from-green-400 dark:to-emerald-500' : 'from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500'} ${confidenceFontSize} transition-all duration-300`}>
                            {stats.confidence}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center px-2 mt-1">Dựa trên chất lượng</p>
                    </div>
                </div>

                {/* Bottom Row: Insights & Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Insights Box */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Phát hiện Insight
                        </h4>
                        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-5 space-y-4 h-full flex flex-col justify-center">
                            <div className="flex gap-4 items-start">
                                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                    <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">AI</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        Pool ứng viên hiện tại mạnh về <span className="text-indigo-600 dark:text-indigo-400 font-bold">{stats.topSkills[0]?.name || 'N/A'}</span> nhưng thiếu các chứng chỉ cao cấp.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                    <span className="text-blue-600 dark:text-blue-400 font-bold text-xs">TIP</span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        Thời gian tuyển dụng dự kiến là <span className="text-green-600 dark:text-green-400 font-bold">{stats.timeToHire} ngày</span>. Cần thêm 2 ứng viên Senior để giảm xuống dưới 10 ngày.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Bar Chart */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            Phân bố Kỹ năng (Top 5)
                        </h4>

                        <div className="bg-white/50 dark:bg-slate-800/40 border border-indigo-50 dark:border-slate-700 rounded-xl p-5 space-y-4 h-full">
                            <TooltipProvider>
                                {stats.topSkills.map((skill, i) => (
                                    <Tooltip key={i}>
                                        <TooltipTrigger asChild>
                                            <div className="space-y-1.5 group cursor-pointer">
                                                <div className="flex justify-between items-center text-xs font-medium">
                                                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                        {skill.name}
                                                    </span>
                                                    <span className="text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                                                        {skill.percentage}%
                                                    </span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-100/80 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100 dark:ring-slate-700">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 rounded-full transition-all duration-1000 ease-out group-hover:scale-[1.02] origin-left shadow-sm"
                                                        style={{ width: `${skill.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="left">
                                            <p className="font-bold">{skill.name}</p>
                                            <p className="text-xs text-muted-foreground">Xuất hiện trong {skill.percentage}% hồ sơ</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
