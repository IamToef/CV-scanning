import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, status, role } = body;

        // Load n8n webhook URL from environment variables
        // Support both standardized name and user's specific name
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || process.env.N8N_EMAIL_TRIGGER;

        if (!n8nWebhookUrl) {
            console.warn("Missing N8N_WEBHOOK_URL (or N8N_EMAIL_TRIGGER) env var. Skipping automation.");
            return NextResponse.json({ message: "Skipped (no url)" }, { status: 200 });
        }

        // Forward to n8n
        const response = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, status, role }),
        });

        if (!response.ok) {
            console.error("Failed to trigger n8n workflow", await response.text());
            return NextResponse.json({ error: "Failed to trigger automation" }, { status: 502 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in n8n-trigger:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
