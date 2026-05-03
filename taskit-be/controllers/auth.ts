import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import connectDB from "../database/connection";
import { users } from "../database/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Access Token is required" });
  }

  try {
    // Verify token and fetch user info from Google
    const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { email, name, picture, sub: providerId } = googleResponse.data;

    if (!email) {
      return res.status(400).json({ error: "Invalid Google token or missing email" });
    }

    const db = await connectDB();
    let user = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, "google"), eq(users.providerId, providerId)))
      .limit(1);

    let userData;

    if (user.length === 0) {
      // Check if user exists with this email
      let userWithEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userWithEmail.length > 0) {
        userData = userWithEmail[0];
      } else {
        const result = await db
          .insert(users)
          .values({
            email,
            name: name || email.split("@")[0],
            avatarUrl: picture,
            provider: "google",
            providerId,
          })
          .returning();
        userData = result[0];
      }
    } else {
      userData = user[0];
    }

    const token = jwt.sign(
      { id: userData.id, email: userData.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(401).json({ error: "Invalid Google access token" });
  }
};

export const githubLogin = async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI || "http://localhost:3000/auth/callback",
      },
      { headers: { Accept: "application/json" } }
    );

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      console.error("GitHub OAuth Error:", error, error_description);
      return res.status(400).json({ error: error_description || error });
    }

    if (!access_token) {
      return res.status(400).json({ error: "Failed to obtain access token from GitHub" });
    }

    // Fetch user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: providerId, login, name, avatar_url, email } = userResponse.data;

    // GitHub might not return email if it's private, fetch it separately if needed
    let userEmail = email;
    if (!userEmail) {
      const emailsResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const primaryEmail = emailsResponse.data.find((e: any) => e.primary && e.verified);
      userEmail = primaryEmail ? primaryEmail.email : `${login}@github.com`;
    }

    const db = await connectDB();
    let user = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, "github"), eq(users.providerId, providerId.toString())))
      .limit(1);

    let userData;

    if (user.length === 0) {
      let userWithEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (userWithEmail.length > 0) {
        userData = userWithEmail[0];
      } else {
        const result = await db
          .insert(users)
          .values({
            email: userEmail,
            name: name || login,
            avatarUrl: avatar_url,
            provider: "github",
            providerId: providerId.toString(),
          })
          .returning();
        userData = result[0];
      }
    } else {
      userData = user[0];
    }

    const token = jwt.sign(
      { id: userData.id, email: userData.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "GitHub login successful",
      token,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        avatarUrl: userData.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("GitHub Auth Error:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.error_description || error.response?.data?.error || "GitHub authentication failed";
    return res.status(error.response?.status || 500).json({ error: errorMessage });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const db = await connectDB();
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        avatarUrl: user[0].avatarUrl,
      },
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
