"use client"

import Link from "next/link"
import { LayoutGrid, List, UploadCloud, MessageSquare, RotateCcw } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCandidates } from "@/components/candidate-context"
import { SiteSettings } from "@/components/site-settings"

const navItems = [
    {
        title: "Tổng quan",
        href: "/dashboard",
        icon: LayoutGrid
    },
    {
        title: "Tải lên",
        href: "/upload",
        icon: UploadCloud
    },
    {
        title: "Bảng xếp hạng",
        href: "/leaderboard",
        icon: List
    },
    {
        title: "Trợ lý AI",
        href: "/chat",
        icon: MessageSquare
    }
]

export function SiteHeader() {
    const pathname = usePathname()
    const { resetData } = useCandidates()

    const navItems = [
        {
            title: "Tổng quan",
            href: "/dashboard",
            icon: LayoutGrid
        },
        {
            title: "Tải lên", // Changed from "Ứng viên" to match href/icon context if needed, but original plan said "Ứng viên". Checking dictionaries.ts: "nav.candidates": "Ứng viên". But href is /upload. Let's stick to dictionary value "Ứng viên" or "Tải lên" as per dictionary/context. 
            // Wait, in previous site-header.tsx (line 48) it was t('nav.candidates'). In dictionaries.ts val is "Ứng viên".
            // However, the original static navItems (lines 12-33) had "Tải lên".
            // The dynamic one (lines 40-61) used t('nav.candidates').
            // I will use "Ứng viên" to match the translatable string, OR "Tải lên" if that makes more sense.
            // PROMPT said "Tải lên" in the static array (line 19).
            // Let's use "Ứng viên" to be consistent with what the user likely saw with Vietnamese locale.
            // Actually, let's look at the plan: "Hardcode navigation items to Vietnamese ("Tổng quan", "Ứng viên", "Bảng xếp hạng", "AI Chat")."
            // Okay I will use "Ứng viên".
            title: "Ứng viên",
            href: "/upload",
            icon: UploadCloud
        },
        {
            title: "Bảng xếp hạng",
            href: "/leaderboard",
            icon: List
        },
        {
            title: "AI Chat",
            href: "/chat",
            icon: MessageSquare
        }
    ]

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all data?")) {
            resetData()
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-background/95 supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 h-14 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                        RecruitPRO
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center space-x-2 transition-colors",
                                    pathname === item.href
                                        ? "text-purple-600 font-bold"
                                        : "text-muted-foreground hover:text-purple-600 transition-colors"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </nav>

                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleReset} title="Reset Data">
                        <RotateCcw className="h-5 w-5" />
                    </Button>
                    <SiteSettings />
                </div>
            </div>
        </header >
    )
}
