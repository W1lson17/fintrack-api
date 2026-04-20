/**
 * Health Check Routes
 *
 * Provides liveness and readiness endpoints for container orchestration
 * (Kubernetes, Docker Compose, etc.)
 */

import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router: Router = Router()

// Note: These routes are mounted at root level (/health, /ready)
// K8s probes typically use these paths

/**
 * GET /health — Liveness probe
 * Returns 200 if the process is running
 * Used by orchestrators to know if the container should be restarted
 */
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

/**
 * GET /ready — Readiness probe
 * Returns 200 if the app can handle requests
 * Used by orchestrators to know if the pod can receive traffic
 */
router.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({ status: 'ready', db: 'connected' })
  } catch {
    res.status(503).json({ status: 'not_ready', db: 'disconnected' })
  }
})

export default router