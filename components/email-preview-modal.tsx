"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Candidate } from "@/types"
import { Send, Mail, Eye, Loader2, CheckCircle2, AlertCircle, Users } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useCandidates } from "@/components/candidate-context"
import dynamic from "next/dynamic"
const Editor = dynamic(() => import("react-simple-wysiwyg").then(mod => mod.DefaultEditor), {
    ssr: false,
    loading: () => <div className="h-[250px] w-full border rounded-md flex items-center justify-center text-slate-400 bg-slate-50">Đang tải công cụ soạn thảo...</div>
})

interface EmailData {
    to: string
    subject: string
    html: string
    text: string
}

function generateEmailForCandidate(candidate: Candidate, fallbackJobPosition?: string): EmailData {
    const name = candidate.name || "Ứng viên"
    const position = candidate.applied_role || fallbackJobPosition || "vị trí tuyển dụng"

    const html = `Dear ${name},<br><br>
Thank you very much for your interest in the <strong>${position}</strong> position at [Company Name] and for taking the time to submit your application. We truly appreciate the opportunity to review your profile.<br><br>

Our team will carefully review your CV and qualifications. Should your experience align with our current requirements, we will reach out to you within the next two weeks to discuss the next steps.<br><br>

In the meantime, you are welcome to learn more about [Company Name] and our mission by visiting our <a href="https://your-company.com/" style="color: #2563eb; text-decoration: underline;">Website</a>. You may also explore other career opportunities with us via our <a href="https://www.linkedin.com/company/your-company/jobs/" style="color: #2563eb; text-decoration: underline;">LinkedIn page</a>.<br><br>

Thank you again for considering [Company Name] as part of your career journey. We sincerely appreciate your interest and look forward to staying connected.<br><br>

Best regards,<br>
<b>HR Department - [Company Name].</b>`

    const text = `Dear ${name},
Thank you very much for your interest in the ${position} position at [Company Name] and for taking the time to submit your application. We truly appreciate the opportunity to review your profile.

Our team will carefully review your CV and qualifications. Should your experience align with our current requirements, we will reach out to you within the next two weeks to discuss the next steps.

In the meantime, you are welcome to learn more about [Company Name] and our mission by visiting our Website (https://your-company.com/). You may also explore other career opportunities with us via our LinkedIn page (https://www.linkedin.com/company/your-company/jobs/).

Thank you again for considering [Company Name] as part of your career journey. We sincerely appreciate your interest and look forward to staying connected.

Best regards,
HR Department - [Company Name].`

    return {
        to: candidate.email || "",
        subject: "[Company Name] Thank You for Your Application",
        html,
        text,
    }
}

async function sendEmail(data: EmailData): Promise<{ success: boolean; message?: string }> {
    const res = await fetch("/api/n8n/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const err = await res.text()
        throw new Error(err || "Failed to send email")
    }
    return res.json()
}

// Single candidate email preview
interface EmailPreviewModalProps {
    candidate: Candidate
    jobPosition?: string
    children: React.ReactNode
}

export function EmailPreviewModal({ candidate, jobPosition: propJobPosition, children }: EmailPreviewModalProps) {
    const { jobRequirements } = useCandidates()
    const finalJobPosition = candidate.applied_role || propJobPosition || jobRequirements?.job_position

    const [open, setOpen] = useState(false)
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [emailData, setEmailData] = useState<EmailData>({ to: "", subject: "", html: "", text: "" })
    const [activeTab, setActiveTab] = useState<string>("edit")

    useEffect(() => {
        if (open) {
            setEmailData(generateEmailForCandidate(candidate, finalJobPosition))
            setSent(false)
        }
    }, [open, candidate, finalJobPosition])

    const handleSend = async () => {
        if (!emailData.to) {
            toast.error("Vui lòng nhập email người nhận")
            return
        }
        setSending(true)
        try {
            await sendEmail(emailData)
            setSent(true)
            toast.success(`Đã gửi email thành công đến ${emailData.to}`)
            setTimeout(() => setOpen(false), 1500)
        } catch (err: any) {
            toast.error(`Gửi email thất bại: ${err.message}`)
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-indigo-600" />
                        Xem trước Email
                    </DialogTitle>
                    <DialogDescription>
                        Xem trước và chỉnh sửa nội dung email trước khi gửi đến <strong>{candidate.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                        <Label className="text-right text-sm font-semibold text-slate-500">Đến:</Label>
                        <Input
                            value={emailData.to}
                            onChange={(e) => setEmailData(p => ({ ...p, to: e.target.value }))}
                            placeholder="email@example.com"
                            className="font-mono text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                        <Label className="text-right text-sm font-semibold text-slate-500">Tiêu đề:</Label>
                        <Input
                            value={emailData.subject}
                            onChange={(e) => setEmailData(p => ({ ...p, subject: e.target.value }))}
                            className="font-semibold"
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="edit" className="gap-1.5">
                                <Mail className="h-3.5 w-3.5" /> Chỉnh sửa
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="gap-1.5">
                                <Eye className="h-3.5 w-3.5" /> Xem trước
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit" className="mt-3">
                            <div className="bg-white [&_.rsw-editor]:min-h-[250px] [&_.rsw-editor]:text-base [&_.rsw-editor]:font-sans border rounded-md">
                                <Editor
                                    value={emailData.html}
                                    onChange={(e) => setEmailData(p => ({ ...p, html: e.target.value, text: e.target.value.replace(/<[^>]*>/g, '').replace(/\n\n+/g, '\n\n') }))}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="preview" className="mt-3">
                            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950 min-h-[300px]">
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: emailData.html }} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || sent || !emailData.to}
                        className={cn(
                            "gap-2 min-w-[140px]",
                            sent ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
                        )}
                    >
                        {sending ? (
                            <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</>
                        ) : sent ? (
                            <><CheckCircle2 className="h-4 w-4" /> Đã gửi!</>
                        ) : (
                            <><Send className="h-4 w-4" /> Gửi email</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Bulk email modal
interface BulkEmailModalProps {
    candidates: Candidate[]
    jobPosition?: string
    children: React.ReactNode
}

export function BulkEmailModal({ candidates, jobPosition: propJobPosition, children }: BulkEmailModalProps) {
    const { jobRequirements } = useCandidates()
    const finalJobPosition = propJobPosition || jobRequirements?.job_position

    const [open, setOpen] = useState(false)
    const [sending, setSending] = useState(false)
    const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 })
    const [done, setDone] = useState(false)
    const [subject, setSubject] = useState("[Company Name] Thank You for Your Application")
    const [templateHtml, setTemplateHtml] = useState("")
    const [activeTab, setActiveTab] = useState<string>("edit")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const validCandidates = candidates.filter(c => c.email && c.email.includes("@"))

    useEffect(() => {
        if (open) {
            const sample = generateEmailForCandidate(
                { name: "{{TÊN ỨNG VIÊN}}", email: "", applied_role: "{{VỊ TRÍ}}" } as any,
                finalJobPosition || "{{VỊ TRÍ}}"
            )
            setTemplateHtml(sample.html)
            setSelectedIds(new Set(validCandidates.map(c => c.id)))
            setDone(false)
            setProgress({ sent: 0, failed: 0, total: 0 })
        }
    }, [open])

    const toggleCandidate = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleBulkSend = async () => {
        const toSend = validCandidates.filter(c => selectedIds.has(c.id))
        if (toSend.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 ứng viên")
            return
        }

        setSending(true)
        setProgress({ sent: 0, failed: 0, total: toSend.length })

        let sentCount = 0
        let failedCount = 0

        for (const candidate of toSend) {
            const position = candidate.applied_role || finalJobPosition || "vị trí tuyển dụng"
            const personalizedHtml = templateHtml
                .replace(/\{\{TÊN ỨNG VIÊN\}\}/g, candidate.name)
                .replace(/\{\{VỊ TRÍ\}\}/g, position)
            const personalizedText = personalizedHtml.replace(/<[^>]*>/g, "").replace(/\n\n+/g, "\n\n")

            try {
                await sendEmail({
                    to: candidate.email,
                    subject: subject.replace(/\{\{TÊN ỨNG VIÊN\}\}/g, candidate.name).replace(/\{\{VỊ TRÍ\}\}/g, position),
                    html: personalizedHtml,
                    text: personalizedText,
                })
                sentCount++
            } catch {
                failedCount++
            }
            setProgress({ sent: sentCount, failed: failedCount, total: toSend.length })
        }

        setDone(true)
        setSending(false)

        if (failedCount === 0) {
            toast.success(`Đã gửi thành công ${sentCount} email!`)
        } else {
            toast.warning(`Gửi ${sentCount} thành công, ${failedCount} thất bại`)
        }
    }

    const previewHtml = templateHtml
        .replace(/\{\{TÊN ỨNG VIÊN\}\}/g, validCandidates[0]?.name || "Nguyễn Văn A")
        .replace(/\{\{VỊ TRÍ\}\}/g, finalJobPosition || validCandidates[0]?.applied_role || "Business Analyst")

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        Gửi Email hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Gửi email đến {validCandidates.length} ứng viên. Sử dụng <code className="bg-slate-100 px-1 rounded text-xs">{"{{TÊN ỨNG VIÊN}}"}</code> và <code className="bg-slate-100 px-1 rounded text-xs">{"{{VỊ TRÍ}}"}</code> để tự động thay thế.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Candidate selection */}
                    <div>
                        <Label className="text-sm font-semibold mb-2 block">
                            Chọn ứng viên ({selectedIds.size}/{validCandidates.length})
                        </Label>
                        <div className="border rounded-lg max-h-[150px] overflow-y-auto p-2 space-y-1">
                            {validCandidates.map(c => (
                                <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(c.id)}
                                        onChange={() => toggleCandidate(c.id)}
                                        className="rounded border-slate-300"
                                    />
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-muted-foreground text-xs">{c.email}</span>
                                </label>
                            ))}
                            {validCandidates.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-3">
                                    Không có ứng viên nào có email hợp lệ
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                        <Label className="text-right text-sm font-semibold text-slate-500">Tiêu đề:</Label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="font-semibold"
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="edit" className="gap-1.5">
                                <Mail className="h-3.5 w-3.5" /> Chỉnh sửa Template
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="gap-1.5">
                                <Eye className="h-3.5 w-3.5" /> Xem trước
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="edit" className="mt-3">
                            <div className="bg-white [&_.rsw-editor]:min-h-[200px] [&_.rsw-editor]:text-base [&_.rsw-editor]:font-sans border rounded-md">
                                <Editor
                                    value={templateHtml}
                                    onChange={(e) => setTemplateHtml(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Dùng <code className="bg-slate-100 px-1 rounded">{"{{TÊN ỨNG VIÊN}}"}</code> và <code className="bg-slate-100 px-1 rounded">{"{{VỊ TRÍ}}"}</code> để cá nhân hóa.
                            </p>
                        </TabsContent>
                        <TabsContent value="preview" className="mt-3">
                            <div className="border rounded-lg p-6 bg-white dark:bg-slate-950 min-h-[250px]">
                                <p className="text-xs text-muted-foreground mb-3 border-b pb-2">
                                    Xem trước cho: <strong>{validCandidates[0]?.name || "Ứng viên"}</strong>
                                </p>
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Progress */}
                    {(sending || done) && (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Tiến trình gửi email</span>
                                <span className="text-muted-foreground">
                                    {progress.sent + progress.failed}/{progress.total}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((progress.sent + progress.failed) / Math.max(progress.total, 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex gap-4 text-xs">
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> {progress.sent} thành công
                                </span>
                                {progress.failed > 0 && (
                                    <span className="text-red-600 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> {progress.failed} thất bại
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
                        {done ? "Đóng" : "Hủy"}
                    </Button>
                    {!done && (
                        <Button
                            onClick={handleBulkSend}
                            disabled={sending || selectedIds.size === 0}
                            className="gap-2 min-w-[160px] bg-indigo-600 hover:bg-indigo-700"
                        >
                            {sending ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</>
                            ) : (
                                <><Send className="h-4 w-4" /> Gửi {selectedIds.size} email</>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
