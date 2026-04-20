/**
 * Graceful Shutdown Handler
 *
 * Handles SIGTERM and SIGINT to close connections properly.
 * Gives in-flight requests time to complete before forcing exit.
 */

import { prisma } from './prisma.js'
import type { Server } from 'http'

/**
 * Creates a graceful shutdown handler for the given server
 */
export const createGracefulShutdown = (server: Server) => {
  return async (signal: string) => {
    console.log(`${signal} received, shutting down gracefully...`)

    // Stop accepting new connections
    server.close(async () => {
      console.log('HTTP server closed')

      // Close database connections
      try {
        await prisma.$disconnect()
        console.log('Database connections closed')
      } catch (err) {
        console.error('Error closing database:', err)
      }

      console.log('Shutdown complete')
      process.exit(0)
    })

    // Force exit after 30 seconds if graceful exit fails
    setTimeout(() => {
      console.error('Forced shutdown after timeout')
      process.exit(1)
    }, 30000)
  }
}

/**
 * Initialize shutdown handlers
 */
export const initShutdownHandlers = (server: Server) => {
  const gracefulShutdown = createGracefulShutdown(server)

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}