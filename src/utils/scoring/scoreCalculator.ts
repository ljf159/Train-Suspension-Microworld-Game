import { Train, RoundScore } from '../../types/index';
import { 
  calculateTrainDelayScore, 
  calculateEvacuationScore, 
  calculateTrackStopScore 
} from './trainScoring';

export const calculateRoundScore = (
  originalTrains: Train[],
  trains: Train[],
  evacuatedTrainIds: number[],
): RoundScore => {
  // 1. 计算每个列车的得分
  const trainScores = trains.map(train => {

    const delayScore = calculateTrainDelayScore(train);
    // console.log('分数delayScore', delayScore);

    let evacuationScore = 0;

    if (evacuatedTrainIds.includes(train.id)) {
      // 找到originalTrains中与train.id相同的列车
      const originalTrain = originalTrains.find(t => t.id === train.id);
      evacuationScore = calculateEvacuationScore(originalTrain!);
    } 

    const trackStopScore = calculateTrackStopScore(train);
    // console.log('分数trackStopScore', trackStopScore);
    
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