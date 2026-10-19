# @actualwave/react-native-background-service

Keeps an Android React Native app alive in the background with a foreground service: an ongoing notification plus a partial
wake lock. Use it while the app does work that must continue when the user leaves it, such as hosting a local HTTP server,
holding sockets or running a long task.

Plain React Native module (no Expo dependency). Android only; on other platforms every call is a no-op and `isRunning()`
returns `false`.

## How it works

`start()` launches a foreground service. Android treats a process that hosts a foreground service as a high-priority one, so
it is much less likely to kill your app while it is in the background. Android requires such a service to show a notification,
and the library also holds a partial wake lock, so the CPU stays awake with the screen off. The notification is the service's
visible face, not what keeps the process alive, and it is not updated on a timer: it changes only when you call `start()` again.

The service stops on `stop()`, and automatically when the user swipes the app away from recents.

## Install

```sh
npm install @actualwave/react-native-background-service
```

Autolinking picks it up. Rebuild the native app (`npx react-native run-android`, or `npx expo prebuild` + a native build for Expo).

The library's manifest is merged into yours and declares:

| Entry | Why |
| --- | --- |
| `FOREGROUND_SERVICE` | run a foreground service |
| `FOREGROUND_SERVICE_SPECIAL_USE` | the service type (Android 14+ requires a type) |
| `POST_NOTIFICATIONS` | show the notification on Android 13+ |
| `WAKE_LOCK` | keep the CPU awake |
| `<service … foregroundServiceType="specialUse">` | the service itself, not exported |

## Usage

```ts
import {
  start, stop, isRunning, isAvailable, requestNotificationPermission,
} from '@actualwave/react-native-background-service';

await requestNotificationPermission();      // Android 13+: ask once, before the first start
start('Serving on port 8080', 'My server'); // title is optional
start('2 connections');                     // call again to change the text
stop();
```

Start it when the work begins and stop it when the work ends, for example while a server is listening:

```ts
useEffect(() => {
  start('Server running');
  return () => stop();
}, []);
```

If the work starts and stops often, delay `stop()` a few seconds so the notification does not flicker.

## API

| Export | Description |
| --- | --- |
| `start(text, title?)` | Starts the service, or updates its notification if already running. `title` defaults to the app name. Android may refuse the start (see Limits). |
| `stop()` | Stops the service and removes the notification. Safe when not running. |
| `isRunning()` | Whether the service is running now. Read from native state, so it is correct after a JS reload. |
| `isAvailable` | `true` when the native module is linked (Android build that includes this package). |
| `requestNotificationPermission()` | Asks for the `POST_NOTIFICATIONS` runtime permission on Android 13+. Resolves `true` when granted or not needed. |

Without the notification permission the service still runs; only its notification is hidden.

## Limits

- **Foreground start only.** Android 12+ blocks starting a foreground service while the app is in the background, so call
  `start()` while the app is visible (or from a user-triggered event). The library does not catch that native exception, so a rejected start can crash the app.
- **Battery policies.** Some manufacturers still kill background apps despite a foreground service, and users can restrict
  background activity per app. The library cannot override that.
- **Google Play.** `specialUse` services must be declared in the Play Console with a justification. The manifest property
  describes the use as "Keeps the app process alive while it hosts local servers or sockets"; adjust it to your app by overriding
  the property in your own manifest (`tools:replace="android:value"`) and make sure your Play declaration matches.
- **Not for scheduled work.** It keeps a running app running. It does not wake a closed app or schedule jobs; use WorkManager
  for that.
- The notification is visible and ongoing, and the user can see it in the shade. Use text that explains what is running.

## License

MIT
