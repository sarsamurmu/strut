import { AnyComp, EventManager, debug, warn, isClassComp, buildChild, log } from './utils';
import { updateChildren, patch } from './render';
import { Context } from './context';
import { VNode } from 'snabbdom/es/vnode';

export const FLAG_STATELESS = 1;

export abstract class Component {
  protected context: Context;
  protected vNodes: VNode[];
  protected mounted = false;
  protected shouldSetVNode = true;
  private readonly _flags: number;
  // Mounted VNode count
  private _mVNC = 0;

  constructor(flags = 0) {
    this._flags = flags;
  }

  rebuild(callback?: () => void) {
    if (!this.mounted) {
      if (debug) warn('"rebuild" method called before the component is mounted');
      return
    }
    if (callback) callback();
    this.shouldSetVNode = false;
    const newChildren = this.render();
    const oldChildren = this.vNodes;
    if (newChildren.length === 1 && oldChildren.length === 1) {
      patch(oldChildren[0], newChildren[0]);
    } else {
      updateChildren({
        parentElm: oldChildren[0].elm.parentElement,
        oldCh: oldChildren,
        newCh: newChildren,
        insertBefore: oldChildren[oldChildren.length - 1].elm.nextSibling,
      });
    }
    this.vNodes = newChildren;
    this.shouldSetVNode = true;
  }

  /* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

  didMount() {}

  didUpdate() {}

  didDestroy() {}

  static create(props: Record<string, any>): Component {
    return null
  }

  /* eslint-enable */

  onContext(context: Context) {
    this.context = context;
  }

  abstract build(context: Context): AnyComp;

  render(): VNode[] {
    let vNodes;
    if (debug) {
      if (typeof this.build === 'function') {
        const builtComp = this.build(this.context);
        if (!isClassComp(builtComp) && !(typeof builtComp === 'function')) {
          warn('Component\'s "build" method should return a Component, Functional Component, Fragment or VNode, but it returned', builtComp);
        }
        vNodes = buildChild(this.context, builtComp);
      } else if (!this.build) {
        warn('The "build" method is not defined for the component');
      }
    } else {
      vNodes = buildChild(this.context, this.build(this.context));
    }
    if (this._flags & FLAG_STATELESS) return vNodes;

    const onMount = () => {
      if (this.mounted) return;
      this.mounted = true;
      this.didMount();
    }
    const onDestroy = () => {
      if (!this.mounted) return;
      this.mounted = false;
      this.didDestroy();
    }

    if (vNodes.length === 1) {
      const eventManager = vNodes[0].data.eventManager as EventManager;
      eventManager.add('mount', onMount, this);
      eventManager.add('update', this.didUpdate, this);
      eventManager.add('destroy', () => {
        onDestroy();
        eventManager.removeKey(this);
      }, this);
    } else {
      vNodes.forEach((vNode) => {
        const eventManager = vNode.data.eventManager as EventManager;
        eventManager.add('mount', () => {
          if (++this._mVNC === this.vNodes.length) onMount();
        }, this);
        eventManager.add('destroy', () => {
          if (--this._mVNC === 0) {
            onDestroy();
            eventManager.removeKey(this);
          }
        }, this);
      });
    }

    if (this.shouldSetVNode) this.vNodes = vNodes;
    return vNodes;
  }
}

type voidFun = () => void;
type buildFunT = (context: Context) => AnyComp;
type rebuildFunT = (callback: () => void) => void;

interface MakeComponentOptions {
  didMount(fun: voidFun): void;
  didUpdate(fun: voidFun): void;
  didDestroy(fun: voidFun): void;
  build(buildFunction: buildFunT): void;
  rebuild(callback: () => void): void;
}

export const makeComp = (compFunc: (methods: MakeComponentOptions) => void): () => Component => () => {
  let rebuildFun: rebuildFunT;
  let didMountFun: voidFun;
  let didUpdateFun: voidFun;
  let didDestroyFun: voidFun;
  let buildFun: buildFunT;

  class FuncComp extends Component {
    constructor() {
      super();
      rebuildFun = this.rebuild.bind(this);
    }

    didMount() {
      if (didMountFun) didMountFun();
    }

    didUpdate() {
      if (didUpdateFun) didUpdateFun();
    }

    didDestroy() {
      if (didDestroyFun) didDestroyFun();
    }

    build(context: Context) {
      return buildFun(context);
    }
  }

  compFunc({
    rebuild: (callback) => rebuildFun(callback),
    didMount: (fun) => didMountFun = fun,
    didUpdate: (fun) => didUpdateFun = fun,
    didDestroy: (fun) => didDestroyFun = fun,
    build: (fun) => buildFun = fun,
  });

  return new FuncComp();
}
