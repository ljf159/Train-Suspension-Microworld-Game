import { clearPersistedLogs, exportLogs } from '../utils/storageUtils';

export const DebugPanel: React.FC = () => (
  <div className="fixed bottom-4 left-4 flex gap-2">
    <button 
      onClick={exportLogs}
      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Export Logs
    </button>
    <button
      onClick={clearPersistedLogs}
      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Clear Logs
    </button>
  </div>
); 