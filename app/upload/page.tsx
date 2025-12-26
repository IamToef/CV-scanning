"use client"

import { UploadZone } from "@/components/upload-zone"
import { useCandidates } from "@/components/candidate-context"
import { useRouter } from "next/navigation"
import { Candidate } from "@/types"

export default function UploadPage() {
    const { candidates, setCandidates, setSortConfig } = useCandidates()
    const router = useRouter()

    const handleAnalysisComplete = (newCandidates: Candidate[]) => {
        setCandidates([...candidates, ...newCandidates])
        setSortConfig({ column: 'score', direction: 'desc' })
        // Redirect to Leaderboard after successful upload
        router.push('/leaderboard')
    }

    return (
        <div className="container mx-auto py-10 space-y-8 max-w-6xl">
            <div className="space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Tải lên JD & Hồ sơ</h1>
                <p className="text-muted-foreground">
                    Cung cấp Mô tả công việc (JD) và CV ứng viên để bắt đầu phân tích.
                </p>
            </div>

            <UploadZone onAnalysisComplete={handleAnalysisComplete} />
        </div>
    )
}
