import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URLが必要です' }), { status: 400 });
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: '無効なURLです' }), { status: 400 });
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new Response(JSON.stringify({ error: 'HTTP/HTTPSのURLのみ対応しています' }), { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ConceptTool/1.0)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `取得失敗: ${response.status}` }), { status: 502 });
    }

    const html = await response.text();

    // Extract text content from HTML
    const text = html
      // Remove scripts and styles
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Limit text length
    const maxLen = 8000;
    const truncated = text.length > maxLen ? text.substring(0, maxLen) + '...(省略)' : text;

    return new Response(JSON.stringify({ title, text: truncated, url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fetch URL error:', error);
    return new Response(JSON.stringify({ error: 'URL取得に失敗しました' }), { status: 500 });
  }
}
