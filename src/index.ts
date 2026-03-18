/**
 * Application Entry Point
 * 
 * Configures and starts the Express server.
 * Registers global middlewares, routes and error handling.
 */

import "dotenv/config" // Must be first — loads env vars before any other import
import express, { type Express } from "express"
import authRouter from "./routes/auth.routes.js"
import categoryRouter from "./routes/category.routes.js"
import transactionRouter from "./routes/transaction.routes.js"
import savingGoalsRouter from "./routes/saving-goal.routes.js"
import reportsRouter from "./routes/report.routes.js"
import { errorHandler } from "./middlewares/errorHandler.js"

const app: Express = express()
const PORT = process.env.PORT ?? 3000

// Parse incoming requests with JSON payloads
app.use(express.json())

/**
 * API Routes
 * All routes are prefixed with /api
 */
app.use("/api/auth", authRouter)
app.use("/api/categories", categoryRouter)
app.use("/api/transactions", transactionRouter)
app.use("/api/saving-goals", savingGoalsRouter)
app.use("/api/reports", reportsRouter)

// 404 handler — must be registered after all routes
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    code: "NOT_FOUND",
    message: "Route not found"
  })
})

/**
 * Global Error Handler
 * Must be registered after all routes — Express identifies error
 * middleware by its 4-parameter signature (err, req, res, next)
 */
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app