import { getAuth } from "@clerk/express";
import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = () => async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    const decision = await aj.protect(req, {
      fingerprint: userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate limit exceeded" });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Bot detected" });
      } else {
        return res.status(400).json({ message: "Request denied" });
      }
    }

    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed
      )
    ) {
      return res.status(403).json({ message: "Spoofed bot detected" });
    }

    next();
  } catch (error) {
    console.log("Arcjet Error 💥", error);
    next(error);
  }
};
