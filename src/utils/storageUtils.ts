import { GameLog } from '../types/index';

const LOG_STORAGE_KEY = 'metro_game_logs_v2';

// 保存日志到localStorage
export const persistLogs = (logs: GameLog[]) => {
  try {
    const maxLogs = 500; // 最多存储100轮
    const data = {
      version: 2.1,
      lastUpdated: new Date().toISOString(),
      logs: logs.slice(0, maxLogs)
    };
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('存储日志失败:', error);
    localStorage.removeItem(LOG_STORAGE_KEY); // 存储失败时自动清理
  }
};

// 从localStorage加载日志
export const loadPersistedLogs = (): GameLog[] => {
  try {
    const data = localStorage.getItem(LOG_STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // 需要验证数据格式
    if (parsed?.logs?.length && Array.isArray(parsed.logs)) {
      return parsed.logs;
    }
    return [];
  } catch (error) {
    console.error('加载日志失败:', error);
    return [];
  }
};

// 修改导出函数名称
export const exportLogs = () => {
  const logs = loadPersistedLogs();
  const blob = new Blob([JSON.stringify(logs)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `metro_logs_${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 清除本地日志
export const clearPersistedLogs = () => {
  localStorage.removeItem(LOG_STORAGE_KEY);
}; 