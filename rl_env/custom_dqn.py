import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import random
from collections import deque
import asyncio
from metro_env import MetroEnv
import json
import websockets
import matplotlib.pyplot as plt
import os
import time
from IPython import display

class QNetwork(nn.Module):
    """自定义Q网络处理地铁环境观察"""
    def __init__(self, obs_size, action_size):
        super(QNetwork, self).__init__()
        self.fc = nn.Sequential(
            nn.Linear(obs_size, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
        )
        # 为每个列车输出独立的动作价值
        self.heads = nn.ModuleList([
            nn.Linear(64, action_size) for _ in range(8)
        ])
    
    def forward(self, x):
        x = self.fc(x)
        return torch.stack([head(x) for head in self.heads], dim=1)  # [batch, 8, 5]

class ReplayBuffer:
    """经验回放缓冲区"""
    def __init__(self, capacity):
        self.buffer = deque(maxlen=capacity)
    
    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))
    
    def sample(self, batch_size):
        return random.sample(self.buffer, batch_size)
    
    def __len__(self):
        return len(self.buffer)

class DQNAgent:
    def __init__(self, env):
        self.env = env
        self.obs_parser = self._get_obs_parser()
        
        # 动作空间参数
        self.train_id_size = 8  # 假设有8个列车
        self.action_type_size = 5  # 5种动作类型
        self.station_id_size = 16  # 假设有16个车站
        self.total_actions = self.train_id_size * self.action_type_size
        
        # 神经网络参数
        self.q_net = QNetwork(obs_size=self._get_obs_dim(), action_size=self.total_actions)
        self.target_net = QNetwork(obs_size=self._get_obs_dim(), action_size=self.total_actions)
        self.optimizer = optim.Adam(self.q_net.parameters(), lr=0.001)
        
        # 训练参数
        self.buffer = ReplayBuffer(10000)
        self.batch_size = 64
        self.gamma = 0.99 # 折扣因子
        self.epsilon = 1.0 # 探索率
        self.epsilon_min = 0.01 # 最小探索率
        self.epsilon_decay = 0.995 # 探索率衰减
        self.update_target_every = 100 # 更新目标网络的频率
        self.steps = 0 # 步数
        self.episode_rewards = []  # 记录每轮的总奖励
        self.moving_avg = []       # 记录移动平均

    def _get_obs_dim(self):
        """动态获取观察空间维度"""
        sample_obs = self._parse_observation({
            'trains': [{
                'id': 0, 
                'stationId': None, 
                'trackId': 0, 
                'nodePosition': 0, 
                'capacity': 100, 
                'passengers': 50, 
                'status': 'running', 
                'direction': 'forward', 
                'lineId': 1, 
                'delayedRounds': 0, 
                # 'lastMoveRound': 0
            }] * 8,
            'stations': [{
                'id': 0, 
                'name': 'H1-West', 
                'x': 100, 
                'y': 200, 
                'passengers': 30, 
                'isTransfer': False, 
                # 'connected': [1], 
                'floodLevel': 0, 
                # 'previousFloodLevel': 0, 
                'isFailurePoint': False, 
                'elevation': 5, 
                # 'hasPump': True, 
                # 'pumpThreshold': 10, 
                # 'pumpRate': 3, 
                'pumpUsed': False, 
                # 'lastIncrease': None, 
                # 'increaseInThisRound': 0
            }] * 16,
            'score': 1600, 
            'info': {'round': 1}
        })
        return len(sample_obs)

    def _get_obs_parser(self):
        """创建观察解析器"""
        def obs_parser(obs):
            # 将观察数据展平为向量
            train_features = []
            for train in obs['trains']:
                # 对离散型ID进行独热编码（假设有8个列车）
                train_id_onehot = [0] * self.train_id_size
                train_id_onehot[train['id']] = 1
                
                train_features.extend([
                    *train_id_onehot,  # 替换原来的train['id']
                    *([1 if train['stationId'] == i else 0 for i in range(16)] + [1 if train['stationId'] is None else 0]),  # 16个车站 + 1个null状态的独热编码
                    *[1 if train['trackId'] == i else 0 for i in range(12)],  # 12条轨道的独热编码
                    train['nodePosition'], 
                    train['capacity'],
                    train['passengers'],
                    train['delayedRounds'],
                    1 if train['direction'] == 'forward' else 0,
                    *[1 if train['lineId'] == i else 0 for i in range(4)],  # 4条线路的独热编码
                    1 if train['status'] == 'running' else 0,
                    1 if train['status'] == 'stopped' else 0, 
                    1 if train['status'] == 'trapped' else 0
                ])
            
            station_features = []
            for station in obs['stations']:
                # 对车站ID也进行独热编码（假设有16个车站）
                station_id_onehot = [0] * self.station_id_size
                station_id_onehot[station['id']] = 1
                
                station_features.extend([
                    *station_id_onehot,  # 替换原来的station['id']
                    float(station['x']),
                    float(station['y']),
                    float(station['passengers']),
                    float(1 if station['isTransfer'] else 0),
                    # station['connected'],
                    float(station['floodLevel']),
                    # station['previousFloodLevel'],
                    1 if station['isFailurePoint'] else 0,
                    station['elevation'],
                    # station['hasPump'],
                    # station['pumpThreshold'],
                    # station['pumpRate'],
                    1 if station['pumpUsed'] else 0,
                ])

            # 使用np.asarray显式指定dtype
            train_array = np.asarray(train_features, dtype=np.float32)
            station_array = np.asarray(station_features, dtype=np.float32)
            
            return np.concatenate([train_array, station_array])
        return obs_parser

    def _parse_observation(self, obs):
        """处理原始观察数据"""
        return self.obs_parser(obs)

    def _action_mapping(self, action_indices):
        """将8个动作索引转换为环境需要的动作列表"""
        return [{
            'trainId': int(train_id),
            'actionType': int(action_idx)
        } for train_id, action_idx in enumerate(action_indices)]

    async def train(self, episodes=1000):

        self.env.ws = await websockets.connect(
            "ws://localhost:8765",
            ping_interval=None,
            max_size=1_000_000_000,
            open_timeout=10,
            subprotocols=["json", "msgpack"]
        )

        """训练循环"""
        for episode in range(episodes):
            obs = await self.env.reset(use_msgpack=True)
            state = self._parse_observation(obs)
            total_reward = obs['score']
            done = False
            
            for _ in range(30):
                # 为每个列车独立决策
                action_indices = []
                state_tensor = torch.FloatTensor(state)
                
                with torch.no_grad():
                    q_values = self.q_net(state_tensor)  # [8, 5]
                
                for train_id in range(self.train_id_size):
                    # 获取列车当前状态
                    train_data = obs['trains'][train_id]
                    status = train_data['status']
                    station_id = train_data['stationId']
                    
                    # 根据状态确定允许的动作类型
                    # 0: Monitor  1: Start  2: Stop  3: Reverse  4: Evacuate
                    allowed_actions = []
                    if status == 'running':
                        allowed_actions = [0, 2, 3]  # monitor, stop, reverse
                        if station_id is not None:
                            allowed_actions.append(4)  # evacuate
                    elif status == 'stopped':
                        allowed_actions = [0, 1, 3]  # monitor, start, reverse
                        if station_id is not None:
                            allowed_actions.append(4)
                    elif status == 'trapped':
                        allowed_actions = [0]  # monitor
                        if station_id is not None:
                            allowed_actions.append(4)
                    
                    # 确保至少有一个允许动作
                    if not allowed_actions:
                        allowed_actions = [0]
                    
                    if random.random() < self.epsilon:
                        action_idx = random.choice(allowed_actions)
                    else:
                        # 在允许动作中选择Q值最大的
                        valid_q = q_values[train_id][allowed_actions]
                        action_idx = allowed_actions[torch.argmax(valid_q).item()]
                        
                    action_indices.append(action_idx)
                
                # 执行动作
                actions = self._action_mapping(action_indices)
                
                next_obs = await self.env.step(actions)
                next_state = self._parse_observation(next_obs)

                # 本次得分或奖励
                reward = next_obs['score'] - total_reward
                
                # 存储经验
                self.buffer.push(state, action_indices, reward, next_state, done)
                state = next_state
                obs = next_obs
                total_reward = next_obs['score']
                
                # 经验回放
                if len(self.buffer) >= self.batch_size:
                    self._replay()
                
                # 更新目标网络
                if self.steps % self.update_target_every == 0:
                    self.target_net.load_state_dict(self.q_net.state_dict())
                
                self.steps += 1

            
            # 衰减探索率
            self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
            
            print(f"Episode: {episode+1}, Total Reward: {total_reward:.2f}, Epsilon: {self.epsilon:.2f}")
            
            # 添加记录
            self.episode_rewards.append(total_reward)
            self.moving_avg.append(np.mean(self.episode_rewards[-100:]))  # 计算100轮移动平均

            # 在训练循环内添加
            if episode % 10 == 0:  # 每10轮更新一次
                self._plot_realtime(episode)

        # 训练结束后添加可视化
        self._plot_training_progress()

    def _replay(self):
        """执行经验回放更新网络"""
        batch = self.buffer.sample(self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        
        states = torch.FloatTensor(np.array(states))
        actions = torch.LongTensor(actions)
        rewards = torch.FloatTensor(rewards)
        next_states = torch.FloatTensor(np.array(next_states))
        dones = torch.BoolTensor(dones)
        
        # 修改后的目标Q值计算
        with torch.no_grad():
            # 修改1：调整维度处理 [batch, 8, 5] -> [batch, 8]
            target_q = self.target_net(next_states).max(dim=2)[0]  # 取每个列车动作的最大值
            target_q = target_q.sum(dim=1)  # 对8个列车的Q值求和 [batch]
            target_q[dones] = 0.0
            target = rewards + self.gamma * target_q

        # 修改后的当前Q值计算
        current_q = self.q_net(states)  # [batch, 8, 5]
        # 为每个列车选择对应的动作 [batch, 8]
        current_q = current_q.gather(2, actions.unsqueeze(-1)).squeeze(-1)
        current_q = current_q.sum(dim=1)  # 对8个列车的Q值求和 [batch]
        
        # 计算损失
        loss = nn.MSELoss()(current_q, target)
        
        # 反向传播
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

    def save(self, filename):
        """保存模型"""
        torch.save({
            'q_net': self.q_net.state_dict(),
            'target_net': self.target_net.state_dict(),
            'optimizer': self.optimizer.state_dict(),
            'epsilon': self.epsilon
        }, filename)

    def load(self, filename):
        """加载模型"""
        checkpoint = torch.load(filename)
        self.q_net.load_state_dict(checkpoint['q_net'])
        self.target_net.load_state_dict(checkpoint['target_net'])
        self.optimizer.load_state_dict(checkpoint['optimizer'])
        self.epsilon = checkpoint['epsilon']

    def _plot_training_progress(self):
        """绘制训练进度图"""
        plt.figure(figsize=(12, 6))
        
        # 原始奖励曲线
        plt.plot(self.episode_rewards, 
                alpha=0.3, 
                color='blue',
                label='Reward per episode')
        
        # 移动平均曲线
        plt.plot(self.moving_avg,
                linewidth=2,
                color='red',
                label='Moving Average (100)')
        
        plt.title('DQN Training Progress')
        plt.xlabel('Episode')
        plt.ylabel('Total Reward')
        plt.legend()
        plt.grid(True)
        
        # 创建保存目录
        os.makedirs('training_plots', exist_ok=True)
        plt.savefig(f'training_plots/dqn_training_{int(time.time())}.png')
        plt.close()

    def _plot_realtime(self, current_episode):
        """实时更新训练曲线"""
        plt.figure(figsize=(10,5))
        plt.clf()
        
        plt.plot(self.episode_rewards, 'b-', alpha=0.3)
        plt.plot(self.moving_avg, 'r-', linewidth=2)
        
        plt.title(f'Training Progress (Current Episode: {current_episode})')
        plt.xlabel('Episode')
        plt.ylabel('Total Reward')
        plt.grid(True)
        
        display.clear_output(wait=True)
        display.display(plt.gcf())
        plt.close()

async def main():
    env = MetroEnv()
    agent = DQNAgent(env)
    
    try:
        await agent.train(episodes=500)
        agent.save("custom_dqn_model.pth")
    finally:
        await env.close()

if __name__ == "__main__":
    asyncio.run(main()) 