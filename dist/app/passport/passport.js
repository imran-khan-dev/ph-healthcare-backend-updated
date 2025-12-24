"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = __importDefault(require("../../shared/prisma"));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
        if (!email) {
            return done(null, false, { message: "No email found from Google" });
        }
        let user = yield prisma_1.default.user.findUnique({
            where: { email },
        });
        // User blocked or deleted
        if (user &&
            (user.status === 'BLOCKED' ||
                user.status === 'DELETED')) {
            return done(null, false, {
                message: `User is ${user.status}`,
            });
        }
        // Create user if not exists
        if (!user) {
            user = yield prisma_1.default.user.create({
                data: {
                    email,
                    role: "PATIENT",
                    status: "ACTIVE",
                    needPasswordChange: false,
                    patient: {
                        create: {
                            name: (_c = profile.displayName) !== null && _c !== void 0 ? _c : "Google User",
                            profilePhoto: (_e = (_d = profile.photos) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value,
                        },
                    },
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error);
    }
})));
/**
 * Session support (optional)
 * If you are fully JWT-based, you can REMOVE these
 */
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id },
        });
        done(null, user);
    }
    catch (error) {
        done(error);
    }
}));
exports.default = passport_1.default;
