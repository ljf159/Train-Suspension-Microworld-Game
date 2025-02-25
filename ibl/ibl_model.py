import asyncio
from metro_env import MetroEnv
import numpy as np
import websockets
from pyibl import Agent  # 新增IBL库
from itertools import repeat
import itertools
from metro_log_parser import MetroLogAnalyzer


train_attributes_definition = [
    "train_in_stationId_0", "trackId_0", "nodePosition_0", "passengers_in_train_0", "delayedRounds_0", "direction_0", "status_0",
    "train_in_stationId_1", "trackId_1", "nodePosition_1", "passengers_in_train_1", "delayedRounds_1", "direction_1", "status_1",
    "train_in_stationId_2", "trackId_2", "nodePosition_2", "passengers_in_train_2", "delayedRounds_2", "direction_2", "status_2",
    "train_in_stationId_3", "trackId_3", "nodePosition_3", "passengers_in_train_3", "delayedRounds_3", "direction_3", "status_3",
    "train_in_stationId_4", "trackId_4", "nodePosition_4", "passengers_in_train_4", "delayedRounds_4", "direction_4", "status_4",
    "train_in_stationId_5", "trackId_5", "nodePosition_5", "passengers_in_train_5", "delayedRounds_5", "direction_5", "status_5",
    "train_in_stationId_6", "trackId_6", "nodePosition_6", "passengers_in_train_6", "delayedRounds_6", "direction_6", "status_6",
    "train_in_stationId_7", "trackId_7", "nodePosition_7", "passengers_in_train_7", "delayedRounds_7", "direction_7", "status_7"
]

station_attributes_definition = [
    "isTransfer_0", "floodLevel_0", "isFailurePoint_0", "elevation_0", "pumpUsed_0",
    "isTransfer_1", "floodLevel_1", "isFailurePoint_1", "elevation_1", "pumpUsed_1",
    "isTransfer_2", "floodLevel_2", "isFailurePoint_2", "elevation_2", "pumpUsed_2",
    "isTransfer_3", "floodLevel_3", "isFailurePoint_3", "elevation_3", "pumpUsed_3",
    "isTransfer_4", "floodLevel_4", "isFailurePoint_4", "elevation_4", "pumpUsed_4",
    "isTransfer_5", "floodLevel_5", "isFailurePoint_5", "elevation_5", "pumpUsed_5",
    "isTransfer_6", "floodLevel_6", "isFailurePoint_6", "elevation_6", "pumpUsed_6",
    "isTransfer_7", "floodLevel_7", "isFailurePoint_7", "elevation_7", "pumpUsed_7",
    "isTransfer_8", "floodLevel_8", "isFailurePoint_8", "elevation_8", "pumpUsed_8",
    "isTransfer_9", "floodLevel_9", "isFailurePoint_9", "elevation_9", "pumpUsed_9",
    "isTransfer_10", "floodLevel_10", "isFailurePoint_10", "elevation_10", "pumpUsed_10",
    "isTransfer_11", "floodLevel_11", "isFailurePoint_11", "elevation_11", "pumpUsed_11",
    "isTransfer_12", "floodLevel_12", "isFailurePoint_12", "elevation_12", "pumpUsed_12",
    "isTransfer_13", "floodLevel_13", "isFailurePoint_13", "elevation_13", "pumpUsed_13",
    "isTransfer_14", "floodLevel_14", "isFailurePoint_14", "elevation_14", "pumpUsed_14",
    "isTransfer_15", "floodLevel_15", "isFailurePoint_15", "elevation_15", "pumpUsed_15"
]

attributes_definition = train_attributes_definition + station_attributes_definition

# 初始化IBL智能体
ibl_agent = Agent(attributes=["action_tuple"] + attributes_definition, default_utility=1.0, noise=0.1, decay=0.5)

# 利用log_parser.py中的函数，获取log文件中的数据
parser = MetroLogAnalyzer('metro_logs_2025-02-25T01_40_19.393Z.json')

for round in parser.rounds:
    # 获取每个回合的action和attributes
    attributes = parser._get_attributes(round.trains, round.stations)
    action_tuple = parser._get_action_attributes(round.player_actions)
    choice = {"action_tuple": action_tuple, **attributes}

    ibl_agent.populate(choices=choice, outcome=round.score_change)




async def env():
    try:
        env = MetroEnv()
        env.ws = await websockets.connect(
            "ws://localhost:8765",
            ping_interval=None,
            max_size=1_000_000_000,
            open_timeout=10,
            subprotocols=["json", "msgpack"]
        )

        response = await env.reset(use_msgpack=True)
        previous_score = response['score']  # 记录前一步得分

        for step in range(2):
            allowed_actions = []
            # 构建状态特征
            train_attributes = {}
            # 按照列车id顺序（0-7），构建状态特征
            for train_id in range(8):
                train = response['trains'][train_id]                 
                train_attributes["train_in_stationId_" + str(train_id)] = str(train['stationId'])
                train_attributes["trackId_" + str(train_id)] = str(train['trackId'])
                train_attributes["nodePosition_" + str(train_id)] = train['nodePosition']                
                train_attributes["passengers_in_train_" + str(train_id)] = train['passengers']
                train_attributes["delayedRounds_" + str(train_id)] = train['delayedRounds']
                train_attributes["direction_" + str(train_id)] = train['direction']
                train_attributes["status_" + str(train_id)] = train['status']
                # train_attributes["train_id"] = str(train['id'])
                # train_attributes["lineId"] = str(train['lineId'])
                # train_attributes["capacity"] = train['capacity']

                # 为每个列车获取本轮可行的action
                allowed_actions_for_each_train = []
                if train['status'] == 'running':
                    allowed_actions_for_each_train = ['monitor', 'stop', 'reverse']
                    if isinstance(train['stationId'], (int, float)):
                        allowed_actions_for_each_train.append('evacuate')
                elif train['status'] == 'stopped':
                    allowed_actions_for_each_train = ['monitor', 'start', 'reverse']
                    if isinstance(train['stationId'], (int, float)):
                        allowed_actions_for_each_train.append('evacuate')
                elif train['status'] == 'trapped':
                    allowed_actions_for_each_train = ['monitor']
                    if isinstance(train['stationId'], (int, float)):
                        allowed_actions_for_each_train.append('evacuate')
                else:
                    allowed_actions_for_each_train = ['monitor']  # 默认值

                allowed_actions_temp = []
                allowed_actions_temp = [str(train_id) + str(a) for a in allowed_actions_for_each_train]
                allowed_actions.append(allowed_actions_temp)
            
            station_attributes = {}
            # 按照车站id顺序（0-15），构建状态特征
            for station_id in range(16):
                station = response['stations'][station_id]
                # station_attributes["station_id"] = str(station['id'])
                # station_attributes["x"] = station['x']
                # station_attributes["y"] = station['y']
                # station_attributes["passengers_in_station"] = station['passengers']
                station_attributes["isTransfer_" + str(station_id)] = station['isTransfer']
                station_attributes["floodLevel_" + str(station_id)] = station['floodLevel']
                station_attributes["isFailurePoint_" + str(station_id)] = station['isFailurePoint']
                station_attributes["elevation_" + str(station_id)] = station['elevation']
                station_attributes["pumpUsed_" + str(station_id)] = station['pumpUsed']

            # 将train_attributes和station_attributes合并
            attributes = {**train_attributes, **station_attributes}

            # 将allowed_actions每个成员中取再取出来一个元素，组成一个组合。请穷尽所有组合，所以组合放到possible_actions中
            possible_actions_combinations = []
            possible_actions_combinations = [list(combination) for combination in itertools.product(*allowed_actions)]

            # 生成所有动作组合与属性的对应关系（修正为列表推导式）
            choices = [{"action_tuple": tuple(action_combination), **attributes} for action_combination in possible_actions_combinations]
            
            # 使用IBL选择动作
            move_tuple = ibl_agent.choose(choices)['action_tuple']

            # 将move_tuple中的每个元素转换为dict，并组成一个列表
            moves = [{"trainId": int(move[0]), "actionType": move[1:]} for move in move_tuple]

            response = await env.step(moves)
            
            # 计算即时奖励（可根据需要调整奖励函数）
            current_score = response['score']
            reward = current_score - previous_score
            previous_score = current_score
            
            # 反馈给IBL智能体
            ibl_agent.respond(reward)

            print(f"回合={response['info']['round']}: 动作={moves}, 总得分={response['score']:.2f}")

        print('游戏结束')

    # except Exception as e:
    #     print(f"测试失败: {str(e)}")
    finally:
        await env.close()

asyncio.run(env()) 