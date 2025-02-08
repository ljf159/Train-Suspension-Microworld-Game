import { Train, RoundScore } from '../../types/index';
import { 
  calculateTrainDelayScore, 
  calculateEvacuationScore, 
  calculateTrackStopScore 
} from './trainScoring';

export const calculateRoundScore = (
  trains: Train[],
  evacuatedTrainIds: number[]
): RoundScore => {
  // 1. 计算每个列车的得分
  const trainScores = trains.map(train => {
    const delayScore = calculateTrainDelayScore(train);
    const evacuationScore = evacuatedTrainIds.includes(train.id) 
      ? calculateEvacuationScore(train) 
      : 0;
    const trackStopScore = calculateTrackStopScore(train);
    
    return {
      trainId: train.id,
      delayScore,
      evacuationScore,
      trackStopScore,
      total: delayScore + evacuationScore + trackStopScore
    };
  });

  return {
    total: trainScores.reduce((sum, score) => sum + score.total, 0),
    trainScores
  };
};