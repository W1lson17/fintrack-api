import "dotenv/config"
import express, { type Express } from "express"
import authRouter from "./routes/auth.routes.js"
import categoryRouter from "./routes/category.routes.js"
import { errorHandler } from "./middlewares/errorHandler.js"

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

const app: Express = express()
const PORT = process.env.PORT ?? 3000

// Middlewares globales
app.use(express.json())

// Rutas
app.use("/api/auth", authRouter)
app.use("/api/categories", categoryRouter)

// Middlewares
// Error handling
app.use(errorHandler)

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app