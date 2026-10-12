import { createServer } from 'http'
import app from './app'
import { env } from './config/env'
import { prisma } from './lib/prisma'
import { initSocket } from './socket'

const httpServer = createServer(app)
initSocket(httpServer)

httpServer.listen(env.PORT, () => {
    console.log(`DevForge API listening on http://localhost:${env.PORT}`)
})

// Finish in-flight requests and close the database pool on shutdown (Docker/Kubernetes send SIGTERM)
const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down`)
    httpServer.close(async () => {
        await prisma.$disconnect()
        process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
