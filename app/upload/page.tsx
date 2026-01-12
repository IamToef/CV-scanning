"use client"

import { UploadZone } from "@/components/upload-zone"
import { useCandidates } from "@/components/candidate-context"
import { useRouter } from "next/navigation"
import { Candidate } from "@/types"

export default function UploadPage() {
    const { candidates, setCandidates, setSortConfig } = useCandidates()
    const router = useRouter()

    const handleAnalysisComplete = (newCandidates: Candidate[]) => {
        const updatedCandidates = [...candidates];

        newCandidates.forEach(newC => {
            const index = updatedCandidates.findIndex(c =>
                c.name.trim().toLowerCase() === newC.name.trim().toLowerCase()
            );

            if (index !== -1) {
                // Update existing candidate: Keep old ID, update all other fields
                updatedCandidates[index] = { ...newC, id: updatedCandidates[index].id };
            } else {
                // Add new candidate
                updatedCandidates.push(newC);
            }
        });

        setCandidates(updatedCandidates);
        setSortConfig({ column: 'score', direction: 'desc' })
        // Redirect to Leaderboard after successful upload
        router.push('/leaderboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="space-y-4 text-center">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm pb-1 leading-relaxed">
                        Tải lên JD & Hồ sơ
                    </h1>
                    <p className="text-indigo-600/80 font-medium text-lg">
                        Cung cấp Mô tả công việc (JD) và CV ứng viên để bắt đầu phân tích.
                    </p>
                </div>

                <UploadZone onAnalysisComplete={handleAnalysisComplete} />
            </div>
        </div>
    )
}
