import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

export const mailer = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth:
        env.smtp.user && env.smtp.pass
            ? { user: env.smtp.user, pass: env.smtp.pass }
            : undefined,
})

export const sendMail = (options: nodemailer.SendMailOptions) =>
    mailer.sendMail({
        from: env.smtp.from,
        ...options,
    })
