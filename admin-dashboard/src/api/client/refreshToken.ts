// api/refreshToken.ts
import { baseKy } from "./baseKy";
import { tokenStore } from "./tokenStore";
import {
  refreshChannel,
  REFRESH_STARTED,
  REFRESH_DONE,
  REFRESH_FAILED,
} from "./refreshChannel";

let localRefreshing = false;
let waiters: (() => void)[] = [];

export async function refreshToken(refreshEndpoint: string) {
  if (localRefreshing) {
    return new Promise<void>((resolve) => waiters.push(resolve));
  }

  localRefreshing = true;
  refreshChannel.postMessage(REFRESH_STARTED);

  try {
    const data = await baseKy.post(refreshEndpoint).json<{ access: string }>();

    tokenStore.set(data.access);

    refreshChannel.postMessage({
      type: REFRESH_DONE,
      access: data.access,
    });

    waiters.forEach((r) => r());
    waiters = [];
  } catch (err) {
    refreshChannel.postMessage(REFRESH_FAILED);
    throw err;
  } finally {
    localRefreshing = false;
  }
}
