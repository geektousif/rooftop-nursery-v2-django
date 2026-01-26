import { createDataProvider } from "@refinedev/rest";
import { defaultOptions } from "./default.options";

export const MyDataProvider = createDataProvider(
  "https://example.com",
  defaultOptions,
  {},
);
