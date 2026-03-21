const colors = {
  info: '\x1b[36m',  // cyan
  warn: '\x1b[33m',  // amarillo
  error: '\x1b[31m', // rojo
  reset: '\x1b[0m'   // reset
}

const formatLog = (level: string, message: string, meta?: object) =>
  JSON.stringify({
    level,
    message,
    ...meta,
    timestamp: new Date().toISOString()
  })

export const logger = {
  info: (message: string, meta?: object) => {
    console.log(`${colors.info}${formatLog('info', message, meta)}${colors.reset}`)
  },
  error: (message: string, meta?: object) => {
    console.error(`${colors.error}${formatLog('error', message, meta)}${colors.reset}`)
  },
  warn: (message: string, meta?: object) => {
    console.warn(`${colors.warn}${formatLog('warn', message, meta)}${colors.reset}`)
  },
}