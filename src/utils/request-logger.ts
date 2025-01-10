import * as fs from 'node:fs/promises'
import * as path from 'node:path'

export interface UnimplementedRequest {
  server: string
  method: string
  url: string
  timestamp: string
  headers: Record<string, string>
  body?: any
  params?: any
}

export const logUnimplementedRequest = async (request: UnimplementedRequest) => {
  const logDir = './unimplemented-requests'
  const serverDir = path.join(logDir, request.server.toLowerCase())

  // Ensure directories exist
  await fs.mkdir(logDir, { recursive: true })
  await fs.mkdir(serverDir, { recursive: true })

  // Create a unique filename based on timestamp and request details
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${timestamp}-${request.method}-${request.url.replace(/[^a-zA-Z0-9]/g, '_')}.json`

  // Save request details to file
  await fs.writeFile(
    path.join(serverDir, filename),
    JSON.stringify(request, null, 2)
  )
}