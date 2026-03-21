import request from "supertest"
import app from "../../index.js"

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
    // accessToken is the short-lived JWT used in Authorization headers
    token: res.body.accessToken,
    refreshToken: res.body.refreshToken
  }
}