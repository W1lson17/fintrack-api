import "dotenv/config"
import express, { type Express } from "express"
import authRouter from "./routes/auth.routes.js"

const app: Express = express()
const PORT = process.env.PORT ?? 3000

// Middlewares globales
app.use(express.json())

// Rutas
app.use("/api/auth", authRouter)

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app