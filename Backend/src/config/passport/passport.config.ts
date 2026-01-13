import passport from "passport";
import { Request } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";

import { prisma } from "../../prisma/client";
import { config } from "../app.config";
import { NotFoundException } from "../../utils/appErros";
import { Roles } from "../../enums/role.enum";
import { verifyPassword } from "../../utils/password.util";

/**
 * =========================
 * GOOGLE STRATEGY (JWT, NO SESSION)
 * =========================
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (_req: Request, _accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          throw new NotFoundException("Google account has no email");
        }

        if (!googleId) {
          throw new NotFoundException("Google ID is missing");
        }

        let user = await prisma.user.findFirst({
          where: {
            OR: [{ google_id: googleId }, ...(email ? [{ email }] : [])],
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              google_id: googleId,
              google_avatar: avatar,
              role: Roles.STUDENT,
            },
          });
        }

        if (user && !user.google_id) {
          user = await prisma.user.update({
            where: { user_id: user.user_id },
            data: {
              google_id: googleId,
              google_avatar: avatar,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);

/**
 * =========================
 * LOCAL STRATEGY (EMAIL + PASSWORD)
 * =========================
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email: string, password: string, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return done(null, false, {
            message: "Invalid credentials",
          });
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          return done(null, false, {
            message: "Invalid credentials",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    }
  )
);
