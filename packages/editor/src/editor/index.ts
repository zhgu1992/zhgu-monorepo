import { View } from '../view';
import { EModeName, EEditorStateName } from '../const';
import type { IInputSnapshot } from '../interface';
import { appendCssToDom } from '../utils/css';
import { EElementChangeType, EOtherElementType } from '@zhgu/type';
import type { Transaction, EElementType, IElementPropsWithoutType, RGBAColor } from '@zhgu/type';
import { Mode, StateFactory } from '../mode';
import style from '../assets/css/cursor.css?raw';
import { SelectHelper } from './SelectHelper.ts';
/**
 * 编辑器核心类，暴露给用户使用
 */
export class Editor extends View {
  selectHelper = new SelectHelper();
  constructor() {
    super();
  }

  initEditorMode() {
    // 鼠标样式
    this.registerCursor();
    // 快捷键
    this.registerShortCut();
    // 注册并默认进入浏览模式
    this.registerMode();
  }

  set hoverNodeId(elementId: string) {
    const node = this.scene.getNodeById(elementId) ?? null;
    this.eventManager!.hover.setHoverNode(node, false);
  }

  createNode(type: EElementType, props: IElementPropsWithoutType) {
    const element = this.documentExchange.createElement(type, {});
    const elementId = element.id;
    this.applyTransaction([
      {
        type: EElementChangeType.Add,
        id: elementId,
        data: element,
      },
    ]);
    const node = this.scene.getNodeById(elementId);
    this.commitHistory();
    return node;
  }

  createEmptyPage() {
    return this.createNode(EOtherElementType.Page, {});
  }

  deletePage(id: string) {
    // todo
  }

  switchPage(id: string) {
    // todo
  }

  addLayer() {
    // todo
  }

  deleteLayer(id: string) {
    // todo
  }

  switchLayer(id: string) {
    // todo
  }

  registerMode() {
    const modeManager = this.modeManager!;
    // 创建编辑器模式
    const mode = new Mode(this, EModeName.Editor);
    // 注册编辑器模式
    modeManager!.registerMode(mode);
    StateFactory.init(this, mode);
    // 进入编辑器模式
    this.modeManager?.changeMode(EModeName.Editor);
  }

  getCurrentState() {
    const modeManager = this.modeManager!;
    const mode = modeManager.getMode(EModeName.Editor)!;
    return mode.getCurrentState();
  }

  getEditorState(id: string) {
    const modeManager = this.modeManager!;
    const mode = modeManager.getMode(EModeName.Editor)!;
    return mode.getState(id);
  }

  changeEditorState(id: string) {
    const modeManager = this.modeManager!;
    const mode = modeManager.getMode(EModeName.Editor)!;
    mode.changeState(id);
  }

  goToDefaultState(id: string) {
    const modeManager = this.modeManager!;
    const mode = modeManager.getMode(EModeName.Editor)!;
    mode.changeState(EEditorStateName.Default);
  }

  registerCursor() {
    appendCssToDom(style);
  }

  setBackgroundColor(color: RGBAColor) {
    const currentPage = this.scene.currentPage;
    return currentPage.setBackgroundColor(color);
  }

  /**
   * todo先简单支持一下快捷键，后续需要修改
   */
  registerShortCut() {
    const config = [
      {
        key: 'f',
        func: () => {
          this.changeEditorState(EEditorStateName.CreateFrame);
        },
      },
      {
        key: 'r',
        func: () => {
          this.changeEditorState(EEditorStateName.CreateRectTangle);
        },
      },
      {
        key: 'Backspace',
        func: () => {
          const transactions: Transaction = [];
          const selectedNodes = this.eventManager!.selectedNodes;
          selectedNodes.forEach(node => {
            node.traverse(node => {
              transactions.push({
                id: node.id,
                type: EElementChangeType.Delete,
              });
              node.destroy();
            });
          });
          this.applyTransaction(transactions);
          this.eventManager!.selectedNodes = [];
          this.commitHistory();
          this.processUpdate();
        },
      },
      {
        key: 'cmd+a',
        func: () => {
          this.eventManager!.selectedNodes = this.scene.getNodes();
        },
      },
      {
        key: 'cmd+y',
        func: () => {
          this.redoHistory();
        },
      },
      {
        key: 'cmd+z',
        func: () => {
          this.undoHistory();
        },
      },
    ];

    const cmdConfig: Record<string, string> = {
      shift: 'shiftKey',
      cmd: 'cmdKey',
    };

    this.eventManager!.on('keydown', (e: IInputSnapshot) => {
      const code = e.key;
      for (let i = 0; i < config.length; i++) {
        const key = config[i].key;
        const arr = key.split('+');
        let flag = true;
        for (let j = 0; j < arr.length; j++) {
          const cur = arr[j];
          if (cmdConfig[cur]) {
            //@ts-ignore
            if (!e[cmdConfig[cur]]) {
              flag = false;
              break;
            }
          } else {
            if (code !== cur) {
              flag = false;
              break;
            }
          }
        }
        if (flag) {
          config[i].func();
          break;
        }
      }
    });
  }
}
