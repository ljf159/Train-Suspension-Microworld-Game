import gym
import json
import websockets
import asyncio
import numpy as np
import msgpack
import io

class MetroEnv(gym.Env):
    def __init__(self, host='localhost', port=8765):
        super().__init__()
        self.ws_uri = f"ws://{host}:{port}"
        self.connection = None
        self.use_msgpack = True  # 添加类属性
        
        # # 改进后的动态动作空间定义
        # self.action_space = gym.spaces.Dict({
        #     'trainId': gym.spaces.Discrete(8),
        #     # 重新定义动作类型：
        #     # 0: Monitor  1: Start  2: Stop  3: Reverse  4: Evacuate
        #     # 动态动作类型空间（实际有效值会在观察中指定）
        #     'actionType': gym.spaces.Sequence(gym.spaces.Discrete(5))
        # })
        
        # # 更新观察空间定义
        # self.observation_space = gym.spaces.Dict({
        #     'trains': gym.spaces.Sequence(
        #         gym.spaces.Dict({
        #             'id': gym.spaces.Discrete(8),
        #             'stationId': gym.spaces.Discrete(16),
        #             'trackId': gym.spaces.Discrete(12),
        #             'nodePosition': gym.spaces.Box(low=-1, high=1, shape=()),
        #             'direction': gym.spaces.Discrete(2),
        #             'status': gym.spaces.Discrete(3),
        #             'delayedRounds': gym.spaces.Box(low=0, high=100, shape=()),   
        #             'lineId': gym.spaces.Discrete(4),
        #             'passengers': gym.spaces.Box(low=0, high=200, shape=()),
        #             'valid_actions': gym.spaces.MultiBinary(5)  # 新增有效动作掩码
        #         })
        #     ),
        #     'stations': gym.spaces.Sequence(
        #         gym.spaces.Dict({
        #             'id': gym.spaces.Discrete(16), 
        #             'x': gym.spaces.Box(0.0, 500.0, shape=(), dtype=np.float32),
        #             'y': gym.spaces.Box(0.0, 500.0, shape=(), dtype=np.float32),
        #             'isTransfer': gym.spaces.Discrete(2),
        #             'connected': gym.spaces.Sequence(gym.spaces.Discrete(12)),
        #             'floodLevel': gym.spaces.Box(low=0, high=100, shape=()),
        #             'passengers': gym.spaces.Box(low=0, high=1000, shape=()),
        #             'isFailurePoint': gym.spaces.Sequence(gym.spaces.Discrete(2)), # 有时候不可见，想想怎么改？？
        #             'elevation': gym.spaces.Box(low=0, high=10, shape=()),
        #             'pumpUsed': gym.spaces.Discrete(2),
        #         })
        #     ),
        #     'score': gym.spaces.Box(low=-np.inf, high=np.inf, shape=()),
        #     'info': gym.spaces.Dict({
        #         'round': gym.spaces.Box(low=0, high=np.inf, shape=()),
        #     })
        # })

    async def reset(self, use_msgpack=False):
        """重置环境并返回初始观察值"""
        self.use_msgpack = use_msgpack  # 存储序列化方式
        # 关闭之前的连接
        if self.connection:
            await self.connection.close()
        
        # 连接到服务器
        self.connection = await websockets.connect(self.ws_uri)

        # 清空缓冲区
        while True:
            try:
                await asyncio.wait_for(self.connection.recv(), timeout=0.1)
            except (asyncio.TimeoutError, websockets.exceptions.ConnectionClosed):
                break

        reset_msg = [{"trainId": 0, "actionType": "reset"}]
        
        if self.use_msgpack:
            await self.connection.send(msgpack.packb(reset_msg))
            response = await self.connection.recv()

            response = msgpack.unpackb(response, raw=False, use_list=True)

            while True:
                try:
                    await asyncio.wait_for(self.connection.recv(), timeout=0.1)
                except (asyncio.TimeoutError, websockets.exceptions.ConnectionClosed):
                    break
            
            return response

        # else:
        #     await self.connection.send(json.dumps(reset_msg))
        #     initial_data = await self.connection.recv()
        #     return self._parse_observation(json.loads(initial_data))

    # # 修改为根据状态返回有效动作的方法
    # def get_valid_actions(self, status, station_id):
    #     """根据列车状态返回允许的动作类型列表"""
    #     base_actions = {
    #         "running": [0, 2, 3],  # Monitor(0), Stop(2), Reverse(3)
    #         "stopped": [0, 1, 3],  # Monitor(0), Start(1), Reverse(3)
    #         "trapped": [0]         # Monitor(0)
    #     }.get(status, [0])  # 默认返回Monitor
        
    #     # 如果列车在车站（station_id不为None），添加疏散动作（4）
    #     if station_id is not None:
    #         base_actions.append(4)
        
    #     return base_actions

    async def step(self, action):
        """执行动作前添加状态验证"""
        # # 获取目标列车当前状态（假设当前观察数据已更新）
        # train_id = action['trainId']
        # current_status = self.current_obs['trains'][train_id]['status']
        # station_id = self.current_obs['trains'][train_id]['stationId']
        
        # # 使用新的验证方法
        # valid_actions = self.get_valid_actions(current_status, station_id)
        # if action['actionType'] not in valid_actions:
        #     return self.current_obs, -10, False, {"error": "无效动作"}

        # # 循环执行所有的action
        # for a in action:
        #     # 将valid_actions转换为字符串'monitor', 'stop', 'reverse'，'start', 'evacuate'
        #     # 0: Monitor  1: Start  2: Stop  3: Reverse  4: Evacuate
        #     valid_actions_str = ['monitor', 'start', 'stop', 'reverse', 'evacuate']
        #     a['actionType'] = valid_actions_str[a['actionType']]
        
        if self.use_msgpack:
            await self.connection.send(msgpack.packb(action))

            response = await self.connection.recv()

            while True:
                try:
                    await asyncio.wait_for(self.connection.recv(), timeout=0.1)
                except (asyncio.TimeoutError, websockets.exceptions.ConnectionClosed):
                    break
            
            return msgpack.unpackb(response, raw=False)
        # else:
        #     await self.connection.send(json.dumps(action))
        #     response = await self.connection.recv()
        #     data = json.loads(response)
        
        # return (
        #     data['trains'],
        #     data['stations'],
        #     data['score'],
        #     data['info']
        # )

    # def _parse_observation(self, obs):
    #     """更新观察解析，包含有效动作掩码"""
    #     try:
    #         return {
    #             'trains': [{
    #                 'id': t.get('id', 0),
    #                 'stationId': t.get('stationId', 0),
    #                 'trackId': t.get('trackId', 0),
    #                 'nodePosition': t.get('nodePosition', 0),
    #                 'direction': {'forward': 0, 'backward': 1}.get(t.get('direction', ''), -1),
    #                 'status': {'running': 0, 'stopped': 1, 'trapped': 2}.get(t.get('status', ''), -1),
    #                 'delayedRounds': t.get('delayedRounds', 0),
    #                 'lineId': t.get('lineId', 0),
    #                 'passengers': t.get('passengers', 0),
    #                 'valid_actions': self._create_action_mask(t.get('status', ''), t.get('stationId', None))
    #             } for t in obs.get('trains', [])],
    #             'stations': [{
    #                 'id': s.get('id', 0),
    #                 'x': s.get('x', 0),
    #                 'y': s.get('y', 0),
    #                 'isTransfer': {'true': 1, 'false': 0}.get(s.get('isTransfer', ''), -1),
    #                 'connected': s.get('connected', []),
    #                 'floodLevel': s.get('floodLevel', 0),
    #                 'passengers': s.get('passengers', 0),
    #                 'isFailurePoint': {'true': 1, 'false': 0}.get(s.get('isFailurePoint', ''), -1),  # 有时候不可见，想想怎么改？？
    #                 'elevation': s.get('elevation', 0),
    #                 'pumpUsed': {'true': 1, 'false': 0}.get(s.get('pumpUsed', ''), -1)
    #             } for s in obs.get('stations', [])],
    #             'score': obs.get('score', 0),
    #             'info': obs.get('info', {})
    #         }
    #     except Exception as e:
    #         print(f"⚠️ 解析错误: {repr(e)}")
    #         raise
    
    # def _create_action_mask(self, status, station_id):
    #     """创建二进制动作掩码"""
    #     valid_actions = self.get_valid_actions(status, station_id)
    #     mask = [0] * 5
    #     for a in valid_actions:
    #         mask[a] = 1
    #     return np.array(mask, dtype=np.int8)

    async def close(self):
        if self.connection:
            await self.connection.close() 

    # async def _get_observation(self):
    #     # 添加编码参数处理二进制键
    #     try:
    #         data = await asyncio.wait_for(self.connection.recv(), timeout=10)
    #         obs = msgpack.unpackb(data, raw=False, use_list=True)
    #         return self._parse_observation(obs)
    #     except Exception as e:
    #         print(f"⚠️ 反序列化错误: {repr(e)}")
    #         print("原始数据:", data[:100])  # 显示部分数据帮助调试
    #         raise