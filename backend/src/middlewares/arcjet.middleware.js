import { getAuth } from "@clerk/express";
import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = () => async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    const decision = await aj.protect(req, {
      fingerprint: userId,
      requested: 1,
    });

    // Agar deny ho gaya
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit) {
        return res.status(429).json({ message: "Rate limit exceeded" });
      } else if (decision.reason.isBot) {
        return res.status(403).json({ message: "Bot detected" });
      } else {
        return res.status(400).json({ message: "Request denied" });
      }
    }

    // Spoofed bot check
    const spoofedBot = decision.results.some(
      (result) => result.reason.isBot && result.reason.isSpoofed
    );

    if (spoofedBot) {
      if (process.env.NODE_ENV === "production") {
        // Production me block karo
        return res.status(403).json({ message: "Spoofed bot detected" });
      } else {
        // Dev me sirf log karo
        console.log("⚠️ Spoofed bot detected (ignored in dev):", decision.results);
      }
    }

    next();
  } catch (error) {
    console.log("Arcjet Error 💥", error);
    next(error);
  }
};
