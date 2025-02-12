import { Train } from "../types/index";
import { Station } from "../types/index";
import { getOnAndOffRatioMin, getOnAndOffRatioMax } from '../data/initialGameState';
// 处理乘客上下车带来的列车和车站人数变化
export const updatePassengers = (stations: Station[], trains: Train[], evacuatedTrainIds: number[]) => {

    // 列车每到一站，都会有20%～40%的乘客会上车或下车
    // 遍历所有在站的列车
    trains.forEach(train => {
        // 如果列车状态是trapped，则不处理
        if (train.status === 'trapped') {
            return;
        }

        if (train.stationId !== null) {
            // 如果列车被evacuate
            if (evacuatedTrainIds.includes(train.id)) {
                // 找到当前车站
                const currentStation = stations.find(s => s.id === train.stationId);
                if (currentStation) {
                    // 乘客全部上车站
                    currentStation.passengers += train.passengers;
                    train.passengers = 0;
                }

                return {
                    updatedStationsWithUpdatedPassengers: stations,
                    updatedTrainsWithUpdatedPassengers: trains
                }
            }

            // 找到当前车站
            const currentStation = stations.find(s => s.id === train.stationId);
            if (currentStation) {
                // 随机生成20%-40%的比例
                const getOffRatio = getOnAndOffRatioMin + Math.random() * (getOnAndOffRatioMax - getOnAndOffRatioMin);
                const getOnRatio = getOnAndOffRatioMin + Math.random() * (getOnAndOffRatioMax - getOnAndOffRatioMin);
                
                // 计算下车人数
                const getOffCount = Math.floor(train.passengers * getOffRatio);
                train.passengers -= getOffCount;
                currentStation.passengers += getOffCount;

                // 计算上车人数 
                const getOnCount = Math.floor(currentStation.passengers * getOnRatio);
                currentStation.passengers -= getOnCount;
                // 更新列车乘客数量，并确保乘客数量不超过车站容量
                train.passengers = Math.min(train.capacity, train.passengers + getOnCount);
            }
        }
    });
    
    return {
        updatedStationsWithUpdatedPassengers: stations,
        updatedTrainsWithUpdatedPassengers: trains
    }
}