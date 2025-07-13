//
//  CatalyftHealth.m
//  CatalyftHealth
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CatalyftHealth, NSObject)

RCT_EXTERN_METHOD(getDailyMetrics:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end