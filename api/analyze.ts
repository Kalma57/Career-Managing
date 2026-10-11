// Vercel serverless function: POST /api/analyze
// The .js extension is required by Node's ESM loader on Vercel; it resolves to analyze.ts.
import { analyze } from '../server/analyze.js'

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'bad request' }, { status: 400 })
  }

  const result = await analyze(body, process.env)
  return Response.json(result.body, { status: result.status, headers: { 'cache-control': 'no-store' } })
}
