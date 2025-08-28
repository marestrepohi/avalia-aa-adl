import React from 'react';
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProps,
} from 'reactflow';
import 'reactflow/dist/style.css';

type FlujoEditorProps = Omit<ReactFlowProps, 'onDrop' | 'onDragOver'> & {
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
};

const FlujoEditor: React.FC<FlujoEditorProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  ...rest
}) => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      fitView
      {...rest}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};

export default FlujoEditor;
