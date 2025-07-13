package com.anonymous.vite_react_shadcnts.health 

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.fitness.Fitness
import com.google.android.gms.fitness.data.DataType
import com.google.android.gms.fitness.request.OnDataPointListener
import com.google.android.gms.fitness.request.SensorRequest
import java.util.concurrent.TimeUnit

class FitnessSyncService : Service() {
    
    companion object {
        private const val TAG = "FitnessSyncService"
    }
    
    private val dataPointListeners = mutableMapOf<DataType, OnDataPointListener>()
    
    override fun onBind(intent: Intent?): IBinder? = null
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "FitnessSyncService started")
        
        val account = GoogleSignIn.getLastSignedInAccount(this)
        if (account != null) {
            setupBackgroundListeners(account)
        }
        
        return START_STICKY // Restart service if killed
    }
    
    private fun setupBackgroundListeners(account: com.google.android.gms.auth.api.signin.GoogleSignInAccount) {
        val dataTypes = listOf(
            DataType.TYPE_HEART_RATE_BPM,
            DataType.TYPE_STEP_COUNT_DELTA
        )
        
        dataTypes.forEach { dataType ->
            val listener = OnDataPointListener { dataPoint ->
                Log.d(TAG, "Background fitness data received: ${dataPoint.dataType.name}")
                // Handle background data updates
                // You could store in local database, send to server, etc.
            }
            
            val request = SensorRequest.Builder()
                .setDataType(dataType)
                .setSamplingRate(5, TimeUnit.MINUTES) // Less frequent for background
                .build()
            
            Fitness.getSensorsClient(this, account)
                .add(request, listener)
                .addOnSuccessListener {
                    Log.d(TAG, "Background listener registered for ${dataType.name}")
                    dataPointListeners[dataType] = listener
                }
                .addOnFailureListener { exception ->
                    Log.e(TAG, "Failed to register background listener for ${dataType.name}", exception)
                }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "FitnessSyncService destroyed")
        
        val account = GoogleSignIn.getLastSignedInAccount(this)
        if (account != null) {
            dataPointListeners.forEach { (_, listener) ->
                Fitness.getSensorsClient(this, account).remove(listener)
            }
        }
        dataPointListeners.clear()
    }
}