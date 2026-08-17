import React, { useState } from 'react';
import { 
  Eye, 
  Volume2, 
  Type, 
  Keyboard, 
  Contrast, 
  Check, 
  X, 
  VolumeX, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { AccessibilitySettings } from '../types';

interface AccessibilityToolbarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (settings: Partial<AccessibilitySettings>) => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen) return null;

  const handleReadScreen = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }

      const textToSpeak = `Welcome to the Stanford University Blockchain E-Voting System. 
      You are on the ballot portal. Use the Tab key to navigate between candidate selections and referendums. 
      All ballots are cryptographically verified with your biometric signature and 2-factor authentication before being sealed into the decentralized blockchain ledger.`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        id="accessibility-modal-dialog"
        role="dialog"
        aria-labelledby="accessibility-title"
        aria-modal="true"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 text-slate-900 dark:text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 id="accessibility-title" className="text-base font-bold">
                Voter Accessibility & Usability (WCAG 2.1 AA)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your voting viewing preferences and assistive features
              </p>
            </div>
          </div>
          <button
            id="close-accessibility-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close accessibility modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          {/* Contrast Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Contrast className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-sm font-semibold">High Contrast Mode</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Increases contrast for sharper edge recognition
                </div>
              </div>
            </div>
            <button
              id="toggle-high-contrast-btn"
              onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.highContrast ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
              }`}
              aria-pressed={settings.highContrast}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Dyslexia-Friendly Font */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-sm font-semibold">Dyslexia-Friendly Typography</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Applies weighted baseline lettering for easier scanning
                </div>
              </div>
            </div>
            <button
              id="toggle-dyslexia-font-btn"
              onClick={() => onUpdateSettings({ dyslexiaFont: !settings.dyslexiaFont })}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.dyslexiaFont ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
              }`}
              aria-pressed={settings.dyslexiaFont}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
            </button>
          </div>

          {/* Font Size Scaler */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-sm font-semibold mb-2">Display Text Sizing</div>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  id={`font-size-${size}-btn`}
                  onClick={() => onUpdateSettings({ fontSize: size })}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center capitalize transition-all cursor-pointer ${
                    settings.fontSize === size
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {size === 'normal' ? 'Standard (100%)' : size === 'large' ? 'Large (120%)' : 'XL (140%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Screen Reader Assist */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              <div>
                <div className="text-sm font-semibold">Audio Ballot Companion</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Read out instructions and candidate manifestos via voice
                </div>
              </div>
            </div>
            <button
              id="audio-screen-reader-btn"
              onClick={handleReadScreen}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-rose-600 text-white hover:bg-rose-700' 
                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  Stop Voice
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Read Page
                </>
              )}
            </button>
          </div>

          {/* Keyboard Navigation Shortcuts */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs">
            <div className="font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 mb-1.5">
              <Keyboard className="w-4 h-4" />
              Keyboard Navigation Shortcuts
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Tab</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Shift+Tab</kbd> : Cycle between candidate cards and ballot choices</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Space</kbd> : Select or toggle candidate or referendum</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono">Enter</kbd> : Confirm selection and proceed to biometric sign</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            id="apply-accessibility-btn"
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Apply Accessibility Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
