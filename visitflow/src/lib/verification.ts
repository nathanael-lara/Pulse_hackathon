import type { MedicationDoseLog, VerificationData, WorkoutSession, SuspiciousActivityScore } from '@/lib/types';

/**
 * DEVICE UNLOCK VERIFICATION
 * Requires patient to unlock their device to verify they're actually taking meds
 */
export async function verifyDeviceUnlock(): Promise<VerificationData | null> {
  if (!window.navigator.credentials) {
    return null; // Web Authentication not available
  }

  try {
    // Request device unlock via WebAuthn (Touch ID, Face ID, Windows Hello, etc)
    const assertion = await window.navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32), // Dummy challenge
        timeout: 5000,
        userVerification: 'preferred',
      },
    } as CredentialRequestOptions);

    if (assertion) {
      return {
        method: 'device-unlock',
        verified: true,
        timestamp: new Date().toISOString(),
        details: { biometricType: 'device-unlock' },
      };
    }
  } catch (error) {
    // User cancelled or device doesn't support WebAuthn
    return {
      method: 'device-unlock',
      verified: false,
      timestamp: new Date().toISOString(),
      details: { error: String(error) },
    };
  }

  return null;
}

/**
 * TIMESTAMP WINDOW VERIFICATION
 * Patient can only log meds within ±5 minutes of scheduled reminder
 */
export function verifyTimestampWindow(scheduledTime: string): VerificationData {
  const now = new Date();
  const scheduled = new Date(scheduledTime);
  const diffMs = now.getTime() - scheduled.getTime();
  const windowMs = 5 * 60 * 1000; // ±5 minutes

  const verified = diffMs >= 0 && diffMs < windowMs;

  return {
    method: 'timestamp-window',
    verified,
    timestamp: now.toISOString(),
    details: { diffMinutes: Math.round(diffMs / 60000), windowMinutes: 5 },
  };
}

/**
 * GEOLOCATION VERIFICATION
 * Confirms patient is outdoors before logging a workout
 */
export async function verifyGeolocation(): Promise<VerificationData | null> {
  if (!navigator.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        // Accuracy < 30m generally means outdoors with good GPS signal
        const isOutdoors = accuracy < 30;

        resolve({
          method: 'geolocation',
          verified: isOutdoors,
          timestamp: new Date().toISOString(),
          details: {
            latitude: Math.round(latitude * 10000) / 10000,
            longitude: Math.round(longitude * 10000) / 10000,
            accuracy,
            isOutdoors,
          },
        });
      },
      () => {
        // Permission denied or error
        resolve({
          method: 'geolocation',
          verified: false,
          timestamp: new Date().toISOString(),
          details: { error: 'Location permission denied' },
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/**
 * HEART RATE VALIDATION
 * Checks if logged HR matches the claimed activity
 * Examples:
 * - 20-min walk should show HR 70-100
 * - 30-min swim should show HR 80-110
 * - Stretching should show HR <70
 */
export function validateHeartRate(
  activityType: string,
  durationMinutes: number,
  avgHeartRate: number | undefined
): VerificationData {
  const now = new Date();

  // No HR provided = invalid
  if (avgHeartRate === undefined) {
    return {
      method: 'heart-rate',
      verified: false,
      timestamp: now.toISOString(),
      details: { reason: 'No heart rate data provided' },
    };
  }

  // Expected HR ranges by activity
  const expectedRanges: Record<string, { min: number; max: number }> = {
    walk: { min: 70, max: 105 }, // Easy walking
    bike: { min: 80, max: 120 }, // Moderate cycling
    swim: { min: 85, max: 130 }, // Swimming effort
    stretch: { min: 50, max: 80 }, // Gentle stretching
    rest: { min: 50, max: 75 }, // At rest/resting
  };

  const range = expectedRanges[activityType] || { min: 60, max: 120 };
  const isValid = avgHeartRate >= range.min && avgHeartRate <= range.max;

  return {
    method: 'heart-rate',
    verified: isValid,
    timestamp: now.toISOString(),
    details: {
      activityType,
      avgHeartRate,
      expectedMin: range.min,
      expectedMax: range.max,
    },
  };
}

/**
 * SUSPICIOUS ACTIVITY SCORING
 * Analyzes patterns to detect cheating:
 * - Consistent quick clicks (always <3 sec after notification)
 * - Perfect timing windows (always logged at boundaries)
 * - No HR data (claims workouts but never logs HR)
 * - No geo variation (always logs from same location)
 */
export function calculateSuspiciousActivityScore(
  medicationLogs: MedicationDoseLog[],
  workoutSessions: WorkoutSession[],
  userId: string
): SuspiciousActivityScore {
  const flags = {
    consistentQuickClicks: false,
    alwaysLogsWithinWindow: false,
    noHRDataOnWorkouts: false,
    noGeoVariation: false,
  };

  let score = 0;

  // Check 1: Consistent quick clicks on medication reminders
  const recentMedLogs = medicationLogs.slice(-10);
  if (recentMedLogs.length >= 5) {
    const quickClicks = recentMedLogs.filter((log) => {
      const verifyData = log.verifications?.find((v) => v.method === 'timestamp-window');
      if (!verifyData) return false;
      const diffMs = verifyData.details?.diffMinutes
        ? (verifyData.details.diffMinutes as number) * 60000
        : 0;
      return diffMs < 3 * 1000; // Less than 3 seconds
    }).length;

    if (quickClicks >= recentMedLogs.length * 0.8) {
      // 80% of logs are suspiciously quick
      flags.consistentQuickClicks = true;
      score += 25;
    }
  }

  // Check 2: Always logs within the tiny window (too perfect timing)
  const perfectTimingLogs = recentMedLogs.filter((log) => {
    const verifyData = log.verifications?.find((v) => v.method === 'timestamp-window');
    return verifyData?.verified;
  }).length;

  if (perfectTimingLogs === recentMedLogs.length && recentMedLogs.length >= 7) {
    // Every single log verified in perfect window
    flags.alwaysLogsWithinWindow = true;
    score += 20;
  }

  // Check 3: Claims workouts but never includes HR data
  const recentWorkouts = workoutSessions.slice(-10);
  if (recentWorkouts.length >= 5) {
    const noHRWorkouts = recentWorkouts.filter((w) => w.avgHeartRate === undefined).length;
    if (noHRWorkouts === recentWorkouts.length) {
      // Never once logged HR data
      flags.noHRDataOnWorkouts = true;
      score += 30;
    }
  }

  // Check 4: Always logs from same GPS location
  const geoVerifications = recentWorkouts
    .flatMap((w) => w.verifications || [])
    .filter((v) => v.method === 'geolocation' && v.details?.latitude);

  if (geoVerifications.length >= 5) {
    const latitudes = geoVerifications.map((v) => v.details?.latitude as number);
    const longitudes = geoVerifications.map((v) => v.details?.longitude as number);

    // Check if all coordinates are within 100 meters of first log (suspiciously consistent)
    const firstLat = latitudes[0];
    const firstLon = longitudes[0];
    const sameLocationCount = latitudes.filter((lat, i) => {
      const distance = Math.sqrt(
        Math.pow(lat - firstLat, 2) + Math.pow(longitudes[i] - firstLon, 2)
      );
      return distance < 0.0009; // ~100 meters
    }).length;

    if (sameLocationCount >= geoVerifications.length * 0.9) {
      flags.noGeoVariation = true;
      score += 25;
    }
  }

  return {
    userId,
    scorePercentage: Math.min(score, 100),
    flags,
    lastUpdated: new Date().toISOString(),
    escalationTriggered: score >= 70, // Escalate at 70+ score
  };
}

/**
 * VERIFY MEDICATION LOG
 * Full verification pipeline for medication logging:
 * 1. Device unlock (biometric)
 * 2. Timestamp window (±5 min from reminder)
 */
export async function verifyMedicationLog(scheduledTime: string): Promise<{
  verified: boolean;
  verifications: VerificationData[];
  message: string;
}> {
  const verifications: VerificationData[] = [];

  // Check timestamp window (required)
  const timeWindowVerif = verifyTimestampWindow(scheduledTime);
  verifications.push(timeWindowVerif);

  if (!timeWindowVerif.verified) {
    return {
      verified: false,
      verifications,
      message: 'Medication must be logged within 5 minutes of the reminder. Try again.',
    };
  }

  // Try device unlock (optional but preferred)
  const unlockVerif = await verifyDeviceUnlock();
  if (unlockVerif) {
    verifications.push(unlockVerif);
    if (!unlockVerif.verified) {
      return {
        verified: false,
        verifications,
        message: 'Device unlock required to confirm medication taken.',
      };
    }
  }

  return {
    verified: true,
    verifications,
    message: 'Medication logged and verified.',
  };
}

/**
 * VERIFY WORKOUT LOG
 * Full verification pipeline for workout logging:
 * 1. Geolocation (outdoors)
 * 2. Heart rate validation (matches activity)
 */
export async function verifyWorkoutLog(
  activityType: string,
  durationMinutes: number,
  avgHeartRate: number | undefined
): Promise<{
  verified: boolean;
  verifications: VerificationData[];
  message: string;
}> {
  const verifications: VerificationData[] = [];

  // Check geolocation (required)
  const geoVerif = await verifyGeolocation();
  if (geoVerif) {
    verifications.push(geoVerif);
    if (!geoVerif.verified) {
      return {
        verified: false,
        verifications,
        message: 'Workout must be logged while outdoors with active GPS.',
      };
    }
  }

  // Check HR validation (required)
  const hrVerif = validateHeartRate(activityType, durationMinutes, avgHeartRate);
  verifications.push(hrVerif);

  if (!hrVerif.verified) {
    const range = hrVerif.details?.expectedMin
      ? `${hrVerif.details.expectedMin}-${hrVerif.details.expectedMax} BPM`
      : 'valid range';
    return {
      verified: false,
      verifications,
      message: `Heart rate ${avgHeartRate} BPM is outside expected range for ${activityType} (${range}).`,
    };
  }

  return {
    verified: true,
    verifications,
    message: 'Workout logged and verified.',
  };
}
