package com.anonymous.vite_react_shadcnts.health 

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.fitness.Fitness
import com.google.android.gms.fitness.FitnessOptions
import com.google.android.gms.fitness.data.*
import com.google.android.gms.fitness.request.DataReadRequest
import com.google.android.gms.fitness.request.OnDataPointListener
import com.google.android.gms.fitness.request.SensorRequest
import com.google.android.gms.tasks.Task
import com.google.android.gms.tasks.Tasks
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

class CatalyftFitModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        private const val TAG = "CatalyftFit"
        private const val GOOGLE_FIT_PERMISSIONS_REQUEST_CODE = 1001
        private const val ISO_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'"
    }

    private var googleSignInClient: GoogleSignInClient? = null
    private var fitnessOptions: FitnessOptions? = null
    private val dataPointListeners = mutableMapOf<DataType, OnDataPointListener>()
    private var pendingPromise: Promise? = null

    init {
        reactApplicationContext.addActivityEventListener(this)
        setupGoogleFit()
    }

    override fun getName(): String = "CatalyftFit"

    private fun setupGoogleFit() {
        // Configure Google Fit options with required scopes
        fitnessOptions = FitnessOptions.builder()
            .addDataType(DataType.TYPE_HEART_RATE_BPM, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.AGGREGATE_HEART_RATE_SUMMARY, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.TYPE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.AGGREGATE_STEP_COUNT_DELTA, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.TYPE_SLEEP_SEGMENT, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.TYPE_ACTIVITY_SEGMENT, FitnessOptions.ACCESS_READ)
            .addDataType(DataType.TYPE_WORKOUT_EXERCISE, FitnessOptions.ACCESS_READ)
            .addDataType(HealthDataTypes.TYPE_HEART_RATE_VARIABILITY_RMSSD, FitnessOptions.ACCESS_READ)
            .build()

        // Configure Google Sign-In
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestEmail()
            .requestScopes(
                com.google.android.gms.common.api.Scope("https://www.googleapis.com/auth/fitness.activity.read"),
                com.google.android.gms.common.api.Scope("https://www.googleapis.com/auth/fitness.sleep.read"),
                com.google.android.gms.common.api.Scope("https://www.googleapis.com/auth/fitness.heart_rate.read")
            )
            .build()

        googleSignInClient = GoogleSignIn.getClient(reactApplicationContext, gso)
    }

    @ReactMethod
    fun getDailyMetrics(promise: Promise) {
        try {
            val account = GoogleSignIn.getLastSignedInAccount(reactApplicationContext)
            
            if (account == null) {
                // Need to sign in first
                pendingPromise = promise
                requestGoogleFitPermissions()
                return
            }

            if (!GoogleSignIn.hasPermissions(account, fitnessOptions)) {
                // Need to request permissions
                pendingPromise = promise
                requestGoogleFitPermissions()
                return
            }

            fetchDailyMetrics(account, promise)
        } catch (e: Exception) {
            Log.e(TAG, "Error in getDailyMetrics", e)
            promise.reject("FETCH_ERROR", "Failed to get daily metrics: ${e.message}", e)
        }
    }

    private fun requestGoogleFitPermissions() {
        val currentActivity = currentActivity
        if (currentActivity == null) {
            pendingPromise?.reject("NO_ACTIVITY", "No current activity available", null)
            pendingPromise = null
            return
        }

        fitnessOptions?.let { options ->
            GoogleSignIn.requestPermissions(
                currentActivity,
                GOOGLE_FIT_PERMISSIONS_REQUEST_CODE,
                GoogleSignIn.getLastSignedInAccount(reactApplicationContext),
                options
            )
        }
    }

    private fun fetchDailyMetrics(account: GoogleSignInAccount, promise: Promise) {
        val calendar = Calendar.getInstance()
        val endTime = calendar.timeInMillis
        
        // Start of today
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        val startTime = calendar.timeInMillis

        val tasks = mutableListOf<Task<*>>()
        val results = WritableNativeMap()

        // Fetch HRV RMSSD
        tasks.add(fetchHRVRMSSD(account, startTime, endTime).continueWith { task ->
            if (task.isSuccessful) {
                results.putDouble("hrvRmssd", task.result ?: 0.0)
            } else {
                Log.w(TAG, "Failed to fetch HRV RMSSD", task.exception)
                results.putNull("hrvRmssd")
            }
        })

        // Fetch Resting Heart Rate
        tasks.add(fetchRestingHeartRate(account, startTime, endTime).continueWith { task ->
            if (task.isSuccessful) {
                results.putDouble("hrRest", task.result ?: 0.0)
            } else {
                Log.w(TAG, "Failed to fetch resting heart rate", task.exception)
                results.putNull("hrRest")
            }
        })

        // Fetch Steps
        tasks.add(fetchSteps(account, startTime, endTime).continueWith { task ->
            if (task.isSuccessful) {
                results.putDouble("steps", task.result ?: 0.0)
            } else {
                Log.w(TAG, "Failed to fetch steps", task.exception)
                results.putNull("steps")
            }
        })

        // Fetch Sleep Minutes
        tasks.add(fetchSleepMinutes(account, startTime, endTime).continueWith { task ->
            if (task.isSuccessful) {
                results.putDouble("sleepMin", task.result ?: 0.0)
            } else {
                Log.w(TAG, "Failed to fetch sleep minutes", task.exception)
                results.putNull("sleepMin")
            }
        })

        // Fetch Workouts
        tasks.add(fetchWorkouts(account, startTime, endTime).continueWith { task ->
            if (task.isSuccessful) {
                results.putArray("workouts", task.result ?: WritableNativeArray())
            } else {
                Log.w(TAG, "Failed to fetch workouts", task.exception)
                results.putArray("workouts", WritableNativeArray())
            }
        })

        // Wait for all tasks to complete
        Tasks.whenAll(tasks).addOnCompleteListener { allTasks ->
            if (allTasks.isSuccessful) {
                promise.resolve(results)
            } else {
                Log.e(TAG, "Some tasks failed", allTasks.exception)
                promise.resolve(results) // Return partial results
            }
        }.addOnFailureListener { exception ->
            Log.e(TAG, "Failed to fetch metrics", exception)
            promise.reject("FETCH_ERROR", "Failed to fetch daily metrics: ${exception.message}", exception)
        }
    }

    private fun fetchHRVRMSSD(account: GoogleSignInAccount, startTime: Long, endTime: Long): Task<Double?> {
        val readRequest = DataReadRequest.Builder()
            .read(HealthDataTypes.TYPE_HEART_RATE_VARIABILITY_RMSSD)
            .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
            .setLimit(1)
            .build()

        return Fitness.getHistoryClient(reactApplicationContext, account)
            .readData(readRequest)
            .continueWith { task ->
                if (task.isSuccessful) {
                    val dataSet = task.result?.getDataSet(HealthDataTypes.TYPE_HEART_RATE_VARIABILITY_RMSSD)
                    val dataPoints = dataSet?.dataPoints
                    if (!dataPoints.isNullOrEmpty()) {
                        val latestPoint = dataPoints.maxByOrNull { it.getTimestamp(TimeUnit.MILLISECONDS) }
                        latestPoint?.getValue(HealthFields.FIELD_HEART_RATE_VARIABILITY_RMSSD)?.asFloat()?.toDouble()
                    } else null
                } else {
                    Log.w(TAG, "Failed to read HRV RMSSD data", task.exception)
                    null
                }
            }
    }

    private fun fetchRestingHeartRate(account: GoogleSignInAccount, startTime: Long, endTime: Long): Task<Double?> {
        val readRequest = DataReadRequest.Builder()
            .aggregate(DataType.TYPE_HEART_RATE_BPM)
            .bucketByTime(1, TimeUnit.DAYS)
            .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
            .build()

        return Fitness.getHistoryClient(reactApplicationContext, account)
            .readData(readRequest)
            .continueWith { task ->
                if (task.isSuccessful) {
                    val buckets = task.result?.buckets
                    if (!buckets.isNullOrEmpty()) {
                        val bucket = buckets.first()
                        val dataSet = bucket.getDataSet(DataType.AGGREGATE_HEART_RATE_SUMMARY)
                        val dataPoints = dataSet?.dataPoints
                        if (!dataPoints.isNullOrEmpty()) {
                            val point = dataPoints.first()
                            point.getValue(Field.FIELD_MIN)?.asFloat()?.toDouble()
                        } else null
                    } else null
                } else {
                    Log.w(TAG, "Failed to read resting heart rate data", task.exception)
                    null
                }
            }
    }

    private fun fetchSteps(account: GoogleSignInAccount, startTime: Long, endTime: Long): Task<Double?> {
        val readRequest = DataReadRequest.Builder()
            .aggregate(DataType.TYPE_STEP_COUNT_DELTA)
            .bucketByTime(1, TimeUnit.DAYS)
            .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
            .build()

        return Fitness.getHistoryClient(reactApplicationContext, account)
            .readData(readRequest)
            .continueWith { task ->
                if (task.isSuccessful) {
                    val buckets = task.result?.buckets
                    var totalSteps = 0.0
                    buckets?.forEach { bucket ->
                        val dataSet = bucket.getDataSet(DataType.AGGREGATE_STEP_COUNT_DELTA)
                        dataSet?.dataPoints?.forEach { dataPoint ->
                            totalSteps += dataPoint.getValue(Field.FIELD_STEPS)?.asInt()?.toDouble() ?: 0.0
                        }
                    }
                    totalSteps
                } else {
                    Log.w(TAG, "Failed to read steps data", task.exception)
                    null
                }
            }
    }

    private fun fetchSleepMinutes(account: GoogleSignInAccount, startTime: Long, endTime: Long): Task<Double?> {
        val readRequest = DataReadRequest.Builder()
            .read(DataType.TYPE_SLEEP_SEGMENT)
            .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
            .build()

        return Fitness.getHistoryClient(reactApplicationContext, account)
            .readData(readRequest)
            .continueWith { task ->
                if (task.isSuccessful) {
                    val dataSet = task.result?.getDataSet(DataType.TYPE_SLEEP_SEGMENT)
                    val dataPoints = dataSet?.dataPoints
                    var totalSleepMinutes = 0.0
                    
                    dataPoints?.forEach { dataPoint ->
                        val sleepType = dataPoint.getValue(Field.FIELD_SLEEP_SEGMENT_TYPE)?.asInt()
                        // Include light sleep, deep sleep, and REM sleep
                        if (sleepType in listOf(1, 2, 3, 4)) { // Light, Deep, REM, Awake in sleep
                            val startTimeMs = dataPoint.getStartTime(TimeUnit.MILLISECONDS)
                            val endTimeMs = dataPoint.getEndTime(TimeUnit.MILLISECONDS)
                            val durationMinutes = (endTimeMs - startTimeMs) / (1000.0 * 60.0)
                            totalSleepMinutes += durationMinutes
                        }
                    }
                    totalSleepMinutes
                } else {
                    Log.w(TAG, "Failed to read sleep data", task.exception)
                    null
                }
            }
    }

    private fun fetchWorkouts(account: GoogleSignInAccount, startTime: Long, endTime: Long): Task<WritableArray?> {
        val readRequest = DataReadRequest.Builder()
            .read(DataType.TYPE_ACTIVITY_SEGMENT)
            .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
            .build()

        return Fitness.getHistoryClient(reactApplicationContext, account)
            .readData(readRequest)
            .continueWith { task ->
                if (task.isSuccessful) {
                    val dataSet = task.result?.getDataSet(DataType.TYPE_ACTIVITY_SEGMENT)
                    val dataPoints = dataSet?.dataPoints
                    val workouts = WritableNativeArray()
                    val dateFormat = SimpleDateFormat(ISO_DATE_FORMAT, Locale.getDefault())
                    dateFormat.timeZone = TimeZone.getTimeZone("UTC")

                    dataPoints?.forEach { dataPoint ->
                        val activityType = dataPoint.getValue(Field.FIELD_ACTIVITY)?.asInt()
                        
                        // Filter for workout activities (exclude still, walking, etc.)
                        if (isWorkoutActivity(activityType)) {
                            val workout = WritableNativeMap()
                            val startTimeMs = dataPoint.getStartTime(TimeUnit.MILLISECONDS)
                            val endTimeMs = dataPoint.getEndTime(TimeUnit.MILLISECONDS)
                            val durationSeconds = (endTimeMs - startTimeMs) / 1000.0

                            workout.putInt("type", activityType ?: 0)
                            workout.putString("startDate", dateFormat.format(Date(startTimeMs)))
                            workout.putString("endDate", dateFormat.format(Date(endTimeMs)))
                            workout.putDouble("duration", durationSeconds)
                            workout.putDouble("totalEnergyBurned", 0.0) // Would need separate query
                            workout.putDouble("totalDistance", 0.0) // Would need separate query

                            workouts.pushMap(workout)
                        }
                    }
                    workouts
                } else {
                    Log.w(TAG, "Failed to read workout data", task.exception)
                    null
                }
            }
    }

    private fun isWorkoutActivity(activityType: Int?): Boolean {
        return when (activityType) {
            FitnessActivities.RUNNING,
            FitnessActivities.BIKING,
            FitnessActivities.WALKING,
            FitnessActivities.STRENGTH_TRAINING,
            FitnessActivities.YOGA,
            FitnessActivities.PILATES,
            FitnessActivities.SWIMMING,
            FitnessActivities.DANCING,
            FitnessActivities.HIKING,
            FitnessActivities.MARTIAL_ARTS,
            FitnessActivities.TENNIS,
            FitnessActivities.BASKETBALL,
            FitnessActivities.FOOTBALL_AMERICAN,
            FitnessActivities.SOCCER,
            FitnessActivities.VOLLEYBALL -> true
            else -> false
        }
    }

    @ReactMethod
    fun startRealTimeUpdates(promise: Promise) {
        try {
            val account = GoogleSignIn.getLastSignedInAccount(reactApplicationContext)
            if (account == null || !GoogleSignIn.hasPermissions(account, fitnessOptions)) {
                promise.reject("PERMISSION_ERROR", "Google Fit permissions not granted", null)
                return
            }

            setupRealTimeListeners(account)
            promise.resolve("Real-time updates started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting real-time updates", e)
            promise.reject("REALTIME_ERROR", "Failed to start real-time updates: ${e.message}", e)
        }
    }

    @ReactMethod
    fun stopRealTimeUpdates(promise: Promise) {
        try {
            val account = GoogleSignIn.getLastSignedInAccount(reactApplicationContext)
            if (account != null) {
                dataPointListeners.forEach { (dataType, listener) ->
                    Fitness.getSensorsClient(reactApplicationContext, account)
                        .remove(listener)
                }
                dataPointListeners.clear()
            }
            promise.resolve("Real-time updates stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping real-time updates", e)
            promise.reject("REALTIME_ERROR", "Failed to stop real-time updates: ${e.message}", e)
        }
    }

    private fun setupRealTimeListeners(account: GoogleSignInAccount) {
        val dataTypes = listOf(
            DataType.TYPE_HEART_RATE_BPM,
            DataType.TYPE_STEP_COUNT_DELTA
        )

        dataTypes.forEach { dataType ->
            val listener = OnDataPointListener { dataPoint ->
                sendEvent("FitnessDataUpdate", createDataPointMap(dataPoint))
            }

            val request = SensorRequest.Builder()
                .setDataType(dataType)
                .setSamplingRate(30, TimeUnit.SECONDS)
                .build()

            Fitness.getSensorsClient(reactApplicationContext, account)
                .add(request, listener)
                .addOnSuccessListener {
                    Log.d(TAG, "Listener registered for ${dataType.name}")
                    dataPointListeners[dataType] = listener
                }
                .addOnFailureListener { exception ->
                    Log.e(TAG, "Failed to register listener for ${dataType.name}", exception)
                }
        }
    }

    private fun createDataPointMap(dataPoint: DataPoint): WritableMap {
        val map = WritableNativeMap()
        val dateFormat = SimpleDateFormat(ISO_DATE_FORMAT, Locale.getDefault())
        dateFormat.timeZone = TimeZone.getTimeZone("UTC")

        map.putString("dataType", dataPoint.dataType.name)
        map.putString("timestamp", dateFormat.format(Date(dataPoint.getTimestamp(TimeUnit.MILLISECONDS))))
        
        val values = WritableNativeArray()
        dataPoint.dataType.fields.forEach { field ->
            val value = WritableNativeMap()
            value.putString("field", field.name)
            
            when (field.format) {
                Field.FORMAT_INT32 -> value.putInt("value", dataPoint.getValue(field).asInt())
                Field.FORMAT_FLOAT -> value.putDouble("value", dataPoint.getValue(field).asFloat().toDouble())
                Field.FORMAT_STRING -> value.putString("value", dataPoint.getValue(field).asString())
                else -> value.putString("value", dataPoint.getValue(field).toString())
            }
            values.pushMap(value)
        }
        map.putArray("values", values)
        
        return map
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == GOOGLE_FIT_PERMISSIONS_REQUEST_CODE) {
            val account = GoogleSignIn.getLastSignedInAccount(reactApplicationContext)
            if (account != null && GoogleSignIn.hasPermissions(account, fitnessOptions)) {
                pendingPromise?.let { promise ->
                    fetchDailyMetrics(account, promise)
                }
            } else {
                pendingPromise?.reject("PERMISSION_DENIED", "Google Fit permissions were denied", null)
            }
            pendingPromise = null
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // Handle new intents if needed
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN built in Event Emitter Calls
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN built in Event Emitter Calls
    }
}