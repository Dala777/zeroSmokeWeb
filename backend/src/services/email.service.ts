import nodemailer from "nodemailer"
import type { Transporter, SendMailOptions } from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Configuración del transporte de correo
const createTransporter = (): Transporter => {
  console.log("Creando transporter con configuración:", {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// Servicio para enviar correos electrónicos
export const emailService = {
  // Enviar respuesta a un mensaje de contacto
  sendMessageReply: async (to: string, subject: string, text: string, html?: string): Promise<any> => {
    try {
      console.log("Iniciando envío de correo a:", to)
      const transporter = createTransporter()

      const mailOptions: SendMailOptions = {
        from: `"ZeroSmoke" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject: `Re: ${subject}`,
        text,
        html: html || text.replace(/\n/g, "<br>"),
      }

      console.log("Opciones de correo:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      })

      const info = await transporter.sendMail(mailOptions)
      console.log("Correo enviado correctamente:", info.messageId)

      return info
    } catch (error) {
      console.error("Error al enviar correo electrónico:", error)
      throw error
    }
  },
}
