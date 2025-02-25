import asyncio
from metro_env import MetroEnv
import numpy as np
import websockets

async def test_env():
    try:
        env = MetroEnv()
        env.ws = await websockets.connect(
            "ws://localhost:8765",
            ping_interval=None,
            max_size=1_000_000_000,
            open_timeout=10,
            subprotocols=["json", "msgpack"]
        )

        initial_response = await env.reset(use_msgpack=True)
     
        for step in range(30):
            # 获取当前所有列车状态
            current_trains = initial_response['trains'] if step == 0 else response['trains']
            
            # 随机选择一个列车并获取其状态
            train_id = np.random.randint(0, 8)
            train_status = next((t['status'] for t in current_trains if t['id'] == train_id), 'running')
            # 判断列车是否在站台，即stationId为null
            train_isinstation = next((t['stationId'] for t in current_trains if t['id'] == train_id), None)
            
            # 根据列车状态确定可用动作
            if train_status == 'running':
                allowed_actions = ['monitor', 'stop', 'reverse']
                if train_isinstation is not None:
                    allowed_actions.append('evacuate')
            elif train_status == 'stopped':
                allowed_actions = ['monitor', 'start', 'reverse']
                if train_isinstation is not None:
                    allowed_actions.append('evacuate')
            elif train_status == 'trapped':
                allowed_actions = ['monitor']
                if train_isinstation is not None:
                    allowed_actions.append('evacuate')
            else:
                allowed_actions = ['monitor']  # 默认值
            
            action = {
                'trainId': train_id,
                'actionType': np.random.choice(allowed_actions)
            }

            response = await env.step(action)

            print(f"Step {step}: Score={response['score']:.2f}, Round={response['info']['round']}")

            # print(f"Step {step}: Trains={response['trains']}, Stations={response['stations']}, Score={response['score']:.2f}, Round={response['info']['round']}")

        print('游戏结束')

    # except Exception as e:
    #     print(f"测试失败: {str(e)}")
    finally:
        await env.close()

asyncio.run(test_env()) 