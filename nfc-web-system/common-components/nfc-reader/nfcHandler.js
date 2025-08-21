/**
 * NFC 读取处理器
 * 提供 NFC 芯片读取、写入和状态管理功能
 */

class NFCHandler {
  constructor() {
    this.isSupported = false;
    this.isReading = false;
    this.readers = [];
    this.callbacks = {
      onRead: null,
      onError: null,
      onStatusChange: null
    };
    
    this.init();
  }

  /**
   * 初始化 NFC 功能
   */
  async init() {
    try {
      // 检查浏览器是否支持 Web NFC
      if ('NDEFReader' in window) {
        this.isSupported = true;
        console.log('NFC Web API 支持检测成功');
        
        // 触发状态变化回调
        this.triggerStatusChange('supported');
      } else {
        console.warn('当前浏览器不支持 Web NFC API');
        this.triggerStatusChange('unsupported');
      }
    } catch (error) {
      console.error('NFC 初始化失败:', error);
      this.triggerError('init_failed', error);
    }
  }

  /**
   * 开始扫描 NFC 标签
   */
  async startScan() {
    if (!this.isSupported) {
      this.triggerError('not_supported', new Error('浏览器不支持 NFC'));
      return false;
    }

    if (this.isReading) {
      console.log('NFC 扫描已在进行中');
      return true;
    }

    try {
      // 请求 NFC 权限
      await this.requestPermission();
      
      // 创建 NDEF 读取器
      const ndef = new NDEFReader();
      this.readers.push(ndef);
      
      // 开始扫描
      await ndef.scan();
      this.isReading = true;
      
      // 监听 NFC 标签读取事件
      ndef.addEventListener('reading', (event) => {
        this.handleNFCRead(event);
      });
      
      // 监听错误事件
      ndef.addEventListener('readingerror', (event) => {
        this.handleNFCError(event);
      });
      
      console.log('NFC 扫描已启动');
      this.triggerStatusChange('scanning');
      return true;
      
    } catch (error) {
      console.error('启动 NFC 扫描失败:', error);
      this.handlePermissionError(error);
      return false;
    }
  }

  /**
   * 停止扫描 NFC 标签
   */
  stopScan() {
    if (!this.isReading) {
      return;
    }

    try {
      // 停止所有读取器
      this.readers.forEach(reader => {
        try {
          reader.removeEventListener('reading', this.handleNFCRead);
          reader.removeEventListener('readingerror', this.handleNFCError);
        } catch (error) {
          console.warn('停止 NFC 读取器时出错:', error);
        }
      });
      
      this.readers = [];
      this.isReading = false;
      
      console.log('NFC 扫描已停止');
      this.triggerStatusChange('stopped');
      
    } catch (error) {
      console.error('停止 NFC 扫描失败:', error);
      this.triggerError('stop_failed', error);
    }
  }

  /**
   * 处理 NFC 标签读取
   */
  handleNFCRead(event) {
    try {
      const { message, serialNumber } = event;
      
      console.log('NFC 标签读取成功:', {
        serialNumber,
        recordsCount: message.records.length
      });

      // 解析 NDEF 记录
      const data = this.parseNDEFMessage(message);
      
      // 触发读取回调
      if (this.callbacks.onRead) {
        this.callbacks.onRead({
          serialNumber,
          data,
          timestamp: Date.now(),
          rawMessage: message
        });
      }
      
      this.triggerStatusChange('read_success');
      
    } catch (error) {
      console.error('处理 NFC 读取数据失败:', error);
      this.triggerError('parse_failed', error);
    }
  }

  /**
   * 处理 NFC 读取错误
   */
  handleNFCError(event) {
    console.error('NFC 读取错误:', event);
    this.triggerError('read_failed', event);
    this.triggerStatusChange('read_error');
  }

  /**
   * 处理权限错误
   */
  handlePermissionError(error) {
    if (error.name === 'NotAllowedError') {
      this.triggerError('permission_denied', error);
    } else if (error.name === 'NotSupportedError') {
      this.triggerError('not_supported', error);
    } else {
      this.triggerError('unknown_error', error);
    }
  }

  /**
   * 解析 NDEF 消息
   */
  parseNDEFMessage(message) {
    const records = [];
    
    for (const record of message.records) {
      const recordData = {
        recordType: record.recordType,
        mediaType: record.mediaType,
        id: record.id,
        data: null
      };
      
      try {
        // 根据记录类型解析数据
        if (record.recordType === 'text') {
          recordData.data = new TextDecoder().decode(record.data);
        } else if (record.recordType === 'url') {
          recordData.data = new TextDecoder().decode(record.data);
        } else if (record.recordType === 'absolute-url') {
          recordData.data = new TextDecoder().decode(record.data);
        } else {
          // 对于其他类型，尝试解析为文本
          recordData.data = new TextDecoder().decode(record.data);
        }
      } catch (error) {
        console.warn('解析 NDEF 记录失败:', error);
        recordData.data = Array.from(new Uint8Array(record.data));
      }
      
      records.push(recordData);
    }
    
    return records;
  }

  /**
   * 请求 NFC 权限
   */
  async requestPermission() {
    try {
      // 检查权限状态
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'nfc' });
        console.log('NFC 权限状态:', permission.state);
        
        if (permission.state === 'denied') {
          throw new Error('NFC 权限被拒绝');
        }
      }
      
      return true;
    } catch (error) {
      console.error('请求 NFC 权限失败:', error);
      throw error;
    }
  }

  /**
   * 写入 NFC 标签 (可选功能)
   */
  async writeTag(data) {
    if (!this.isSupported) {
      throw new Error('浏览器不支持 NFC');
    }

    try {
      const ndef = new NDEFReader();
      
      // 构造 NDEF 消息
      const records = [];
      
      if (typeof data === 'string') {
        records.push({
          recordType: 'text',
          data: data
        });
      } else if (data.url) {
        records.push({
          recordType: 'url',
          data: data.url
        });
      } else if (data.records) {
        records.push(...data.records);
      }
      
      await ndef.write({ records });
      console.log('NFC 标签写入成功');
      return true;
      
    } catch (error) {
      console.error('写入 NFC 标签失败:', error);
      throw error;
    }
  }

  /**
   * 设置回调函数
   */
  setCallbacks(callbacks) {
    if (callbacks.onRead) this.callbacks.onRead = callbacks.onRead;
    if (callbacks.onError) this.callbacks.onError = callbacks.onError;
    if (callbacks.onStatusChange) this.callbacks.onStatusChange = callbacks.onStatusChange;
  }

  /**
   * 触发状态变化回调
   */
  triggerStatusChange(status) {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(status);
    }
  }

  /**
   * 触发错误回调
   */
  triggerError(type, error) {
    if (this.callbacks.onError) {
      this.callbacks.onError(type, error);
    }
  }

  /**
   * 获取 NFC 状态
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      isReading: this.isReading,
      readersCount: this.readers.length
    };
  }

  /**
   * 销毁 NFC 处理器
   */
  destroy() {
    this.stopScan();
    this.callbacks = {
      onRead: null,
      onError: null,
      onStatusChange: null
    };
  }
}

// 导出 NFC 处理器类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NFCHandler;
} else {
  window.NFCHandler = NFCHandler;
}