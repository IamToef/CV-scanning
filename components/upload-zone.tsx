"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCandidates } from "@/components/candidate-context"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, CloudUpload, FileType, CheckCircle2, X, ArrowRight, Sparkles, Edit2, Briefcase, GraduationCap, Code2, Users, Save } from "lucide-react"
import { toast } from "sonner"
import { uploadJDAndCVs, extractRequirementsFromJD } from "@/lib/api"
import { Candidate, JobRequirements } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Input } from "@/components/ui/input"

interface UploadZoneProps {
    onAnalysisComplete: (candidates: Candidate[]) => void
}

export function UploadZone({ onAnalysisComplete }: UploadZoneProps) {
    // Destructure everything from context
    const {
        jd, setJd,
        jobRequirements, setJobRequirements,
        uploadedFiles: files, setUploadedFiles: setFiles, // Alias to match existing code
        uploadStep: step, setUploadStep: setStep,
        extractedRequirements, setExtractedRequirements,
        selectedJDFile, setSelectedJDFile
    } = useCandidates()

    const [isUploading, setIsUploading] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)

    // Drag States
    const [isDraggingJD, setIsDraggingJD] = useState(false)
    const [isDraggingCV, setIsDraggingCV] = useState(false)
    // Edit States
    const [isEditingCriteria, setIsEditingCriteria] = useState(false)
    const [editForm, setEditForm] = useState<JobRequirements>({
        technical_skills: [],
        soft_skills: [],
        years_of_experience: { min_years: 0, description: "" },
        education: { degree_level: "", major: "", certifications: [] }
    })

    const [activeTab, setActiveTab] = useState("file")

    const jdInputRef = useRef<HTMLInputElement>(null)
    const cvInputRef = useRef<HTMLInputElement>(null)

    // Check if we already have JD data to restore logic for badge display or sync
    useEffect(() => {
        if (jd && step === 'jd' && extractedRequirements.length === 0 && !jobRequirements) {
            // If JD exists but no reqs parsed (e.g. simplified text mode), try simple bullet parse
            const lines = jd.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).slice(0, 5);
            if (lines.length > 0) setExtractedRequirements(lines.map(l => l.replace(/^[-•]\s*/, '')));
        }
    }, [jd, step, jobRequirements, extractedRequirements]);

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
                await analyzeRequirements(data.text);
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
            const result = await extractRequirementsFromJD(text);

            // Handle Structured Data
            if (result.job_requirements) {
                setJobRequirements(result.job_requirements);
                setJd(JSON.stringify(result.job_requirements, null, 2)); // Save structured JSON as JD text for API consistency? Or keep raw Text?
                // Ideally keep raw text OR meaningful summary for the CV matching prompt.
                // For now, let's keep the raw text if available in result, or fall back to the stringified requirements
                if (result.raw_text) setJd(result.raw_text);

                toast.success("Phân tích hoàn tất!", { id: toastId });
                setStep('cv');
                return;
            }

            // Fallback: Old String Summary
            if (result.summary) {
                // Heuristic parsing of the bullets for the badge display
                const reqs = result.summary.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))
                    .map(line => line.replace(/^[-•\d.]+\s*/, ''))
                    .filter(l => l.length > 5 && l.length < 100)
                    .slice(0, 6); // Take top 6

                setExtractedRequirements(reqs);
                setJd(result.summary);
                toast.success("Phân tích hoàn tất!", { id: toastId });
                setStep('cv');
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể phân tích yêu cầu (nhưng vẫn lưu nội dung gốc)", { id: toastId });
            setStep('cv'); // Advance anyway
        }
    };

    const handleJDFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedJDFile(e.target.files[0])
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
            if (type === 'jd' && files[0]) setSelectedJDFile(files[0]); // Change to set state
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
                setFiles([]); // Clear files after successful processing
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
                                    onClick={() => !selectedJDFile && jdInputRef.current?.click()}
                                >
                                    <input ref={jdInputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={handleJDFileChange} disabled={isExtracting} />

                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex flex-col items-center gap-4 text-center p-6 relative z-10 w-3/4">
                                        {isExtracting ? (
                                            <ScanningAnimation />
                                        ) : selectedJDFile ? (
                                            <div className="flex flex-col items-center gap-4 w-full animate-in zoom-in-95 duration-300">
                                                <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                                                    <FileText className="h-10 w-10" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-lg text-foreground break-all px-4 line-clamp-1">{selectedJDFile.name}</p>
                                                    <p className="text-sm text-muted-foreground">{(selectedJDFile.size / 1024).toFixed(0)} KB</p>
                                                </div>
                                                <div className="flex gap-3 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedJDFile(null);
                                                        }}
                                                    >
                                                        Thay đổi
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            processJDFile(selectedJDFile);
                                                        }}
                                                        className="min-w-[140px]"
                                                    >
                                                        Xác nhận & Phân tích
                                                    </Button>
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
                <Card className="border-primary/20 bg-primary/5 shadow-none sticky top-4 max-h-[calc(100vh-14rem)] flex flex-col">
                    <CardHeader className="bg-primary/10 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                                <FileText className="h-5 w-5" />
                                {isEditingCriteria ? "Chỉnh sửa tiêu chí" : "JD Đang chọn"}
                            </CardTitle>
                            {!isEditingCriteria && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    // Initialize form
                                    if (jobRequirements) {
                                        setEditForm(JSON.parse(JSON.stringify(jobRequirements)));
                                    } else {
                                        // Try to parse from fallback bullets
                                        setEditForm({
                                            technical_skills: extractedRequirements,
                                            soft_skills: [],
                                            years_of_experience: { min_years: 0, description: "" },
                                            education: { degree_level: "", major: "", certifications: [] }
                                        })
                                    }
                                    setIsEditingCriteria(true)
                                }} className="h-8 w-8 p-0 rounded-full hover:bg-background/50" title="Chỉnh sửa JD">
                                    <Edit2 className="h-4 w-4 text-primary" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4 overflow-y-auto custom-scrollbar">

                        {isEditingCriteria ? (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-primary flex items-center gap-2">
                                        <Code2 className="h-3 w-3" /> Kỹ năng chuyên môn
                                    </label>
                                    <Textarea
                                        value={editForm.technical_skills.join('\n')}
                                        onChange={(e) => setEditForm(p => ({ ...p, technical_skills: e.target.value.split('\n') }))}
                                        placeholder="Mỗi kỹ năng một dòng (VD: ReactJS, Figma...)"
                                        className="h-24 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-primary flex items-center gap-2">
                                        <Users className="h-3 w-3" /> Kỹ năng mềm
                                    </label>
                                    <Textarea
                                        value={editForm.soft_skills.join('\n')}
                                        onChange={(e) => setEditForm(p => ({ ...p, soft_skills: e.target.value.split('\n') }))}
                                        placeholder="Mỗi kỹ năng một dòng"
                                        className="h-24 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-primary flex items-center gap-2">
                                        <Briefcase className="h-3 w-3" /> Kinh nghiệm
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* <Input
                                            type="number"
                                            placeholder="Số năm"
                                            value={editForm.years_of_experience.min_years || ''}
                                            onChange={(e) => setEditForm(p => ({ ...p, years_of_experience: { ...p.years_of_experience, min_years: parseFloat(e.target.value) || 0 } }))}
                                        /> */}
                                        <Textarea
                                            className="col-span-3 h-24 text-sm"
                                            placeholder="Mô tả (VD: Kinh nghiệm làm Product)"
                                            value={editForm.years_of_experience.description}
                                            onChange={(e) => setEditForm(p => ({ ...p, years_of_experience: { ...p.years_of_experience, description: e.target.value } }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-primary flex items-center gap-2">
                                        <GraduationCap className="h-3 w-3" /> Học vấn
                                    </label>
                                    <Textarea
                                        placeholder="Bằng cấp / Chuyên ngành (VD: Đại học CNTT...)"
                                        value={editForm.education.major}
                                        onChange={(e) => setEditForm(p => ({ ...p, education: { ...p.education, major: e.target.value } }))}
                                        className="h-24 text-sm"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsEditingCriteria(false)}>
                                        <X className="h-4 w-4 mr-1" /> Hủy
                                    </Button>
                                    <Button size="sm" className="flex-1" onClick={() => {
                                        // Clean up arrays before saving
                                        const cleanForm = {
                                            ...editForm,
                                            technical_skills: editForm.technical_skills.filter(l => l.trim()),
                                            soft_skills: editForm.soft_skills.filter(l => l.trim())
                                        };
                                        setJobRequirements(cleanForm);
                                        // Force update JD string to new structured format for API consistency
                                        setJd(JSON.stringify(cleanForm, null, 2));
                                        // Clear legacy requirements to force structured view
                                        setExtractedRequirements([]);
                                        setIsEditingCriteria(false);
                                        toast.success("Đã cập nhật tiêu chí!");
                                    }}>
                                        <Save className="h-4 w-4 mr-1" /> Lưu
                                    </Button>

                                </div>
                            </div>
                        ) : jobRequirements ? (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                {/* Technical Skills */}
                                {jobRequirements.technical_skills?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                            <Code2 className="h-4 w-4" />
                                            <span>Kỹ năng chuyên môn</span>
                                        </div>
                                        <ul className="space-y-1.5 pl-1">
                                            {jobRequirements.technical_skills.map((skill, i) => (
                                                <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                    <span className="leading-snug">{skill}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <Separator className="bg-primary/10" />

                                {/* Experience */}
                                {jobRequirements.years_of_experience && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                            <Briefcase className="h-4 w-4" />
                                            <span>Kinh nghiệm</span>
                                        </div>
                                        <div className="pl-6 text-sm text-foreground/80 leading-relaxed">
                                            {/* {(jobRequirements.years_of_experience.min_years || 0) > 0 && (
                                                <span className="font-semibold text-foreground mr-1">
                                                    {jobRequirements.years_of_experience.min_years} năm:
                                                </span>
                                            )} */}
                                            {jobRequirements.years_of_experience.description.includes('\n') ? (
                                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                                    {jobRequirements.years_of_experience.description.split('\n').map((line, i) => (
                                                        <li key={i}>{line}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span>{jobRequirements.years_of_experience.description}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Separator className="bg-primary/10" />

                                {/* Education */}
                                {jobRequirements.education && (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                            <GraduationCap className="h-4 w-4" />
                                            <span>Học vấn</span>
                                        </div>
                                        <div className="pl-6 text-sm text-foreground/80 leading-relaxed">
                                            {jobRequirements.education.degree_level && <p className="font-medium">{jobRequirements.education.degree_level}</p>}
                                            {jobRequirements.education.major.includes('\n') ? (
                                                <ul className="list-disc pl-4 mt-1 space-y-1">
                                                    {jobRequirements.education.major.split('\n').map((line, i) => (
                                                        <li key={i}>{line}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p>{jobRequirements.education.major}</p>
                                            )}

                                            {jobRequirements.education.certifications?.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    CC: {jobRequirements.education.certifications.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Separator className="bg-primary/10" />

                                {/* Soft Skills */}
                                {jobRequirements.soft_skills?.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                            <Users className="h-4 w-4" />
                                            <span>Kỹ năng mềm</span>
                                        </div>
                                        <ul className="space-y-1.5 pl-1">
                                            {jobRequirements.soft_skills.map((skill, i) => (
                                                <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                                    <span className="leading-snug">{skill}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : extractedRequirements.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tiêu chí phát hiện:</p>
                                <div className="flex flex-wrap gap-2">
                                    {extractedRequirements.map((req, i) => (
                                        <Badge key={i} variant="secondary" className="bg-background/80 hover:bg-background border-primary/20 text-foreground font-normal leading-normal py-1.5 whitespace-normal h-auto text-left max-w-full">
                                            {req}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Chưa trích xuất được tiêu chí cụ thể.</p>
                        )}

                        {!jobRequirements && (
                            <div className="pt-4 border-t border-primary/10">
                                <p className="text-xs text-muted-foreground line-clamp-4">
                                    {jd}
                                </p>
                            </div>
                        )}
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

// Scanning Animation Component
function ScanningAnimation() {
    const [text, setText] = useState("Đang đọc tài liệu...")

    useEffect(() => {
        const texts = ["Đang đọc tài liệu...", "Phân tích kỹ năng...", "Trích xuất yêu cầu...", "Đang tổng hợp..."]
        let i = 0
        const interval = setInterval(() => {
            i = (i + 1) % texts.length
            setText(texts[i])
        }, 1200)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative flex flex-col items-center justify-center w-full py-8">
            {/* Document Icon Container */}
            <div className="relative w-24 h-32 bg-background border-2 border-primary/20 rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(var(--primary),0.1)]">
                <FileText className="w-10 h-10 text-primary/30" />

                {/* Content Lines Simulation */}
                <div className="absolute top-8 left-4 right-4 space-y-2 opacity-30">
                    <div className="h-1.5 w-full bg-primary/40 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-primary/40 rounded-full" />
                    <div className="h-1.5 w-5/6 bg-primary/40 rounded-full" />
                    <div className="h-1.5 w-full bg-primary/40 rounded-full" />
                </div>

                {/* Moving Scan Line */}
                <div
                    className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(var(--primary),0.6)] animate-[scan_2s_linear_infinite]"
                    style={{ animationName: 'scan' }}
                />
                <style jsx>{`
                    @keyframes scan {
                        0% { top: 0%; opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { top: 100%; opacity: 0; }
                    }
                `}</style>
            </div>

            {/* Status Text */}
            <div className="mt-6 flex flex-col items-center gap-2">
                <p className="font-medium text-primary animate-pulse transition-all duration-300 min-w-[150px] text-center">
                    {text}
                </p>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                </div>
            </div>
        </div>
    )
}
