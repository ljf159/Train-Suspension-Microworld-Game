import { Station, Track, Train, TrainLocation } from '../types/index';

// 计算轨道上station和track node在整条line的相对位置
export const getLocationSequenceInLine = (
  track: Track,
  stations: Station[],
  tracks: Track[]
): TrainLocation[] | null => {

  // 声明一个变量，表示起点
  let startStationId: number;

  // 通过track找到line
  const lineId = track.lineId;
  // 找到其他含有这个lineId的track，包括当前track
  const TracksInLine = tracks.filter(t => t.lineId === lineId);

  // 根据每个track的stationA和stationB，找出只属于一个track的station，即为端点
  const allStations = TracksInLine.flatMap(t => [t.stationA, t.stationB]);
  const uniqueStations = allStations.filter(
    (station, index, arr) => arr.indexOf(station) === arr.lastIndexOf(station)
  );

  // 添加空数组检查，可能是环线，没有端点
  if (uniqueStations.length === 0) {
    console.warn('检测到环形线路，将选Id最小的站作为起点');
    // 如果uniqueStations为空，则从allStations中选择一个id最小的station作为起点
    startStationId = allStations.sort((a, b) => a - b)[0];
  }

  // 看uniqueStations中哪个station是某个track的stationA，即为起点
  // 处理可能未找到的情况
  const foundStartId = uniqueStations.find(s => 
    TracksInLine.some(t => t.stationA === s)
  );
  
  if (foundStartId === undefined) {
    console.error('无法确定线路起点');
    return null; // 或抛出错误
  }
  startStationId = foundStartId;

  // 从startLocation开始，看它在哪一段track上，然后找到track nodes以及track的另一端，然后再循环到下一个track，做相同的操作，直到所有的track都被访问过。将这个顺序用trainLocation存下来
  // 从起点开始遍历线路
  const visitedTracks = new Set<number>();
  const lineSequence: Array<{ stationId: number; trackId: number }> = [];
  let currentStationId = startStationId;


  // 构建线路序列
  while (true) {
    const nextTrack = TracksInLine.find(t => 
      (t.stationA === currentStationId || t.stationB === currentStationId) &&
      !visitedTracks.has(t.id)
    );

    if (!nextTrack) break;

    visitedTracks.add(nextTrack.id);
    const nextStationId = nextTrack.stationA === currentStationId 
      ? nextTrack.stationB 
      : nextTrack.stationA;

    lineSequence.push({
      stationId: currentStationId,
      trackId: nextTrack.id
    });

    currentStationId = nextStationId;
  }

  // 按顺序循环lineSequence，找到station和track node在line中的位置，以trainLocation的形式存下来
  const locationSequenceInLine: TrainLocation[] = [];
  let position = 0;
  for (const item of lineSequence) {
    const station = stations.find(s => s.id === item.stationId);

    if (!station) continue;

    locationSequenceInLine.push({
      type: 'station',
      id: station.id,
      name: station.name,
      indexInLine: position
    });
    position++;

    const track = tracks.find(t => t.id === item.trackId);

    if (!track) continue;

    // 写个循环，如果station是track的stationA，则从track node的列表正向开始，依次push进trainLocations，否则从反方向的track node开始
    if (track.stationA === station.id) {
      for (let i = 0; i < track.nodes.length; i++) {
        locationSequenceInLine.push({
          type: 'track',
          id: track.nodes[i].id,
          name: track.nodes[i].name,
          indexInLine: position
        });
        position++;
      }
    } else {
      for (let i = track.nodes.length - 1; i >= 0; i--) {
        locationSequenceInLine.push({
          type: 'track',
          id: track.nodes[i].id,
          name: track.nodes[i].name,
          indexInLine: position
        });
        position++;
      }
    }
  }

  // 对于最后一个track，还需要将另外一个端点push进trainLocations
  const lastStationId = currentStationId
  const lastStation = stations.find(s => s.id === lastStationId);
  if (!lastStation) return null;
  locationSequenceInLine.push({
    type: 'station',
    id: lastStationId,
    name: lastStation.name,
    indexInLine: position
  });

  return locationSequenceInLine;
}






export const getTrainLocation = (
  train: Train,
  stations: Station[],
  tracks: Track[]
): TrainLocation | null => {

  // 如果列车在车站，返回车站在line中的位置
  if (train.stationId !== null) {

    // 找到车站相连接的任何一个track
    const track = tracks.find(t => t.stationA === train.stationId || t.stationB === train.stationId);
    if (!track) return null;

    // 通过getLocationSequenceInLine，找到车站在line中的位置
    const locationSequenceInLine = getLocationSequenceInLine(track, stations, tracks);
    if (!locationSequenceInLine) return null;

    // 找到车站在line中的位置
    const stationIndexInLine = locationSequenceInLine.findIndex(l => l.type === 'station' && l.id === train.stationId);
    if (stationIndexInLine === -1) return null;

    const station = stations.find(s => s.id === train.stationId);
    if (!station) return null;
    
    return {
      type: 'station',
      id: station.id,
      name: station.name,
      indexInLine: stationIndexInLine
    };
  }

  // 如果列车在轨道上，返回轨道位置
  const track = tracks.find(t => t.id === train.trackId);
  if (!track) return null;

  const node = track.nodes[train.nodePosition];
  if (!node) return null;

  // 通过getLocationSequenceInLine，找到轨道位置在line中的位置
  const locationSequenceInLine = getLocationSequenceInLine(track, stations, tracks);
  if (!locationSequenceInLine) return null;

  // 找到track node在line中的位置
  const nodeIndexInLine = locationSequenceInLine.findIndex(l => l.type === 'track' && l.id === node.id);
  if (nodeIndexInLine === -1) return null;

  return {
    type: 'track',
    id: node.id,
    name: node.name,
    indexInLine: nodeIndexInLine
  };
};