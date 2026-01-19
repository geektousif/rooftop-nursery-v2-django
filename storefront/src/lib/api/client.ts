import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./v1";
import { env } from "@/env";

export const fetchClient = createFetchClient<paths>({
  baseUrl: `${env.VITE_BACKEND_SERVER_URL}`,
  credentials: "include",
});

export const $api = createClient(fetchClient);
