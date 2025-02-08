import { Track, Train } from '../types/index';

export const getTrackBetweenStations = (
  tracks: Track[],
  stationA: number,
  stationB: number
): Track | undefined => {
  return tracks.find(
    track => 
      (track.stationA === stationA && track.stationB === stationB) ||
      (track.stationA === stationB && track.stationB === stationA)
  );
};

export const getTrackNodeName = (train: Train, tracks: Track[]): string => {
  const track = tracks.find(t => t.id === train.trackId);
  if (!track) return 'Unknown Location';

  const node = track.nodes[train.nodePosition];
  return node ? node.name : 'Unknown Location';
};