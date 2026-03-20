import request from "supertest"
import app from "../../index.js"
import { AppError } from "../../lib/AppError.js"

interface TestUserOverrides {
  name?: string
  email?: string
  password?: string
}

export async function createTestUser(overrides: TestUserOverrides = {}) {
  const user = {
    name: "Test User",
    email: `test-${Date.now()}@test.com`,
    password: "Test1234!",
    ...overrides
  }

  const res = await request(app)
    .post("/api/auth/register")
    .send(user)

  return {
    token: res.body.token,
    user: res.body.user
  }
}