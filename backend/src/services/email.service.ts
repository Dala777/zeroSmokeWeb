import nodemailer from "nodemailer"
import type { Transporter, SendMailOptions } from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Configuración del transporte de correo
const createTransporter = (): Transporter => {
  // Verificar si estamos en entorno de desarrollo
  const isDev = process.env.NODE_ENV !== "production"

  if (isDev) {
    // En desarrollo, usamos ethereal.email (servicio de prueba)
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "ethereal_user",
        pass: process.env.EMAIL_PASSWORD || "ethereal_password",
      },
    })
  } else {
    // En producción, usamos la configuración real
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
}

// Servicio para enviar correos electrónicos
export const emailService = {
  // Enviar respuesta a un mensaje de contacto
  sendMessageReply: async (to: string, subject: string, text: string, html?: string): Promise<any> => {
    try {
      const transporter = createTransporter()

      const mailOptions: SendMailOptions = {
        from: `"ZeroSmoke" <${process.env.EMAIL_FROM || "info@zerosmoke.com"}>`,
        to,
        subject: `Re: ${subject}`,
        text,
        html: html || text.replace(/\n/g, "<br>"),
      }

      const info = await transporter.sendMail(mailOptions)

      // En desarrollo, mostramos la URL de vista previa
      if (process.env.NODE_ENV !== "production" && "messageId" in info) {
        // Verificamos si getTestMessageUrl existe antes de usarlo
        if (typeof nodemailer.getTestMessageUrl === "function") {
          console.log("Vista previa del correo:", nodemailer.getTestMessageUrl(info))
        }
      }

      return info
    } catch (error) {
      console.error("Error al enviar correo electrónico:", error)
      throw error
    }
  },
}

