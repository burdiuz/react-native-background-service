/**
 * @actualwave/react-native-background-service — keeps an Android app process alive in the
 * background through a foreground service (ongoing notification + partial wake lock).
 * Android only; on other platforms every call is a no-op.
 */
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

interface BackgroundServiceNative {
  start(text: string, title: string | null): void;
  stop(): void;
  isRunning(): boolean;
}

const native: BackgroundServiceNative | undefined =
  Platform.OS === 'android' ? NativeModules.ActualwaveBackgroundService : undefined;

/** True when the native module is linked (Android build that includes this package). */
export const isAvailable = native != null;

/**
 * Starts the service, or updates its notification when already running. `title` defaults to the
 * app name. Android may refuse the start (e.g. a background-start restriction).
 */
export function start(text: string, title?: string): void {
  native?.start(text, title ?? null);
}

/** Whether the service is running now (read from native state, so it survives a JS reload). */
export function isRunning(): boolean {
  return native?.isRunning() ?? false;
}

/** Stops the service and removes its notification. Safe to call when it is not running. */
export function stop(): void {
  native?.stop();
}

/**
 * Android 13+ asks for notification permission at runtime. Without it the service still runs, only
 * its notification is hidden. Resolves true when granted (or not needed).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Number(Platform.Version) < 33) return true;
  const result = await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as never);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}
