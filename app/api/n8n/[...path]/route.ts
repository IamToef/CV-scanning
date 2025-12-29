import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');

    // Map paths to specific environment variables
    let targetUrl = '';

    // Explicit mappings
    if (path.includes('score') && process.env.N8N_SCORE_WEBHOOK_URL) {
        targetUrl = process.env.N8N_SCORE_WEBHOOK_URL;
    } else if (path.includes('chat') && process.env.N8N_CHAT_WEBHOOK_URL) {
        targetUrl = process.env.N8N_CHAT_WEBHOOK_URL;
    } else if (path.includes('jd-extraction') && process.env.N8N_EXTRACTJD_WEBHOOK_URL) {
        targetUrl = process.env.N8N_EXTRACTJD_WEBHOOK_URL;
    } else {
        // Fallback to base URL logic
        const n8nBase = process.env.N8N_WEBHOOK_BASE;
        if (!n8nBase) {
            console.error('N8N_WEBHOOK_BASE is not defined and no specific URL found');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }
        targetUrl = `${n8nBase.replace(/\/$/, '')}/${pathString}`;
    }

    console.log(`[Proxy] Target URL: ${targetUrl}`);
    console.log(`[Proxy] N8N_CHAT_WEBHOOK_URL: ${process.env.N8N_CHAT_WEBHOOK_URL}`);
    console.log(`[Proxy] N8N_API_KEY exists: ${!!process.env.N8N_API_KEY}`);

    try {
        const contentType = req.headers.get('content-type') || '';

        // Prepare headers
        const headers: Record<string, string> = {
            'X-N8N-API-KEY': process.env.N8N_API_KEY || '',
        };

        // Note: When using fetch with FormData, do NOT set Content-Type manually to multipart/form-data,
        // let fetch generate the boundary.

        let body: any;

        if (contentType.includes('multipart/form-data')) {
            body = await req.formData();
            // headers['Content-Type'] is NOT set here
        } else {
            body = JSON.stringify(await req.json());
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[Proxy] n8n responded with ${response.status} at ${targetUrl}`);
            console.error(`[Proxy] Error body:`, errorBody);
            return NextResponse.json(
                { error: `Upstream error: ${response.statusText}`, details: errorBody },
                { status: response.status }
            );
        }

        // Try to parse JSON response, else return text
        const responseText = await response.text();
        try {
            const data = JSON.parse(responseText);
            return NextResponse.json(data);
        } catch {
            // Return as raw text wrapped in json? or just text? 
            // Client expects JSON usually.
            return NextResponse.json({ message: responseText });
        }

    } catch (error: any) {
        console.error('[Proxy] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
