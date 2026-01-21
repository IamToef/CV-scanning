"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Candidate } from "@/types"
import { CandidateProfile } from "./candidate-profile"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Check, Filter, Eye, X, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCandidates } from "@/components/candidate-context"
import * as XLSX from "xlsx"


interface CandidateTableProps {
    candidates: Candidate[]
}
// ... (existing code) ...


export function CandidateTable({ candidates }: CandidateTableProps) {
    const [selectedSkills, setSelectedSkills] = React.useState<string[]>([])

    // Extract unique skills
    const uniqueSkills = React.useMemo(() => {
        const skills = new Set<string>()
        candidates.forEach(c => c.skills_found.forEach(s => skills.add(s)))
        return Array.from(skills).sort()
    }, [candidates])

    // Filter candidates
    const filteredCandidates = React.useMemo(() => {
        if (selectedSkills.length === 0) return candidates
        return candidates.filter(candidate =>
            selectedSkills.every(skill => candidate.skills_found.includes(skill))
        )
    }, [candidates, selectedSkills])

    // Calculate Scores and Sort
    const sortedCandidates = React.useMemo(() => {
        const processed = filteredCandidates.map(c => {
            const details = c.score_details || c.reasoning || {};
            const exp = Number(details.experience_score) || 0;
            const skill = Number(details.skills_score) || 0;
            const edu = Number(details.education_score) || 0;
            const pot = Number(details.potential_score) || 0;

            // Calculate Total Score Average
            const prof = Math.round((exp + skill) / 2);
            const potential = Math.round((edu + pot) / 2);
            const displayScore = Math.round((prof + potential) / 2);

            // Use calculated score if valid, else fallback
            const finalScore = displayScore > 0 ? displayScore : (c.score || 0);

            return { ...c, score: finalScore };
        });

        return processed.sort((a, b) => b.score - a.score);
    }, [filteredCandidates]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        )
    }

    const handleExportExcel = () => {
        const exportData = sortedCandidates.map(c => {
            // Helper to join arrays with newlines
            const formatList = (min?: string[]) => min?.join("\n- ") ? "- " + min.join("\n- ") : "";
            const details = c.score_details || c.reasoning || {};

            return {
                "Họ tên": c.name,
                "Vị trí": c.experience_years > 5 ? "Senior Business Analyst" : "Business Analyst",
                "Email": c.email,
                "SDT": c.phone || "",
                "Tổng điểm": c.score,
                "Điểm Kinh nghiệm": details.experience_score || 0,
                "Điểm Kỹ năng": details.skills_score || 0,
                "Điểm Học vấn": details.education_score || 0,
                "Điểm Tiềm năng": details.potential_score || 0,
                "Số năm kinh nghiệm": c.experience_years,
                "Trạng thái": c.status === 'shortlisted' ? 'Phù hợp' : c.status === 'rejected' ? 'Đã loại' : 'Mới',
                "Tóm tắt hồ sơ": c.scoring_reason || c.summary,
                "Ưu điểm": formatList(c.pros || c.strengths),
                "Nhược điểm": formatList(c.cons || c.weaknesses),
                "Kỹ năng phù hợp": c.skills_found.join(", "),
                "Kỹ năng còn thiếu": c.skills_missing?.join(", ") || "",
                "Câu hỏi chuyên môn": formatList(c.technical_questions),
                "Câu hỏi kỹ năng mềm": formatList(c.soft_skill_questions),
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Auto-width columns
        const colWidths = [
            { wch: 20 }, // Name
            { wch: 20 }, // Role
            { wch: 25 }, // Email
            { wch: 15 }, // Phone
            { wch: 10 }, // Total Score
            { wch: 15 }, // Exp Score
            { wch: 15 }, // Skill Score
            { wch: 15 }, // Edu Score
            { wch: 15 }, // Pot Score
            { wch: 10 }, // Exp Years
            { wch: 15 }, // Status
            { wch: 50 }, // Summary
            { wch: 40 }, // Pros
            { wch: 40 }, // Cons
            { wch: 40 }, // Skills Found
            { wch: 40 }, // Skills Missing
            { wch: 50 }, // Tech Questions
            { wch: 50 }, // Soft Questions
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Danh sách chi tiết");

        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Danh_sach_ung_vien_CHITIET_${date}.xlsx`);
    }



    return (
        <div className="space-y-4">
            {/* Header Section matches Image 1 */}
            {/* Header Section matches Image 1 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent inline-block">Danh sách ứng viên</h2>
                    <p className="text-muted-foreground">Quản lý và theo dõi kết quả phân tích</p>
                </div>
                <Button variant="outline" onClick={handleExportExcel} className="gap-2">
                    <Download className="h-4 w-4" />
                    Xuất Excel
                </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/50 border-b-2 border-purple-100">
                        <TableRow className="hover:bg-transparent border-b-input">
                            <TableHead className="w-[250px] font-semibold text-foreground">Ứng viên</TableHead>
                            <TableHead className="font-semibold text-foreground">Điểm phù hợp</TableHead>
                            <TableHead className="font-semibold text-foreground">Kinh nghiệm</TableHead>
                            <TableHead className="font-semibold text-foreground">Trạng thái</TableHead>
                            <TableHead className="w-[300px] font-semibold text-foreground">
                                <div className="flex items-center gap-2">
                                    Kỹ năng
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                                                <Filter className={`h-4 w-4 ${selectedSkills.length > 0 ? "text-primary fill-primary" : ""}`} />
                                                {selectedSkills.length > 0 && (
                                                    <span className="ml-1 rounded-full bg-primary w-4 h-4 text-[10px] flex items-center justify-center text-primary-foreground">
                                                        {selectedSkills.length}
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Tìm kỹ năng..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy kỹ năng.</CommandEmpty>
                                                    <CommandGroup>
                                                        {uniqueSkills.map((skill) => {
                                                            const isSelected = selectedSkills.includes(skill)
                                                            return (
                                                                <CommandItem
                                                                    key={skill}
                                                                    onSelect={() => toggleSkill(skill)}
                                                                >
                                                                    <div className={cn(
                                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                                    )}>
                                                                        <Check className={cn("h-4 w-4")} />
                                                                    </div>
                                                                    <span>{skill}</span>
                                                                </CommandItem>
                                                            )
                                                        })}
                                                    </CommandGroup>
                                                    {selectedSkills.length > 0 && (
                                                        <>
                                                            <CommandSeparator />
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    onSelect={() => setSelectedSkills([])}
                                                                    className="justify-center text-center"
                                                                >
                                                                    Xóa bộ lọc
                                                                </CommandItem>
                                                            </CommandGroup>
                                                        </>
                                                    )}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-foreground">Lí do chấm điểm</TableHead>
                            <TableHead className="text-right font-semibold text-foreground">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy ứng viên phù hợp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedCandidates.map((candidate) => (
                                <CandidateRow key={candidate.id} candidate={candidate} />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function CandidateRow({ candidate }: { candidate: Candidate }) {
    const { deleteCandidate } = useCandidates()
    const [isExpanded, setIsExpanded] = React.useState(false)

    return (
        <TableRow className="group hover:bg-muted/20 border-b-muted/50 last:border-0">
            {/* Candidate Name & Role */}
            <TableCell className="py-4">
                <div className="space-y-1">
                    <div className="font-bold text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                        {candidate.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                        {candidate.experience_years > 5 ? "Senior Business Analyst" : "Business Analyst"}
                    </div>
                </div>
            </TableCell>

            {/* Match Score */}
            <TableCell>
                <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-black bg-clip-text text-transparent bg-gradient-to-r ${candidate.score >= 80 ? 'from-purple-600 via-pink-500 to-orange-500' :
                        candidate.score >= 50 ? 'from-orange-500 to-amber-500' :
                            'from-red-500 to-pink-600'
                        }`}>
                        {candidate.score}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/ 100</span>
                </div>
            </TableCell>

            {/* Experience */}
            <TableCell>
                <div className="space-y-1">
                    <div className="text-sm font-bold">{candidate.experience_years} năm</div>
                </div>
            </TableCell>

            {/* Status */}
            <TableCell>
                <Badge
                    variant="outline"
                    className={cn(
                        "capitalize border-0 font-bold",
                        candidate.status === 'shortlisted' ? "bg-green-100 text-green-700" :
                            candidate.status === 'rejected' ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                    )}
                >
                    {candidate.status === 'shortlisted' ? 'Phù hợp' :
                        candidate.status === 'rejected' ? 'Đã loại' :
                            'Mới'}
                </Badge>
            </TableCell>

            {/* Skills */}
            <TableCell>
                <div className="flex flex-wrap gap-1.5 transition-all">
                    {candidate.skills_found.slice(0, 5).map((skill, i) => (
                        <Badge
                            key={i}
                            className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100 rounded-md px-2 py-0.5 text-[10px] uppercase font-bold"
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>
            </TableCell>

            {/* Summary */}
            <TableCell className="max-w-[300px] whitespace-normal">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed" title={candidate.scoring_reason || candidate.summary}>
                    {candidate.scoring_reason || candidate.summary}
                </p>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <CandidateProfile candidate={candidate}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
                        <Eye className="h-4 w-4" />
                    </Button>
                </CandidateProfile>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all ml-1 opacity-0 group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Ứng viên này sẽ bị xóa vĩnh viễn khỏi danh sách.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCandidate(candidate.id)} className="bg-red-600 hover:bg-red-700">
                                Xóa
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </TableCell>
        </TableRow>
    )
}
