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
    <aside
      className="relative bg-white md:w-64 w-full md:h-full md:border-r border-b border-gray-200 md:p-4 p-3"
    >
      <h3 className="md:text-lg text-base font-semibold md:mb-4 mb-2">Nodos</h3>
      {/* Mobile: horizontal scroll row; Desktop: vertical list */}
      <div
        className="flex md:block gap-2 md:gap-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0"
        role="list"
      >
        {nodeTypes.map((node) => (
          <div
            key={node.type + node.label}
            className="shrink-0 md:shrink md:w-full min-w-[140px] md:min-w-0 md:mb-2 md:last:mb-0 md:p-3 p-2 border border-gray-300 rounded-md md:rounded-lg flex items-center gap-2 md:gap-3 cursor-grab hover:bg-gray-50 transition-colors"
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            {node.icon}
            <span className="font-medium text-sm md:text-base">{node.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
