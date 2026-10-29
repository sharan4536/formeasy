import React from 'react';
import { UserPreferences } from '../../utils/types';
import { Sparkles, Save, Check } from 'lucide-react';

interface PreferencesTabProps {
  preferences: UserPreferences;
  onPreferenceChange: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  onSave: () => void;
  saved: boolean;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  preferences,
  onPreferenceChange,
  onSave,
  saved
}) => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Autofill Rules & Behaviors</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how FormEasy operates when you navigate online forms.
            </p>
          </div>
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved' : 'Save Preferences'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Auto-Record Preference */}
          <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <div>
              <div className="font-semibold text-sm text-slate-900">
                Auto-Capture New Form Entries
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Automatically saves newly typed fields from forms to your vault for future autofills.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoRecordNewData !== false}
                onChange={e => onPreferenceChange('autoRecordNewData', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Notify On Auto-Record */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-sm text-slate-900">
                Show Notification on Auto-Save
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Display a brief notification toast when new details are saved from a web form.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifyOnAutoRecord !== false}
                onChange={e => onPreferenceChange('notifyOnAutoRecord', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Auto-fill on Focus */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-sm text-slate-900">Autofill on Field Focus</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Automatically populate matching saved data as soon as you focus an empty input.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoFillOnFocus}
                onChange={e => onPreferenceChange('autoFillOnFocus', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Floating Assistant Widget */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-sm text-slate-900">Floating Assistant Button</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Show the 1-click "Auto-Fill Form" button in the bottom corner of web pages with forms.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showFloatingWidget}
                onChange={e => onPreferenceChange('showFloatingWidget', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          {/* Auto-fill on Page Load */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="font-semibold text-sm text-slate-900">Autofill on Page Load</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Automatically fills recognizable form fields as soon as the page finishes loading.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoFillPageOnLoad}
                onChange={e => onPreferenceChange('autoFillPageOnLoad', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>

        {/* Gemini AI Settings */}
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-base text-slate-900">Google Gemini AI Engine</h4>
          </div>
          <p className="text-xs text-slate-500">
            FormEasy uses built-in contextual explanations by default. Optionally enter a Google Gemini API
            key for generative explanations on rare or domain-specific form fields.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={preferences.geminiApiKey || ''}
              onChange={e => onPreferenceChange('geminiApiKey', e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
