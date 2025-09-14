(function () {
  window.SANDRA_CONFIG = {
    ORIGIN: window.location.origin,
    CHAT_ENDPOINT: "/chat",                 // Netlify Functions redirect
    TOKEN_ENDPOINT: "/token/realtime",      // Netlify Functions redirect
    AVATAR_IFRAME_URL: "https://avatar.guestsvalencia.com/sandra-ia/embed/v7/chat",
    LANGUAGE: "es",
    // Opcional: si tu backend propio está disponible y quieres saltarte la Function:
    // UPSTREAM_API_URL: "https://api.guestsvalencia.com/sandra/v7"
  };
})();