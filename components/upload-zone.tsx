"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { uploadJDAndCVs } from "@/lib/api"
import { Candidate } from "@/types"

interface UploadZoneProps {
    onAnalysisComplete: (candidates: Candidate[]) => void
}

export function UploadZone({ onAnalysisComplete }: UploadZoneProps) {
    const [jd, setJd] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)
    const [isDraggingJD, setIsDraggingJD] = useState(false)
    const [isDraggingCV, setIsDraggingCV] = useState(false)
    const jdInputRef = useRef<HTMLInputElement>(null)
    const cvInputRef = useRef<HTMLInputElement>(null)

    const processJDFile = async (file: File) => {
        setIsExtracting(true)
        const toastId = toast.loading("Extracting text from JD...")

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/extract-text', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Failed to extract text')

            const data = await res.json()
            if (data.text) {
                setJd(data.text)
                toast.success("JD text extracted successfully", { id: toastId })
            } else {
                throw new Error("No text found in file")
            }
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to read JD file", { id: toastId })
        } finally {
            setIsExtracting(false)
        }
    }

    const handleJDFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processJDFile(e.target.files[0])
            // Reset input value
            e.target.value = ''
        }
    }

    const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            console.log('[UploadZone] Files selected via input:', newFiles.map(f => f.name))
            setFiles(prev => [...prev, ...newFiles])
            toast.success(`Added ${newFiles.length} file(s)`)
            e.target.value = ''
        }
    }

    const handleJDDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingJD(true)
    }

    const handleJDDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingJD(false)
    }

    const handleJDDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingJD(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
            const fileExtension = file.name.split('.').pop()?.toLowerCase()

            if (validTypes.includes(file.type) || ['pdf', 'docx', 'doc', 'txt'].includes(fileExtension || '')) {
                processJDFile(file)
            } else {
                toast.error("Invalid file type. Please upload a PDF, DOCX, or TXT file.")
            }
        }
    }

    const handleCVDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingCV(true)
    }

    const handleCVDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingCV(false)
    }

    const handleCVDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingCV(false)

        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(file => {
                const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
                const fileExtension = file.name.split('.').pop()?.toLowerCase()
                return validTypes.includes(file.type) || ['pdf', 'docx', 'doc'].includes(fileExtension || '')
            })

            if (newFiles.length > 0) {
                setFiles(prev => [...prev, ...newFiles])
                toast.success(`Added ${newFiles.length} file(s)`)
            } else {
                toast.error("No valid CV files found (PDF/DOCX required)")
            }
        }
    }

    const handleUpload = async () => {
        if (!jd || files.length === 0) return

        setIsUploading(true)
        const toastId = toast.loading("Uploading and analyzing CVs...")

        try {
            const result = await uploadJDAndCVs(jd, files)
            if (result && result.candidates) {
                onAnalysisComplete(result.candidates)
                toast.success(`Analysis complete! Processed ${result.candidates.length} candidates.`, { id: toastId })
            } else {
                throw new Error("No candidates received from analysis")
            }
            // Optional: Clear files? setFiles([])
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to analyze CVs", { id: toastId })
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>1. Upload JD</CardTitle>
                    <CardDescription>Paste the Job Description (JD) below or upload a file.</CardDescription>
                </CardHeader>
                <CardContent
                    className={`space-y-4 transition-colors duration-200 ${isDraggingJD ? "bg-muted/50 border-primary/50 border-2 border-dashed rounded-lg" : ""}`}
                    onDragOver={handleJDDragOver}
                    onDragLeave={handleJDDragLeave}
                    onDrop={handleJDDrop}
                >
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="jd-upload" className="text-xs text-muted-foreground">
                            Upload a file (PDF/DOCX/TXT) or paste text below
                        </Label>
                        <input
                            id="jd-upload"
                            type="file"
                            accept=".pdf,.docx,.doc,.txt"
                            onChange={handleJDFileChange}
                            disabled={isUploading || isExtracting}
                            className="hidden"
                            ref={jdInputRef}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => jdInputRef.current?.click()}
                            disabled={isUploading || isExtracting}
                            className="w-fit"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            {isExtracting ? "Extracting..." : "Upload JD File"}
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Paste complete JD content here... or drag and drop a file"
                        className={`h-[300px] resize-none font-mono text-sm ${isDraggingJD ? "pointer-events-none" : ""}`}
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        disabled={isUploading}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Upload CVs</CardTitle>
                    <CardDescription>Select candidate resumes (PDF/DOCX) to analyze.</CardDescription>
                </CardHeader>
                <CardContent
                    className={`space-y-4 transition-colors duration-200 ${isDraggingCV ? "bg-muted/50 border-primary/50 border-2 border-dashed rounded-lg" : ""}`}
                    onDragOver={handleCVDragOver}
                    onDragLeave={handleCVDragLeave}
                    onDrop={handleCVDrop}
                >
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="cv-upload" className="text-xs text-muted-foreground">
                            Upload CVs (PDF/DOCX) or drag & drop below
                        </Label>
                        <input
                            id="cv-upload"
                            type="file"
                            multiple
                            accept=".pdf,.docx,.doc"
                            onChange={handleCVFileChange}
                            disabled={isUploading}
                            className="hidden"
                            ref={cvInputRef}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cvInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-fit"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload CVs
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
                            {files.length > 0 && !isUploading && (
                                <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="h-auto p-0 text-destructive text-xs">Clear</Button>
                            )}
                        </div>
                        <div className="h-[150px] w-full rounded-md border p-2 overflow-y-auto space-y-1 bg-muted/50">
                            {files.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-xs">
                                    <Upload className="h-8 w-8 mb-2 opacity-50" />
                                    <span>No files selected</span>
                                </div>
                            ) : (
                                files.map((file, i) => (
                                    <div key={i} className="flex items-center text-sm p-1 hover:bg-background rounded">
                                        <FileText className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <Button onClick={handleUpload} className="w-full" disabled={!jd || files.length === 0 || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" /> Run AI Scoring
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
