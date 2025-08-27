import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";

import { ENV } from "./env.js";

export const aj = arcjet({
  key: ENV.ARCJET_KEY,
  characteristics: ["fingerprint"],
  rules: [
    shield({
      mode: "LIVE",
    }),

    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),

    tokenBucket({
      mode: "LIVE",
      capacity: 15,
      interval: 10,
      refillRate: 10,
    }),
  ],
});
