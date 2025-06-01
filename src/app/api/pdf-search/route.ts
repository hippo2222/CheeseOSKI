import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const INDEX_PATH = path.join(process.cwd(), 'src/data/pdf-index.json');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  if (!query.trim()) {
    return NextResponse.json([]);
  }
  const indexRaw = fs.readFileSync(INDEX_PATH, 'utf-8');
  const index = JSON.parse(indexRaw);
  const results = [];
  for (const file of index) {
    const text = file.text.toLowerCase();
    const idx = text.indexOf(query);
    if (idx !== -1) {
      // Формируем фрагмент вокруг найденного слова
      const start = Math.max(0, idx - 50);
      const end = Math.min(text.length, idx + query.length + 50);
      const preview = file.text.slice(start, end).replace(/\n/g, ' ');
      results.push({
        path: file.path,
        preview,
      });
    }
  }
  return NextResponse.json(results);
} 