import { Train, Track } from '../types';

export const findTrainAtLocation = (
  locationId: number,
  trains: Train[],
  tracks: Track[]
): Train | undefined => {
  // First check if there's a train at the station
  const trainAtStation = trains.find(t => t.stationId === locationId);
  if (trainAtStation) return trainAtStation;

  // Then check if there's a train on a track connected to this station
  return trains.find(train => {
    if (train.stationId !== null) return false;
    
    const track = tracks.find(t => t.id === train.trackId);
    if (!track) return false;

    return track.stationA === locationId || track.stationB === locationId;
  });
};