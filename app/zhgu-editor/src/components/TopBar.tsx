import React from 'react';
import { Menu, ChevronDown, User, Undo2, Redo2, Share2, Minus, Plus, RotateCcw } from 'lucide-react';
import { EditorInitState, useEditorStore } from '../store';

const TopBar: React.FC = () => {
  const { canvasZoom, setCanvasZoom, initState, editor } = useEditorStore();

  const isEditorReady = editor && initState === EditorInitState.READY;

  const handleFileAction = (action: string) => {
    console.log('文件操作:', action);
  };

  const handleViewAction = (action: string) => {
    console.log('视图操作:', action);
    if (action === 'zoom-in') {
      setCanvasZoom(Math.min(canvasZoom * 1.2, 5));
    } else if (action === 'zoom-out') {
      setCanvasZoom(Math.max(canvasZoom / 1.2, 0.1));
    } else if (action === 'zoom-reset') {
      setCanvasZoom(1);
    }
  };

  const handleEditAction = (action: string) => {
    console.log('编辑操作:', action);
    if (!isEditorReady) return;

    if (action === 'undo') {
      editor!.undoHistory();
    } else if (action === 'redo') {
      editor!.redoHistory();
    }
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 relative z-10">
      {/* 左侧：菜单和文件信息 */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          onClick={() => handleFileAction('menu')}
          title="菜单"
        >
          <Menu size={16} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">个人文件</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>

        <div className="text-sm font-medium text-gray-900">无标题</div>

        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">未保存</div>
      </div>

      {/* 中间：编辑操作 */}
      <div className="flex items-center gap-2">
        {/* 撤销重做 */}
        <div className="flex items-center gap-1">
          <button
            className={`p-2 rounded transition-colors ${isEditorReady ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => handleEditAction('undo')}
            disabled={!isEditorReady}
            title={isEditorReady ? '撤销 (Ctrl+Z)' : '编辑器加载中...'}
          >
            <Undo2 size={14} />
          </button>
          <button
            className={`p-2 rounded transition-colors ${isEditorReady ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => handleEditAction('redo')}
            disabled={!isEditorReady}
            title={isEditorReady ? '重做 (Ctrl+Y)' : '编辑器加载中...'}
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* 缩放控制 */}
        <div className={`flex items-center gap-1 bg-gray-50 rounded-lg p-1 ${!isEditorReady ? 'opacity-50' : ''}`}>
          <button
            className={`p-1 rounded transition-colors ${isEditorReady ? 'hover:bg-white' : 'cursor-not-allowed'}`}
            onClick={() => handleViewAction('zoom-out')}
            disabled={!isEditorReady}
            title={isEditorReady ? '缩小' : '编辑器加载中...'}
          >
            <Minus size={14} />
          </button>

          <button
            className={`px-3 py-1 text-sm rounded transition-colors min-w-[50px] text-center ${isEditorReady ? 'hover:bg-white' : 'cursor-not-allowed'}`}
            onClick={() => handleViewAction('zoom-reset')}
            disabled={!isEditorReady}
            title={isEditorReady ? '重置缩放' : '编辑器加载中...'}
          >
            {Math.round((canvasZoom || 1) * 100)}%
          </button>

          <button
            className={`p-1 rounded transition-colors ${isEditorReady ? 'hover:bg-white' : 'cursor-not-allowed'}`}
            onClick={() => handleViewAction('zoom-in')}
            disabled={!isEditorReady}
            title={isEditorReady ? '放大' : '编辑器加载中...'}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* 重置视图 */}
        <button
          className={`p-2 rounded transition-colors ${isEditorReady ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
          onClick={() => handleViewAction('reset-view')}
          disabled={!isEditorReady}
          title={isEditorReady ? '重置视图' : '编辑器加载中...'}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* 右侧：协作和用户 */}
      <div className="flex items-center gap-4">
        {/* 分享按钮 */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
          onClick={() => handleFileAction('share')}
        >
          <Share2 size={14} />
          <span>分享</span>
        </button>

        {/* 用户头像 */}
        <button
          className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-medium hover:bg-orange-500 transition-colors"
          onClick={() => handleFileAction('profile')}
          title="用户设置"
        >
          <User size={16} />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
