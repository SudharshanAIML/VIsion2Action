import { SensorData } from '../types';

let stepCount = 0;
let isMoving = false;
let heading: number | null = null;
let lastAcceleration = { x: 0, y: 0, z: 0 };
let lastUpdate = 0;

// Threshold for step detection
const STEP_THRESHOLD = 12.0; // m/s^2 total acceleration magnitude check
const MOVEMENT_TIMEOUT_MS = 2000;
let lastMoveTime = 0;

export const initSensors = async () => {
  if (typeof window === 'undefined') return;

  // iOS 13+ permission request
  if ((DeviceMotionEvent as any).requestPermission) {
    try {
      const permissionState = await (DeviceMotionEvent as any).requestPermission();
      if (permissionState !== 'granted') return;
    } catch (e) {
      console.warn("Sensor permission error", e);
    }
  }

  window.addEventListener('devicemotion', handleMotion);
  window.addEventListener('deviceorientation', handleOrientation);
};

export const stopSensors = () => {
  window.removeEventListener('devicemotion', handleMotion);
  window.removeEventListener('deviceorientation', handleOrientation);
};

const handleMotion = (event: DeviceMotionEvent) => {
  const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
  
  if (!x || !y || !z) return;

  // Simple step counting based on peak acceleration magnitude
  // This is a basic implementation for web; native apps use pedometer APIs
  const magnitude = Math.sqrt(x*x + y*y + z*z);
  
  if (magnitude > STEP_THRESHOLD) {
    const now = Date.now();
    if (now - lastUpdate > 500) { // Debounce steps (max 2 steps/sec)
      stepCount++;
      lastUpdate = now;
      isMoving = true;
      lastMoveTime = now;
    }
  }

  // Reset moving status if no steps for a while
  if (Date.now() - lastMoveTime > MOVEMENT_TIMEOUT_MS) {
    isMoving = false;
  }
};

const handleOrientation = (event: DeviceOrientationEvent) => {
  // alpha is compass direction (0-360)
  if (event.alpha !== null) {
    heading = event.alpha;
  } else if ((event as any).webkitCompassHeading) {
    // iOS specific
    heading = (event as any).webkitCompassHeading;
  }
};

export const getSensorData = (): SensorData => {
  return {
    isMoving,
    heading: heading ? Math.floor(heading) : null,
    stepCount
  };
};

export const resetStepCount = () => {
  stepCount = 0;
};