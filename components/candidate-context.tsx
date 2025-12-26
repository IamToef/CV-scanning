"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Candidate } from '@/types'
import { APP_CONFIG } from '@/lib/config'

interface CandidateContextType {
    candidates: Candidate[]
    setCandidates: (candidates: Candidate[]) => void
    jd: string
    setJd: (jd: string) => void
    sortConfig: { column: string, direction: 'asc' | 'desc' } | null
    setSortConfig: (config: { column: string, direction: 'asc' | 'desc' } | null) => void
    filters: Record<string, Set<string>>
    setFilters: (filters: Record<string, Set<string>>) => void
    numericFilters: Record<string, { operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq', value: number } | null>
    setNumericFilters: (filters: Record<string, { operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq', value: number } | null>) => void
    isInitialized: boolean
    resetData: () => void
    updateCandidateStatus: (id: string, status: 'shortlisted' | 'rejected' | 'new') => void
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined)

export function CandidateProvider({ children }: { children: ReactNode }) {
    const [isInitialized, setIsInitialized] = useState(false)
    const [candidates, setCandidates] = useState<Candidate[]>([])
    const [jd, setJd] = useState("")
    const [sortConfig, setSortConfig] = useState<{ column: string, direction: 'asc' | 'desc' } | null>({ column: 'score', direction: 'desc' })
    const [filters, setFilters] = useState<Record<string, Set<string>>>({
        name: new Set(),
        score: new Set(),
        status: new Set(),
        experience_years: new Set(),
        match_level: new Set()
    })
    const [numericFilters, setNumericFilters] = useState<Record<string, { operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq', value: number } | null>>({})

    // Load from localStorage on mount
    useEffect(() => {
        const storedCandidates = localStorage.getItem('candidates')
        const storedJd = localStorage.getItem('jd')
        const storedSort = localStorage.getItem('sortConfig')
        const storedFilters = localStorage.getItem('filters') // Need special handling for Sets

        if (storedCandidates) {
            setCandidates(JSON.parse(storedCandidates))
        } else if (APP_CONFIG.useMockData) {
            // Initial mock data if no storage
            setCandidates([
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
                    experience_years: 5,
                },
                // ... (rest of mock data can remain or be simplified as verified in previous steps, focusing on persistence logic here)
            ])
        }

        if (storedJd) setJd(storedJd)
        if (storedSort) setSortConfig(JSON.parse(storedSort))

        // Restore numeric filters
        const storedNumericFilters = localStorage.getItem('numericFilters')
        if (storedNumericFilters) {
            setNumericFilters(JSON.parse(storedNumericFilters))
        }

        setIsInitialized(true)
    }, [])

    // Update localStorage when state changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('candidates', JSON.stringify(candidates))
        }
    }, [candidates, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('jd', jd)
        }
    }, [jd, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('sortConfig', JSON.stringify(sortConfig))
        }
    }, [sortConfig, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('numericFilters', JSON.stringify(numericFilters))
        }
    }, [numericFilters, isInitialized])

    const resetData = () => {
        setCandidates([])
        setJd("")
        setSortConfig({ column: 'score', direction: 'desc' })
        setFilters({
            name: new Set(),
            score: new Set(),
            status: new Set(),
            experience_years: new Set(),
            match_level: new Set()
        })
        setNumericFilters({})

        localStorage.removeItem('candidates')
        localStorage.removeItem('jd')
        localStorage.removeItem('filters')
        localStorage.removeItem('numericFilters')
        localStorage.removeItem('sortConfig')
    }

    const updateCandidateStatus = (id: string, status: 'shortlisted' | 'rejected' | 'new') => {
        setCandidates(prev => prev.map(c =>
            c.id === id ? { ...c, status } : c
        ))
    }

    return (
        <CandidateContext.Provider value={{
            candidates,
            setCandidates,
            jd,
            setJd,
            sortConfig,
            setSortConfig,
            filters,
            setFilters,
            numericFilters,
            setNumericFilters,
            isInitialized,
            resetData,
            updateCandidateStatus
        }}>
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
