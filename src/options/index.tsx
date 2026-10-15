import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

const Options = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get(['geminiApiKey'], (result) => {
      if (result.geminiApiKey) setApiKey(String(result.geminiApiKey));
    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <span className="text-yellow-400">✨</span> FormEasy Settings
      </h1>
      <div className="space-y-6">
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">AI API Key</h2>
          <p className="text-sm text-gray-500 mb-4">
            FormEasy requires a Google Gemini API Key to understand new, complex forms dynamically. You can get one for free from Google AI Studio.
          </p>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Gemini API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
            <button 
              onClick={saveSettings}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              {saved ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Guidance Preferences</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300 text-primary" defaultChecked />
              <span>Show examples</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300 text-primary" defaultChecked />
              <span>Show tips</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-gray-300 text-primary" defaultChecked />
              <span>Show warnings</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
