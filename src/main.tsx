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
