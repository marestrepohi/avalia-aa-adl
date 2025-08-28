import React from 'react';
import { MessageSquare, Play, GitBranch, Code, Zap, LogOut } from 'lucide-react';

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTypes = [
    { type: 'input', label: 'Inicio', icon: <Play className="w-5 h-5" /> },
    { type: 'default', label: 'Mensaje', icon: <MessageSquare className="w-5 h-5" /> },
    { type: 'default', label: 'Condición', icon: <GitBranch className="w-5 h-5" /> },
    { type: 'default', label: 'API', icon: <Code className="w-5 h-5" /> },
    { type: 'default', label: 'Acción', icon: <Zap className="w-5 h-5" /> },
    { type: 'output', label: 'Fin', icon: <LogOut className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white p-4 border-r border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Nodos</h3>
      <div className="space-y-2">
        {nodeTypes.map((node) => (
          <div
            key={node.type + node.label}
            className="p-3 border border-gray-300 rounded-lg flex items-center gap-3 cursor-grab hover:bg-gray-100 transition-colors"
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            {node.icon}
            <span className="font-medium">{node.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
