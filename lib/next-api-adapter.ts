import type { VercelRequest, VercelResponse } from '@vercel/node'

export class NodeResponseAdapter {
  statusCode = 200
  private headers = new Map<string, string | string[]>()
  body: BodyInit | null = null
  ended = false

  status(code: number): this {
    this.statusCode = code
    return this
  }

  setHeader(name: string, value: string | string[]): this {
    this.headers.set(name.toLowerCase(), value)
    return this
  }

  json(data: unknown): this {
    this.setHeader('content-type', 'application/json')
    this.body = JSON.stringify(data)
    this.ended = true
    return this
  }

  send(data: string): this {
    this.body = data
    this.ended = true
    return this
  }

  end(data?: string): void {
    if (data !== undefined) {
      this.body = data
    }
    this.ended = true
  }

  toWebResponse(): Response {
    const headers = new Headers()
    for (const [key, value] of this.headers) {
      if (Array.isArray(value)) {
        for (const item of value) {
          headers.append(key, item)
        }
      } else {
        headers.set(key, value)
      }
    }

    return new Response(this.body, {
      status: this.statusCode,
      headers,
    })
  }
}

function appendQueryValue(
  query: Record<string, string | string[]>,
  key: string,
  value: string,
) {
  const existing = query[key]
  if (existing === undefined) {
    query[key] = value
    return
  }

  if (Array.isArray(existing)) {
    existing.push(value)
    return
  }

  query[key] = [existing, value]
}

export async function toVercelRequest(request: Request): Promise<VercelRequest> {
  const url = new URL(request.url)
  const query: Record<string, string | string[]> = {}

  url.searchParams.forEach((value, key) => {
    appendQueryValue(query, key, value)
  })

  let body: unknown
  const method = request.method

  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type') ?? ''
    const text = await request.text()

    if (contentType.includes('application/json')) {
      body = text.trim() ? JSON.parse(text) : {}
    } else {
      body = text
    }
  }

  const headers: Record<string, string | string[]> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  return {
    method,
    url: `${url.pathname}${url.search}`,
    headers,
    query,
    body,
  } as VercelRequest
}

export async function handleWithAdapter(
  request: Request,
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void>,
): Promise<Response> {
  const req = await toVercelRequest(request)
  const res = new NodeResponseAdapter()
  await handler(req, res as unknown as VercelResponse)
  return res.toWebResponse()
}
