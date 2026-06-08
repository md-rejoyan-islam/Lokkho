import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { refreshCookieOptions } from "../../utils/token";
import { exposeDevLinks } from "../../utils/mailer";
import * as authService from "./auth.service";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { user, tokens, verifyLink } = await authService.registerUser(req.body);
  res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());
  sendResponse(res, {
    statusCode: 201,
    data: {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      ...(exposeDevLinks ? { devVerifyLink: verifyLink } : {}),
    },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.loginUser(req.body);
  res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());
  sendResponse(res, { data: { user: user.toJSON(), accessToken: tokens.accessToken } });
});

// POST /api/auth/refresh — validates against DB and rotates the token
export const refresh = asyncHandler(async (req, res) => {
  const tokens = await authService.rotateSession(req.cookies?.refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());
  sendResponse(res, { data: { accessToken: tokens.accessToken } });
});

// POST /api/auth/logout — revokes this session's refresh token
export const logout = asyncHandler(async (req, res) => {
  await authService.revokeSession(req.cookies?.refreshToken);
  res.clearCookie("refreshToken", { path: "/api/auth" });
  sendResponse(res, { message: "Logged out" });
});

// POST /api/auth/forgot-password — always responds success (no email enumeration)
export const forgotPassword = asyncHandler(async (req, res) => {
  const devLink = await authService.requestPasswordReset(req.body.email);
  sendResponse(res, {
    message: "If that email exists, a reset link has been sent.",
    data: exposeDevLinks && devLink ? { devResetLink: devLink } : undefined,
  });
});

// POST /api/auth/reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetUserPassword(req.body.token, req.body.password);
  sendResponse(res, { message: "Password reset. Please log in." });
});

// POST /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyUserEmail(req.body.token);
  sendResponse(res, { message: "Email verified" });
});

// POST /api/auth/resend-verification (protected)
export const resendVerification = asyncHandler(async (req, res) => {
  const { alreadyVerified, link } = await authService.resendVerification(req.user._id);
  if (alreadyVerified) return sendResponse(res, { message: "Already verified" });
  sendResponse(res, {
    message: "Verification email sent.",
    data: exposeDevLinks ? { devVerifyLink: link } : undefined,
  });
});
