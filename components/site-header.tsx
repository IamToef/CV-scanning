import Link from "next/link"
import { LayoutGrid, List, UploadCloud } from "lucide-react"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-background/95 supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 h-14 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
                        TalentIQ
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                            <LayoutGrid className="h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                        <Link href="/upload" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                            <UploadCloud className="h-4 w-4" />
                            <span>Upload</span>
                        </Link>
                        <Link href="/leaderboard" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                            <List className="h-4 w-4" />
                            <span>Leaderboard</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}
