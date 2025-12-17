"use client"

import { CandidateCardView } from "@/components/candidate-card-view"
import { useCandidates } from "@/components/candidate-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud } from "lucide-react"

export default function DashboardPage() {
    const { candidates } = useCandidates()

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">
                        Tổng quan hồ sơ ứng viên
                    </p>
                </div>
                <Link href="/upload">
                    <Button variant="outline" className="gap-2">
                        <UploadCloud className="h-4 w-4" />
                        Upload Mới
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col space-y-6">
                {/* Main Content: Card View (Full Width) */}
                {candidates.length > 0 ? (
                    <CandidateCardView candidates={candidates} />
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
