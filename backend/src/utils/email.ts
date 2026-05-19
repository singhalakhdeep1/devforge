import nodemailer from 'nodemailer'

interface EmailOptions {
    to: string
    subject: string
    text?: string
    html?: string
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export const sendEmail = async (options: EmailOptions) => {
    try {
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@devhub.com',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('Email sent:', info.messageId)
        return info
    } catch (error) {
        console.error('Email error:', error)
        throw error
    }
}
