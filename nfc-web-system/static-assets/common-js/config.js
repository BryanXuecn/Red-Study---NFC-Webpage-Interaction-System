/**
 * 全局配置文件
 */

window.AppConfig = {
  // 应用信息
  app: {
    name: '红色研学NFC交互系统',
    version: '1.0.0',
    build: '20240821',
    author: '红色研学开发团队'
  },

  // API 配置
  api: {
    baseUrl: '/api',
    timeout: 10000,
    retryTimes: 3
  },

  // NFC 配置
  nfc: {
    scanTimeout: 30000,
    retryInterval: 1000,
    supportedTypes: ['text', 'url', 'absolute-url'],
    hallTags: {
      manifesto: {
        id: 'xuanyan',
        name: '宣言馆',
        keywords: ['manifesto', '宣言馆', 'xuanyan']
      },
      anthem: {
        id: 'guoge',
        name: '国歌馆',
        keywords: ['anthem', '国歌馆', 'guoge']
      },
      riverside: {
        id: 'binjiang',
        name: '滨江馆',
        keywords: ['riverside', '滨江馆', 'binjiang']
      }
    }
  },

  // 音频配置
  audio: {
    preloadEnabled: true,
    formats: ['mp3', 'ogg', 'wav'],
    volume: {
      default: 0.8,
      min: 0,
      max: 1
    },
    fadeInDuration: 500,
    fadeOutDuration: 300
  },

  // 动画配置
  animation: {
    defaultDuration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    loadingDelay: 2000,
    coverAnimationDelay: 3000
  },

  // 本地存储配置
  storage: {
    prefix: 'redStudy_',
    expiry: 24 * 60 * 60 * 1000, // 24小时
    keys: {
      userProgress: 'userProgress',
      audioSettings: 'audioSettings',
      visitHistory: 'visitHistory',
      preferences: 'preferences'
    }
  },

  // 错误处理配置
  error: {
    showToast: true,
    logToConsole: true,
    reportToServer: false,
    retryAttempts: 3,
    messages: {
      nfc: {
        notSupported: '您的设备不支持NFC功能，请使用备用方案',
        permissionDenied: '需要NFC权限才能使用此功能',
        readFailed: 'NFC读取失败，请重试',
        invalidTag: '请使用正确的印章标签'
      },
      audio: {
        loadFailed: '音频加载失败，请检查网络连接',
        playFailed: '音频播放失败，请检查设备设置',
        notSupported: '您的设备不支持此音频格式'
      },
      network: {
        offline: '网络连接已断开',
        timeout: '请求超时，请重试',
        serverError: '服务器错误，请稍后重试'
      }
    }
  },

  // 用户体验配置
  ux: {
    toastDuration: 3000,
    loadingMinDuration: 1500,
    hapticFeedback: true,
    autoPlay: false,
    debugMode: false
  },

  // 响应式断点
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  },

  // 主题配置
  theme: {
    colors: {
      primary: '#c41e3a',
      secondary: '#d4af37',
      success: '#16a34a',
      warning: '#f59e0b',
      error: '#dc2626',
      info: '#2563eb'
    },
    fonts: {
      chinese: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", STHeiti, "华文黑体", sans-serif',
      english: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }
  },

  // 性能监控配置
  performance: {
    enabled: true,
    sampleRate: 0.1,
    metrics: ['FCP', 'LCP', 'FID', 'CLS'],
    reportThreshold: {
      loadTime: 3000,
      renderTime: 1000
    }
  },

  // 辅助功能配置
  accessibility: {
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableHighContrast: false,
    focusVisible: true,
    announcements: true
  },

  // 开发模式配置
  development: {
    enableConsoleLog: true,
    enablePerformanceLog: false,
    mockNFC: false,
    skipAnimations: false,
    showDebugInfo: false
  }
};

// 设备检测
window.DeviceInfo = {
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: /Android/.test(navigator.userAgent),
  isTablet: /iPad|Android(?!.*Mobile)|Tablet/.test(navigator.userAgent),
  hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  hasNFC: 'NDEFReader' in window,
  hasWebAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
  pixelRatio: window.devicePixelRatio || 1,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  isOnline: navigator.onLine
};

// 浏览器功能检测
window.FeatureSupport = {
  webNFC: 'NDEFReader' in window,
  serviceWorker: 'serviceWorker' in navigator,
  webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
  localStorage: typeof Storage !== 'undefined',
  sessionStorage: typeof sessionStorage !== 'undefined',
  indexedDB: 'indexedDB' in window,
  webGL: (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  })(),
  fullscreen: document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled,
  vibration: 'vibrate' in navigator,
  geolocation: 'geolocation' in navigator,
  camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
};

// 环境检测
window.Environment = {
  isProduction: location.hostname !== 'localhost' && location.hostname !== '127.0.0.1',
  isDevelopment: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
  isHTTPS: location.protocol === 'https:',
  userAgent: navigator.userAgent,
  language: navigator.language || navigator.userLanguage,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  cookieEnabled: navigator.cookieEnabled
};

// 性能监控初始化
if (window.AppConfig.performance.enabled) {
  window.Performance = {
    marks: {},
    measures: {},
    
    mark: function(name) {
      this.marks[name] = performance.now();
      performance.mark(name);
    },
    
    measure: function(name, startMark, endMark) {
      const start = this.marks[startMark] || 0;
      const end = this.marks[endMark] || performance.now();
      this.measures[name] = end - start;
      performance.measure(name, startMark, endMark);
      return this.measures[name];
    },
    
    getMetric: function(name) {
      return this.measures[name] || 0;
    },
    
    report: function() {
      console.table(this.measures);
    }
  };
  
  // 页面加载性能标记
  window.Performance.mark('app-start');
  
  window.addEventListener('load', () => {
    window.Performance.mark('app-loaded');
    window.Performance.measure('app-load-time', 'app-start', 'app-loaded');
  });
}

// 错误处理初始化
if (window.AppConfig.error.logToConsole) {
  window.ErrorHandler = {
    errors: [],
    
    log: function(error, context = {}) {
      const errorInfo = {
        message: error.message || error,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        context: context,
        userAgent: navigator.userAgent,
        url: location.href
      };
      
      this.errors.push(errorInfo);
      console.error('Application Error:', errorInfo);
      
      // 显示用户友好的错误信息
      if (window.AppConfig.error.showToast && window.showToast) {
        window.showToast(this.getErrorMessage(error), 'error');
      }
    },
    
    getErrorMessage: function(error) {
      // 根据错误类型返回用户友好的消息
      const messages = window.AppConfig.error.messages;
      
      if (error.name === 'NFCError') {
        return messages.nfc.readFailed;
      } else if (error.name === 'AudioError') {
        return messages.audio.playFailed;
      } else {
        return '发生了未知错误，请重试';
      }
    },
    
    getAll: function() {
      return this.errors;
    },
    
    clear: function() {
      this.errors = [];
    }
  };
  
  // 全局错误捕获
  window.addEventListener('error', (event) => {
    window.ErrorHandler.log(event.error, {
      type: 'javascript',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  // Promise 错误捕获
  window.addEventListener('unhandledrejection', (event) => {
    window.ErrorHandler.log(event.reason, {
      type: 'promise'
    });
  });
}

// 本地存储工具初始化
window.Storage = {
  set: function(key, value, expiry = window.AppConfig.storage.expiry) {
    const item = {
      value: value,
      timestamp: Date.now(),
      expiry: expiry
    };
    localStorage.setItem(window.AppConfig.storage.prefix + key, JSON.stringify(item));
  },
  
  get: function(key) {
    const itemStr = localStorage.getItem(window.AppConfig.storage.prefix + key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() - item.timestamp > item.expiry) {
        this.remove(key);
        return null;
      }
      return item.value;
    } catch (e) {
      this.remove(key);
      return null;
    }
  },
  
  remove: function(key) {
    localStorage.removeItem(window.AppConfig.storage.prefix + key);
  },
  
  clear: function() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(window.AppConfig.storage.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
};

console.log('红色研学NFC交互系统配置已加载', window.AppConfig);