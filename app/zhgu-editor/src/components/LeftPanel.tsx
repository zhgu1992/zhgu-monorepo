import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Square,
  Type,
  Layers,
  Search,
  MoreVertical,
  Trash2,
  Copy,
} from 'lucide-react';
import { useEditorStore, EditorInitState } from '../store';
import type { IBaseNode } from '@zhgu/editor';
import { EHistoryEvent } from '@zhgu/editor';
import { ESelectEventType, EHoverEventType } from '@zhgu/editor';

// 图层项组件
interface LayerItemProps {
  node: IBaseNode;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (node: IBaseNode, multi: boolean) => void;
  onToggleVisibility: (node: IBaseNode) => void;
  onToggleLock: (node: IBaseNode) => void;
  onRename: (node: IBaseNode, name: string) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  node,
  isSelected,
  isHovered,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name || 'Unnamed');

  // 获取editor实例来设置hover状态
  const { editor, initState } = useEditorStore();

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditName(node.name || 'Unnamed');
  };

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== node.name) {
      onRename(node, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditName(node.name || 'Unnamed');
      setIsEditing(false);
    }
  };

  // 鼠标进入时设置hover状态
  const handleMouseEnter = () => {
    if (editor && initState === EditorInitState.READY && editor.eventManager) {
      try {
        // 通过editor API设置hover节点
        editor.hoverNodeId = node.id;
        console.log('设置hover节点:', node.id);
      } catch (error) {
        console.warn('设置hover状态失败:', error);
      }
    }
  };

  // 鼠标离开时清除hover状态
  const handleMouseLeave = () => {
    if (editor && initState === EditorInitState.READY && editor.eventManager) {
      try {
        // 清除hover节点
        editor.hoverNodeId = '';
        console.log('清除hover节点');
      } catch (error) {
        console.warn('清除hover状态失败:', error);
      }
    }
  };

  const getLayerIcon = () => {
    // 根据node的type决定图标
    switch (node.type) {
      case 'Rectangle':
        return <Square size={14} />;
      case 'Text':
        return <Type size={14} />;
      default:
        return <Layers size={14} />;
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer ${
        isSelected
          ? 'bg-blue-50 border-r-2 border-blue-500'
          : isHovered
            ? 'bg-yellow-50 border-r-2 border-yellow-400'
            : ''
      }`}
      onClick={e => onSelect(node, e.metaKey || e.ctrlKey)}
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
    >
      {/* 图层图标 */}
      <div className="text-gray-400">{getLayerIcon()}</div>

      {/* 图层名称 */}
      <div className="flex-1 text-left  min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="w-full px-1 py-0.5 text-sm border border-blue-500 rounded focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="text-sm truncate block" onDoubleClick={handleDoubleClick}>
            {node.name || 'Unnamed'}
          </span>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-1">
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={e => {
            e.stopPropagation();
            onToggleVisibility(node);
          }}
          title={node.isVisible ? '隐藏' : '显示'}
        >
          {node.isVisible ? (
            <Eye size={12} className="text-gray-600" />
          ) : (
            <EyeOff size={12} className="text-gray-400" />
          )}
        </button>

        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={e => {
            e.stopPropagation();
            onToggleLock(node);
          }}
          title={node.props.isLocked ? '解锁' : '锁定'}
        >
          {node.props.isLocked ? (
            <Lock size={12} className="text-gray-600" />
          ) : (
            <Unlock size={12} className="text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

// 递归渲染图层树
const LayerTree: React.FC<{
  nodes: IBaseNode[];
  selectedNodes: IBaseNode[];
  hoveredNode: IBaseNode | null;
  onSelect: (node: IBaseNode, multi: boolean) => void;
  onToggleVisibility: (node: IBaseNode) => void;
  onToggleLock: (node: IBaseNode) => void;
  onRename: (node: IBaseNode, name: string) => void;
  level?: number;
}> = ({ nodes, selectedNodes, hoveredNode, onSelect, onToggleVisibility, onToggleLock, onRename, level = 0 }) => {
  return (
    <div>
      {nodes.map(node => {
        const isSelected = selectedNodes.some(selected => selected.id === node.id);
        const isHovered = hoveredNode?.id === node.id;

        return (
          <div key={node.id}>
            {/* 当前节点 */}
            <div style={{ paddingLeft: level * 16 }}>
              <LayerItem
                node={node}
                isSelected={isSelected}
                isHovered={isHovered}
                onSelect={onSelect}
                onToggleVisibility={onToggleVisibility}
                onToggleLock={onToggleLock}
                onRename={onRename}
              />
            </div>

            {/* 递归渲染子节点 */}
            {node.children && node.children.length > 0 && (
              <LayerTree
                nodes={node.children as IBaseNode[]}
                selectedNodes={selectedNodes}
                hoveredNode={hoveredNode}
                onSelect={onSelect}
                onToggleVisibility={onToggleVisibility}
                onToggleLock={onToggleLock}
                onRename={onRename}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// 左侧面板主组件
const LeftPanel: React.FC = () => {
  const { initState, getPages, getCurrentPage, getSelectedNodes, getHoveredNode, selectNodes, clearSelection } =
    useEditorStore();

  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLayerActions, setShowLayerActions] = useState(false);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const { editor } = useEditorStore.getState();

    if (!editor || initState !== EditorInitState.READY) {
      return;
    }

    const eventManager = editor.eventManager;
    if (!eventManager) {
      return;
    }

    const handleSelectionChange = () => {
      console.log('选中数据变更，刷新组件显示');
      forceUpdate({});
    };

    const handleHoverChange = () => {
      console.log('hover数据变更，刷新组件显示');
      forceUpdate({});
    };

    const handleUndoRedoChange = () => {
      console.log('undoredo数据变更，刷新组件显示');
      forceUpdate({});
    };

    eventManager.on(ESelectEventType.SelectChange, handleSelectionChange);
    eventManager.on(EHoverEventType.HoverChange, handleHoverChange);
    eventManager.on(EHistoryEvent.UndoRedo, handleUndoRedoChange);

    return () => {
      eventManager.off(ESelectEventType.SelectChange, handleSelectionChange);
      eventManager.off(EHoverEventType.HoverChange, handleHoverChange);
      eventManager.off(EHistoryEvent.UndoRedo, handleUndoRedoChange);
    };
  }, [initState]);

  const pages = getPages();
  const currentPage = getCurrentPage();
  const selectedNodes = getSelectedNodes();
  const hoveredNode = getHoveredNode();

  const isEditorReady = initState === EditorInitState.READY;

  const handleSelectNode = (node: IBaseNode, multi: boolean) => {
    if (multi) {
      const isSelected = selectedNodes.some(selected => selected.id === node.id);
      if (isSelected) {
        const newSelection = selectedNodes.filter(selected => selected.id !== node.id);
        selectNodes(newSelection);
      } else {
        selectNodes([...selectedNodes, node]);
      }
    } else {
      selectNodes([node]);
    }
  };

  const handleToggleVisibility = (node: IBaseNode) => {
    console.log('切换可见性:', node.id);
  };

  const handleToggleLock = (node: IBaseNode) => {
    console.log('切换锁定:', node.id);
  };

  const handleRename = (node: IBaseNode, name: string) => {
    console.log('重命名:', node.id, name);
  };

  const handleDeleteSelectedLayers = () => {
    selectedNodes.forEach(node => {
      console.log('删除节点:', node.id);
    });
    clearSelection();
  };

  const handleLayerAction = (action: string) => {
    console.log('图层操作:', action);
    setShowLayerActions(false);
  };

  const layers = currentPage?.children || [];
  const filteredLayers = layers.filter(layer =>
    ((layer as any).name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) as IBaseNode[];

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="border-b border-gray-100" style={{ minHeight: '200px' }}>
        <div
          className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100"
          onClick={() => setPagesExpanded(!pagesExpanded)}
        >
          <div className="flex items-center gap-2">
            {pagesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="text-sm font-medium">页面</span>
            <span className="text-xs text-gray-500">({pages.length})</span>
          </div>
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={e => {
              e.stopPropagation();
              console.log('添加页面 - 待实现');
            }}
            title="添加页面"
          >
            <Plus size={14} />
          </button>
        </div>

        {pagesExpanded && (
          <div className="max-h-32 overflow-y-auto">
            {isEditorReady ? (
              pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                    page.id === currentPage?.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => {
                    console.log('切换页面:', page.id);
                  }}
                >
                  {(page as any).name || `页面 ${index + 1}`}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div
          className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100"
          onClick={() => setLayersExpanded(!layersExpanded)}
        >
          <div className="flex items-center gap-2">
            {layersExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="text-sm font-medium">图层</span>
            <span className="text-xs text-gray-500">({layers.length})</span>
          </div>

          <div className="flex items-center gap-1">
            {selectedNodes.length > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">已选择 {selectedNodes.length}</span>
            )}

            <div className="relative">
              <button
                className="p-1 hover:bg-gray-200 rounded"
                onClick={e => {
                  e.stopPropagation();
                  setShowLayerActions(!showLayerActions);
                }}
                title="图层操作"
              >
                <MoreVertical size={14} />
              </button>

              {showLayerActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 w-32">
                  <div className="py-1">
                    <button
                      className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 rounded flex items-center gap-2"
                      onClick={() => handleLayerAction('duplicate-selected')}
                      disabled={selectedNodes.length === 0}
                    >
                      <Copy size={12} />
                      复制选中
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 rounded flex items-center gap-2 text-red-600"
                      onClick={handleDeleteSelectedLayers}
                      disabled={selectedNodes.length === 0}
                    >
                      <Trash2 size={12} />
                      删除选中
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {layersExpanded && (
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={isEditorReady ? '搜索图层...' : '加载中...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={!isEditorReady}
                className={`w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 ${!isEditorReady ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        )}

        {layersExpanded && (
          <div className="flex-1 overflow-auto">
            {isEditorReady ? (
              <LayerTree
                nodes={filteredLayers}
                selectedNodes={selectedNodes}
                hoveredNode={hoveredNode}
                onSelect={handleSelectNode}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
                onRename={handleRename}
              />
            ) : (
              <div className="p-3 space-y-2">
                <div className="animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-2 py-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-500">
          {isEditorReady ? (
            <>
              共 {layers.length} 个图层
              {selectedNodes.length > 0 && ` • 已选择 ${selectedNodes.length} 个`}
            </>
          ) : (
            '图层数据加载中...'
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
