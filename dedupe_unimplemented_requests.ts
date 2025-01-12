import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { UnimplementedRequest } from './src/utils/request-logger'

async function getRequestFiles(directory: string): Promise<string[]> {
  const files: string[] = []
  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await getRequestFiles(fullPath)
      files.push(...subFiles)
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath)
    }
  }

  return files
}

function createRequestKey(request: UnimplementedRequest): string {
  // Create a unique key based on the important parts of the request
  return `${request.server}:${request.method}:${request.url}`
}

async function deduplicateRequests() {
  const requestsDir = './unimplemented-requests'
  const files = await getRequestFiles(requestsDir)
  const uniqueRequests = new Map<string, { file: string; request: UnimplementedRequest }>()

  console.log(`Found ${files.length} request files`)

  // Process each file
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')
    const request: UnimplementedRequest = JSON.parse(content)
    const key = createRequestKey(request)

    if (!uniqueRequests.has(key)) {
      uniqueRequests.set(key, { file, request })
    } else {
      // This is a duplicate, delete it
      console.log(`Deleting duplicate: ${file}`)
      await fs.unlink(file)
    }
  }

  console.log(`Kept ${uniqueRequests.size} unique requests`)
  console.log(`Deleted ${files.length - uniqueRequests.size} duplicates`)
}

// Run the deduplication
deduplicateRequests().catch(console.error)
