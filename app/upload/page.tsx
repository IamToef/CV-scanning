"use client"

import { UploadZone } from "@/components/upload-zone"
import { useCandidates } from "@/components/candidate-context"
import { useRouter } from "next/navigation"
import { Candidate } from "@/types"

export default function UploadPage() {
    const { candidates, setCandidates, setSortConfig } = useCandidates()
    const router = useRouter()

    const handleAnalysisComplete = (newCandidates: Candidate[]) => {
        let updatedCandidates = [...candidates];

        newCandidates.forEach(newC => {
            // 1. Check by ID first (Most reliable for same file)
            const idIndex = updatedCandidates.findIndex(c => c.id === newC.id);

            if (idIndex !== -1) {
                // Update existing candidate by ID
                updatedCandidates[idIndex] = { ...newC, id: newC.id };
            } else {
                // 2. Check by Name (Legacy check for different files but same person)
                const nameIndex = updatedCandidates.findIndex(c =>
                    c.name.trim().toLowerCase() === newC.name.trim().toLowerCase()
                );

                if (nameIndex !== -1) {
                    // Update existing candidate: Keep old ID to preserve history
                    updatedCandidates[nameIndex] = { ...newC, id: updatedCandidates[nameIndex].id };
                } else {
                    // 3. Add new candidate
                    updatedCandidates.push(newC);
                }
            }
        });

        // 4. Final Safety: Ensure uniqueness by ID
        // This handles edge cases where logic might have missed something
        const uniqueIds = new Set();
        updatedCandidates = updatedCandidates.filter(c => {
            if (uniqueIds.has(c.id)) return false;
            uniqueIds.add(c.id);
            return true;
        });

        setCandidates(updatedCandidates);
        setSortConfig({ column: 'score', direction: 'desc' })
        // Redirect to Leaderboard after successful upload
        router.push('/leaderboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="space-y-4 text-center">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-sm pb-1 leading-relaxed">
                        Tải lên JD & Hồ sơ
                    </h1>
                    <p className="text-indigo-600/80 dark:text-indigo-400 font-medium text-lg">
                        Cung cấp Mô tả công việc (JD) và CV ứng viên để bắt đầu phân tích.
                    </p>
                </div>

                <UploadZone onAnalysisComplete={handleAnalysisComplete} />
            </div>
        </div>
    )
}
