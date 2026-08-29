export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).send(`Errore TikTok: ${error_description || error}`);
  }

  // Leggiamo il cookie con lo state originale
  const cookies = req.headers.cookie || "";
  const savedState = cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("tiktok_state="))
    ?.split("=")[1];

  // Verifica di sicurezza
  if (!state || !savedState || state !== savedState) {
    return res.status(400).send("Richiesta non valida. Riprova ad accedere con TikTok.");
  }

  if (!code) {
    return res.status(400).send("Codice di autorizzazione mancante.");
  }

  try {
    const redirectUri = "https://zio-fester.vercel.app/api/tiktok/callback";

    const response = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Errore TikTok:", data);
      return res.status(500).send("Errore durante l'accesso con TikTok.");
    }

    // Per ora confermiamo semplicemente che l'autorizzazione è riuscita.
    // NON mostriamo access_token o refresh_token nel browser.
    res.setHeader(
      "Set-Cookie",
      "tiktok_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    );

    return res.redirect("/?tiktok_login=success");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Errore del server durante il login.");
  }
}
