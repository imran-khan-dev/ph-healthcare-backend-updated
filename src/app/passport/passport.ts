/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import prisma from '../../shared/prisma';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done: VerifyCallback
        ) => {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(null, false, { message: "No email found from Google" });
                }

                let user = await prisma.user.findUnique({
                    where: { email },
                });


                // User blocked or deleted
                if (
                    user &&
                    (user.status === 'BLOCKED' ||
                        user.status === 'DELETED')
                ) {
                    return done(null, false, {
                        message: `User is ${user.status}`,
                    });
                }

                // Create user if not exists
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            role: "PATIENT",
                            status: "ACTIVE",
                            needPasswordChange: false,

                            patient: {
                                create: {
                                    name: profile.displayName ?? "Google User",
                                    profilePhoto: profile.photos?.[0]?.value,
                                },
                            },
                        },
                    });
                }

                return done(null, user);
            } catch (error) {
                console.error("Google Strategy Error:", error);
                return done(error);
            }
        }
    )
);

/**
 * Session support (optional)
 * If you are fully JWT-based, you can REMOVE these
 */
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
