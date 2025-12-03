import React, { useState } from 'react';
import { 
  Download, 
  Trash2, 
  Maximize2, 
  Share2, 
  Sparkles,
  Layout,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyStart,
  FileJson
} from 'lucide-react';
import { generateJsonWithGemini } from '../services/geminiService';

interface ToolbarProps {
  onClear: () => void;
  onLayoutChange: (direction: 'LR' | 'TB') => void;
  onImport: () => void; // Placeholder for file import
  onExport: () => void;
  onShare: () => void;
  onAiGenerate: (text: string) => void;
  isGenerating: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onClear, 
  onLayoutChange, 
  isGenerating, 
  onAiGenerate,
  onExport,
  onShare
}) => {
  const [showAiModal, setShowAiModal] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleAiSubmit = () => {
    if (!prompt.trim()) return;
    onAiGenerate(prompt);
    setShowAiModal(false);
    setPrompt('');
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
    </div>
  );
};

export default Toolbar;