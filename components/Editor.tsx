import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, error }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#333]">
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
