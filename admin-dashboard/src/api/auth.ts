import { baseKy } from "./client/baseKy";

export const handleLogin = async (email: string, password: string) => {
  return await baseKy.post("auth/login", {
    json: {
      email,
      password,
    },
  });
};

export const handleLogout = async () => {
  return await baseKy.post("auth/logout");
};

export const loggedInUser = async () => {
  return await baseKy.get("auth/user");
};
