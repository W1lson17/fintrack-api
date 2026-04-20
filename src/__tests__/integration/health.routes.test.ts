/**
 * Health Check Integration Tests
 *
 * Tests /health and /ready endpoints
 */

import request from 'supertest'
import app from '../../index.js'

describe('Health Check', () => {
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({ status: 'ok' })
    })
  })

  describe('GET /ready', () => {
    it('should return 200 with db connected when database is available', async () => {
      const res = await request(app).get('/ready')

      expect(res.status).toBe(200)
      expect(res.body).toEqual({
        status: 'ready',
        db: 'connected'
      })
    })
  })
})