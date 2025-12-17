"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Candidate } from '@/types'
import { APP_CONFIG } from '@/lib/config'

interface CandidateContextType {
    candidates: Candidate[]
    setCandidates: (candidates: Candidate[]) => void
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined)

export function CandidateProvider({ children }: { children: ReactNode }) {
    const [candidates, setCandidates] = useState<Candidate[]>(
        APP_CONFIG.useMockData
            ? [
                {
                    id: '1',
                    name: 'Nguyen Van A',
                    email: 'nguyenvana@example.com',
                    score: 88,
                    status: 'shortlisted',
                    summary:
                        'Strong background in React and Next.js. 5 years of experience.',
                    strengths: ['React', 'TypeScript', 'Leadership'],
                    weaknesses: ['Angular'],
                    skills_found: ['React', 'Next.js', 'PostgreSQL'],
                    skills_missing: ['Docker'],
                    experience_years: 5,
                },
                {
                    id: '2',
                    name: 'Tran Thi B',
                    email: 'tranthib@example.com',
                    score: 45,
                    status: 'rejected',
                    summary:
                        'Junior developer with potential but lacks required experience.',
                    strengths: ['Learning agility'],
                    weaknesses: ['Experience'],
                    skills_found: ['HTML', 'CSS'],
                    skills_missing: ['React', 'Node.js'],
                    experience_years: 1,
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
                    experience_years: 3,
                },
            ]
            : []
    )

    return (
        <CandidateContext.Provider value={{ candidates, setCandidates }}>
            {children}
        </CandidateContext.Provider>
    )
}

export function useCandidates() {
    const context = useContext(CandidateContext)
    if (context === undefined) {
        throw new Error('useCandidates must be used within a CandidateProvider')
    }
    return context
}
