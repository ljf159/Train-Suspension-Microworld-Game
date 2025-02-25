import React from 'react';

export const Instructions: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex flex-col items-center h-screen bg-gray-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-4">Subway Train Dispatch during Flooding</h1>
    <h2 className="text-2xl font-semibold text-green-400 mb-4">Game Instructions</h2>

    
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mb-4 overflow-y-auto" 
         style={{ maxHeight: '70vh' }}>
      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">1. Basic Interface Guide</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong>Left Map View:</strong> Displays railway network map (stations, discrete track nodes, train positions)</li>
          <li><strong>Right Control Panel:</strong> Contains round display, remaining time countdown (30s per round), score display, action buttons for selected trains</li>
        </ul>
        {/* 在这里加一个游戏的截图，给这个图加一个边框 */}
        <div className="flex flex-col items-center mt-6">
          <img src="/images/Screenshot.png" alt="Game Screenshot" className="w-full h-auto border-2 border-white rounded-lg" />
          <div className="text-center text-white mt-2 italic">Game Overview</div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">2. Your Role</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>As a train dispatcher, you need to try your best to transport passengers on time and safely.</li>
          <li>Flood may trap trains. You need to prevent the train from being trapped by flood water and try to keep the train moving to transport as many passengers as possible.</li>
          <li>Flood levels are only visible at stations, not on track nodes. Failure points (where flood water gets in) are also only visible at stations, not on track nodes.</li>
          <li>You need to make decisions based on your judgement of flood levels and failure points.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">3. Core Operation Process</h2>
        <div className="space-y-4 ml-4">
          <h3 className="text-lg font-semibold">1. Select Train</h3>
          <p> - Click on the train icon on the map</p>
          
          <h3 className="text-lg font-semibold mt-4">2. Select Action</h3>
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
                <tr><td className="p-2 border">Start</td><td className="p-2 border">Train stopped and water level safe</td><td className="p-2 border">Status: "stopped" → "running"</td></tr>
                <tr><td className="p-2 border">Stop</td><td className="p-2 border">Train in motion</td><td className="p-2 border">Status: "running" → "stopped"</td></tr>
                <tr><td className="p-2 border">Reverse</td><td className="p-2 border">Train not trapped</td><td className="p-2 border">Direction: "forward" ↔ "backward"</td></tr>
                <tr><td className="p-2 border">Evacuate</td><td className="p-2 border">Train at station</td><td className="p-2 border">Transfer train passengers to station and excute "stop" action</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mt-4">3. Submit Decision</h3>
          <ul className="list-disc list-inside ml-4">
            <li>Allow multiple actions per round</li>
            <li>Manual submit with "Submit Decision" button</li>
            <li>Auto-submit "Monitor" when time expires</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">4. Water Level and Train Status</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><span className="text-yellow-400">≥40%</span> water level: Yellow warning</li>
          <li><span className="text-red-400">≥50%</span> water level: Red warning
            <ul className="list-circle list-inside ml-6">
              <li> - Train status will be "trapped"</li>
              <li> - No passenger boarding</li>
            </ul>
          </li>
          <li>Trap Recovery Mechanism:
            <ul className="list-circle list-inside ml-6">
              <li> - Water must stay &lt;50% to auto-change from "trapped" to "stopped"</li>
              <li> - Still need manual start after recovery</li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">5. Scoring Rules</h2>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>On-time: +5 × passengers</li>
          <li>Delay: -5 × passengers</li>
          <li>Trapped on tunnel tracks: -50 × passengers</li>
          <li>Evacuation: -15 × passengers</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">6. Other Rules</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li className="mb-2">
            <strong>Collision Prevention:</strong>
            <span> Trains within 1 unit distance from the train ahead will auto-stop</span>
          </li>
          <li>
            <strong>Flood Propagation:</strong>
            <span> Affected by floodlevel difference and elevation</span>
          </li>
          <li>
            <strong>Pump Operation:</strong>
            <span> Pump is only available at stations and will be operated automatically when the water level is &gt;= 10%</span>
          </li>
          <li>
            <strong>Export log:</strong>
            <span> After the game ends, please export the log of the game by clicking the "Export Log" button</span>
          </li>
        </ol>
        {/* <blockquote className="ml-6 pl-4 border-l-4 border-gray-500 italic mt-4 text-gray-300">
          Tip: Prioritize high-load trains, evacuate high-risk areas promptly.
        </blockquote> */}
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