import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, error }) => {
  const [formatError, setFormatError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setFormatError(null);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      const formatted = JSON.stringify(parsed, null, 2);
      onChange(formatted);
      setFormatError(null);
    } catch (e: any) {
      setFormatError(`Invalid JSON: ${e.message}`);
      setTimeout(() => setFormatError(null), 3000);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(value);
      const minified = JSON.stringify(parsed);
      onChange(minified);
      setFormatError(null);
    } catch (e: any) {
      setFormatError(`Invalid JSON: ${e.message}`);
      setTimeout(() => setFormatError(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#333]">
      {/* Formatter Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#252525] border-b border-[#333]">
        <button
          onClick={handleFormat}
          title="Format JSON with proper indentation"
          className="flex items-center gap-1 text-gray-400 hover:text-blue-400 text-xs px-2 py-1 rounded hover:bg-[#333] transition-colors"
        >
          <Wand2 size={14} />
          Format
        </button>
        <button
          onClick={handleMinify}
          title="Minify JSON (remove whitespace)"
          className="flex items-center gap-1 text-gray-400 hover:text-orange-400 text-xs px-2 py-1 rounded hover:bg-[#333] transition-colors"
        >
          <Wand2 size={14} />
          Minify
        </button>
        {formatError && (
          <span className="text-red-400 text-xs ml-auto">{formatError}</span>
        )}
      </div>

      {/* Editor */}
      <div className="h-full relative group">
        <textarea
          value={value}
          onChange={handleChange}
          spellCheck={false}
          className="w-full h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
          placeholder="Paste your JSON here..."
        />
        {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-200 text-xs p-3 rounded border border-red-700 backdrop-blur-sm">
                ⚠️ {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
