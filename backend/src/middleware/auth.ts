import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/token";
import { User } from "../modules/users/users.model";

// Requires a valid access token. Attaches req.user.
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw ApiError.unauthorized("Access token missing");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }

  const user = await User.findById(payload.sub).select("_id name email emailVerified");
  if (!user) throw ApiError.unauthorized("User no longer exists");

  req.user = user as any;
  next();
});
