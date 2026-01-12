"use client"

import { useState } from "react"
import { CandidateCardView } from "@/components/candidate-card-view"
import { CandidateTable } from "@/components/candidate-table"
import { useCandidates } from "@/components/candidate-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud, LayoutGrid, List } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
    const { candidates } = useCandidates()
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                            Dashboard
                        </h1>
                        <p className="text-indigo-600/80 dark:text-indigo-400 font-medium mt-2 text-lg">
                            Tổng quan hồ sơ ứng viên
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* View Toggle */}
                        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="hidden sm:block">
                            <TabsList className="grid w-[100px] grid-cols-2 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 shadow-sm">
                                <TabsTrigger value="grid" className="data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400">
                                    <LayoutGrid className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="list" className="data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-900/30 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400">
                                    <List className="h-4 w-4" />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Link href="/upload">
                            <Button className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-white/90 dark:hover:bg-slate-700 border border-indigo-100 dark:border-slate-700 shadow-sm gap-2 font-semibold">
                                <UploadCloud className="h-4 w-4" />
                                Upload Mới
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Mobile View Toggle (Visible only on small screens) */}
                <div className="sm:hidden w-full">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-slate-800">
                            <TabsTrigger value="grid">
                                <LayoutGrid className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="list">
                                <List className="h-4 w-4" />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex flex-col space-y-6">
                    {candidates.length > 0 ? (
                        viewMode === 'grid' ? (
                            <CandidateCardView candidates={candidates} />
                        ) : (
                            <CandidateTable candidates={candidates} />
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 border rounded-3xl bg-white/50 dark:bg-slate-900/50 border-dashed border-indigo-200 dark:border-slate-700">
                            <p className="text-indigo-400 dark:text-slate-400 mb-4 font-medium">Chưa có dữ liệu ứng viên.</p>
                            <Link href="/upload">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none">Upload ngay</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
