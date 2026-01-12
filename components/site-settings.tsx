"use client"

import * as React from "react"
import { Moon, Sun, Settings, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"

export function SiteSettings() {
    const { setTheme, theme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="group relative">
                    <Settings className="h-5 w-5 transition-transform duration-700 ease-in-out group-hover:rotate-180 text-slate-600 dark:text-slate-300" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Cài đặt</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Theme Submenu */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>Giao diện</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                <span>Sáng</span>
                            </div>
                            {theme === 'light' && <Check className="h-3 w-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                <span>Tối</span>
                            </div>
                            {theme === 'dark' && <Check className="h-3 w-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                <span>Hệ thống</span>
                            </div>
                            {theme === 'system' && <Check className="h-3 w-3" />}
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}
