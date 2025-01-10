/**
 * Main entry point for the Anyland-like server
 */

import { createAreaBundlesServer } from './servers/area'
import { createThingDefsServer } from './servers/thingdefs'
import { createUGCImagesServer } from './servers/ugcimages'
import { createAPIServer } from './servers/api'

// Start all servers
const apiServer = createAPIServer()
const areaBundlesServer = createAreaBundlesServer()
const thingDefsServer = createThingDefsServer()
const ugcImagesServer = createUGCImagesServer()

// Handle process termination
const cleanup = () => {
  console.log('Shutting down servers...')
  apiServer.stop()
  areaBundlesServer.stop()
  thingDefsServer.stop()
  ugcImagesServer.stop()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)