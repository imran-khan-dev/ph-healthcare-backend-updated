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
exports.AuthRoutes = void 0;
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const rateLimiter_1 = require("../../middlewares/rateLimiter");
const auth_controller_1 = require("./auth.controller");
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("../../../config"));
const router = express_1.default.Router();
router.post('/login', rateLimiter_1.authLimiter, auth_controller_1.AuthController.loginUser);
router.post('/refresh-token', auth_controller_1.AuthController.refreshToken);
router.post('/change-password', (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT), auth_controller_1.AuthController.changePassword);
router.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
router.post('/reset-password', (req, res, next) => {
    //user is resetting password without token and logged in newly created admin or doctor
    if (!req.headers.authorization && req.cookies.accessToken) {
        console.log(req.headers.authorization, "from reset password route guard");
        console.log(req.cookies.accessToken, "from reset password route guard");
        (0, auth_1.default)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.DOCTOR, client_1.UserRole.PATIENT)(req, res, next);
    }
    else {
        //user is resetting password via email link with token
        next();
    }
}, auth_controller_1.AuthController.resetPassword);
router.get('/me', auth_controller_1.AuthController.getMe);
router.get("/google", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirect = req.query.redirect || "/";
    passport_1.default.authenticate("google", { scope: ["profile", "email"], state: redirect })(req, res, next);
}));
// api/v1/auth/google/callback?state=/booking
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: `${config_1.default.frontend_url}/login?error=There is some issues with your account. Please contact with out support team!` }), auth_controller_1.AuthController.googleCallbackController);
exports.AuthRoutes = router;
