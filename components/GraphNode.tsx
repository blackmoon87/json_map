import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { JsonNodeData } from '../types';
import { 
  Braces, 
  Brackets, 
  Type, 
  Hash, 
  ToggleLeft, 
  CircleOff,
  Eye,
  X
} from 'lucide-react';

// Icon helper
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'string': return <Type size={12} className="text-green-400" />;
    case 'number': return <Hash size={12} className="text-orange-400" />;
    case 'boolean': return <ToggleLeft size={12} className="text-blue-400" />;
    case 'null': return <CircleOff size={12} className="text-gray-400" />;
    case 'object': return <Braces size={12} className="text-purple-400" />;
    case 'array': return <Brackets size={12} className="text-yellow-400" />;
    default: return <Braces size={12} className="text-gray-400" />;
  }
};

// Text color helper for VALUES
const getValueColor = (type: string) => {
  switch (type) {
    case 'string': return 'text-green-400';
    case 'number': return 'text-orange-400';
    case 'boolean': return 'text-blue-400';
    case 'null': return 'text-gray-500'; // Slightly darker for null
    default: return 'text-gray-400';
  }
};

// Text color helper for KEYS
const getKeyColor = (child: { type: string, isLink: boolean }) => {
  if (child.isLink) {
    // Match the color of the child node (Object = Purple, Array = Yellow)
    return child.type === 'array' ? 'text-yellow-400' : 'text-purple-400';
  }
  // Standard distinct color for primitive keys
  return 'text-cyan-400';
};

const GraphNode = ({ data, isConnectable }: NodeProps<JsonNodeData>) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-[#1e1e1e] border border-[#444] rounded-md shadow-xl min-w-[280px] overflow-hidden transition-all duration-200">
        {/* Header */}
        <div className="bg-[#2d2d2d] px-3 py-2 border-b border-[#444] flex items-center justify-between h-[40px]">
          <div className="flex items-center gap-2">
            {data.type === 'array' ? (
              <Brackets size={14} className="text-yellow-500" />
            ) : (
              <Braces size={14} className="text-purple-500" />
            )}
            <span className={`font-bold text-sm truncate max-w-[180px] ${data.type === 'array' ? 'text-yellow-500' : 'text-purple-500'}`} title={data.label}>
              {data.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="p-1 hover:bg-[#3d3d3d] rounded transition-colors text-gray-400 hover:text-gray-200"
              title="View full content"
            >
              <Eye size={14} />
            </button>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
              {data.type}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="py-2">
          {data.children.map((child, index) => (
            <div 
              key={child.id} 
              className="group relative flex items-center justify-between px-3 py-1 hover:bg-[#2a2a2a] transition-colors h-[28px]"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {/* Type Icon */}
                <span className="text-gray-400 font-mono text-xs opacity-70">
                  {getTypeIcon(child.type)}
                </span>
                
                {/* Key Name */}
                <span className={`${getKeyColor(child)} text-xs font-mono truncate max-w-[100px]`} title={child.key}>
                  {child.key}
                </span>
                
                {/* Separator */}
                <span className="text-gray-500 text-xs">:</span>
              </div>
              
              <div className="flex items-center">
                 {!child.isLink ? (
                   <span 
                    className={`text-xs font-mono truncate max-w-[120px] ${getValueColor(child.type)}`}
                    title={child.value}
                   >
                     {child.type === 'string' ? `"${child.value}"` : child.value}
                   </span>
                 ) : (
                   <span className="text-xs text-gray-600 italic"></span>
                 )}
              </div>

              {/* Handle for outgoing connections if it is a link */}
              {child.isLink && (
                 <Handle
                   type="source"
                   position={Position.Right}
                   id={child.id}
                   isConnectable={isConnectable}
                   className="!bg-[#5b5b5b] !w-2 !h-2 !border-none !right-[-5px]"
                 />
              )}
            </div>
          ))}
          
          {data.children.length === 0 && (
             <div className="px-3 py-1 text-gray-500 text-xs italic text-center">Empty</div>
          )}
        </div>

        {/* Input Handle for incoming connections */}
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="!bg-[#5b5b5b] !w-2 !h-2 !border-none !left-[-5px] top-[20px]"
        />
      </div>

      {/* Full Content Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] border border-[#444] rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#2d2d2d] px-4 py-3 border-b border-[#444] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {data.type === 'array' ? (
                  <Brackets size={16} className="text-yellow-500" />
                ) : (
                  <Braces size={16} className="text-purple-500" />
                )}
                <span className={`font-bold text-sm ${data.type === 'array' ? 'text-yellow-500' : 'text-purple-500'}`}>
                  {data.label}
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#3d3d3d] rounded transition-colors text-gray-400 hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto flex-1 py-3">
              {data.children.map((child) => (
                <div
                  key={child.id}
                  className="px-4 py-2 border-b border-[#333] hover:bg-[#252525] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400 font-mono text-sm opacity-70 flex-shrink-0">
                      {getTypeIcon(child.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${getKeyColor(child)} text-sm font-mono font-semibold`}>
                          {child.key}
                        </span>
                        <span className="text-gray-500 text-sm">:</span>
                      </div>
                      {!child.isLink ? (
                        <span className={`text-sm font-mono break-words ${getValueColor(child.type)}`}>
                          {child.type === 'string' ? `"${child.value}"` : child.value}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600 italic">[Linked object/array]</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {data.children.length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-sm italic text-center">No content</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(GraphNode);