import { Train, Track, Station } from '../types/index';

export const handleEvacuation = (
  station: Station,
  train: Train
): { updatedStation: Station; updatedTrain: Train } => {
  return {
    updatedStation: {
      ...station,
      passengers: station.passengers + train.passengers
    },
    updatedTrain: {
      ...train,
      passengers: 0,
      status: 'stopped'
    }
  };
};

// 新增位置标识函数
export const getTrainPositionIdentifier = (train: Train, tracks: Track[]): string => {
  if (train.stationId !== null) {
    return `Station ${train.stationId}`;
  }
  
  const currentTrack = tracks.find(t => t.id === train.trackId);
  if (currentTrack && train.nodePosition < currentTrack.nodes.length) {
    return `Track ${currentTrack.id}-Node ${train.nodePosition}`;
  }
  return 'Unknown Position';
};

// 修改列车位置更新逻辑
export const updateTrainPositions = (trains: Train[], tracks: Track[]): Train[] => {
  return trains.map(train => {
    if (train.status !== 'running' || train.stationId !== null) return train;

    const newPosition = train.direction === 'forward' 
      ? train.nodePosition + 1 
      : train.nodePosition - 1;

    const currentTrack = tracks.find(t => t.id === train.trackId);
    if (!currentTrack) return train;

    let updatedTrain = { ...train };

    // 处理到达站点的情况
    if (newPosition >= currentTrack.nodes.length) {
      return {
        ...updatedTrain,
        stationId: currentTrack.stationB,
        trackId: null,    // 清除轨道ID
        nodePosition: 0
      };
    } else if (newPosition < 0) {
      return {
        ...updatedTrain,
        stationId: currentTrack.stationA,
        trackId: null,    // 清除轨道ID
        nodePosition: 0
      };
    }

    // 保持轨道运行状态
    return {
      ...updatedTrain,
      trackId: currentTrack.id,
      nodePosition: newPosition
    };
  });
};