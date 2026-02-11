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
        const firstName = profile.name?.givenName || "";
        const lastName = profile.name?.familyName || "";

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
          // ✅ Create User + Student in a transaction (same as register)
          user = await prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
              data: {
                email,
                google_id: googleId,
                google_avatar: avatar,
                role: Roles.STUDENT,
                is_active: true,
              },
            });

            const student = await tx.student.create({
              data: {
                user_id: createdUser.user_id,
                first_name: firstName,
                last_name: lastName,
                email,
              },
            });

            const updatedUser = await tx.user.update({
              where: { user_id: createdUser.user_id },
              data: { student_id: student.student_id },
            });

            return updatedUser;
          });
        } else {
          // ✅ Existing user — link google_id if missing
          if (!user.google_id) {
            user = await prisma.user.update({
              where: { user_id: user.user_id },
              data: {
                google_id: googleId,
                google_avatar: avatar,
              },
            });
          }

          // ✅ Existing user — create Student record if missing
          if (user.role === Roles.STUDENT && !user.student_id) {
            const existingStudent = await prisma.student.findFirst({
              where: { user_id: user.user_id },
            });

            if (!existingStudent) {
              const student = await prisma.$transaction(async (tx) => {
                const newStudent = await tx.student.create({
                  data: {
                    user_id: user!.user_id,
                    first_name: firstName || email.split("@")[0],
                    last_name: lastName || "",
                    email,
                  },
                });

                await tx.user.update({
                  where: { user_id: user!.user_id },
                  data: { student_id: newStudent.student_id },
                });

                return newStudent;
              });
            }
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, false);
      }
    },
  ),
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
    },
  ),
);