package com.sencillo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

class GooglePlayServicesCheck(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "GooglePlayServicesCheck"
    }
    
    @ReactMethod
    fun isGooglePlayServicesAvailable(promise: Promise) {
        try {
            val apiAvailability = GoogleApiAvailability.getInstance()
            val resultCode = apiAvailability.isGooglePlayServicesAvailable(reactApplicationContext)
            
            val isAvailable = resultCode == ConnectionResult.SUCCESS
            val result = mapOf(
                "available" to isAvailable,
                "resultCode" to resultCode,
                "errorString" to if (isAvailable) null else apiAvailability.getErrorString(resultCode),
                "isUserResolvableError" to if (isAvailable) false else apiAvailability.isUserResolvableError(resultCode)
            )
            
            promise.resolve(com.facebook.react.bridge.Arguments.makeNativeMap(result))
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to check Google Play Services: ${e.message}", e)
        }
    }
}



