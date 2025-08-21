/**
 * 浏览器兼容性补丁
 * 为不支持某些现代API的浏览器提供兼容性支持
 */

// ES6 Promise 支持
if (typeof Promise === 'undefined') {
  // 简单的 Promise polyfill
  window.Promise = function(executor) {
    var self = this;
    self.state = 'pending';
    self.value = undefined;
    self.handlers = [];

    function resolve(result) {
      if (self.state === 'pending') {
        self.state = 'fulfilled';
        self.value = result;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function reject(error) {
      if (self.state === 'pending') {
        self.state = 'rejected';
        self.value = error;
        self.handlers.forEach(handle);
        self.handlers = null;
      }
    }

    function handle(handler) {
      if (self.state === 'pending') {
        self.handlers.push(handler);
      } else {
        if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
          handler.onFulfilled(self.value);
        }
        if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
          handler.onRejected(self.value);
        }
      }
    }

    this.then = function(onFulfilled, onRejected) {
      return new Promise(function(resolve, reject) {
        handle({
          onFulfilled: function(result) {
            try {
              resolve(onFulfilled ? onFulfilled(result) : result);
            } catch (ex) {
              reject(ex);
            }
          },
          onRejected: function(error) {
            try {
              resolve(onRejected ? onRejected(error) : error);
            } catch (ex) {
              reject(ex);
            }
          }
        });
      });
    };

    this.catch = function(onRejected) {
      return this.then(null, onRejected);
    };

    executor(resolve, reject);
  };

  Promise.resolve = function(value) {
    return new Promise(function(resolve) {
      resolve(value);
    });
  };

  Promise.reject = function(reason) {
    return new Promise(function(resolve, reject) {
      reject(reason);
    });
  };

  Promise.all = function(promises) {
    return new Promise(function(resolve, reject) {
      var results = [];
      var completed = 0;
      
      if (promises.length === 0) {
        resolve(results);
        return;
      }
      
      promises.forEach(function(promise, index) {
        Promise.resolve(promise).then(function(value) {
          results[index] = value;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        }).catch(reject);
      });
    });
  };
}

// fetch API 支持
if (typeof fetch === 'undefined') {
  window.fetch = function(url, options) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      var method = (options && options.method) || 'GET';
      var headers = (options && options.headers) || {};
      var body = (options && options.body) || null;

      xhr.open(method, url, true);

      // 设置请求头
      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }

      xhr.onload = function() {
        var response = {
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          text: function() {
            return Promise.resolve(xhr.responseText);
          },
          json: function() {
            return Promise.resolve(JSON.parse(xhr.responseText));
          }
        };
        resolve(response);
      };

      xhr.onerror = function() {
        reject(new Error('Network Error'));
      };

      xhr.ontimeout = function() {
        reject(new Error('Request Timeout'));
      };

      xhr.send(body);
    });
  };
}

// Array.from 支持
if (!Array.from) {
  Array.from = function(object) {
    return [].slice.call(object);
  };
}

// Array.includes 支持
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    return this.indexOf(searchElement) !== -1;
  };
}

// Object.assign 支持
if (!Object.assign) {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];
      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// String.startsWith 支持
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

// String.endsWith 支持
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, length) {
    if (length === undefined || length > this.length) {
      length = this.length;
    }
    return this.substring(length - searchString.length, length) === searchString;
  };
}

// String.includes 支持
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// CustomEvent 支持
if (typeof CustomEvent !== 'function') {
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
}

// addEventListener 的 passive 选项支持检测
var supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener('test', null, opts);
} catch (e) {}

// requestAnimationFrame 支持
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function(callback) {
    return setTimeout(callback, 1000 / 60);
  };
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function(id) {
    clearTimeout(id);
  };
}

// performance.now 支持
if (!window.performance || !window.performance.now) {
  window.performance = window.performance || {};
  window.performance.now = function() {
    return Date.now();
  };
}

// classList 支持 (IE9+)
if (!('classList' in document.createElement('_'))) {
  (function(view) {
    if (!('Element' in view)) return;
    
    var classListProp = 'classList',
        protoProp = 'prototype',
        elemCtrProto = view.Element[protoProp],
        objCtr = Object,
        strTrim = String[protoProp].trim || function() {
          return this.replace(/^\s+|\s+$/g, '');
        },
        arrIndexOf = Array[protoProp].indexOf || function(item) {
          var i = 0, len = this.length;
          for (; i < len; i++) {
            if (i in this && this[i] === item) {
              return i;
            }
          }
          return -1;
        };

    var DOMTokenList = function(el) {
      this.el = el;
      var classes = el.className.replace(/^\s+|\s+$/g, '').split(/\s+/);
      for (var i = 0, len = classes.length; i < len; i++) {
        this.push(classes[i]);
      }
      this._updateClassName = function() {
        el.className = this.toString();
      };
    };

    var classListProto = DOMTokenList[protoProp] = [];

    classListProto.item = function(i) {
      return this[i] || null;
    };

    classListProto.contains = function(token) {
      token += '';
      return arrIndexOf.call(this, token) !== -1;
    };

    classListProto.add = function() {
      var tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false;
      do {
        token = tokens[i] + '';
        if (arrIndexOf.call(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };

    classListProto.remove = function() {
      var tokens = arguments,
          i = 0,
          l = tokens.length,
          token,
          updated = false,
          index;
      do {
        token = tokens[i] + '';
        index = arrIndexOf.call(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = arrIndexOf.call(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };

    classListProto.toggle = function(token, force) {
      token += '';

      var result = this.contains(token),
          method = result ?
            force !== true && 'remove' :
            force !== false && 'add';

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };

    classListProto.toString = function() {
      return this.join(' ');
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
        get: function() {
          return new DOMTokenList(this);
        },
        enumerable: true,
        configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) {
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    }

  }(window));
}

// TextDecoder/TextEncoder 支持 (用于 NFC 数据解析)
if (typeof TextDecoder === 'undefined') {
  window.TextDecoder = function(encoding) {
    this.encoding = encoding || 'utf-8';
  };
  
  TextDecoder.prototype.decode = function(input) {
    var str = '';
    var bytes = new Uint8Array(input);
    
    for (var i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    
    try {
      return decodeURIComponent(escape(str));
    } catch (e) {
      return str;
    }
  };
}

if (typeof TextEncoder === 'undefined') {
  window.TextEncoder = function() {};
  
  TextEncoder.prototype.encode = function(input) {
    var str = unescape(encodeURIComponent(input));
    var bytes = new Uint8Array(str.length);
    
    for (var i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    
    return bytes;
  };
}

// Web Audio API 兼容性
if (typeof AudioContext === 'undefined' && typeof webkitAudioContext !== 'undefined') {
  window.AudioContext = window.webkitAudioContext;
}

// 移动端触摸事件兼容性
if (!window.TouchEvent && window.PointerEvent) {
  // 使用 Pointer Events 模拟 Touch Events
  var touchEventMap = {
    pointerdown: 'touchstart',
    pointermove: 'touchmove',
    pointerup: 'touchend',
    pointercancel: 'touchcancel'
  };
  
  Object.keys(touchEventMap).forEach(function(pointerEvent) {
    document.addEventListener(pointerEvent, function(e) {
      var touchEvent = new CustomEvent(touchEventMap[pointerEvent], {
        bubbles: true,
        cancelable: true
      });
      
      touchEvent.touches = e.isPrimary ? [e] : [];
      touchEvent.targetTouches = e.isPrimary ? [e] : [];
      touchEvent.changedTouches = [e];
      
      e.target.dispatchEvent(touchEvent);
    });
  });
}

// 控制台日志兼容性
if (typeof console === 'undefined') {
  window.console = {
    log: function() {},
    error: function() {},
    warn: function() {},
    info: function() {},
    debug: function() {},
    table: function() {},
    group: function() {},
    groupEnd: function() {},
    time: function() {},
    timeEnd: function() {}
  };
}

// 为老版本浏览器添加 matches 方法
if (!Element.prototype.matches) {
  Element.prototype.matches = 
    Element.prototype.matchesSelector || 
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector || 
    Element.prototype.oMatchesSelector || 
    Element.prototype.webkitMatchesSelector ||
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s);
      var i = matches.length;
      while (--i >= 0 && matches.item(i) !== this) {}
      return i > -1;            
    };
}

// 为老版本浏览器添加 closest 方法
if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

console.log('浏览器兼容性补丁已加载');