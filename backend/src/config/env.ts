import dotenv from 'dotenv'

dotenv.config()

const number = (value: string | undefined, fallback: number) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const bool = (value: string | undefined, fallback: boolean) => {
    if (value === undefined) return fallback
    return value.toLowerCase() === 'true'
}

const list = (value: string | undefined) =>
    value
        ? value
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
        : []

const required = (value: string | undefined, name: string) => {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: number(process.env.PORT, 3000),
    databaseUrl: required(process.env.DATABASE_URL, 'DATABASE_URL'),
    jwtSecret: required(process.env.JWT_SECRET, 'JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    corsOrigins: list(process.env.CORS_ORIGINS),
    smtp: {
        host: process.env.SMTP_HOST,
        port: number(process.env.SMTP_PORT, 587),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        secure: bool(process.env.SMTP_SECURE, false),
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    },
    aws: {
        region: process.env.AWS_REGION ?? 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET ?? '',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
}

export const isProduction = env.nodeEnv === 'production'
