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
import { Check, Filter, Eye } from "lucide-react"
import { cn } from "@/lib/utils"


interface CandidateTableProps {
    candidates: Candidate[]
}

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

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill)
                ? prev.filter(s => s !== skill)
                : [...prev, skill]
        )
    }

    return (
        <div className="space-y-4">
            {/* Header Section matches Image 1 */}
            <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent inline-block">Danh sách ứng viên</h2>
                <p className="text-muted-foreground">Quản lý và theo dõi kết quả phân tích</p>
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
                            <TableHead className="font-semibold text-foreground">Tóm tắt</TableHead>
                            <TableHead className="text-right font-semibold text-foreground">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCandidates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Không tìm thấy ứng viên phù hợp.
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Sort by Score Descending
                            [...filteredCandidates].sort((a, b) => b.score - a.score).map((candidate) => (
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
                    <span className={`text-xl font-black ${candidate.score >= 80 ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent' :
                        candidate.score >= 50 ? 'text-yellow-600' : 'text-red-500'
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
                    {(isExpanded ? candidate.skills_found : candidate.skills_found.slice(0, 3)).map((skill, i) => (
                        <Badge
                            key={i}
                            className="bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-100 rounded-md px-2 py-0.5 text-[10px] uppercase font-bold"
                        >
                            {skill}
                        </Badge>
                    ))}
                    {!isExpanded && candidate.skills_found.length > 3 && (
                        <Badge
                            variant="outline"
                            className="border-dashed text-[10px] text-muted-foreground hover:bg-muted cursor-pointer hover:text-foreground"
                            onClick={() => setIsExpanded(true)}
                        >
                            +{candidate.skills_found.length - 3}
                        </Badge>
                    )}
                    {isExpanded && candidate.skills_found.length > 3 && (
                        <Badge
                            variant="outline"
                            className="border-dashed text-[10px] text-muted-foreground hover:bg-muted cursor-pointer hover:text-foreground"
                            onClick={() => setIsExpanded(false)}
                        >
                            Thu gọn
                        </Badge>
                    )}
                </div>
            </TableCell>

            {/* Summary */}
            <TableCell className="max-w-[300px] whitespace-normal">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed" title={candidate.summary}>
                    {candidate.summary}
                </p>
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
                <CandidateProfile candidate={candidate}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
                        <Eye className="h-4 w-4" />
                    </Button>
                </CandidateProfile>
            </TableCell>
        </TableRow>
    )
}
