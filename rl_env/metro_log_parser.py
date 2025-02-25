import json
from dataclasses import dataclass
from typing import List, Dict, Optional, Union

@dataclass
class GameSettings:
    failure_points_count: int
    failure_points_flood_increase_base_mu: float
    failure_points_flood_increase_sigma_min: float
    failure_points_flood_increase_sigma_max: float
    get_on_and_off_ratio_min: float
    get_on_and_off_ratio_max: float
    trapped_threshold: int
    flood_warning_threshold: float
    default_decision_time: int
    delay_score_per_passenger: int
    evacuation_score_per_passenger: int
    trapped_in_track_score_per_passenger: int
    PROPAGATION_FLOOD_INCREASE: float
    PROPAGATION_THRESHOLD: float
    elevation_difference_factor: float
    flood_difference_factor: float

@dataclass
class Train:
    id: int
    station_id: Optional[int]
    track_id: int
    node_position: int
    capacity: int
    passengers_change: Optional[int]
    passengers: int
    position_change: Optional[str]
    status_change: Optional[str]
    status: str  # running/stopped/trapped
    direction_change: Optional[str]
    direction: str
    line_id: int
    delayed_rounds: int
    last_move_round: int

@dataclass
class Station:
    id: int
    current_flood_level: float
    passengers_change: Optional[int]
    passengers: int
    pump_used: bool
    pump_threshold: float
    pump_rate: float
    is_failure_point: bool
    elevation: float
    is_transfer: bool

class TrackNode:
    track_id: int
    station_a: int
    station_b: int
    line_id: int
    node_id: int
    node_current_flood_level: float
    node_is_failure_point: bool

@dataclass
class TrainLocation:
    type: str
    id: int
    name: str
    index_in_line: int

@dataclass
class PlayerAction:
    action_type: str
    target_train: Train
    target_location: TrainLocation
    timestamp: str
    round: int
    select_time_used: int

@dataclass
class GameRound:
    round_id: int
    round_num: int
    timestamp: str
    total_score: int
    score_change: int
    decision_time_used: int
    trains: List[Train]
    stations: List[Station]
    track_nodes: List[TrackNode]
    player_actions: List[PlayerAction]

class MetroLogAnalyzer:
    def __init__(self, file_path: str):
        with open(file_path, 'r') as f:
            self.raw_logs = json.load(f)
        
        self.settings = self._parse_global_settings()
        self.rounds = self._parse_all_rounds()

    def _parse_global_settings(self) -> GameSettings:
        """解析全局游戏设置（仅在第一回合出现）"""
        setting_data = self.raw_logs[0]['setting']
        return GameSettings(
            failure_points_count=setting_data['failurePointCount'],
            failure_points_flood_increase_base_mu=setting_data['failurePointFloodIncreaseBaseMu'],
            failure_points_flood_increase_sigma_min=setting_data['failurePointFloodIncreaseSigmaMin'],
            failure_points_flood_increase_sigma_max=setting_data['failurePointFloodIncreaseSigmaMax'],
            get_on_and_off_ratio_min=setting_data['getOnAndOffRatioMin'],
            get_on_and_off_ratio_max=setting_data['getOnAndOffRatioMax'],
            trapped_threshold=setting_data['trappedThreshold'],
            flood_warning_threshold=setting_data['floodWarningThreshold'],
            default_decision_time=setting_data['defaultDecisionTime'],
            delay_score_per_passenger=setting_data['delayScorePerPassenger'],
            evacuation_score_per_passenger=setting_data['evacuationScorePerPassenger'],
            trapped_in_track_score_per_passenger=setting_data['trappedInTrackScorePerPassenger'],
            PROPAGATION_FLOOD_INCREASE=setting_data['PROPAGATION_FLOOD_INCREASE'],
            PROPAGATION_THRESHOLD=setting_data['PROPAGATION_THRESHOLD'],
            elevation_difference_factor=setting_data['elevationDifferenceFactor'],
            flood_difference_factor=setting_data['floodDifferenceFactor'],
        )

    def _parse_all_rounds(self) -> List[GameRound]:
        """解析所有回合数据"""
        return [self._parse_single_round(round_data) for round_data in self.raw_logs]

    def _parse_single_round(self, data: dict) -> GameRound:
        """解析单个回合数据"""
        return GameRound(
            round_id=data['id'],
            round_num=data['round'],
            timestamp=data['timestamp'],
            total_score=data['totalScore'],
            score_change=data['scoreChange'],
            decision_time_used=data['decisionTimeUsed'],
            trains=self._parse_trains(data['trains']),
            stations=self._parse_stations(data['stations']),
            track_nodes=self._parse_track_nodes(data['tracks']),
            player_actions=self._parse_player_actions(data['playerActions'])
        )

    def _parse_trains(self, trains: List[dict]) -> List[Train]:
        """解析列车状态数据"""
        return [Train(
            id=t['id'],
            station_id=t['stationId'],
            track_id=t['trackId'],
            node_position=t['nodePosition'],
            capacity=t['capacity'],
            passengers_change=t.get('passengersChange', None),
            passengers=t['currentPassengers'],
            position_change=t.get('positionChange', None),
            status_change=t.get('statusChange', None),
            status=t['currentStatus'],
            direction_change=t.get('directionChange', None),
            direction=t['currentDirection'],
            line_id=t['lineId'],
            delayed_rounds=t.get('delayedRounds', 0),
            last_move_round=t.get('lastMoveRound', 0)
        ) for t in trains]
    
    def _get_train_attributes(self, train: Train) -> Dict[str, Union[str, int, float]]:
        return {
            "train_in_stationId_" + str(train.id): str(train.station_id),
            "trackId_" + str(train.id): str(train.track_id),
            "nodePosition_" + str(train.id): train.node_position,
            "passengers_in_train_" + str(train.id): train.passengers,
            "delayedRounds_" + str(train.id): train.delayed_rounds,
            "direction_" + str(train.id): train.direction,
            "status_" + str(train.id): train.status
        }

    def _parse_stations(self, stations: List[dict]) -> List[Station]:
        """解析车站状态数据"""
        return [Station(
            id=s['id'],
            current_flood_level=s['currentFloodLevel'],
            passengers_change=s.get('passengersChange', None),
            passengers=s['currentPassengers'],
            pump_used=s['pumpUsed'],
            pump_threshold=s['pumpThreshold'],
            pump_rate=s['pumpRate'],
            is_failure_point=s['isFailurePoint'],
            elevation=s['elevation'],
            is_transfer=s['isTransfer']
        ) for s in stations]
    
    def _get_station_attributes(self, station: Station) -> Dict[str, Union[str, int, float]]:
        return {
            "isTransfer_" + str(station.id): station.is_transfer,
            "floodLevel_" + str(station.id): station.current_flood_level,
            "isFailurePoint_" + str(station.id): station.is_failure_point,
            "elevation_" + str(station.id): station.elevation,
            "pumpUsed_" + str(station.id): station.pump_used,
        }

    def _parse_track_nodes(self, tracks: List[dict]) -> List[TrackNode]:
        """解析轨道节点数据"""
        return [(TrackNode(
            track_id=t['id'],
            station_a=t['stationA'],
            station_b=t['stationB'],
            line_id=t['lineId'],
            node_id=n['id'],
            node_current_flood_level=n['currentFloodLevel'],
            node_is_failure_point=n['isFailurePoint']
            ) for n in t['nodes']
        ) for t in tracks]
    
    def _parse_train_location(self, location: dict) -> TrainLocation:
        """解析列车位置数据"""
        return TrainLocation(
            type=location['type'],
            id=location['id'],
            name=location['name'],
            index_in_line=location['indexInLine']
        )
    
    def _parse_train(self, train: dict) -> Train:
        """解析列车数据"""
        return Train(
            id=train['id'],
            station_id=train['stationId'],
            track_id=train['trackId'],
            node_position=train['nodePosition'],
            capacity=train['capacity'],
            passengers=train['passengers'],
            status=train['status'],
            direction=train['direction'],
            line_id=train['lineId'],
            delayed_rounds=train.get('delayedRounds', 0),
            last_move_round=train.get('lastMoveRound', 0),
            passengers_change=train.get('passengersChange', None),
            status_change=train.get('statusChange', None),
            direction_change=train.get('directionChange', None),
            position_change=train.get('positionChange', None)
        )
    
    def _parse_player_actions(self, player_actions: List[dict]) -> List[PlayerAction]:
        """解析玩家操作数据"""
        return [PlayerAction(
            action_type=a['type'],
            target_train=self._parse_train(a['targetTrain']),
            target_location=self._parse_train_location(a['targetLocation']),
            timestamp=a['timestamp'],
            round=a['round'],
            select_time_used=a['selectTimeUsed']
        ) for a in player_actions]
    
    def _get_attributes(self, trains: List[Train], stations: List[Station]) -> Dict[str, Union[str, int, float]]:
        train_attributes = dict(item for train in trains for item in self._get_train_attributes(train).items())
        station_attributes = dict(item for station in stations for item in self._get_station_attributes(station).items())
        return {**train_attributes, **station_attributes}
    
    def _get_action_attributes(self, player_actions: List[PlayerAction]) -> tuple[str, str, str, str, str, str, str, str]:
        move_list = ["0monitor", "1monitor", "2monitor", "3monitor", "4monitor", "5monitor", "6monitor", "7monitor"]
        for action in player_actions:
            train_id = action.target_train.id
            action_type = action.action_type
            move_list[train_id] = str(train_id) + action_type
        return tuple(move_list)
    
    # @staticmethod
    # def _extract_position_id(position_str: str, target_type: str) -> Optional[int]:
    #     """从位置字符串中提取ID"""
    #     for part in position_str.split():
    #         if part.startswith(target_type):
    #             if '-' in part:
    #                 return int(part.split('-')[0].split('_')[-1])
    #             return int(part.split('_')[-1])
    #     return None

# 使用示例
if __name__ == "__main__":
    analyzer = MetroLogAnalyzer("metro_logs_2025-02-25T01_40_19.393Z.json")
    
    print(f"游戏设置：故障点数量={analyzer.settings.failure_points_count}")
    print(f"总回合数：{len(analyzer.rounds)}")
    
    first_round = analyzer.rounds[0]
    print(f"\n首回合关键信息：")
    print(f"时间：{first_round.timestamp}")
    print(f"初始得分：{first_round.total_score}")
    print(f"洪水最严重的车站：{max(first_round.stations, key=lambda s: s.current_flood_level).id}号站")
    
    last_round = analyzer.rounds[-1]
    print(f"\n最终回合统计：")
    print(f"总得分：{last_round.total_score}")
    print(f"玩家操作次数：{len(last_round.player_actions)}")
    print(f"仍在运行的列车：{len([t for t in last_round.trains if t.status == 'running'])}辆") 