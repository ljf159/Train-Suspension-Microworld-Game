import React from 'react';

export const Instructions: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex flex-col items-center h-screen bg-gray-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-4">Train Dispatch in Flood</h1>
    <h2 className="text-2xl font-semibold text-green-400 mb-4">Game Instructions</h2>

    
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mb-4 overflow-y-auto" 
         style={{ maxHeight: '70vh' }}>
      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Basic Interface Guide</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Left View:</strong> Displays railway network map (stations, tracks, train positions)</li>
          <li><strong>Right Panel:</strong> Contains:
            <ul className="list-circle list-inside ml-6">
              <li>Current round display</li>
              <li>Remaining decision time countdown (30 seconds per round)</li>
              <li>Score display</li>
              <li>Action buttons for selected trains</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-green-400 mb-4">2. Core Operation Process</h2>
        <div className="space-y-4 ml-4">
          <h3 className="text-lg font-semibold">1. Select Train</h3>
          <p>Click on the train icon on the map</p>
          
          <h3 className="text-lg font-semibold mt-4">2. Execute Action</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-2 border">Action Type</th>
                  <th className="p-2 border">Execution Condition</th>
                  <th className="p-2 border">Effect</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border">Monitor</td><td className="p-2 border">Any condition</td><td className="p-2 border">Do nothing</td></tr>
                <tr><td className="p-2 border">Start</td><td className="p-2 border">Train stopped and water level safe</td><td className="p-2 border">"stopped" → "running"</td></tr>
                <tr><td className="p-2 border">Stop</td><td className="p-2 border">Train in motion</td><td className="p-2 border">"running" → "stopped"</td></tr>
                <tr><td className="p-2 border">Reverse</td><td className="p-2 border">Train not trapped</td><td className="p-2 border">Change direction</td></tr>
                <tr><td className="p-2 border">Evacuate</td><td className="p-2 border">Train stopped at station</td><td className="p-2 border">Transfer passengers and stop</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-4">3. Submit Decision</h3>
          <ul className="list-disc list-inside ml-4">
            <li>Multiple actions per round</li>
            <li>Manual submit with "Submit Decision" button</li>
            <li>Auto-submit "Monitor" when time expires</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-yellow-400 mb-4">3. Water Level and Train Status</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Yellow warning: ≥40% water level</li>
          <li>Red warning (≥50%):
            <ul className="list-circle list-inside ml-6">
              <li>Status: "trapped"</li>
              <li>No passenger boarding</li>
            </ul>
          </li>
          <li>Recovery Mechanism:
            <ul className="list-circle list-inside ml-6">
              <li>Water must stay &lt;50% to auto-change to "stopped"</li>
              <li>Manual start required after recovery</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-purple-400 mb-4">4. Scoring Rules</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>On-time: +5 × passengers</li>
          <li>Delay: -5 × passengers</li>
          <li>Trapped: -50 × passengers</li>
          <li>Evacuation: -15 × passengers</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-pink-400 mb-4">5. Other Rules</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li className="mb-2">
            <strong>Collision Prevention:</strong>
            <span> Trains within 1 unit distance auto-stop</span>
          </li>
          <li className="mb-2">
            <strong>Failure Points:</strong>
            <span> Only visible at stations, hidden on tracks</span>
          </li>
          <li>
            <strong>Flood Propagation:</strong>
            <span> Affected by level difference and elevation</span>
          </li>
        </ol>
        <blockquote className="ml-6 pl-4 border-l-4 border-gray-500 italic mt-4 text-gray-300">
          Tip: Prioritize high-load trains, evacuate high-risk areas promptly.
        </blockquote>
      </section>
    </div>

    <button 
      onClick={onStart}
      className="px-8 py-4 bg-blue-600 text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors"
    >
      Start Game
    </button>
  </div>
); 