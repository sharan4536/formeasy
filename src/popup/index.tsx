
import { createRoot } from 'react-dom/client';
import '../index.css';

const Popup = () => {
  return (
    <div className="w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold flex items-center gap-1 text-gray-900">
          <span className="text-yellow-400">✨</span> FormEasy
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Guide Mode</span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-success"></div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-4">Your form companion</p>
      
      <div className="border-t border-gray-100 pt-3 mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Fields detected:</span>
          <span className="font-medium">14</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fields explained:</span>
          <span className="font-medium text-primary">6</span>
        </div>
      </div>

      <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 text-sm font-medium rounded-md transition-colors border border-gray-200 mb-2">
        Scan Form
      </button>

      <button onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') })} className="w-full py-2 bg-primary hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors border border-blue-700 mb-3">
        Open Dashboard
      </button>

      <div className="flex justify-between text-xs text-muted pt-2 border-t border-gray-100">
        <a href="#" onClick={() => chrome.runtime.openOptionsPage()} className="hover:text-gray-900">Settings</a>
        <a href="#" className="hover:text-gray-900">Privacy</a>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
