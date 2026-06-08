import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { refreshCookieOptions } from "../../utils/token";
import * as usersService from "./users.service";

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  sendResponse(res, { data: { user: req.user } });
});

// PUT /api/auth/profile (protected) — update name
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await usersService.updateProfile(req.user._id, req.body.name);
  sendResponse(res, { data: { user: user.toJSON() } });
});

// PUT /api/auth/password (protected) — change password
export const changePassword = asyncHandler(async (req, res) => {
  const tokens = await usersService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions());
  sendResponse(res, { message: "Password changed", data: { accessToken: tokens.accessToken } });
});

// DELETE /api/auth/account (protected) — delete account + personal data
export const deleteAccount = asyncHandler(async (req, res) => {
  await usersService.deleteAccount(req.user._id);
  res.clearCookie("refreshToken", { path: "/api/auth" });
  sendResponse(res, { message: "Account deleted" });
});
