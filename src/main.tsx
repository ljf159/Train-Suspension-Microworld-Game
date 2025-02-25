import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 添加错误边界
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)



// 删除所有GameServer相关代码
const ws = new WebSocket('ws://localhost:8765');

ws.onerror = (error) => {
  console.error('WebSocket错误:', error);
};

ws.onclose = (event) => {
  console.log('连接关闭:', event.code, event.reason);
};

setTimeout(() => {
  if (ws.readyState === WebSocket.CONNECTING) {
    console.log('⌛ 仍在尝试连接训练服务器...');
    ws.onopen = () => {
      console.log('✅ 已成功连接到训练服务器');
    };
  } else if (ws.readyState === WebSocket.OPEN) {
    console.log('✅ 已连接到训练服务器');
  } else {
    console.log(ws.readyState);
    console.log('❌ 无法连接到训练服务器');
  }
}, 500); // 延迟500毫秒后检查连接状态

// ws.onmessage = (event) => {
//   console.log('onmessage', event);
//   console.log('event.data', event.data);
//   const data = JSON.parse(event.data);
//   // 处理服务器消息...
//   console.log(data);
// };
