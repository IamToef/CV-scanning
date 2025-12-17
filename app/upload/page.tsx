"use client"

import { UploadZone } from "@/components/upload-zone"
import { useCandidates } from "@/components/candidate-context"
import { useRouter } from "next/navigation"
import { Candidate } from "@/types"

export default function UploadPage() {
    const { setCandidates } = useCandidates()
    const router = useRouter()

    const handleAnalysisComplete = (newCandidates: Candidate[]) => {
        setCandidates(newCandidates)
        // Redirect to Leaderboard after successful upload
        router.push('/leaderboard')
    }

    return (
        <div className="container mx-auto py-10 space-y-8 max-w-4xl">
            <div className="space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Upload JD & CV</h1>
                <p className="text-muted-foreground">
                    Upload Job Description and Candidate CVs to start analysis.
                </p>
            </div>

            <UploadZone onAnalysisComplete={handleAnalysisComplete} />
        </div>
    )
}
