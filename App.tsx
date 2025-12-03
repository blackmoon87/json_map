import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  NodeTypes,
  Panel,
  ReactFlowProvider,
  Node
} from 'reactflow';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import GraphNode from './components/GraphNode';
import { getLayoutedElements } from './services/layoutService';
import { generateJsonWithGemini } from './services/geminiService';
import { apiKeyManager } from './services/apiKeyManager';
import { INITIAL_JSON } from './constants';

// Define custom node types outside component to prevent re-creation
const nodeTypes: NodeTypes = {
  custom: GraphNode,
};

const Flow = () => {
    const [jsonInput, setJsonInput] = useState(INITIAL_JSON);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // ReactFlow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Check for shared JSON in URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedJson = params.get('json');
        if (sharedJson) {
            try {
                // Decode: URL Decode -> Base64 Decode -> URI Decode (to handle UTF-8 correctly)
                const decoded = decodeURIComponent(escape(atob(sharedJson)));
                setJsonInput(decoded);
            } catch (e) {
                console.error("Failed to parse shared JSON from URL", e);
                // Fallback to default if share is invalid
            }
        }
    }, []);

    // Debounced Layout Update
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            try {
                // Validate JSON first
                JSON.parse(jsonInput);
                setJsonError(null);
                
                // Calculate Layout
                const layout = getLayoutedElements(jsonInput, layoutDirection);
                setNodes(layout.nodes);
                setEdges(layout.edges);
            } catch (e: any) {
                setJsonError(e.message);
                // We do not clear nodes/edges on error, keeping the last valid state visible is better UX
            }
        }, 500); // 500ms delay for performance

        return () => clearTimeout(timeoutId);
    }, [jsonInput, layoutDirection, setNodes, setEdges]);

    const handleClear = () => {
        setJsonInput('{}');
        // Clear URL param when clearing editor
        window.history.pushState({}, '', window.location.pathname);
    };

    const handleExport = () => {
        try {
            const blob = new Blob([jsonInput], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'json-crack-clone.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed", e);
            alert("Failed to export JSON.");
        }
    };

    const handleShare = () => {
        try {
            // Encode: URI Encode (UTF-8) -> Base64 Encode -> URL Encode
            // Using unescape(encodeURIComponent(str)) is a common trick to handle UTF-8 string for btoa
            const encoded = btoa(unescape(encodeURIComponent(jsonInput)));
            const newUrl = `${window.location.pathname}?json=${encoded}`;
            window.history.pushState({}, '', newUrl);
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        } catch (e) {
            console.error("Share failed", e);
            alert("Failed to generate share link (JSON might be too large).");
        }
    };

    const handleAiGenerate = async (prompt: string) => {
        // Check if API key exists
        if (!apiKeyManager.hasApiKey()) {
            alert('⚠️ No API Key Found!\n\nPlease configure your Google Gemini API key first.\n\nClick "OK" to open Settings.');
            setShowSettingsModal(true);
            return;
        }

        setIsAiGenerating(true);
        try {
            const newJson = await generateJsonWithGemini(prompt);
            setJsonInput(newJson);
        } catch (e) {
            console.error(e);
            alert('Failed to generate JSON. Check your API Key or try again.');
        } finally {
            setIsAiGenerating(false);
        }
    };

    // Search handler - highlights matching nodes
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            // Reset all nodes to default style
            setNodes((nds) =>
                nds.map((node) => ({
                    ...node,
                    style: { ...node.style, opacity: 1, border: 'none', boxShadow: 'none' }
                }))
            );
            return;
        }

        const lowerQuery = query.toLowerCase();
        
        // Find matching nodes
        setNodes((nds) =>
            nds.map((node) => {
                const nodeData = node.data as any;
                
                // Check if label matches
                const labelMatch = nodeData.label?.toLowerCase().includes(lowerQuery);
                
                // Check if any child key or value matches
                const childrenMatch = nodeData.children?.some((child: any) =>
                    child.key?.toLowerCase().includes(lowerQuery) ||
                    String(child.value)?.toLowerCase().includes(lowerQuery)
                );
                
                const isMatch = labelMatch || childrenMatch;

                return {
                    ...node,
                    style: {
                        border: isMatch ? '2px solid #22c55e' : 'none',
                        opacity: isMatch ? 1 : 0.2,
                        boxShadow: isMatch ? '0 0 15px rgba(34, 197, 94, 0.6)' : 'none',
                        backgroundColor: isMatch ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
                    } as any
                };
            })
        );
    };

    // Highlight connections on drag start
    const onNodeDragStart = useCallback((_: React.MouseEvent, node: Node) => {
        setEdges((eds) =>
            eds.map((edge) => {
                const isConnected = edge.source === node.id || edge.target === node.id;
                
                if (isConnected) {
                    return {
                        ...edge,
                        style: { 
                            ...edge.style, 
                            stroke: '#a855f7', // Purple highlight
                            strokeWidth: 3,
                            opacity: 1 
                        }, 
                        zIndex: 1000, 
                        animated: true,
                    };
                }
                
                // Dim other edges
                return {
                    ...edge,
                    style: { 
                        ...edge.style, 
                        opacity: 0.2,
                        stroke: '#5b5b5b',
                        strokeWidth: 2
                    },
                    zIndex: 0
                };
            })
        );
    }, [setEdges]);

    // Reset styles on drag stop
    const onNodeDragStop = useCallback(() => {
        setEdges((eds) =>
            eds.map((edge) => ({
                ...edge,
                style: { 
                    stroke: '#5b5b5b', 
                    strokeWidth: 2, 
                    opacity: 1 
                },
                zIndex: 0,
                animated: true
            }))
        );
    }, [setEdges]);

    return (
        <div className="flex flex-col h-full w-full">
            <Toolbar 
                onClear={handleClear} 
                onLayoutChange={setLayoutDirection}
                onImport={() => {}}
                onExport={handleExport}
                onShare={handleShare}
                onAiGenerate={handleAiGenerate}
                onSearch={handleSearch}
                isGenerating={isAiGenerating}
                showSettingsModal={showSettingsModal}
                setShowSettingsModal={setShowSettingsModal}
            />
            
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Editor */}
                <div className="w-[350px] md:w-[450px] shrink-0 h-full shadow-2xl z-10">
                    <Editor 
                        value={jsonInput} 
                        onChange={setJsonInput} 
                        error={jsonError}
                    />
                </div>

                {/* Right Panel: Graph */}
                <div className="flex-1 h-full bg-[#111] relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeDragStart={onNodeDragStart}
                        onNodeDragStop={onNodeDragStop}
                        nodeTypes={nodeTypes}
                        fitView
                        minZoom={0.1}
                        maxZoom={2}
                        defaultEdgeOptions={{
                            type: 'smoothstep',
                            animated: true,
                            style: { stroke: '#5b5b5b', strokeWidth: 2 },
                        }}
                    >
                        <Background color="#222" gap={20} size={1} />
                        <Controls className="bg-[#1e1e1e] border border-[#444] text-gray-200 fill-gray-200" />
                        <Panel position="bottom-right" className="bg-[#1e1e1e]/80 p-2 rounded text-xs text-gray-400 backdrop-blur-sm border border-[#333]">
                            {nodes.length} Nodes • {edges.length} Connections
                        </Panel>
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}