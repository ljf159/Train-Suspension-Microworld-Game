import json
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class TrainStatus:
    id: int
    passengers: int
    position: str
    status: str
    station_id: int
    track_id: int
    delayed_rounds: int

@dataclass
class StationStatus:
    id: int
    flood_level: float
    passengers: int
    is_failure_point: bool
    pump_used: bool

@dataclass
class TrackNode:
    id: int
    flood_level: float
    is_failure_point: bool

@dataclass
class RoundData:
    round_number: int
    timestamp: str
    score: int
    trains: List[TrainStatus]
    stations: List[StationStatus]
    tracks: Dict[int, List[TrackNode]]
    actions: List[dict]
    
class MetroLogParser:
    def __init__(self, file_path: str):
        with open(file_path, 'r') as f:
            self.raw_data = json.load(f)
        
        self.settings = self._parse_settings()
        self.rounds = [self._parse_round(round_data) for round_data in self.raw_data]

    def _parse_settings(self) -> Dict:
        return {
            'failure_points': self.raw_data[0]['setting']['failurePointCount'],
            'flood_increase_mu': self.raw_data[0]['setting']['failurePointFloodIncreaseBaseMu'],
            'trapped_threshold': self.raw_data[0]['setting']['trappedThreshold'],
            'evacuation_penalty': self.raw_data[0]['setting']['evacuationScorePerPassenger'],
            'decision_time': self.raw_data[0]['setting']['defaultDecisionTime']
        }

    def _parse_round(self, data: Dict) -> RoundData:
        return RoundData(
            round_number=data['round'],
            timestamp=data['timestamp'],
            score=data['totalScore'],
            trains=self._parse_trains(data['trains']),
            stations=self._parse_stations(data['stations']),
            tracks=self._parse_tracks(data['tracks']),
            actions=data['playerActions']
        )

    def _parse_trains(self, trains: List[Dict]) -> List[TrainStatus]:
        return [TrainStatus(
            id=t['id'],
            passengers=t['currentPassengers'],
            position=t['positionChange'],
            status=self._get_train_status(t['positionChange']),
            station_id=self._extract_station_id(t['positionChange']),
            track_id=self._extract_track_id(t['positionChange']),
            delayed_rounds=t.get('delayedRounds', 0)
        ) for t in trains]

    def _parse_stations(self, stations: List[Dict]) -> List[StationStatus]:
        return [StationStatus(
            id=s['id'],
            flood_level=s['currentFloodLevel'],
            passengers=s['currentPassengers'],
            is_failure_point=s['isFailurePoint'],
            pump_used=s['pumpUsed']
        ) for s in stations]

    def _parse_tracks(self, tracks: List[Dict]) -> Dict[int, List[TrackNode]]:
        return {
            t['id']: [
                TrackNode(
                    id=n['id'],
                    flood_level=n['currentFloodLevel'],
                    is_failure_point=n['isFailurePoint']
                ) for n in t['nodes']
            ] for t in tracks
        }

    @staticmethod
    def _get_train_status(position: str) -> str:
        if 'Station' in position:
            return 'docked'
        if 'Track' in position:
            return 'moving'
        return 'unknown'

    @staticmethod
    def _extract_station_id(position: str) -> int:
        parts = position.split()
        for part in parts:
            if part.startswith('Station'):
                return int(part.split('_')[-1])
        return -1

    @staticmethod
    def _extract_track_id(position: str) -> int:
        parts = position.split()
        for part in parts:
            if part.startswith('Track'):
                return int(part.split('-')[0].split('_')[-1])
        return -1

if __name__ == "__main__":
    # 使用示例
    parser = MetroLogParser('Metro Logs Feb 12 2025.json')
    
    # 访问解析后的数据
    print(f"总回合数: {len(parser.rounds)}")
    print(f"系统设置: {parser.settings}")
    
    first_round = parser.rounds[0]
    print(f"\n第一回合信息:")
    print(f"时间: {first_round.timestamp}")
    print(f"得分: {first_round.score}")
    
    print("\n列车状态:")
    for train in first_round.trains:
        print(f"列车 {train.id}: {train.status} 在 {'车站' if train.station_id != -1 else '轨道'} {train.station_id if train.station_id != -1 else train.track_id}")

    print("\n轨道洪水情况:")
    for track_id, nodes in first_round.tracks.items():
        print(f"轨道 {track_id}: {len([n for n in nodes if n.flood_level > 0])}个节点有洪水") 