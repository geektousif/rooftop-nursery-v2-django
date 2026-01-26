import ky from "ky";

export const baseKy = ky.create({
  prefixUrl: "http://127.0.0.1:8000/api/v1/",
  credentials: "include",
  retry: 0,
});
