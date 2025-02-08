import { Station } from '../types/index';

export const calculateRescuedPassengers = (
  stationPassengers: number,
  trainCapacity: number,
  trainPassengers: number
): number => {
  return Math.min(
    trainCapacity - trainPassengers,
    stationPassengers
  );
};

export const updateStations = (stations: Station[]): Station[] => {
  return stations.map(station => ({
    ...station,
    passengers: station.passengers + Math.floor(Math.random() * 8)
  }));
};