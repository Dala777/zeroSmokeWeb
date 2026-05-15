import admin from "firebase-admin"
import path from "path"
import fs from "fs"
import UserDevice from "../models/UserDevice"
import NotificationLog from "../models/NotificationLog"

let initialized = false

const resolveServiceAccountPath = (givenPath: string): string | null => {
  const candidates: string[] = []

  if (path.isAbsolute(givenPath)) {
    candidates.push(givenPath)
  } else {
    candidates.push(path.resolve(process.cwd(), givenPath))
    candidates.push(path.resolve(process.cwd(), givenPath.replace(/^\.\//, "")))
    candidates.push(path.resolve(__dirname, "..", "..", givenPath))
    candidates.push(path.resolve(__dirname, "..", "..", givenPath.replace(/^\.\//, "")))
  }

  for (const candidate of candidates) {
    const resolved = path.normalize(candidate)
    if (fs.existsSync(resolved)) {
      console.log("[push] Service account found at:", resolved)
      return resolved
    }
    console.log("[push] Not found at:", resolved)
  }

  return null
}

const loadServiceAccount = (filePath: string): Record<string, unknown> => {
  const raw = fs.readFileSync(filePath, "utf8")
  return JSON.parse(raw) as Record<string, unknown>
}

export const initFirebaseAdmin = (): void => {
  if (initialized) return

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH

  try {
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson)
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
      console.log("[push] Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT_KEY env var")
      initialized = true
    } else if (serviceAccountPath) {
      const resolvedPath = resolveServiceAccountPath(serviceAccountPath)
      if (!resolvedPath) {
        console.warn("[push] Service account file not found for path:", serviceAccountPath)
        console.warn("[push] Push notifications disabled.")
        return
      }
      const serviceAccount = loadServiceAccount(resolvedPath)
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
      console.log("[push] Firebase Admin initialized from file:", resolvedPath)
      initialized = true
    } else {
      try {
        admin.initializeApp({ credential: admin.credential.applicationDefault() })
        console.log("[push] Firebase Admin initialized with ADC")
        initialized = true
      } catch {
        console.warn("[push] No Firebase credentials found. Push notifications disabled.")
        console.warn("[push] Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH env var")
      }
    }
  } catch (err) {
    console.error("[push] Firebase Admin init failed:", err)
  }
}

export const isPushEnabled = (): boolean => initialized

const logNotification = async (
  userId: string,
  title: string,
  body: string,
  type: string,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  try {
    await NotificationLog.create({ userId, title, body, type, sentAt: new Date(), metadata })
  } catch (err) {
    console.error("[push] Error logging notification:", err)
  }
}

export const sendToUser = async (
  userId: string,
  title: string,
  body: string,
  type: string = "smart",
  data?: Record<string, string>,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  if (!initialized) {
    console.log("[push] Skipping push (Firebase not initialized)")
    return
  }

  try {
    const devices = await UserDevice.find({ userId, isActive: true })
    if (devices.length === 0) {
      console.log("[push] No active devices for user", userId)
      return
    }

    const tokens = devices.map((d) => d.fcmToken)
    const payload: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      data: { type, ...data },
      android: { priority: "high" },
      apns: {
        payload: { aps: { sound: "default", badge: 1 } },
      },
    }

    const response = await admin.messaging().sendEachForMulticast(payload)
    console.log("[push] Sent to user", { userId, success: response.successCount, failure: response.failureCount })

    const invalidTokens: string[] = []
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        console.warn("[push] Token error:", resp.error.code, tokens[idx])
        if (
          resp.error.code === "messaging/invalid-registration-token" ||
          resp.error.code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(tokens[idx])
        }
      }
    })

    if (invalidTokens.length > 0) {
      await UserDevice.updateMany(
        { fcmToken: { $in: invalidTokens } },
        { $set: { isActive: false } },
      )
      console.log("[push] Marked", invalidTokens.length, "tokens as inactive")
    }

    await logNotification(userId, title, body, type, metadata)
  } catch (err) {
    console.error("[push] Error sending to user:", err)
  }
}

export const sendMulticast = async (
  userIds: string[],
  title: string,
  body: string,
  type: string = "smart",
  data?: Record<string, string>,
  metadata?: Record<string, unknown>,
): Promise<void> => {
  if (!initialized) return

  for (const userId of userIds) {
    await sendToUser(userId, title, body, type, data, metadata)
  }
}
