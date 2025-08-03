import { config } from '../config';

interface DeviceData {
  strain?: number;
  recovery?: number;
  sleep?: number;
  hrv?: number;
  heartRate?: number;
  calories?: number;
  steps?: number;
  battery?: number;
  lastSync?: string;
}

interface Device {
  id: string;
  name: string;
  type: 'whoop' | 'apple' | 'garmin' | 'fitbit';
  connected: boolean;
  data?: DeviceData;
}

class WearableService {
  private devices: Device[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDevices();
  }

  private initializeDevices() {
    // Initialize with common devices - actual connection status will be determined by API calls
    this.devices = [
      {
        id: 'whoop',
        name: 'WHOOP 4.0',
        type: 'whoop',
        connected: false,
        data: {}
      },
      {
        id: 'apple',
        name: 'Apple Watch',
        type: 'apple',
        connected: false,
        data: {}
      },
      {
        id: 'garmin',
        name: 'Garmin Device',
        type: 'garmin',
        connected: false,
        data: {}
      },
      {
        id: 'fitbit',
        name: 'Fitbit Device',
        type: 'fitbit',
        connected: false,
        data: {}
      }
    ];
  }

  async connectDevice(deviceType: 'whoop' | 'apple' | 'garmin' | 'fitbit'): Promise<boolean> {
    try {
      let connected = false;

      switch (deviceType) {
        case 'whoop':
          connected = await this.connectWHOOP();
          break;
        case 'apple':
          connected = await this.connectAppleWatch();
          break;
        case 'garmin':
          connected = await this.connectGarmin();
          break;
        case 'fitbit':
          connected = await this.connectFitbit();
          break;
      }

      this.updateDeviceConnection(deviceType, connected);
      
      if (connected) {
        this.startAutoSync();
      }

      return connected;
    } catch (error) {
      console.error(`Failed to connect ${deviceType}:`, error);
      return false;
    }
  }

  async disconnectDevice(deviceType: 'whoop' | 'apple' | 'garmin' | 'fitbit'): Promise<void> {
    this.updateDeviceConnection(deviceType, false);
    
    // If no devices are connected, stop auto-sync
    const hasConnectedDevices = this.devices.some(device => device.connected);
    if (!hasConnectedDevices) {
      this.stopAutoSync();
    }
  }

  private async connectWHOOP(): Promise<boolean> {
    // WHOOP API integration would go here
    // For now, simulate connection with environment check
    if (config.openai.apiKey) { // Using OpenAI key as proxy for API connectivity
      console.log('WHOOP: Simulating connection...');
      return true;
    }
    return false;
  }

  private async connectAppleWatch(): Promise<boolean> {
    // Apple HealthKit integration would go here
    try {
      // Check if running on iOS
      const isIOS = true; // In real app, check Platform.OS === 'ios'
      if (isIOS) {
        console.log('Apple Watch: Requesting HealthKit permissions...');
        // In real implementation: await HealthKit.requestPermissions()
        return true;
      }
      return false;
    } catch (error) {
      console.error('Apple HealthKit error:', error);
      return false;
    }
  }

  private async connectGarmin(): Promise<boolean> {
    // Garmin Connect IQ integration would go here
    if (config.googleFit.clientId) {
      console.log('Garmin: Simulating Connect IQ integration...');
      return true;
    }
    return false;
  }

  private async connectFitbit(): Promise<boolean> {
    // Fitbit Web API integration would go here
    if (config.supabase.url) { // Using Supabase as proxy for API connectivity
      console.log('Fitbit: Simulating Web API connection...');
      return true;
    }
    return false;
  }

  async syncDeviceData(deviceType?: 'whoop' | 'apple' | 'garmin' | 'fitbit'): Promise<DeviceData | null> {
    const devicesToSync = deviceType 
      ? this.devices.filter(d => d.type === deviceType && d.connected)
      : this.devices.filter(d => d.connected);

    if (devicesToSync.length === 0) {
      return null;
    }

    try {
      // For demo purposes, generate realistic data based on device type
      const combinedData: DeviceData = {};

      for (const device of devicesToSync) {
        const deviceData = await this.fetchDeviceData(device.type);
        
        // Merge data from all connected devices
        Object.assign(combinedData, deviceData);
        
        // Update device data
        device.data = deviceData;
        device.data.lastSync = new Date().toLocaleTimeString();
      }

      return combinedData;
    } catch (error) {
      console.error('Sync error:', error);
      return null;
    }
  }

  private async fetchDeviceData(deviceType: 'whoop' | 'apple' | 'garmin' | 'fitbit'): Promise<DeviceData> {
    // In real implementation, these would be actual API calls
    const baseData: DeviceData = {
      lastSync: new Date().toLocaleTimeString()
    };

    switch (deviceType) {
      case 'whoop':
        return {
          ...baseData,
          strain: 6.5 + Math.random() * 3, // 6.5-9.5
          recovery: 60 + Math.random() * 30, // 60-90%
          sleep: 6.5 + Math.random() * 2, // 6.5-8.5 hours
          hrv: 35 + Math.random() * 20, // 35-55ms
          battery: 75 + Math.random() * 20 // 75-95%
        };

      case 'apple':
        return {
          ...baseData,
          heartRate: 65 + Math.random() * 20, // 65-85 BPM
          calories: 1800 + Math.random() * 400, // 1800-2200
          steps: 8000 + Math.random() * 4000, // 8000-12000
          battery: 80 + Math.random() * 15 // 80-95%
        };

      case 'garmin':
        return {
          ...baseData,
          heartRate: 60 + Math.random() * 25, // 60-85 BPM
          calories: 1900 + Math.random() * 300, // 1900-2200
          steps: 9000 + Math.random() * 3000, // 9000-12000
          battery: 70 + Math.random() * 25 // 70-95%
        };

      case 'fitbit':
        return {
          ...baseData,
          steps: 7500 + Math.random() * 5000, // 7500-12500
          calories: 1700 + Math.random() * 500, // 1700-2200
          sleep: 6 + Math.random() * 3, // 6-9 hours
          battery: 60 + Math.random() * 35 // 60-95%
        };

      default:
        return baseData;
    }
  }

  getConnectedDevices(): Device[] {
    return this.devices.filter(device => device.connected);
  }

  getAllDevices(): Device[] {
    return this.devices;
  }

  getDeviceData(deviceType: 'whoop' | 'apple' | 'garmin' | 'fitbit'): DeviceData | null {
    const device = this.devices.find(d => d.type === deviceType);
    return device?.data || null;
  }

  getCombinedHealthData(): DeviceData {
    const connectedDevices = this.getConnectedDevices();
    const combinedData: DeviceData = {};

    connectedDevices.forEach(device => {
      if (device.data) {
        // Prioritize WHOOP for strain/recovery, Apple Watch for heart rate, etc.
        if (device.type === 'whoop') {
          combinedData.strain = device.data.strain;
          combinedData.recovery = device.data.recovery;
          combinedData.sleep = device.data.sleep;
          combinedData.hrv = device.data.hrv;
        } else if (device.type === 'apple' && !combinedData.heartRate) {
          combinedData.heartRate = device.data.heartRate;
        }
        
        // Combine steps and calories from all devices (take highest)
        if (device.data.steps && (!combinedData.steps || device.data.steps > combinedData.steps)) {
          combinedData.steps = device.data.steps;
        }
        if (device.data.calories && (!combinedData.calories || device.data.calories > combinedData.calories)) {
          combinedData.calories = device.data.calories;
        }
      }
    });

    return combinedData;
  }

  private updateDeviceConnection(deviceType: 'whoop' | 'apple' | 'garmin' | 'fitbit', connected: boolean) {
    const device = this.devices.find(d => d.type === deviceType);
    if (device) {
      device.connected = connected;
      if (!connected) {
        device.data = {};
      }
    }
  }

  startAutoSync(intervalMinutes: number = 5) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const connectedDevices = this.getConnectedDevices();
      if (connectedDevices.length > 0) {
        console.log('Auto-syncing devices...');
        await this.syncDeviceData();
      }
    }, intervalMinutes * 60 * 1000);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async testConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const device of this.devices) {
      try {
        results[device.type] = await this.testDeviceConnection(device.type);
      } catch (error) {
        results[device.type] = false;
      }
    }

    return results;
  }

  private async testDeviceConnection(deviceType: 'whoop' | 'apple' | 'garmin' | 'fitbit'): Promise<boolean> {
    // Simulate connection test - in real app, this would ping the actual APIs
    switch (deviceType) {
      case 'whoop':
        return !!config.openai.apiKey; // Proxy for API availability
      case 'apple':
        return true; // HealthKit is always available on iOS
      case 'garmin':
        return !!config.googleFit.clientId;
      case 'fitbit':
        return !!config.supabase.url;
      default:
        return false;
    }
  }

  // Cleanup method
  destroy() {
    this.stopAutoSync();
    this.devices = [];
  }
}

export const wearableService = new WearableService();
export default wearableService;