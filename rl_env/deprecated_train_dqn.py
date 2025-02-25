import torch
import asyncio
from metro_env import MetroEnv
from stable_baselines3 import DQN
import gym  # 添加gym依赖
import numpy as np

class AsyncWrapper(gym.Env):  # 继承gym.Env
    def __init__(self, env):
        super().__init__()  # 调用父类初始化
        self.env = env
        # 将复合动作空间转换为Discrete空间
        self.action_type_size = 5  # 假设actionType有5种可能
        self.train_id_size = 8     # 假设trainId有8种可能
        self.action_space = gym.spaces.Discrete(self.action_type_size * self.train_id_size)
        # 修改为正确的Box空间（假设观察值是二维的）
        self.observation_space = gym.spaces.Box(
            low=0, 
            high=1, 
            shape=(2,),  # 根据实际观察维度调整
            dtype=np.float32
        )
    
    def reset(self):
        # 使用事件循环执行异步reset
        return asyncio.run(self.env.reset())
    
    def step(self, action):
        # 将action转换为字典
        converted_action = {
            "actionType": [action // self.train_id_size],  # 计算actionType
            "trainId": action % self.train_id_size          # 计算trainId
        }
        # 使用事件循环执行异步step
        obs, reward, done, info = asyncio.run(self.env.step(converted_action))
        return self._flatten_obs(obs), reward, done, info
    
    def _flatten_obs(self, obs):
        # 确保返回一维numpy数组（示例）
        return np.array([v for v in obs.values()]).flatten().astype(np.float32)
    
    async def close(self):
        await self.env.close()

async def main():
    env = AsyncWrapper(MetroEnv())
    model = DQN('MlpPolicy', env,  # 修改为MlpPolicy
                learning_rate=1e-4,      # 学习率
                gamma=0.99,              # 折扣因子
                buffer_size=10000,       # 经验回放大小
                batch_size=128,          # 训练批次大小
                verbose=1)
    model.learn(total_timesteps=10)
    model.save("metro_dqn")
    await env.env.close()  # 修改关闭方式

if __name__ == "__main__":
    asyncio.run(main()) 