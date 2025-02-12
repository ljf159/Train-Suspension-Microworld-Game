import { Train } from '../../types/index';
import { delayScorePerPassenger, evacuationScorePerPassenger, trappedInTrackScorePerPassenger } from '../../data/initialGameState';

export const calculateTrainDelayScore = (train: Train): number => {
  const baseScore = delayScorePerPassenger * train.passengers;  // 基础分 = 5分 × 乘客数
  return train.delayedRounds > 0 ? -baseScore : baseScore;  
  // 如果有延误，扣除基础分；否则获得基础分
};

export const calculateEvacuationScore = (train: Train): number => {
  return evacuationScorePerPassenger * train.passengers;  // 疏散扣分 = -15分 × 乘客数
};

export const calculateTrackStopScore = (train: Train): number => {
  // 如果列车在轨道上停止（非站点），扣分 = -50分 × 乘客数
  return train.status === 'trapped' && train.stationId === null ? trappedInTrackScorePerPassenger * train.passengers : 0;
};
