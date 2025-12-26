"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCandidates } from "@/components/candidate-context"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, CloudUpload, FileType, CheckCircle2, X, ArrowRight, Sparkles, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { uploadJDAndCVs, extractRequirementsFromJD } from "@/lib/api"
import { Candidate } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface UploadZoneProps {
    onAnalysisComplete: (candidates: Candidate[]) => void
}

export function UploadZone({ onAnalysisComplete }: UploadZoneProps) {
    const { jd, setJd } = useCandidates()
    const [files, setFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)
    const [extractedRequirements, setExtractedRequirements] = useState<string[]>([])
    const [step, setStep] = useState<'jd' | 'cv'>('jd') // Progressive Disclosure

    // Drag States
    const [isDraggingJD, setIsDraggingJD] = useState(false)
    const [isDraggingCV, setIsDraggingCV] = useState(false)
    const [activeTab, setActiveTab] = useState("file")

    const jdInputRef = useRef<HTMLInputElement>(null)
    const cvInputRef = useRef<HTMLInputElement>(null)

    // Check if we already have JD data to restore state
    useEffect(() => {
        if (jd && step === 'jd' && extractedRequirements.length === 0) {
            // If JD exists but no reqs parsed (e.g. navigation back), try to parse simplistic bullets
            const lines = jd.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).slice(0, 5);
            if (lines.length > 0) setExtractedRequirements(lines.map(l => l.replace(/^[-•]\s*/, '')));
        }
    }, [jd, step]);

    const processJDFile = async (file: File) => {
        setIsExtracting(true)
        const toastId = toast.loading("Đang đọc mô tả công việc...")

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
                toast.success("Đã đọc xong JD!", { id: toastId })

                // Auto-extract logic
                analyzeRequirements(data.text);
            } else {
                throw new Error("No text found in file")
            }
        } catch (error: any) {
            console.error(error)
            toast.error("Không đọc được file JD", { id: toastId })
        } finally {
            setIsExtracting(false)
        }
    }

    const analyzeRequirements = async (text: string) => {
        const toastId = toast.loading("AI đang phân tích yêu cầu công việc...");
        try {
            const extractedText = await extractRequirementsFromJD(text);
            if (extractedText) {
                // Heuristic parsing of the bullets for the badge display
                const reqs = extractedText.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
                    .map(line => line.replace(/^[-•\d.]+\s*/, ''))
                    .filter(l => l.length > 5 && l.length < 100)
                    .slice(0, 6); // Take top 6

                setExtractedRequirements(reqs);
                setJd(extractedText); // Update JD with the structured version if desired, or keep original? 
                // Usually keeping the structured one is better for the prompting later.

                toast.success("Phân tích hoàn tất!", { id: toastId });
                setStep('cv'); // Auto-advance
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể phân tích yêu cầu (nhưng vẫn lưu nội dung gốc)", { id: toastId });
            setStep('cv'); // Advance anyway
        }
    };

    const handleJDFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processJDFile(e.target.files[0])
            e.target.value = ''
        }
    }

    const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles])
            toast.success(`Đã thêm ${newFiles.length} hồ sơ`)
            e.target.value = ''
        }
    }

    // Drag Handlers (Condensed)
    const handleDrag = (e: React.DragEvent, setDrag: (v: boolean) => void, onDrop: (f: FileLike[]) => void, type: 'jd' | 'cv') => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragover' || e.type === 'dragenter') setDrag(true);
        else if (e.type === 'dragleave' || e.type === 'drop') setDrag(false);

        if (e.type === 'drop' && e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files);
            if (type === 'jd' && files[0]) processJDFile(files[0]);
            if (type === 'cv') {
                const valid = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
                if (valid.length > 0) {
                    setFiles(p => [...p, ...valid]);
                    toast.success(`Đã thêm ${valid.length} CV`);
                } else toast.error("Chỉ chấp nhận file PDF");
            }
        }
    }

    const handleUpload = async () => {
        if (!jd || files.length === 0) return
        setIsUploading(true)
        const toastId = toast.loading("Đang chấm điểm hồ sơ...")
        try {
            const result = await uploadJDAndCVs(jd, files)
            if (result && result.candidates) {
                onAnalysisComplete(result.candidates)
                toast.success(`Hoàn tất! Đã chấm ${result.candidates.length} ứng viên.`, { id: toastId })
            } else {
                throw new Error("No candidates received")
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Lỗi xử lý", { id: toastId })
        } finally {
            setIsUploading(false)
        }
    }

    // RENDER: STEP 1 - JD INPUT
    if (step === 'jd') {
        return (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-border/50 shadow-lg bg-gradient-to-b from-card to-muted/20">
                    <CardHeader className="text-center pb-8 pt-8">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 text-primary animate-pulse">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-3xl font-bold">Bắt đầu tuyển dụng</CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Cung cấp mô tả công việc (JD) để AI hiểu tiêu chí đánh giá
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                                <TabsTrigger value="file" className="text-base">Tải file JD</TabsTrigger>
                                <TabsTrigger value="text" className="text-base">Dán văn bản</TabsTrigger>
                            </TabsList>

                            <TabsContent value="file" className="mt-0">
                                <div
                                    className={`
                                        group relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed 
                                        transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                                        ${isDraggingJD ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"}
                                    `}
                                    onDragOver={(e) => handleDrag(e, setIsDraggingJD, () => { }, 'jd')}
                                    onDragLeave={(e) => handleDrag(e, setIsDraggingJD, () => { }, 'jd')}
                                    onDrop={(e) => handleDrag(e, setIsDraggingJD, () => { }, 'jd')}
                                    onClick={() => jdInputRef.current?.click()}
                                >
                                    <input ref={jdInputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleJDFileChange} disabled={isExtracting} />

                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex flex-col items-center gap-4 text-center p-6 relative z-10 w-3/4">
                                        {isExtracting ? (
                                            <div className="flex flex-col items-center gap-4 w-full">
                                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                                <div className="space-y-1 w-full">
                                                    <p className="font-medium text-foreground">Đang phân tích JD...</p>
                                                    <SimulatedProgress duration={2000} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-4 rounded-full bg-background shadow-sm border group-hover:scale-110 transition-transform duration-300">
                                                    <CloudUpload className="h-8 w-8 text-primary" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-lg font-semibold text-foreground">
                                                        Kéo thả hoặc click để tải lên
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Hỗ trợ PDF, DOCX, TXT
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="mt-0">
                                <div className="space-y-4">
                                    <Textarea
                                        placeholder="Dán nội dung JD vào đây..."
                                        className="h-72 resize-none font-sans text-base leading-relaxed p-4 border-2 focus-visible:ring-0 focus-visible:border-primary/50"
                                        value={jd}
                                        onChange={(e) => setJd(e.target.value)}
                                    />
                                    <Button
                                        className="w-full h-12 text-base font-semibold"
                                        onClick={() => analyzeRequirements(jd)}
                                        disabled={!jd.trim() || isExtracting}
                                    >
                                        {isExtracting ? (
                                            <div className="flex items-center gap-2 w-full justify-center">
                                                <Loader2 className="animate-spin h-4 w-4" />
                                                <span>Đang xử lý...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Phân tích & Tiếp tục
                                            </>
                                        )}
                                    </Button>
                                    {isExtracting && activeTab === 'text' && <SimulatedProgress duration={1500} />}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // RENDER: STEP 2 - WORKSPACE (JD Summary + CV Upload)
    return (
        <div className="grid gap-8 lg:grid-cols-12 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Sidebar: Job Context (Col 4) */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden sticky top-4">
                    <CardHeader className="bg-primary/10 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                                <FileText className="h-5 w-5" />
                                JD Đang chọn
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setStep('jd')} className="h-8 w-8 p-0 rounded-full hover:bg-background/50" title="Chỉnh sửa JD">
                                <Edit2 className="h-4 w-4 text-primary" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {extractedRequirements.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tiêu chí phát hiện:</p>
                                <div className="flex flex-wrap gap-2">
                                    {extractedRequirements.map((req, i) => (
                                        <Badge key={i} variant="secondary" className="bg-background/80 hover:bg-background border-primary/20 text-foreground font-normal leading-normal py-1">
                                            {req}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Chưa trích xuất được tiêu chí cụ thể.</p>
                        )}

                        <div className="pt-4 border-t border-primary/10">
                            <p className="text-xs text-muted-foreground line-clamp-4">
                                {jd}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Area: CV Upload (Col 8) */}
            <div className="lg:col-span-8">
                <Card className="border-border/50 shadow-md h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <FileType className="h-6 w-6 text-primary" />
                            Upload Hồ Sơ Ứng Viên
                        </CardTitle>
                        <CardDescription>
                            Tải lên các file CV (PDF) để hệ thống tự động chấm điểm dựa trên JD.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div
                            className={`
                                relative flex flex-col items-center justify-center w-full h-56 rounded-xl border-2 border-dashed 
                                transition-all duration-300 ease-in-out cursor-pointer bg-muted/5
                                ${isDraggingCV ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"}
                            `}
                            onDragOver={(e) => handleDrag(e, setIsDraggingCV, () => { }, 'cv')}
                            onDragLeave={(e) => handleDrag(e, setIsDraggingCV, () => { }, 'cv')}
                            onDrop={(e) => handleDrag(e, setIsDraggingCV, () => { }, 'cv')}
                            onClick={() => cvInputRef.current?.click()}
                        >
                            <input ref={cvInputRef} type="file" multiple accept=".pdf" className="hidden" onChange={handleCVFileChange} />

                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="p-4 rounded-full bg-background shadow-sm text-primary">
                                    <CloudUpload className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">Chọn hoặc kéo thả CV vào đây</p>
                                    <p className="text-sm text-muted-foreground">Chỉ hỗ trợ PDF</p>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-sm font-semibold text-foreground">
                                        Đã chọn {files.length} file
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => setFiles([])} className="text-destructive h-8 text-xs hover:bg-destructive/10">
                                        Xóa tất cả
                                    </Button>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto space-y-2 p-1 pr-2 custom-scrollbar">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border rounded-lg hover:border-primary/30 transition-colors group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 rounded bg-white border shadow-sm">
                                                    <FileType className="h-4 w-4 text-red-500" />
                                                </div>
                                                <span className="truncate font-medium text-sm">{file.name}</span>
                                            </div>
                                            <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <Button
                                        onClick={handleUpload}
                                        className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-4"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang xử lý {files.length} hồ sơ...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                                Chấm điểm ngay
                                            </>
                                        )}
                                    </Button>
                                    {isUploading && <SimulatedProgress duration={5000} />}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Helper types for drag
interface FileLike {
    name: string;
    type: string;
}

// Simulated Progress Component
function SimulatedProgress({ duration = 3000 }: { duration?: number }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) return 100
                const diff = Math.random() * 10
                return Math.min(oldProgress + diff, 90)
            })
        }, duration / 10)

        return () => {
            clearInterval(timer)
        }
    }, [duration])

    return (
        <div className="w-full space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary/80 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-center text-muted-foreground animate-pulse">
                Đang xử lý... {Math.round(progress)}%
            </p>
        </div>
    )
}
