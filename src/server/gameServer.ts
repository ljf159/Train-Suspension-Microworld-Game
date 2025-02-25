import { WebSocketServer } from 'ws';
import { GameState } from '../types/index';
import { initialGameState } from '../data/initialGameState';
import { updateGameState } from '../utils/gameUtils';
import { handleRLAction } from '../utils/actionHandlers';
import msgpack from 'msgpack-lite';

export class GameServer {
  public wss: WebSocketServer;
  private gameState: GameState;

  constructor(port: number) {    
    // 将初始游戏状态的isPaused设置为false
    this.gameState = {
      ...initialGameState,
      isPaused: false
    };

    this.wss = new WebSocketServer({
      port,
      host: '0.0.0.0',
      perMessageDeflate: {
        zlibDeflateOptions: { chunkSize: 1024, memLevel: 7, level: 3 },
        zlibInflateOptions: { chunkSize: 10 * 1024 }
      }
    });
    
    this.wss.on('listening', () => {
      console.log(`🚀 WebSocket server listening on port ${port}`);
      console.log(`🔗 Access URL: ws://localhost:${port}`);
    });

    this.wss.on('error', (error) => {
      console.error('⚠️ WebSocket server error:', error);
    });

    this.wss.on('connection', (ws, request) => {
      const clientIP = request.socket.remoteAddress;
      console.log(`RL Client connected from ${clientIP}`);
      
      // 保持连接活跃
      const keepAlive = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on('close', (code, reason) => {
        clearInterval(keepAlive);
        const reasonText = getCloseReason(code);
        console.log(`客户端 ${clientIP} 断开连接（${reasonText}）: ${reason.toString() || '无说明'}`);
      });
      
      // 发送初始状态
      ws.send(this.serializeState(this.gameState));
      
      ws.on('message', (message: Buffer) => {
        try {
          const actions = msgpack.decode(message);

          // 遍历所有动作并执行
          actions.forEach((action: { trainId: number, actionType: string }) => {
            this.handleAction(action);
          });

          // 更新游戏逻辑（保持只执行一次）
          const newState = this.step();

          ws.send(this.serializeState(newState));
        } catch (error) {
          console.error('处理动作失败:', error);
        }
      });
    });
  }

  private serializeState(state: GameState): Buffer {
    const observation = {
      trains: Array.from(state.trains.values()),
      stations: Array.from(state.stations.values()),
      score: state.score,
      info: { round: state.round }
    };
    return msgpack.encode(observation);
  }

  private handleAction(action: { trainId: number, actionType: string }): void {
    // 添加类型守卫
    if (action.actionType === 'reset') {
      this.gameState = {
        ...initialGameState,
        isPaused: false
      };
      return;
    } else {
    // 将RL动作转换为游戏动作
    // 示例动作格式：
    // { trainId: number, actionType: 'evacuate'|'reverse'|'stop' }
    if (action.trainId && action.actionType) {
        const train = this.gameState.trains.find(t => t.id === action.trainId);
        if (train) {
          // 调用现有游戏逻辑处理动作
          // 这里需要根据实际游戏接口调整
          this.gameState = handleRLAction(
            this.gameState, 
            train, 
            action.actionType as 'evacuate' | 'reverse' | 'stop' | 'start' | 'monitor'
          );
        }
      }
    }
  }

  private step(): GameState {
    // 用当前状态生成新状态
    const newState = updateGameState(this.gameState);
    this.gameState = newState;
    return newState; // 返回更新后的状态
  }

}

function getCloseReason(code: number): string {
  const reasons: { [key: number]: string } = {
    1000: '正常关闭',
    1001: '服务器停止中',
    1002: '协议错误',
    1003: '接收了无法处理的数据',
    1006: '异常断开',
    4000: '游戏会话超时',
    4001: '无效操作',
    4002: '资源限制'
  };
  return reasons[code] || `未知原因码 ${code}`;
} 

// interface Observation {
//   trains: Train[];
//   stations: Station[];
//   score: number;
//   info: GameInfo;
// }

// interface GameInfo {
//   round: number;
// }

//   private getObservation(): Observation {
//     return {
//       trains: Array.from(this.gameState.trains.values()).map(t => ({
//         id: t.id,
//         stationId: t.stationId,
//         trackId: t.trackId,
//         nodePosition: t.nodePosition,
//         direction: t.direction,
//         status: t.status,
//         delayedRounds: t.delayedRounds,
//         lineId: t.lineId,
//         passengers: t.passengers,
//         capacity: t.capacity,
//         lastMoveRound: t.lastMoveRound,
//       })),
//       stations: Array.from(this.gameState.stations.values()).map(s => ({
//         id: s.id,
//         name: s.name,
//         x: s.x,
//         y: s.y,
//         passengers: s.passengers,
//         isTransfer: s.isTransfer,
//         connected: s.connected,
//         floodLevel: s.floodLevel,
//         isFailurePoint: s.isFailurePoint,
//         elevation: s.elevation,
//         hasPump: s.hasPump,
//         pumpThreshold: s.pumpThreshold,
//         pumpRate: s.pumpRate,
//         pumpUsed: s.pumpUsed,
//         previousFloodLevel: s.previousFloodLevel,
//         lastIncrease: s.lastIncrease,
//         increaseInThisRound: s.increaseInThisRound,
//       })),
//       score: 0,
//       info: { round: this.gameState.round }
//     };
//   }

  // 配置msgpack编码器
//   private encode = (data: any) => {
//     return msgpack.encode(data, { codec: msgpack.createCodec({ preset: true }) });
//   };

