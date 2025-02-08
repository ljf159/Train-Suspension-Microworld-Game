import { Train } from '../../types';

export const calculateTrainDelayScore = (train: Train): number => {
  const baseScore = 5 * train.passengers;  // 基础分 = 5分 × 乘客数
  return train.delayedRounds > 0 ? -baseScore : baseScore;  
  // 如果有延误，扣除基础分；否则获得基础分
};

export const calculateEvacuationScore = (train: Train): number => {
  return -15 * train.passengers;  // 疏散扣分 = -15分 × 乘客数
};

export const calculateTrackStopScore = (train: Train): number => {
  // 如果列车在轨道上停止（非站点），扣分 = -50分 × 乘客数
  return train.status === 'stopped' && train.stationId === null ? -50 * train.passengers : 0;
};