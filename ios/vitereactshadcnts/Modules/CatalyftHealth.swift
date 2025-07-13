import Foundation
import HealthKit
import React

@objc(CatalyftHealth)
class CatalyftHealth: NSObject {
    
    private let healthStore = HKHealthStore()
    private var backgroundObservers: [HKObserverQuery] = []
    
    override init() {
        super.init()
        setupBackgroundDelivery()
    }
    
    // MARK: - React Native Bridge Methods
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func getDailyMetrics(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        guard HKHealthStore.isHealthDataAvailable() else {
            reject("HEALTH_UNAVAILABLE", "HealthKit is not available on this device", nil)
            return
        }
        
        requestHealthKitPermissions { [weak self] success, error in
            if let error = error {
                reject("PERMISSION_ERROR", error.localizedDescription, error)
                return
            }
            
            guard success else {
                reject("PERMISSION_DENIED", "HealthKit permissions were denied", nil)
                return
            }
            
            self?.fetchDailyMetrics(resolve: resolve, reject: reject)
        }
    }
    
    // MARK: - HealthKit Permissions
    
    private func requestHealthKitPermissions(completion: @escaping (Bool, Error?) -> Void) {
        let typesToRead: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRateVariabilitySDNN)!,
            HKObjectType.quantityType(forIdentifier: .restingHeartRate)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
            HKObjectType.workoutType()
        ]
        
        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
            DispatchQueue.main.async {
                completion(success, error)
            }
        }
    }
    
    // MARK: - Data Fetching
    
    private func fetchDailyMetrics(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        let calendar = Calendar.current
        let now = Date()
        let startOfDay = calendar.startOfDay(for: now)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let group = DispatchGroup()
        var results: [String: Any] = [:]
        var errors: [Error] = []
        
        // Fetch HRV RMSSD
        group.enter()
        fetchHRVRMSSD(from: startOfDay, to: endOfDay) { value, error in
            if let error = error {
                errors.append(error)
            } else {
                results["hrvRmssd"] = value
            }
            group.leave()
        }
        
        // Fetch Resting Heart Rate
        group.enter()
        fetchRestingHeartRate(from: startOfDay, to: endOfDay) { value, error in
            if let error = error {
                errors.append(error)
            } else {
                results["hrRest"] = value
            }
            group.leave()
        }
        
        // Fetch Steps
        group.enter()
        fetchSteps(from: startOfDay, to: endOfDay) { value, error in
            if let error = error {
                errors.append(error)
            } else {
                results["steps"] = value
            }
            group.leave()
        }
        
        // Fetch Sleep Minutes
        group.enter()
        fetchSleepMinutes(from: startOfDay, to: endOfDay) { value, error in
            if let error = error {
                errors.append(error)
            } else {
                results["sleepMin"] = value
            }
            group.leave()
        }
        
        // Fetch Workouts
        group.enter()
        fetchWorkouts(from: startOfDay, to: endOfDay) { workouts, error in
            if let error = error {
                errors.append(error)
            } else {
                results["workouts"] = workouts
            }
            group.leave()
        }
        
        group.notify(queue: .main) {
            if !errors.isEmpty {
                reject("FETCH_ERROR", "Failed to fetch some health data", errors.first)
            } else {
                resolve(results)
            }
        }
    }
    
    // MARK: - Individual Data Fetchers
    
    private func fetchHRVRMSSD(from startDate: Date, to endDate: Date, completion: @escaping (Double?, Error?) -> Void) {
        guard let hrvType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) else {
            completion(nil, NSError(domain: "CatalyftHealth", code: 1, userInfo: [NSLocalizedDescriptionKey: "HRV type not available"]))
            return
        }
        
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        
        let query = HKSampleQuery(sampleType: hrvType, predicate: predicate, limit: 1, sortDescriptors: [sortDescriptor]) { _, samples, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let sample = samples?.first as? HKQuantitySample else {
                completion(nil, nil)
                return
            }
            
            let value = sample.quantity.doubleValue(for: HKUnit.secondUnit(with: .milli))
            completion(value, nil)
        }
        
        healthStore.execute(query)
    }
    
    private func fetchRestingHeartRate(from startDate: Date, to endDate: Date, completion: @escaping (Double?, Error?) -> Void) {
        guard let hrType = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) else {
            completion(nil, NSError(domain: "CatalyftHealth", code: 2, userInfo: [NSLocalizedDescriptionKey: "Resting HR type not available"]))
            return
        }
        
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        
        let query = HKSampleQuery(sampleType: hrType, predicate: predicate, limit: 1, sortDescriptors: [sortDescriptor]) { _, samples, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let sample = samples?.first as? HKQuantitySample else {
                completion(nil, nil)
                return
            }
            
            let value = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
            completion(value, nil)
        }
        
        healthStore.execute(query)
    }
    
    private func fetchSteps(from startDate: Date, to endDate: Date, completion: @escaping (Double?, Error?) -> Void) {
        guard let stepsType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            completion(nil, NSError(domain: "CatalyftHealth", code: 3, userInfo: [NSLocalizedDescriptionKey: "Steps type not available"]))
            return
        }
        
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        
        let query = HKStatisticsQuery(quantityType: stepsType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let result = result, let sum = result.sumQuantity() else {
                completion(0, nil)
                return
            }
            
            let value = sum.doubleValue(for: HKUnit.count())
            completion(value, nil)
        }
        
        healthStore.execute(query)
    }
    
    private func fetchSleepMinutes(from startDate: Date, to endDate: Date, completion: @escaping (Double?, Error?) -> Void) {
        guard let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) else {
            completion(nil, NSError(domain: "CatalyftHealth", code: 4, userInfo: [NSLocalizedDescriptionKey: "Sleep type not available"]))
            return
        }
        
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        
        let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let samples = samples as? [HKCategorySample] else {
                completion(0, nil)
                return
            }
            
            var totalSleepMinutes: Double = 0
            
            for sample in samples {
                if sample.value == HKCategoryValueSleepAnalysis.inBed.rawValue ||
                   sample.value == HKCategoryValueSleepAnalysis.asleep.rawValue {
                    let duration = sample.endDate.timeIntervalSince(sample.startDate)
                    totalSleepMinutes += duration / 60.0
                }
            }
            
            completion(totalSleepMinutes, nil)
        }
        
        healthStore.execute(query)
    }
    
    private func fetchWorkouts(from startDate: Date, to endDate: Date, completion: @escaping ([[String: Any]]?, Error?) -> Void) {
        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate, options: .strictStartDate)
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
        
        let query = HKSampleQuery(sampleType: HKWorkoutType.workoutType(), predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { _, samples, error in
            if let error = error {
                completion(nil, error)
                return
            }
            
            guard let workouts = samples as? [HKWorkout] else {
                completion([], nil)
                return
            }
            
            let workoutData = workouts.map { workout -> [String: Any] in
                return [
                    "type": workout.workoutActivityType.rawValue,
                    "startDate": ISO8601DateFormatter().string(from: workout.startDate),
                    "endDate": ISO8601DateFormatter().string(from: workout.endDate),
                    "duration": workout.duration,
                    "totalEnergyBurned": workout.totalEnergyBurned?.doubleValue(for: HKUnit.kilocalorie()) ?? 0,
                    "totalDistance": workout.totalDistance?.doubleValue(for: HKUnit.meter()) ?? 0
                ]
            }
            
            completion(workoutData, nil)
        }
        
        healthStore.execute(query)
    }
    
    // MARK: - Background Delivery Setup
    
    private func setupBackgroundDelivery() {
        let typesToObserve: [HKQuantityTypeIdentifier] = [
            .heartRateVariabilitySDNN,
            .restingHeartRate,
            .stepCount
        ]
        
        for typeIdentifier in typesToObserve {
            guard let quantityType = HKQuantityType.quantityType(forIdentifier: typeIdentifier) else { continue }
            
            let query = HKObserverQuery(sampleType: quantityType, predicate: nil) { [weak self] query, completionHandler, error in
                if let error = error {
                    print("Observer query error for \(typeIdentifier): \(error.localizedDescription)")
                    completionHandler()
                    return
                }
                
                // Handle background update
                self?.handleBackgroundUpdate(for: quantityType)
                completionHandler()
            }
            
            healthStore.execute(query)
            backgroundObservers.append(query)
            
            // Enable background delivery
            healthStore.enableBackgroundDelivery(for: quantityType, frequency: .daily) { success, error in
                if let error = error {
                    print("Failed to enable background delivery for \(typeIdentifier): \(error.localizedDescription)")
                } else if success {
                    print("Successfully enabled background delivery for \(typeIdentifier)")
                }
            }
        }
        
        // Setup background delivery for sleep and workouts
        if let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) {
            let sleepQuery = HKObserverQuery(sampleType: sleepType, predicate: nil) { [weak self] query, completionHandler, error in
                if let error = error {
                    print("Observer query error for sleep: \(error.localizedDescription)")
                    completionHandler()
                    return
                }
                
                self?.handleBackgroundUpdate(for: sleepType)
                completionHandler()
            }
            
            healthStore.execute(sleepQuery)
            backgroundObservers.append(sleepQuery)
            
            healthStore.enableBackgroundDelivery(for: sleepType, frequency: .daily) { success, error in
                if let error = error {
                    print("Failed to enable background delivery for sleep: \(error.localizedDescription)")
                } else if success {
                    print("Successfully enabled background delivery for sleep")
                }
            }
        }
        
        // Setup background delivery for workouts
        let workoutType = HKWorkoutType.workoutType()
        let workoutQuery = HKObserverQuery(sampleType: workoutType, predicate: nil) { [weak self] query, completionHandler, error in
            if let error = error {
                print("Observer query error for workouts: \(error.localizedDescription)")
                completionHandler()
                return
            }
            
            self?.handleBackgroundUpdate(for: workoutType)
            completionHandler()
        }
        
        healthStore.execute(workoutQuery)
        backgroundObservers.append(workoutQuery)
        
        healthStore.enableBackgroundDelivery(for: workoutType, frequency: .immediate) { success, error in
            if let error = error {
                print("Failed to enable background delivery for workouts: \(error.localizedDescription)")
            } else if success {
                print("Successfully enabled background delivery for workouts")
            }
        }
    }
    
    private func handleBackgroundUpdate(for sampleType: HKSampleType) {
        // This method is called when new health data is available
        // You can implement custom logic here, such as sending notifications
        // or updating local storage
        print("Background update received for: \(sampleType.identifier)")
        
        // Example: Post notification to React Native
        NotificationCenter.default.post(
            name: NSNotification.Name("HealthDataUpdated"),
            object: nil,
            userInfo: ["sampleType": sampleType.identifier]
        )
    }
    
    deinit {
        // Clean up background observers
        for query in backgroundObservers {
            healthStore.stop(query)
        }
    }
}