import { dispatchApiRoute } from '@lib/dispatch-api'
import { handleWithAdapter } from '@lib/next-api-adapter'
import { getApiPathFromNextParams } from '@lib/vercel-route'

export const maxDuration = 30

interface RouteContext {
  params: Promise<{ path?: string[] }>
}

async function handleRequest(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { path } = await context.params
  const segments = getApiPathFromNextParams(path)

  return handleWithAdapter(request, async (req, res) => {
    await dispatchApiRoute(req, res, segments)
  })
}

export async function GET(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export async function POST(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export async function PUT(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}

export async function OPTIONS(request: Request, context: RouteContext) {
  return handleRequest(request, context)
}
