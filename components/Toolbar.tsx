import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Maximize2, 
  Share2, 
  Sparkles,
  Layout,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyStart,
  FileJson,
  Settings,
  Key,
  Copy,
  Trash,
  Search,
  X
} from 'lucide-react';
import { generateJsonWithGemini } from '../services/geminiService';
import { apiKeyManager } from '../services/apiKeyManager';

interface ToolbarProps {
  onClear: () => void;
  onLayoutChange: (direction: 'LR' | 'TB') => void;
  onImport: () => void; // Placeholder for file import
  onExport: () => void;
  onShare: () => void;
  onAiGenerate: (text: string) => void;
  isGenerating: boolean;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onClear, 
  onLayoutChange, 
  isGenerating, 
  onAiGenerate,
  onExport,
  onShare,
  showSettingsModal,
  setShowSettingsModal
}) => {
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load saved API key on mount
  useEffect(() => {
    const savedKey = apiKeyManager.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      setApiKeySaved(true);
    }
  }, []);

  const handleAiSubmit = () => {
    if (!prompt.trim()) return;
    onAiGenerate(prompt);
    setShowAiModal(false);
    setPrompt('');
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      alert('Please enter an API key');
      return;
    }
    
    if (apiKeyManager.saveApiKey(apiKeyInput)) {
      setApiKey(apiKeyInput);
      setApiKeySaved(true);
      setApiKeyInput('');
      alert('API Key saved successfully!');
    } else {
      alert('Failed to save API key. Check browser console for details.');
    }
  };

  const handleRemoveApiKey = () => {
    if (confirm('Are you sure you want to remove the saved API key?')) {
      if (apiKeyManager.removeApiKey()) {
        setApiKey('');
        setApiKeySaved(false);
        alert('API key removed');
      }
    }
  };

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="h-14 bg-[#2d2d2d] border-b border-[#444] flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-lg select-none">
          <FileJson size={24} />
          <span>JSON <span className="text-gray-100">VISUALIZER</span></span>
        </div>
        
        <div className="h-6 w-px bg-[#444] mx-2"></div>

        <button 
          onClick={() => setShowAiModal(true)}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md transition-colors font-medium shadow-sm"
        >
          <Sparkles size={14} />
          {isGenerating ? 'Dreaming...' : 'AI Generate'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-[#1e1e1e] p-1 rounded-md flex gap-1 border border-[#444]">
            <button onClick={() => onLayoutChange('LR')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white" title="Horizontal Layout">
                <AlignHorizontalJustifyStart size={16} />
            </button>
            <button onClick={() => onLayoutChange('TB')} className="p-1.5 hover:bg-[#333] rounded text-gray-400 hover:text-white" title="Vertical Layout">
                <AlignVerticalJustifyStart size={16} />
            </button>
        </div>
        
        <div className="h-6 w-px bg-[#444] mx-2"></div>

        <button 
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-xs px-3 py-1.5 rounded-md hover:bg-[#333] transition-colors"
          title="Search in JSON Map"
        >
          <Search size={14} />
          Search
        </button>

        <button 
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 text-xs px-3 py-1.5 rounded-md hover:bg-[#333] transition-colors"
          title="API Settings"
        >
          <Settings size={14} />
          Settings
        </button>

        <button onClick={onShare} className="flex items-center gap-2 text-gray-400 hover:text-blue-400 text-xs px-3 py-1.5 rounded-md hover:bg-[#333] transition-colors" title="Copy Link to Clipboard">
          <Share2 size={14} />
          Share
        </button>

        <button onClick={onExport} className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-xs px-3 py-1.5 rounded-md hover:bg-[#333] transition-colors">
          <Download size={14} />
          Export
        </button>

        <button onClick={onClear} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-xs px-3 py-1.5 rounded-md hover:bg-[#333] transition-colors">
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#2d2d2d] border border-[#555] rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                    <Sparkles className="text-purple-400" size={20} />
                    Generate or Fix JSON
                </h3>
                <p className="text-gray-400 text-sm mb-4">Describe the data structure you want to generate, or paste broken JSON to fix.</p>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] rounded p-3 text-gray-200 text-sm min-h-[100px] mb-4 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. Generate a list of 5 RPG characters with stats and inventory..."
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setShowAiModal(false)}
                        className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAiSubmit}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
                    >
                        Generate
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#2d2d2d] border border-[#555] rounded-lg shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Settings className="text-yellow-400" size={20} />
                    API Settings
                </h3>

                {/* API Key Status */}
                <div className="mb-6 p-3 bg-[#1e1e1e] rounded border border-[#444]">
                  <p className="text-gray-400 text-xs mb-2">Current Status:</p>
                  {apiKeySaved ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-green-400 text-sm font-medium">API Key Configured</p>
                      </div>
                      <p className="text-gray-500 text-xs">{apiKeyManager.getMaskedApiKey()}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-yellow-400 text-sm font-medium">No API Key Set</p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="mb-6 p-3 bg-[#1a1a1a] rounded text-xs text-gray-400">
                  <p className="font-semibold text-gray-300 mb-2">How to get your API Key:</p>
                  <ol className="space-y-1 ml-3 list-decimal">
                    <li>Visit <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">aistudio.google.com/api-keys</a></li>
                    <li>Create or copy your API key</li>
                    <li>Paste it below and save</li>
                    <li>Your key is stored locally in browser cache</li>
                  </ol>
                </div>

                {/* API Key Input */}
                <div className="mb-4">
                  <label className="text-gray-400 text-xs block mb-2">Google Gemini API Key:</label>
                  <input 
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#444] rounded p-2 text-gray-200 text-sm focus:border-yellow-500 focus:outline-none font-mono text-xs"
                    placeholder="Paste your API key here..."
                  />
                  <p className="text-gray-500 text-xs mt-1">🔒 Your key is stored securely in browser local storage</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={handleSaveApiKey}
                    className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Key size={14} />
                    Save API Key
                  </button>
                  {apiKeySaved && (
                    <button 
                      onClick={handleRemoveApiKey}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium flex items-center gap-2"
                      title="Remove saved API key"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full px-4 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded text-sm"
                >
                  Close
                </button>
            </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#2d2d2d] border border-[#555] rounded-lg shadow-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Search className="text-green-400" size={20} />
                    Search in Graph
                  </h3>
                  <button 
                    onClick={() => setShowSearchModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-gray-400 text-sm mb-4">Search by key name or value to find and highlight nodes in the graph visualization.</p>
                
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#444] rounded p-2 text-gray-200 text-sm focus:border-green-500 focus:outline-none mb-4"
                  placeholder="Search keys, values, or node names..."
                  autoFocus
                />

                <div className="bg-[#1a1a1a] rounded p-3 text-xs text-gray-400 mb-4">
                  <p className="font-semibold text-gray-300 mb-2">Search Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-500">
                    <li>Search for key names (e.g., "name", "email")</li>
                    <li>Search for values (e.g., "john", "123")</li>
                    <li>Search is case-insensitive</li>
                    <li>Matching nodes will be highlighted</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowSearchModal(false)}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Toolbar;