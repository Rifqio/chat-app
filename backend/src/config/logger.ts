import { createLogger, format, transports } from 'winston'
import { isProduction } from './env.js'

const { combine, timestamp, errors, json, colorize, printf } = format

const pad = (value: number, size = 2) => value.toString().padStart(size, '0')

const formatTimestamp = () => {
    const now = new Date()
    const offsetMinutes = now.getTimezoneOffset()
    const sign = offsetMinutes > 0 ? '-' : '+'
    const absMinutes = Math.abs(offsetMinutes)
    const offsetHours = pad(Math.floor(absMinutes / 60))
    const offsetMins = pad(absMinutes % 60)
    const zone = `GMT${sign}${offsetHours}:${offsetMins}`

    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate(),
    )}`
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
        now.getSeconds(),
    )}.${pad(now.getMilliseconds(), 3)}`

    return `${date} ${time} ${zone}`
}

const formatMeta = (meta: Record<string, unknown>) => {
    const entries = Object.entries(meta)
    if (!entries.length) return ''
    return entries
        .map(([key, value]) => {
            if (typeof value === 'string') return `${key}=${value}`
            if (typeof value === 'number' || typeof value === 'boolean')
                return `${key}=${value}`
            return `${key}=${JSON.stringify(value)}`
        })
        .join(' ')
}

const consoleFormat = printf(({ level, message, timestamp: time, stack, ...meta }) => {
    const metaString = formatMeta(meta)
    return `${time} [${level}]: ${stack ?? message}${metaString ? ' ' + metaString : ''}`
})

export const logger = createLogger({
    level: isProduction ? 'info' : 'debug',
    format: combine(timestamp({ format: formatTimestamp }), errors({ stack: true }), json()),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: formatTimestamp }),
                errors({ stack: true }),
                consoleFormat,
            ),
        }),
    ],
    exitOnError: false,
})
