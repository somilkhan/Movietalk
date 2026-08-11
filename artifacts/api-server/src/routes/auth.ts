import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { authLimiter } from "../middlewares/security";

const router = Router();

// In-memory session store with TTL cleanup
interface Session {
  userId: string;
  email: string;
  expiresAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const sessions = new Map<string, Session>();

// Periodic cleanup of expired sessions (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(id);
    }
  }
}, 10 * 60 * 1000);

function setSessionCookie(res: any, sessionId: string) {
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
  });
}

function createSession(userId: string, email: string): string {
  const sessionId = randomUUID();
  sessions.set(sessionId, {
    userId,
    email,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

function getSession(sessionId: string | undefined): Session | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(sessionId);
    return null;
  }
  return session;
}

// Apply strict rate limiting to auth endpoints
router.use(authLimiter);

router.post("/register", async (req, res): Promise<void> => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  // Password strength check
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        email,
        username,
        passwordHash: hash,
      })
      .returning();

    const sessionId = createSession(user.id, user.email);
    setSessionCookie(res, sessionId);

    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    req.log.error({ err }, "Registration failed");
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing email or password" });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const sessionId = createSession(user.id, user.email);
    setSessionCookie(res, sessionId);

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res): void => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.clearCookie("sessionId");
  res.json({ success: true });
});

router.get("/me", (req, res): void => {
  const sessionId = req.cookies?.sessionId;
  const session = getSession(sessionId);
  if (!session) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({ id: session.userId, email: session.email });
});

export default router;
