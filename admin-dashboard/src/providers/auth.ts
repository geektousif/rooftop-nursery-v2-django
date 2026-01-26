import type { AuthProvider } from "@refinedev/core";
import { handleLogin, handleLogout, loggedInUser } from "../api/auth";
import { tokenStore } from "../api/client/tokenStore";

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const response = await handleLogin(email, password);
    const data = await response.json();

    if (response.status === 200) {
      tokenStore.set(data.access);
      return {
        authenticated: true,
        success: true,
        redirectTo: "/dashboard",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    await handleLogout();
    tokenStore.clear();
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    // Direct API call to DRF. If the cookie is there, it passes.
    const response = await loggedInUser();

    if (response.status === 200) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: {
        message: "Check failed",
        name: "Token not found",
      },
      // logout: true,
      redirectTo: "/login",
    };
  },

  getPermissions: async () => null,
  getIdentity: async () => {
    const response = await loggedInUser();

    if (response.status === 200) {
      const data = await response.json();
      return data;
    }

    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
