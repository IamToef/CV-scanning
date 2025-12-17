"use client"

import { CandidateTable } from "@/components/candidate-table"
import { useCandidates } from "@/components/candidate-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UploadCloud } from "lucide-react"

export default function LeaderboardPage() {
    const { candidates } = useCandidates()

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bảng xếp hạng ứng viên</h1>
                    <p className="text-muted-foreground mt-2">
                        {candidates.length} ứng viên đã được đánh giá
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/upload">
                        <Button variant="outline" className="gap-2">
                            <UploadCloud className="h-4 w-4" />
                            Upload Mới
                        </Button>
                    </Link>
                </div>
            </div>

            {candidates.length > 0 ? (
                <CandidateTable candidates={candidates} />
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border rounded-lg bg-muted/10 border-dashed">
                    <p className="text-muted-foreground mb-4">Chưa có ứng viên nào.</p>
                    <Link href="/upload">
                        <Button>Bắt đầu Upload</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
