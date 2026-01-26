// api/createAuthKy.ts
import { baseKy } from "./baseKy";
import { tokenStore } from "./tokenStore";
import { refreshToken } from "./refreshToken";
import { refreshChannel, REFRESH_DONE, REFRESH_FAILED } from "./refreshChannel";

const refreshEndpoint = "auth/refreshToken";

export function adminKy() {
  // Listen for refresh results from OTHER tabs
  refreshChannel.onmessage = (event) => {
    if (event.data?.type === REFRESH_DONE) {
      tokenStore.set(event.data.access);
    }

    if (event.data === REFRESH_FAILED) {
      tokenStore.clear();
      window.location.href = "/login";
    }
  };

  return baseKy.extend({
    hooks: {
      beforeRequest: [
        (request) => {
          const token = tokenStore.get();
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        },
      ],

      afterResponse: [
        async (request, options, response) => {
          if (response.status !== 401) {
            return response;
          }

          // Prevent infinite loops
          if (request.headers.get("x-retried") === "1") {
            tokenStore.clear();
            window.location.href = "/login";
            throw response;
          }

          try {
            await refreshToken(refreshEndpoint);
          } catch {
            tokenStore.clear();
            window.location.href = "/login";
            throw response;
          }

          // 🔑 RETRY ORIGINAL REQUEST (NOT LOST)
          return baseKy(request, {
            ...options,
            headers: {
              ...Object.fromEntries(options.headers ?? []),
              Authorization: `Bearer ${tokenStore.get()}`,
              "x-retried": "1",
            },
          });
        },
      ],
    },
  });
}
