"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react'
import { Candidate, JobRequirements } from '@/types'
import { APP_CONFIG } from '@/lib/config'

interface CandidateContextType {
    candidates: Candidate[]
    setCandidates: Dispatch<SetStateAction<Candidate[]>>
    jd: string
    setJd: (jd: string) => void
    sortConfig: { column: string, direction: 'asc' | 'desc' } | null
    setSortConfig: (config: { column: string, direction: 'asc' | 'desc' } | null) => void
    filters: Record<string, Set<string>>
    setFilters: (filters: Record<string, Set<string>>) => void
    numericFilters: Record<string, { operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq', value: number } | null>
    setNumericFilters: (filters: Record<string, { operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq', value: number } | null>) => void

    // New persistent upload state
    jobRequirements: JobRequirements | null
    setJobRequirements: Dispatch<SetStateAction<JobRequirements | null>>
    uploadedFiles: File[]
    setUploadedFiles: Dispatch<SetStateAction<File[]>>
    uploadStep: 'jd' | 'cv'
    setUploadStep: Dispatch<SetStateAction<'jd' | 'cv'>>
    extractedRequirements: string[]
    setExtractedRequirements: Dispatch<SetStateAction<string[]>>
    selectedJDFile: File | null
    setSelectedJDFile: Dispatch<SetStateAction<File | null>>

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

    // Upload State
    const [jobRequirements, setJobRequirements] = useState<any | null>(null)
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [uploadStep, setUploadStep] = useState<'jd' | 'cv'>('jd')
    const [extractedRequirements, setExtractedRequirements] = useState<string[]>([])
    const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null)

    // Load from localStorage on mount
    useEffect(() => {
        const storedCandidates = localStorage.getItem('candidates')
        const storedJd = localStorage.getItem('jd')
        const storedSort = localStorage.getItem('sortConfig')

        // Restore upload state if available
        const storedJobReqs = localStorage.getItem('jobRequirements')
        const storedUploadStep = localStorage.getItem('uploadStep')
        const storedExtractedReqs = localStorage.getItem('extractedRequirements')

        if (storedCandidates) {
            setCandidates(JSON.parse(storedCandidates))
        } else if (APP_CONFIG.useMockData) {
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
            ])
        }

        if (storedJd) setJd(storedJd)
        if (storedSort) setSortConfig(JSON.parse(storedSort))
        if (storedJobReqs) setJobRequirements(JSON.parse(storedJobReqs))
        if (storedUploadStep) setUploadStep(storedUploadStep as 'jd' | 'cv')
        if (storedExtractedReqs) setExtractedRequirements(JSON.parse(storedExtractedReqs))

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

    // Persist Upload State
    useEffect(() => {
        if (isInitialized) {
            if (jobRequirements) localStorage.setItem('jobRequirements', JSON.stringify(jobRequirements))
            else localStorage.removeItem('jobRequirements')
        }
    }, [jobRequirements, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('uploadStep', uploadStep)
        }
    }, [uploadStep, isInitialized])

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('extractedRequirements', JSON.stringify(extractedRequirements))
        }
    }, [extractedRequirements, isInitialized])


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

        // Reset Upload State
        setJobRequirements(null)
        setUploadedFiles([])
        setUploadStep('jd')
        setExtractedRequirements([])
        setSelectedJDFile(null)

        localStorage.removeItem('candidates')
        localStorage.removeItem('jd')
        localStorage.removeItem('filters')
        localStorage.removeItem('numericFilters')
        localStorage.removeItem('sortConfig')

        // Remove Upload Persistence
        localStorage.removeItem('jobRequirements')
        localStorage.removeItem('uploadStep')
        localStorage.removeItem('extractedRequirements')
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

            // Upload State Exposed
            jobRequirements,
            setJobRequirements,
            uploadedFiles,
            setUploadedFiles,
            uploadStep,
            setUploadStep,
            extractedRequirements,
            setExtractedRequirements,
            selectedJDFile,
            setSelectedJDFile,

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
