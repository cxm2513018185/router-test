// 定义路由的模式
const RouterModel = Object.freeze({
  HASH: 'hash',
  HISTORY: 'history',
});

class HistoryRoute {
  constructor() {
    this.current = null;
  }
}

class VueRouter {
  constructor(options) {
    this.mode = options.mode || RouterModel.HASH;
    this.routes = options.routes || [];

    // 当前路由
    this.historyRoute = new HistoryRoute();
    // 路由表
    this.routeMap = this.createRouteMap(this.routes);

    // 对页面模式进行监听
    this.init();
  }
  init() {
    switch(this.mode) {
      case RouterModel.HISTORY: 
        window.addEventListener('load', () => {
          this.historyRoute.current = location.pathname;
        })
        window.addEventListener('popstate', () => {
          this.historyRoute.current = location.pathname;
        })
        return;
      case RouterModel.HASH:
      default: 
        if (!location.hash) {
          location.hash = '/';
        }
        window.addEventListener('load', () => {
          this.historyRoute.current = location.hash.slice(1);
        })
        window.addEventListener('hashchange', () => {
          this.historyRoute.current = location.hash.slice(1);
        })
    }
  }
  // 创建路由表
  createRouteMap(routes) {
    return routes.reduce((obj, currentRoute) => {
      obj[currentRoute.path] = currentRoute.component;
      return obj;
    }, {})
  }
}

VueRouter.install = function (Vue, options) {
  Vue.mixin({
    beforeCreate() {
      if (this.$options && this.$options.router) {  // Root
        this._root = this;
        this._router = this.$options.router;
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {  // Children
        this._root = this.$parent._root;
      }
      Vue.util.defineReactive(this, '', this._root._router.historyRoute);
      // $router
      Object.defineProperty(this, '$router', {
        get() {
          return this._root._router;
        }
      })
      // $route
      Object.defineProperty(this, '$route', {
        get() {
          return this._root._router.history.current;
        }
      })
    }
  })
  // <router-link>
  Vue.component('RouterLink', {
    props: {
      to: {
        type: String,
      }
    },
    render() {
      let { mode } = this._self._root._router;
      return <a href={ mode === RouterModel.HASH ? `#${this.to}` : this.to }>{this.$slots.default}</a>
    }
  })
  // <router-view>
  Vue.component('RouterView', {
    render(h) {
      let { historyRoute, routeMap } = this._self._root._router;
      let { current } = historyRoute;
      if (current) {
        let currentComponent = routeMap[current];
        // 渲染组件
        return h(currentComponent);
      }
    }
  })
}

export default VueRouter;