import React from 'react';
import type { IMetaData, IBaseNode } from '@zhgu/editor';

interface BaseAttributePanelProps {
  selectedNodes: IBaseNode[];
  metaData?: IMetaData;
  sectionKey?: keyof IMetaData;
  onLayoutChange: (property: string, value: number | string) => void;
}

const BaseAttributePanel: React.FC<BaseAttributePanelProps> = ({
  selectedNodes,
  metaData,
  sectionKey,
  onLayoutChange,
}) => {
  // 渲染属性输入组件
  const PropertyInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: number | string) => void;
    type?: 'text' | 'number' | 'color';
    metaKey: keyof IMetaData;
  }> = ({ label, value, onChange, type = 'text', metaKey }) => {
    const config = metaData?.[metaKey];
    if (!config?.isVisible) return null;

    return (
      <div className="flex flex-col space-y-1">
        <label className="text-xs text-gray-600">{label}</label>
        <input
          type={type}
          value={value}
          onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
          disabled={!config.enabled}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500 font-mono tabular-nums"
        />
      </div>
    );
  };

  // 如果当前section被禁用，不渲染任何内容
  if (metaData?.[sectionKey!]?.enabled === false) {
    return null;
  }

  if (selectedNodes.length === 0) {
    return <div className="text-xs text-gray-500 text-center py-4">选择图层以编辑属性</div>;
  }

  return (
    <div className="space-y-4">
      {selectedNodes.map(node => (
        <div key={node.id} className="space-y-3">
          {selectedNodes.length > 1 && (
            <div className="text-xs font-medium text-gray-600 pb-2 border-b border-gray-100">{node.name}</div>
          )}

          {/* 位置 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 text-left">位置</div>
            <div className="grid grid-cols-2 gap-3">
              <PropertyInput
                label="X"
                value={node.x || 0}
                onChange={value => onLayoutChange(`${node.id}.x`, value)}
                type="number"
                metaKey="x"
              />
              <PropertyInput
                label="Y"
                value={node.y || 0}
                onChange={value => onLayoutChange(`${node.id}.y`, value)}
                type="number"
                metaKey="y"
              />
            </div>
          </div>

          {/* 尺寸 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 text-left">尺寸</div>
            <div className="grid grid-cols-2 gap-3">
              <PropertyInput
                label="宽度"
                value={node.w || 0}
                onChange={value => onLayoutChange(`${node.id}.width`, value)}
                type="number"
                metaKey="w"
              />
              <PropertyInput
                label="高度"
                value={node.h || 0}
                onChange={value => onLayoutChange(`${node.id}.height`, value)}
                type="number"
                metaKey="h"
              />
            </div>
          </div>

          {/* 其他属性 */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <PropertyInput
                label="旋转"
                value={0}
                onChange={value => onLayoutChange(`${node.id}.rotation`, value)}
                type="number"
                metaKey="rotation"
              />
              <PropertyInput
                label="透明度"
                value={100}
                onChange={value => onLayoutChange(`${node.id}.opacity`, value)}
                type="number"
                metaKey="aspectRatio"
              />
            </div>
          </div>

          {/* 圆角 */}
          {node.type === 'rectangle' && metaData?.cornerRadius?.isVisible && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <PropertyInput
                  label="圆角"
                  value={0}
                  onChange={value => onLayoutChange(`${node.id}.borderRadius`, value)}
                  type="number"
                  metaKey="cornerRadius"
                />
                <div></div> {/* 占位，保持网格布局 */}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BaseAttributePanel;
