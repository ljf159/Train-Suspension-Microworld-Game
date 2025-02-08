import { Train, Track, Station } from '../types/index';
import { getCollisionImminentTrains } from './trainCollision';

export const moveTrainToNextNode = (
  train: Train,
  tracks: Track[],
  stations: Station[],
  currentRound: number,
  allTrains: Train[]
): Train => {
  if (train.status !== 'running') {
    // Update delay if train is stopped
    const roundsSinceLastMove = currentRound - train.lastMoveRound;
    return {
      ...train,
      delayedRounds: train.delayedRounds + (roundsSinceLastMove > 0 ? 1 : 0)
    };
  }

  // Check for potential collisions
  const collisionPairs = getCollisionImminentTrains(train, allTrains, tracks, stations);

  if (collisionPairs.length > 0) {
    // 将后面车的状态设置为stopped
    for (const pair of collisionPairs) {
      // 如果碰撞风险列车是当前列车，则当前列车停止
      if (pair.trainB.id === train.id) {
        train.status = 'stopped';
      }
    }
    console.warn(`提醒:列车 ${train.id} 检测到碰撞风险,系统自动停车! 请关闭此窗口，继续游戏！`);

    return {
      ...train,
      delayedRounds: train.delayedRounds + 1,
    };
  }

  // console.log('列车状态:', train);

  // If train is at station, start moving on track
  if (train.stationId !== null) {
    const station = stations.find(s => s.id === train.stationId);
    if (!station) return train;

    // Find next track based on direction
    const nextTrack = tracks.find(t => 
      train.direction === 'forward' 
        ? t.stationA === train.stationId
        : t.stationB === train.stationId
    );

    // If no next track is found, we're at a terminal station - reverse direction
    if (!nextTrack) {
      return {
        ...train,
        direction: train.direction === 'forward' ? 'backward' : 'forward',
        lastMoveRound: currentRound
      };
    }

    return {
      ...train,
      stationId: null,
      trackId: nextTrack.id,
      nodePosition: train.direction === 'forward' ? 0 : nextTrack.nodes.length - 1,
      lastMoveRound: currentRound
    };
  }

  // Train is on track, move to next node
  const currentTrack = tracks.find(t => t.id === train.trackId);
  if (!currentTrack) return train;

  const newPosition = train.direction === 'forward'
    ? train.nodePosition + 1
    : train.nodePosition - 1;

  // Check if train reaches a station
  if (train.direction === 'forward' && newPosition >= currentTrack.nodes.length) {
    // 找到下一个track
    const nextTrack = tracks.find(t => 
      train.direction === 'forward' 
        ? t.stationA === train.stationId
        : t.stationB === train.stationId
    );

    // 如果下一个track不存在，则将当前的track作为下一个track，因为要掉头
    if (!nextTrack) {
      return {
        ...train,
        stationId: currentTrack.stationB,
        trackId: currentTrack.id,
        nodePosition: currentTrack.nodes.length,
        lastMoveRound: currentRound
      };
    }

    return {
      ...train,
      stationId: currentTrack.stationB,
      trackId: currentTrack.id,
      nodePosition: currentTrack.nodes.length,
      lastMoveRound: currentRound
    };
  }

  if (train.direction === 'backward' && newPosition < 0) {
    // 找到下一个track
    const nextTrack = tracks.find(t => 
      train.direction === 'forward' 
        ? t.stationA === train.stationId
        : t.stationB === train.stationId
    );

    // 如果下一个track不存在，则将当前的track作为下一个track，因为要掉头
    if (!nextTrack) {
      return {
        ...train,
        stationId: currentTrack.stationA,
        trackId: currentTrack.id,
        nodePosition: -1,
        lastMoveRound: currentRound
      };
    }

    return {
      ...train,
      stationId: nextTrack.stationB,
      trackId: nextTrack.id,
      nodePosition: nextTrack.nodes.length,
      lastMoveRound: currentRound
    };
  }

  // Move to next node on track
  return {
    ...train,
    nodePosition: newPosition,
    lastMoveRound: currentRound
  };
};