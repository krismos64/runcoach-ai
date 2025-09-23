import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';
import path from 'path';
import { IWorkout } from '../models/Workout.model';
import { IHealthData } from '../models/HealthData.model';

interface ParsedHealthData {
  workouts: Partial<IWorkout>[];
  healthRecords: Partial<IHealthData>[];
  routes: Map<string, any>;
  userProfile: {
    dateOfBirth?: string;
    biologicalSex?: string;
    height?: number;
    weight?: number[];
  };
}

export class AppleHealthParser {
  private static instance: AppleHealthParser;

  private constructor() {}

  public static getInstance(): AppleHealthParser {
    if (!AppleHealthParser.instance) {
      AppleHealthParser.instance = new AppleHealthParser();
    }
    return AppleHealthParser.instance;
  }

  async parseHealthExport(xmlPath: string): Promise<ParsedHealthData> {
    const xmlContent = await fs.readFile(xmlPath, 'utf-8');
    const result = await parseStringPromise(xmlContent, {
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: true,
      attrValueProcessors: [(value: string) => {
        const num = Number(value);
        return isNaN(num) ? value : num;
      }]
    });

    const healthData = result.healthdata;
    const workouts: Partial<IWorkout>[] = [];
    const healthRecords: Partial<IHealthData>[] = [];
    const routes = new Map<string, any>();
    const userProfile: any = {};

    if (healthData.me) {
      userProfile.dateOfBirth = healthData.me.HKCharacteristicTypeIdentifierDateOfBirth;
      userProfile.biologicalSex = healthData.me.HKCharacteristicTypeIdentifierBiologicalSex === 'HKBiologicalSexMale' ? 'male' : 'female';
    }

    const records = Array.isArray(healthData.record) ? healthData.record : [healthData.record].filter(Boolean);
    const workoutRecords = Array.isArray(healthData.workout) ? healthData.workout : [healthData.workout].filter(Boolean);

    for (const record of records) {
      if (record.type === 'HKQuantityTypeIdentifierHeight') {
        userProfile.height = record.value;
      } else if (record.type === 'HKQuantityTypeIdentifierBodyMass') {
        if (!userProfile.weight) userProfile.weight = [];
        userProfile.weight.push({
          value: record.value,
          date: new Date(record.startdate),
          unit: record.unit
        });
      } else if (record.type === 'HKQuantityTypeIdentifierVO2Max') {
        userProfile.vo2Max = record.value;
      } else if (record.type === 'HKQuantityTypeIdentifierRestingHeartRate') {
        userProfile.restingHeartRate = record.value;
      }

      healthRecords.push({
        type: record.type,
        value: record.value,
        unit: record.unit || '',
        date: new Date(record.startdate),
        source: record.sourcename,
        sourceVersion: record.sourceversion,
        device: record.device,
        appleHealthId: `${record.type}_${record.startdate}_${record.enddate}`
      });
    }

    for (const workout of workoutRecords) {
      const workoutData: Partial<IWorkout> = {
        workoutActivityType: workout.workoutactivitytype,
        duration: workout.duration || 0,
        distance: workout.totaldistance || 0,
        energyBurned: workout.totalenergyburned || 0,
        startDate: new Date(workout.startdate),
        endDate: new Date(workout.enddate),
        source: workout.sourcename,
        sourceVersion: workout.sourceversion,
        device: workout.device,
        appleHealthId: `workout_${workout.startdate}_${workout.enddate}`
      };

      if (workout.workoutstatistics) {
        const stats = Array.isArray(workout.workoutstatistics)
          ? workout.workoutstatistics
          : [workout.workoutstatistics];

        for (const stat of stats) {
          if (stat.type === 'HKQuantityTypeIdentifierHeartRateAverage') {
            workoutData.averageHeartRate = stat.average;
          } else if (stat.type === 'HKQuantityTypeIdentifierHeartRateMaximum') {
            workoutData.maxHeartRate = stat.maximum;
          } else if (stat.type === 'HKQuantityTypeIdentifierRunningPace') {
            workoutData.averagePace = stat.average;
            workoutData.maxPace = stat.minimum;
          } else if (stat.type === 'HKQuantityTypeIdentifierElevationAscended') {
            workoutData.elevationGain = stat.sum;
          }
        }
      }

      if (workout.workoutroute && workout.workoutroute.filereference) {
        const routePath = workout.workoutroute.filereference.path;
        routes.set(workoutData.appleHealthId!, routePath);
      }

      workouts.push(workoutData);
    }

    return {
      workouts,
      healthRecords,
      routes,
      userProfile
    };
  }

  async parseGPXRoute(gpxPath: string): Promise<any[]> {
    try {
      const gpxContent = await fs.readFile(gpxPath, 'utf-8');
      const result = await parseStringPromise(gpxContent, {
        explicitArray: false,
        mergeAttrs: true,
        normalizeTags: true
      });

      const coordinates: any[] = [];
      const gpx = result.gpx;

      if (gpx && gpx.trk) {
        const tracks = Array.isArray(gpx.trk) ? gpx.trk : [gpx.trk];

        for (const track of tracks) {
          const segments = Array.isArray(track.trkseg) ? track.trkseg : [track.trkseg];

          for (const segment of segments) {
            const points = Array.isArray(segment.trkpt) ? segment.trkpt : [segment.trkpt];

            for (const point of points) {
              coordinates.push({
                latitude: parseFloat(point.lat),
                longitude: parseFloat(point.lon),
                altitude: point.ele ? parseFloat(point.ele) : undefined,
                timestamp: point.time ? new Date(point.time) : new Date(),
                speed: point.speed ? parseFloat(point.speed) : undefined,
                course: point.course ? parseFloat(point.course) : undefined,
                heartRate: point.extensions?.['gpxtpx:TrackPointExtension']?.['gpxtpx:hr']
                  ? parseInt(point.extensions['gpxtpx:TrackPointExtension']['gpxtpx:hr'])
                  : undefined
              });
            }
          }
        }
      }

      return coordinates;
    } catch (error) {
      console.error('Error parsing GPX file:', error);
      return [];
    }
  }

  analyzeWorkoutType(workout: Partial<IWorkout>): string {
    const distance = workout.distance || 0;
    const duration = workout.duration || 0;
    const pace = duration / distance;
    const elevationGain = workout.elevationGain || 0;

    if (distance > 15000) {
      return 'long';
    } else if (elevationGain > 100) {
      return 'trail';
    } else if (pace < 300) {
      return 'interval';
    } else if (pace > 400) {
      return 'recovery';
    } else {
      return 'endurance';
    }
  }

  calculateSplits(coordinates: any[], splitDistance: number = 1000): any[] {
    const splits = [];
    let currentSplit = {
      distance: 0,
      duration: 0,
      pace: 0,
      heartRate: 0,
      heartRateCount: 0,
      elevation: 0,
      startTime: coordinates[0]?.timestamp
    };

    let totalDistance = 0;
    let lastPoint = coordinates[0];

    for (let i = 1; i < coordinates.length; i++) {
      const point = coordinates[i];
      const distance = this.calculateDistance(
        lastPoint.latitude,
        lastPoint.longitude,
        point.latitude,
        point.longitude
      );

      totalDistance += distance;
      currentSplit.distance += distance;

      if (point.heartRate) {
        currentSplit.heartRate += point.heartRate;
        currentSplit.heartRateCount++;
      }

      if (point.altitude) {
        currentSplit.elevation = point.altitude;
      }

      if (currentSplit.distance >= splitDistance) {
        const timeDiff = (new Date(point.timestamp).getTime() - new Date(currentSplit.startTime).getTime()) / 1000;
        currentSplit.duration = timeDiff;
        currentSplit.pace = timeDiff / (currentSplit.distance / 1000);

        if (currentSplit.heartRateCount > 0) {
          currentSplit.heartRate = currentSplit.heartRate / currentSplit.heartRateCount;
        }

        splits.push({ ...currentSplit });

        currentSplit = {
          distance: 0,
          duration: 0,
          pace: 0,
          heartRate: 0,
          heartRateCount: 0,
          elevation: 0,
          startTime: point.timestamp
        };
      }

      lastPoint = point;
    }

    return splits;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

export default AppleHealthParser.getInstance();