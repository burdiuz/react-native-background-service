package com.actualwave.backgroundservice

import android.content.Intent
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/** start(text, title?) / stop() for the keep-alive foreground service. Both are idempotent. */
class BackgroundServiceModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {
  override fun getName() = "ActualwaveBackgroundService"

  @ReactMethod
  fun start(text: String, title: String?) {
    val intent = Intent(context, KeepAliveService::class.java)
      .putExtra(KeepAliveService.EXTRA_TEXT, text)
      .putExtra(KeepAliveService.EXTRA_TITLE, title)
    ContextCompat.startForegroundService(context, intent)
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun isRunning(): Boolean = KeepAliveService.running

  @ReactMethod
  fun stop() {
    context.stopService(Intent(context, KeepAliveService::class.java))
  }
}
