import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { JsonNodeData } from '../types';
import { 
  Braces, 
  Brackets, 
  Type, 
  Hash, 
  ToggleLeft, 
  CircleOff,
  GripVertical
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
  const [width, setWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  // Handle resize drag
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.max(280, Math.min(700, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div 
      ref={containerRef}
      className="bg-[#1e1e1e] border border-[#444] rounded-md shadow-xl overflow-hidden transition-all duration-200 flex flex-col"
      style={{ width: `${width}px`, minWidth: '280px', maxWidth: '700px' }}
    >
      {/* Header */}
      <div className="bg-[#2d2d2d] px-3 py-2 border-b border-[#444] flex items-center justify-between h-[40px] flex-shrink-0">
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
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
          {data.type}
        </span>
      </div>

      {/* Body - Scrollable */}
      <div className="py-2 overflow-y-auto max-h-[400px] flex-1">
        {data.children.map((child, index) => (
          <div 
            key={child.id} 
            className="group relative flex items-center justify-between px-3 py-1 hover:bg-[#2a2a2a] transition-colors h-[28px] flex-shrink-0"
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

      {/* Resize Handle */}
      <div 
        onMouseDown={handleResizeStart}
        className={`h-1.5 cursor-col-resize border-t border-[#444] flex-shrink-0 transition-all flex items-center justify-center ${
          isResizing ? 'bg-[#666]' : 'bg-[#333] hover:bg-[#555]'
        }`} 
        title="Drag to resize width"
      >
        <GripVertical size={12} className="text-gray-500 opacity-50" />
      </div>

      {/* Input Handle for incoming connections */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!bg-[#5b5b5b] !w-2 !h-2 !border-none !left-[-5px] top-[20px]"
      />
    </div>
  );
};

export default memo(GraphNode);