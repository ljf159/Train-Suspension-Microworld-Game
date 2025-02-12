import { Train, Track, Station } from '../types/index';
import { getTrainLocation } from './locationUtils';

export const getCollisionImminentTrains = (
  train: Train,
  allTrains: Train[],
  tracks: Track[],
  stations: Station[]
): {trainA: Train, trainB: Train}[] => {
  // 定义trainCollisionPair，包含有相撞风险的列车对<trainA, trainB>。在列车运行方向上，trainA在前，trainB在后
  const trainCollisionPairs: {trainA: Train, trainB: Train}[] = [];

  // Find trains on the same line going in the same direction,
  // 不考虑自己
  const trainsOnSameLine = allTrains.filter(t => 
    t.id !== train.id && 
    t.lineId === train.lineId && 
    t.direction === train.direction
  );

  // console.log('train:', train);
  // console.log('trainsOnSameLine:', trainsOnSameLine);

  if (trainsOnSameLine.length === 0) return [];

  // For each train on the same line
  for (const otherTrain of trainsOnSameLine) {

    const trainLocation = getTrainLocation(train, stations, tracks);
    if (!trainLocation) continue;
    
    const otherTrainLocation = getTrainLocation(otherTrain, stations, tracks);
    if (!otherTrainLocation) continue;

    // 将train和otherTrain中的每个train逐个比较indexInLine，如果indexInLine差值为1，则认为有碰撞风险。
    const trainIndexInLine = trainLocation.indexInLine;
    const otherTrainIndexInLine = otherTrainLocation.indexInLine;
    if (Math.abs(trainIndexInLine - otherTrainIndexInLine) <= 1) {
      // 判断谁在前谁在后，面的车应该停车
      // 如果两车的方向都是forward
      if (train.direction === 'forward' && otherTrain.direction === 'forward') {
        if (trainIndexInLine < otherTrainIndexInLine) {
          // 判断前车是否停车，如果停车，则将这对列车对推入trainCollisionPairs
          if (train.status === 'stopped' || train.status === 'trapped') {
            trainCollisionPairs.push({trainA: train, trainB: otherTrain});
          }
        } else {
          if (otherTrain.status === 'stopped' || otherTrain.status === 'trapped') {
            trainCollisionPairs.push({trainA: otherTrain, trainB: train});
          }
        }
      }
      // 如果两车的方向都是backward
      if (train.direction === 'backward' && otherTrain.direction === 'backward') {
        if (trainIndexInLine > otherTrainIndexInLine) {
          if (otherTrain.status === 'stopped' || otherTrain.status === 'trapped') {
            trainCollisionPairs.push({trainA: otherTrain, trainB: train});
          }
        } else {
          if (train.status === 'stopped' || train.status === 'trapped') {
            trainCollisionPairs.push({trainA: train, trainB: otherTrain});
          }
        }
      }
    }
  }
  // 返回有碰撞风险的列车
  return trainCollisionPairs;
}