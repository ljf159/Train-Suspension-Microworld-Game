import { Station, Track } from '../types/index';

const PROPAGATION_FLOOD_INCREASE = 5;  // 减小传播增量
const PROPAGATION_THRESHOLD = 20;

// 新增对数正态分布生成函数
const generateLognormalIncrease = (): number => {
  // 参数设定（众数=5，即概率密度最大值在5）
  const baseMu = Math.log(5);
  const sigma = 0.3 + Math.random() * 0.4; // 随机方差（0.3-0.7）
  const mu = baseMu + sigma * sigma; // 根据众数公式调整μ
  
  // 生成正态分布随机数
  const normal = mu + sigma * (Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random()));
  // 转换为对数正态分布并四舍五入
  return Math.round(Math.exp(normal) * 10) / 10; // 保留1位小数
};

export const initializeFailurePoints = (
  stations: Station[],
  tracks: Track[],
  failurePointCount: number = 2
): { updatedStations: Station[]; updatedTracks: Track[] } => {
  // 创建候选节点列表，确保每个节点有唯一标识
  const candidates = [
    ...stations.map(s => ({ id: s.id, type: 'station' as const, globalId: `station-${s.id}` })),
    ...tracks.flatMap(t => t.nodes.map(n => ({ id: n.id, type: 'trackNode' as const, globalId: `track-${n.id}` })))
  ];

  // 随机选择failure points，使用Fisher-Yates洗牌算法
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 取前failurePointCount个元素
  const selectedPoints = shuffled.slice(0, failurePointCount - 1);

  // 更新stations
  const updatedStations = stations.map(station => ({
    ...station,
    floodLevel: 0,
    isFailurePoint: selectedPoints.some(
      point => point.type === 'station' && point.id === station.id
    ),
    lastIncrease: undefined
  }));

  // 更新tracks
  const updatedTracks = tracks.map(track => ({
    ...track,
    nodes: track.nodes.map(node => ({
      ...node,
      floodLevel: 0,
      isFailurePoint: selectedPoints.some(
        point => point.type === 'trackNode' && point.id === node.id
      ),
      lastIncrease: undefined
    }))
  }));

  return { updatedStations, updatedTracks };
};

export const updateFloodLevels = (
  stations: Station[],
  tracks: Track[]
): { updatedStations: Station[]; updatedTracks: Track[] } => {

  // 处理stations（记录上一轮水位）
  let updatedStations = stations.map(station => ({
    ...station,
    previousFloodLevel: station.floodLevel
  })).map(station => {
    let newFloodLevel = station.floodLevel;
    let increase = 0;
    let pumpUsed = false;

    

    // 水泵排水逻辑（先排水）
    if (station.hasPump && station.floodLevel >= station.pumpThreshold) {
      newFloodLevel = Math.max(0, newFloodLevel - station.pumpRate);
      pumpUsed = true;
    }

    // 故障点涨水逻辑（后涨水）
    if (station.isFailurePoint) {
      increase = generateLognormalIncrease();
      newFloodLevel = Math.min(100, newFloodLevel + increase);
    }

    return {
      ...station,
      floodLevel: newFloodLevel,
      increaseInThisRound: newFloodLevel - (station.previousFloodLevel || 0),
      lastIncrease: station.isFailurePoint ? increase : undefined,
      pumpUsed: pumpUsed
    };
  });

  // 处理tracks（记录上一轮水位）
  let updatedTracks = tracks.map(track => ({
    ...track,
    nodes: track.nodes.map(node => ({
      ...node,
      previousFloodLevel: node.floodLevel
    }))
  })).map(track => ({
    ...track,
    nodes: track.nodes.map(node => {
      if (node.isFailurePoint) {
        const increase = generateLognormalIncrease();
        const newFloodLevel = Math.min(100, node.floodLevel + increase);
        return {
          ...node,
          floodLevel: newFloodLevel,
          increaseInThisRound: newFloodLevel - (node.previousFloodLevel || 0),
          lastIncrease: increase
        };
      }
      return {
        ...node,
        increaseInThisRound: 0 // 非故障点初始为0
      };
    })
  }));

  // 修改传播函数
  const propagateFlood = (
    sourceLevel: number,
    targetLevel: number,
    sourceElevation: number,
    targetElevation: number
  ) => {
    if (sourceLevel >= PROPAGATION_THRESHOLD && sourceLevel > targetLevel) {
      const floodDifference = sourceLevel - targetLevel;
      const elevationDifference = sourceElevation - targetElevation;
      
      // 计算高度影响系数：
      // 1. 当水流向低处(elevationDifference > 0)时，传播会加快
      // 2. 当水流向高处(elevationDifference < 0)时，传播会减慢
      const elevationFactor = 1 + (elevationDifference * 0.2);
      
      const propagationAmount = Math.min(
        PROPAGATION_FLOOD_INCREASE,
        Math.ceil(floodDifference * 0.3 * elevationFactor)
      );
      const newLevel = Math.min(100, targetLevel + propagationAmount);
      return {
        floodLevel: newLevel,
        increase: propagationAmount
      };
    }
    return { floodLevel: targetLevel, increase: 0 };
  };

  // 进行多轮传播，确保水能传播到更远的地方
  const PROPAGATION_ROUNDS = 1;
  for (let round = 0; round < PROPAGATION_ROUNDS; round++) {
    // 处理换乘站之间的传播
    updatedStations.forEach(station => {
      if (station.isTransfer && station.floodLevel >= PROPAGATION_THRESHOLD) {
        const transferStations = updatedStations.filter(s => 
          s.isTransfer && 
          s.id !== station.id && 
          s.x === station.x && 
          s.y === station.y
        );

        transferStations.forEach(transferStation => {
          const result = propagateFlood(
            station.floodLevel,
            transferStation.floodLevel,
            station.elevation,
            transferStation.elevation
          );
          transferStation.floodLevel = result.floodLevel;
          transferStation.increaseInThisRound! += result.increase;
        });
      }
    });

    // 从站点向轨道传播
    updatedStations.forEach(station => {
      if (station.floodLevel >= PROPAGATION_THRESHOLD) {
        const connectedTracks = updatedTracks.filter(t => 
          t.stationA === station.id || t.stationB === station.id
        );

        connectedTracks.forEach(track => {
          const nodeIndex = track.stationA === station.id ? 0 : track.nodes.length - 1;
          const result = propagateFlood(
            station.floodLevel,
            track.nodes[nodeIndex].floodLevel,
            station.elevation,
            track.nodes[nodeIndex].elevation
          );
          track.nodes[nodeIndex].floodLevel = result.floodLevel;
          track.nodes[nodeIndex].increaseInThisRound! += result.increase;
        });
      }
    });

    // 在轨道节点之间传播
    updatedTracks.forEach(track => {
      const nodes = track.nodes;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].floodLevel >= PROPAGATION_THRESHOLD) {
          [-1, 1].forEach(offset => {
            const nextIndex = i + offset;
            if (nextIndex >= 0 && nextIndex < nodes.length) {
              const result = propagateFlood(
                nodes[i].floodLevel,
                nodes[nextIndex].floodLevel,
                nodes[i].elevation,
                nodes[nextIndex].elevation
              );
              nodes[nextIndex].floodLevel = result.floodLevel;
              nodes[nextIndex].increaseInThisRound! += result.increase;
            }
          });
        }
      }
    });

    // 从轨道向站点传播
    updatedTracks.forEach(track => {
      [
        { node: track.nodes[0], stationId: track.stationA },
        { node: track.nodes[track.nodes.length - 1], stationId: track.stationB }
      ].forEach(({ node, stationId }) => {
        if (node.floodLevel >= PROPAGATION_THRESHOLD) {
          const station = updatedStations.find(s => s.id === stationId);
          if (station) {
            const result = propagateFlood(
              node.floodLevel,
              station.floodLevel,
              node.elevation,
              station.elevation
            );
            station.floodLevel = result.floodLevel;
            station.increaseInThisRound! += result.increase;
          }
        }
      });
    });
  }

  return { updatedStations, updatedTracks };
};