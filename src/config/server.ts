/**
 * Server configuration module
 */

// Configuration constants
export const HOSTNAME_API = "app.anyland.com"
export const HOSTNAME_CDN_THINGDEFS = "d6ccx151yatz6.cloudfront.net"
export const HOSTNAME_CDN_AREABUNDLES = "d26e4xubm8adxu.cloudfront.net"

// Environment variables interface
export interface ServerConfig {
  HOST: string
  PORT_API: string
  PORT_CDN_THINGDEFS: string
  PORT_CDN_AREABUNDLES: string
  PORT_CDN_UGCIMAGES: string
}

// TODO: Add environment variable validation
export const config: ServerConfig = {
  HOST: process.env.HOST!,
  PORT_API: process.env.PORT_API!,
  PORT_CDN_THINGDEFS: process.env.PORT_CDN_THINGDEFS!,
  PORT_CDN_AREABUNDLES: process.env.PORT_CDN_AREABUNDLES!,
  PORT_CDN_UGCIMAGES: process.env.PORT_CDN_UGCIMAGES!
}