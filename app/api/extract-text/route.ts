import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        if (file.type === 'application/pdf') {
            // @ts-ignore
            const pdfParser = new PDFParser(null, 1);

            text = await new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
                pdfParser.on("pdfParser_dataReady", () => {
                    resolve(pdfParser.getRawTextContent());
                });
                pdfParser.parseBuffer(buffer);
            });

        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') { // docx
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (file.type === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
            return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
        }

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('Error extracting text:', error);
        return NextResponse.json({ error: error.message || 'Failed to extract text' }, { status: 500 });
    }
}
