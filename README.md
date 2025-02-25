# Train Suspension Microworld Game

## Game Instructions

### 1. Basic Interface Guide
- **Left Map View**: Displays railway network map (stations, discrete track nodes, train positions)
- **Right Control Panel**: Contains round display, remaining time countdown (30s per round), score display, action buttons for selected trains

### 2. Your Role
- As a train dispatcher, you need to try your best to transport passengers on time and safely
- Flood may trap trains. You need to prevent the train from being trapped by flood water and try to keep the train moving to transport as many passengers as possible
- Flood levels are only visible at stations, not on track nodes. Failure points (where flood water gets in) are also only visible at stations, not on track nodes
- You need to make decisions based on your judgement of flood levels and failure points

### 3. Core Operation Process
1. **Select Train**
   - Click on the train icon on the map

2. **Select Action**
   | Action Type | Execution Condition | Effect |
   |------------|-------------------|--------|
   | Monitor | Any condition | Do nothing |
   | Start | Train stopped and water level safe | Status: "stopped" → "running" |
   | Stop | Train in motion | Status: "running" → "stopped" |
   | Reverse | Train not trapped | Direction: "forward" ↔ "backward" |
   | Evacuate | Train at station | Transfer train passengers to station and execute "stop" action |

3. **Submit Decision**
   - Allow multiple actions per round
   - Manual submit with "Submit Decision" button
   - Auto-submit "Monitor" when time expires

### 4. Water Level and Train Status
- **≥40%** water level: Yellow warning
- **≥50%** water level: Red warning
  - Train status will be "trapped"
  - No passenger boarding
- **Trap Recovery Mechanism**:
  - Water must stay <50% to auto-change from "trapped" to "stopped"
  - Still need manual start after recovery

### 5. Scoring Rules
- On-time: +5 × passengers
- Delay: -5 × passengers
- Trapped on tunnel tracks: -50 × passengers
- Evacuation: -15 × passengers

### 6. Other Rules
1. **Collision Prevention**: Trains within 1 unit distance from the train ahead will auto-stop
2. **Flood Propagation**: Affected by floodlevel difference and elevation
3. **Pump Operation**: Pump is only available at stations and will be operated automatically when the water level is ≥ 10%




## Play the game with RL agent

### Clone repository 
```
git clone https://github.com/ljf159/Train-Suspension-Microworld-Game.git
```

### Play the game with DQN agent
1. **Start Game Server** (in separate terminal):
```
npm run start:server # Starts WebSocket server on port 8765
```

2. **Train DQN Agent**:
```
python rl_env/custom_dqn.py
```
