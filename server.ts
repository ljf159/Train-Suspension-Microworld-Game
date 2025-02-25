import { GameServer } from './src/server/gameServer';

// 只在Node环境启动服务器
if (import.meta.url.endsWith(process.argv[1]?.replace(/^(file:\/\/)?/, 'file://'))) {

  const gameServer = new GameServer(8765);
  console.log('✅ RL服务器已启动在端口8765');

  gameServer.wss.on('listening', () => {
    const address = gameServer.wss.address()!;
    // console.log(`✅ RL服务器已启动在端口${address.port}`);
    // console.log(`✅ RL服务器协议版本${address.family === 'IPv6' ? 'IPv6' : 'IPv4'}`);
  });

  gameServer.wss.on('error', (error: NodeJS.ErrnoException) => {
    console.error('❌ 服务器错误:', error);
    if (error.code === 'EADDRINUSE') {
      console.error('  端口已被占用，请尝试：');
      console.error('  1. 关闭其他占用8765端口的程序');
      console.error('  2. 使用新端口重启应用');
    }
  });
}
