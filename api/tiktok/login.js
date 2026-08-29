import crypto from "crypto";

export default function handler(req, res) {
  const state = crypto.randomBytes(32).toString("hex");

  // Salviamo lo state temporaneamente per proteggere il login
  res.setHeader(
    "Set-Cookie",
    `tiktok_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
  );

  const redirectUri = "https://zio-fester.vercel.app/api/tiktok/callback";

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY,
    response_type: "code",
    scope: "user.info.basic",
    redirect_uri: redirectUri,
    state: state,
  });

  res.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
}
