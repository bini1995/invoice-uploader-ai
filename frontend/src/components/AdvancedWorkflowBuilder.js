import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  LightningBoltIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const WORKFLOW_NODES = {
  trigger: {
    type: 'trigger',
    label: 'Trigger',
    icon: LightningBoltIcon,
    color: 'bg-blue-500',
    description: 'Start workflow on event'
  },
  condition: {
    type: 'condition',
    label: 'Condition',
    icon: CogIcon,
    color: 'bg-yellow-500',
    description: 'Check if condition is met'
  },
  action: {
    type: 'action',
    label: 'Action',
    icon: CheckCircleIcon,
    color: 'bg-green-500',
    description: 'Perform an action'
  },
  approval: {
    type: 'approval',
    label: 'Approval',
    icon: UserIcon,
    color: 'bg-purple-500',
    description: 'Require human approval'
  },
  fraud_check: {
    type: 'fraud_check',
    label: 'Fraud Check',
    icon: ShieldCheckIcon,
    color: 'bg-red-500',
    description: 'AI fraud detection'
  },
  notification: {
    type: 'notification',
    label: 'Notification',
    icon: EyeIcon,
    color: 'bg-indigo-500',
    description: 'Send notification'
  },
  integration: {
    type: 'integration',
    label: 'Integration',
    icon: ChartBarIcon,
    color: 'bg-orange-500',
    description: 'External system integration'
  }
};

export default function AdvancedWorkflowBuilder() {
  const [workflow, setWorkflow] = useState({
    id: null,
    name: '',
    description: '',
    nodes: [],
    connections: [],
    isActive: false,
    version: 1
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // AI-powered workflow suggestions
  const generateAISuggestions = async () => {
    setIsAIAnalyzing(true);
    try {
      const response = await fetch('/api/superior/workflows/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentWorkflow: workflow,
          tenantId: 'default'
        })
      });

      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions(suggestions.data);
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // Add node to workflow
  const addNode = useCallback((nodeType, position) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: WORKFLOW_NODES[nodeType].label,
        description: WORKFLOW_NODES[nodeType].description,
        config: getDefaultConfig(nodeType)
      }
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  // Get default configuration for node type
  const getDefaultConfig = (nodeType) => {
    switch (nodeType) {
      case 'trigger':
        return {
          event: 'claim_submitted',
          conditions: []
        };
      case 'condition':
        return {
          operator: 'AND',
          rules: []
        };
      case 'action':
        return {
          action: 'assign_claim',
          parameters: {}
        };
      case 'approval':
        return {
          approvers: [],
          timeout: 24,
          escalation: true
        };
      case 'fraud_check':
        return {
          threshold: 0.7,
          autoBlock: true,
          notifyOnHigh: true
        };
      case 'notification':
        return {
          type: 'email',
          recipients: [],
          template: 'default'
        };
      case 'integration':
        return {
          system: 'crm',
          action: 'create_contact',
          mapping: {}
        };
      default:
        return {};
    }
  };

  // Handle node drag start
  const handleNodeDragStart = (e, nodeType) => {
    setDraggedNode(nodeType);
  };

  // Handle canvas drop
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (draggedNode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      addNode(draggedNode, position);
      setDraggedNode(null);
    }
  };

  // Handle canvas drag over
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  // Connect nodes
  const connectNodes = (sourceId, targetId) => {
    const newConnection = {
      id: `conn_${Date.now()}`,
      source: sourceId,
      target: targetId
    };

    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  };

  // Save workflow
  const saveWorkflow = async () => {
    try {
      const response = await fetch('/api/superior/workflows', {
        method: workflow.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(workflow)
      });

      if (response.ok) {
        const savedWorkflow = await response.json();
        setWorkflow(prev => ({
          ...prev,
          id: savedWorkflow.data.id
        }));
        alert('Workflow saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    }
  };

  // Deploy workflow
  const deployWorkflow = async () => {
    try {
      const response = await fetch(`/api/superior/workflows/${workflow.id}/deploy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setWorkflow(prev => ({
          ...prev,
          isActive: true
        }));
        alert('Workflow deployed successfully!');
      }
    } catch (error) {
      console.error('Failed to deploy workflow:', error);
      alert('Failed to deploy workflow');
    }
  };

  // Workflow Node Component
  const WorkflowNode = ({ node, isSelected }) => {
    const nodeConfig = WORKFLOW_NODES[node.type];
    const Icon = nodeConfig.icon;

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: node.position.x,
          top: node.position.y
        }}
        onClick={() => setSelectedNode(node)}
      >
        <div className={`${nodeConfig.color} text-white rounded-lg p-3 shadow-lg min-w-[120px]`}>
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{nodeConfig.label}</span>
          </div>
          <p className="text-xs opacity-90 mt-1">{nodeConfig.description}</p>
        </div>
      </motion.div>
    );
  };

  // Connection Line Component
  const ConnectionLine = ({ connection }) => {
    const sourceNode = workflow.nodes.find(n => n.id === connection.source);
    const targetNode = workflow.nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) return null;

    const startX = sourceNode.position.x + 60;
    const startY = sourceNode.position.y + 30;
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 30;

    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#3B82F6"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
          </marker>
        </defs>
      </svg>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Workflow Builder
            </h1>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Workflow Name"
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm"
              />
              <button
                onClick={saveWorkflow}
                className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={deployWorkflow}
                disabled={!workflow.id || workflow.isActive}
                className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {workflow.isActive ? 'Active' : 'Deploy'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1 rounded text-sm ${
                previewMode 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={generateAISuggestions}
              disabled={isAIAnalyzing}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {isAIAnalyzing ? 'Analyzing...' : 'AI Suggestions'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar - Node Palette */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Workflow Nodes
          </h3>
          
          <div className="space-y-2">
            {Object.entries(WORKFLOW_NODES).map(([key, node]) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleNodeDragStart(e, key)}
                className={`${node.color} text-white p-3 rounded-lg cursor-move hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center space-x-2">
                  <node.icon className="w-5 h-5" />
                  <span className="font-medium">{node.label}</span>
                </div>
                <p className="text-xs opacity-90 mt-1">{node.description}</p>
              </div>
            ))}
          </div>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                AI Suggestions
              </h4>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {suggestion.description}
                    </p>
                    <button
                      onClick={() => {
                        // Apply AI suggestion
                        setWorkflow(prev => ({
                          ...prev,
                          nodes: [...prev.nodes, ...suggestion.nodes],
                          connections: [...prev.connections, ...suggestion.connections]
                        }));
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      Apply Suggestion
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            className="w-full h-full relative bg-gray-100 dark:bg-gray-900"
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
          >
            {/* Connection Lines */}
            {workflow.connections.map(connection => (
              <ConnectionLine key={connection.id} connection={connection} />
            ))}

            {/* Workflow Nodes */}
            <AnimatePresence>
              {workflow.nodes.map(node => (
                <WorkflowNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                />
              ))}
            </AnimatePresence>

            {/* Drop Zone Indicator */}
            {draggedNode && (
              <div className="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-20 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Right Sidebar - Node Configuration */}
        {selectedNode && (
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Node Configuration
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <NodeConfiguration
              node={selectedNode}
              onUpdate={(updatedNode) => {
                setWorkflow(prev => ({
                  ...prev,
                  nodes: prev.nodes.map(n => 
                    n.id === updatedNode.id ? updatedNode : n
                  )
                }));
                setSelectedNode(updatedNode);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Node Configuration Component
const NodeConfiguration = ({ node, onUpdate }) => {
  const [config, setConfig] = useState(node.data.config);

  const updateConfig = (newConfig) => {
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        config: newConfig
      }
    };
    setConfig(newConfig);
    onUpdate(updatedNode);
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                value={config.event}
                onChange={(e) => updateConfig({ ...config, event: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              >
                <option value="claim_submitted">Claim Submitted</option>
                <option value="document_uploaded">Document Uploaded</option>
                <option value="fraud_detected">Fraud Detected</option>
                <option value="approval_required">Approval Required</option>
              </select>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Operator</label>
              <select
                value={config.operator}
                onChange={(e) => updateConfig({ ...config, operator: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              >
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rules</label>
              <button className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-left">
                Add Rule
              </button>
            </div>
          </div>
        );

      case 'action':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <select
                value={config.action}
                onChange={(e) => updateConfig({ ...config, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              >
                <option value="assign_claim">Assign Claim</option>
                <option value="send_notification">Send Notification</option>
                <option value="update_status">Update Status</option>
                <option value="create_task">Create Task</option>
              </select>
            </div>
          </div>
        );

      case 'approval':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Approvers</label>
              <input
                type="text"
                placeholder="Enter email addresses"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timeout (hours)</label>
              <input
                type="number"
                value={config.timeout}
                onChange={(e) => updateConfig({ ...config, timeout: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.escalation}
                onChange={(e) => updateConfig({ ...config, escalation: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm">Enable Escalation</label>
            </div>
          </div>
        );

      case 'fraud_check':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Threshold</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.threshold}
                onChange={(e) => updateConfig({ ...config, threshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{config.threshold}</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.autoBlock}
                onChange={(e) => updateConfig({ ...config, autoBlock: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm">Auto-block High Risk</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.notifyOnHigh}
                onChange={(e) => updateConfig({ ...config, notifyOnHigh: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm">Notify on High Risk</label>
            </div>
          </div>
        );

      default:
        return <div>Configuration not available for this node type.</div>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Node Label</label>
        <input
          type="text"
          value={node.data.label}
          onChange={(e) => {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                label: e.target.value
              }
            };
            onUpdate(updatedNode);
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={node.data.description}
          onChange={(e) => {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                description: e.target.value
              }
            };
            onUpdate(updatedNode);
          }}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Configuration</label>
        {renderConfigFields()}
      </div>
    </div>
  );
}; 