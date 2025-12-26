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
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Tổng quan hồ sơ ứng viên
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="hidden sm:block">
                        <TabsList className="grid w-[100px] grid-cols-2">
                            <TabsTrigger value="grid">
                                <LayoutGrid className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="list">
                                <List className="h-4 w-4" />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Link href="/upload">
                        <Button variant="outline" className="gap-2">
                            <UploadCloud className="h-4 w-4" />
                            Upload Mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Mobile View Toggle (Visible only on small screens) */}
            <div className="sm:hidden w-full">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
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
                    <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-muted/10 border-dashed">
                        <p className="text-muted-foreground mb-4">Chưa có dữ liệu ứng viên.</p>
                        <Link href="/upload">
                            <Button>Upload ngay</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
