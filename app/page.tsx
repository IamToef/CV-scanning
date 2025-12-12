"use client"

import { useState } from "react"
import { UploadZone } from "@/components/upload-zone"
import { CandidateTable } from "@/components/candidate-table"
import { ChatInterface } from "@/components/chat-interface"
import { Candidate } from "@/types"
import { APP_CONFIG } from "@/lib/config"

export default function Home() {
  // Initial Mock Data
  const [candidates, setCandidates] = useState<Candidate[]>(APP_CONFIG.useMockData ? [
    {
      id: '1',
      name: 'Nguyen Van A',
      email: 'nguyenvana@example.com',
      score: 88,
      status: 'shortlisted',
      summary: 'Strong background in React and Next.js. 5 years of experience.',
      strengths: ['React', 'TypeScript', 'Leadership'],
      weaknesses: ['Angular'],
      skills_found: ['React', 'Next.js', 'PostgreSQL'],
      skills_missing: ['Docker'],
      experience_years: 5
    },
    {
      id: '2',
      name: 'Tran Thi B',
      email: 'tranthib@example.com',
      score: 45,
      status: 'rejected',
      summary: 'Junior developer with potential but lacks required experience.',
      strengths: ['Learning agility'],
      weaknesses: ['Experience'],
      skills_found: ['HTML', 'CSS'],
      skills_missing: ['React', 'Node.js'],
      experience_years: 1
    },
    {
      id: '3',
      name: 'Le Van C',
      email: 'levanc@example.com',
      score: 72,
      status: 'analyzed',
      summary: 'Solid backend skills, transitioning to fullstack.',
      strengths: ['Node.js', 'SQL'],
      weaknesses: ['Frontend UI'],
      skills_found: ['Node.js', 'Express', 'React'],
      skills_missing: ['Tailwind'],
      experience_years: 3
    }
  ] : [])

  const handleAnalysisComplete = (newCandidates: Candidate[]) => {
    setCandidates(newCandidates)
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-background/95 supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 h-14 flex items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="#">
              <span className="hidden font-bold sm:inline-block">TalentIQ</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 space-y-8">

        {/* Section 1: Ingestion */}
        <section>
          <UploadZone onAnalysisComplete={handleAnalysisComplete} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 2: Leaderboard */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Candidate Leaderboard</h2>
              <div className="text-sm text-muted-foreground">
                {candidates?.length || 0} Scored Candidates
              </div>
            </div>
            <CandidateTable candidates={candidates} />
          </div>

          {/* Section 3: Chat */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
            <ChatInterface />
          </div>
        </div>

      </main>
    </div>
  )
}
