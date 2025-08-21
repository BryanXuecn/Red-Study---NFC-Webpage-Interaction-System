/**
 * 宣言馆 - 墨韵真理模块主控制器
 */

class ManifestoHall {
  constructor() {
    this.nfcHandler = null;
    this.audioPlayer = null;
    this.isInitialized = false;
    this.animationCompleted = false;
    
    // DOM 元素引用
    this.elements = {};
    
    // 音频文件映射
    this.audioFiles = {
      truthStory: '../assets/audio/truth-story.mp3',
      opening: '../assets/audio/opening-passage.mp3',
      workers: '../assets/audio/workers-unite.mp3'
    };
    
    // 初始化
    this.init();
  }

  /**
   * 初始化模块
   */
  async init() {
    try {
      console.log('初始化宣言馆模块...');
      
      // 等待 DOM 加载完成
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // 获取 DOM 元素
      this.initElements();
      
      // 初始化 NFC 功能
      await this.initNFC();
      
      // 初始化音频播放器
      this.initAudioPlayer();
      
      // 绑定事件监听器
      this.bindEvents();
      
      // 开始加载动画
      this.startLoadingAnimation();
      
      this.isInitialized = true;
      console.log('宣言馆模块初始化完成');
      
    } catch (error) {
      console.error('宣言馆模块初始化失败:', error);
      this.showError('模块初始化失败，请刷新页面重试');
    }
  }

  /**
   * 获取 DOM 元素引用
   */
  initElements() {
    this.elements = {
      // 容器元素
      loadingScreen: document.getElementById('loading-screen'),
      mainContainer: document.getElementById('main-container'),
      
      // NFC 相关
      nfcStatus: document.getElementById('nfc-status'),
      
      // 封面动画
      coverAnimation: document.getElementById('cover-animation'),
      
      // 音频控制
      inkBottleBtn: document.getElementById('ink-bottle-btn'),
      audioPlayer: document.getElementById('audio-player'),
      truthAudio: document.getElementById('truth-audio'),
      playPauseBtn: document.getElementById('play-pause-btn'),
      closePlayer: document.getElementById('close-player'),
      progressFill: document.getElementById('progress-fill'),
      currentTime: document.getElementById('current-time'),
      duration: document.getElementById('duration'),
      
      // 经典段落按钮
      passageBtns: document.querySelectorAll('.passage-btn'),
      
      // 导航按钮
      nextHallBtn: document.getElementById('next-hall-btn')
    };

    // 验证关键元素是否存在
    const requiredElements = ['loadingScreen', 'mainContainer', 'inkBottleBtn'];
    for (const key of requiredElements) {
      if (!this.elements[key]) {
        throw new Error(`关键 DOM 元素未找到: ${key}`);
      }
    }
  }

  /**
   * 初始化 NFC 功能
   */
  async initNFC() {
    try {
      // 创建 NFC 处理器实例
      this.nfcHandler = new NFCHandler();
      
      // 设置 NFC 回调
      this.nfcHandler.setCallbacks({
        onRead: (data) => this.handleNFCRead(data),
        onError: (type, error) => this.handleNFCError(type, error),
        onStatusChange: (status) => this.handleNFCStatusChange(status)
      });
      
      // 检查 NFC 支持状态
      const nfcStatus = this.nfcHandler.getStatus();
      if (nfcStatus.isSupported) {
        console.log('NFC 功能可用，开始扫描...');
        await this.nfcHandler.startScan();
      } else {
        console.warn('NFC 功能不可用，显示备用方案');
        this.showNFCAlternative();
      }
      
    } catch (error) {
      console.error('NFC 初始化失败:', error);
      this.showNFCAlternative();
    }
  }

  /**
   * 初始化音频播放器
   */
  initAudioPlayer() {
    if (!this.elements.truthAudio) {
      console.warn('音频元素未找到');
      return;
    }

    const audio = this.elements.truthAudio;
    
    // 音频事件监听
    audio.addEventListener('loadedmetadata', () => {
      if (this.elements.duration) {
        this.elements.duration.textContent = this.formatTime(audio.duration);
      }
    });
    
    audio.addEventListener('timeupdate', () => {
      this.updateAudioProgress();
    });
    
    audio.addEventListener('ended', () => {
      this.resetAudioPlayer();
    });
    
    audio.addEventListener('error', (e) => {
      console.error('音频加载失败:', e);
      this.showError('音频加载失败，请检查网络连接');
    });
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 墨水瓶按钮点击
    if (this.elements.inkBottleBtn) {
      this.elements.inkBottleBtn.addEventListener('click', (e) => {
        this.handleInkBottleClick(e);
      });
    }
    
    // 音频播放控制
    if (this.elements.playPauseBtn) {
      this.elements.playPauseBtn.addEventListener('click', () => {
        this.toggleAudioPlayback();
      });
    }
    
    // 关闭音频播放器
    if (this.elements.closePlayer) {
      this.elements.closePlayer.addEventListener('click', () => {
        this.closeAudioPlayer();
      });
    }
    
    // 进度条点击
    if (this.elements.progressFill && this.elements.progressFill.parentElement) {
      this.elements.progressFill.parentElement.addEventListener('click', (e) => {
        this.seekAudio(e);
      });
    }
    
    // 经典段落按钮
    this.elements.passageBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handlePassageClick(e);
      });
    });
    
    // 下一馆按钮
    if (this.elements.nextHallBtn) {
      this.elements.nextHallBtn.addEventListener('click', () => {
        this.navigateToNextHall();
      });
    }
    
    // 页面可见性变化监听
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.elements.truthAudio && !this.elements.truthAudio.paused) {
        this.elements.truthAudio.pause();
      }
    });
  }

  /**
   * 开始加载动画
   */
  startLoadingAnimation() {
    // 2秒后隐藏加载屏幕
    setTimeout(() => {
      if (this.elements.loadingScreen) {
        this.elements.loadingScreen.style.display = 'none';
      }
      if (this.elements.mainContainer) {
        this.elements.mainContainer.classList.remove('hidden');
      }
      
      // 开始封面复原动画
      this.startCoverAnimation();
    }, 2000);
  }

  /**
   * 开始封面复原动画
   */
  startCoverAnimation() {
    if (!this.elements.coverAnimation) return;
    
    // 标记动画开始
    setTimeout(() => {
      this.elements.coverAnimation.classList.add('animation-active');
      this.animationCompleted = true;
    }, 1000);
  }

  /**
   * 处理 NFC 读取
   */
  handleNFCRead(data) {
    console.log('检测到 NFC 标签:', data);
    
    // 检查是否为宣言馆的标签
    const isManifestoTag = this.validateManifestoTag(data);
    
    if (isManifestoTag) {
      console.log('宣言馆标签验证成功');
      this.onManifestoTagDetected(data);
    } else {
      console.log('非宣言馆标签');
      this.showMessage('请使用正确的宣言馆印章');
    }
  }

  /**
   * 验证是否为宣言馆标签
   */
  validateManifestoTag(data) {
    // 检查标签数据中是否包含宣言馆标识
    for (const record of data.data) {
      if (record.data && typeof record.data === 'string') {
        // 检查 URL 或文本中是否包含宣言馆标识
        if (record.data.includes('manifesto') || 
            record.data.includes('宣言馆') ||
            record.data.includes('xuanyan')) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 宣言馆标签检测成功处理
   */
  onManifestoTagDetected(data) {
    // 隐藏 NFC 状态指示器
    if (this.elements.nfcStatus) {
      this.elements.nfcStatus.style.display = 'none';
    }
    
    // 触发成功反馈
    this.showSuccessMessage('宣言馆印章识别成功！');
    
    // 自动播放真理故事
    setTimeout(() => {
      this.playTruthStory();
    }, 1500);
    
    // 标记章节完成
    this.markChapterCompleted();
  }

  /**
   * 处理 NFC 错误
   */
  handleNFCError(type, error) {
    console.error('NFC 错误:', type, error);
    
    switch (type) {
      case 'permission_denied':
        this.showError('需要NFC权限才能使用此功能');
        break;
      case 'not_supported':
        this.showNFCAlternative();
        break;
      default:
        this.showError('NFC读取失败，请重试');
    }
  }

  /**
   * 处理 NFC 状态变化
   */
  handleNFCStatusChange(status) {
    console.log('NFC 状态变化:', status);
    
    if (this.elements.nfcStatus) {
      const nfcText = this.elements.nfcStatus.querySelector('.nfc-text');
      if (nfcText) {
        switch (status) {
          case 'scanning':
            nfcText.textContent = '请将墨水瓶印章靠近手机';
            break;
          case 'read_success':
            nfcText.textContent = '印章识别成功！';
            break;
          case 'read_error':
            nfcText.textContent = '识别失败，请重试';
            break;
        }
      }
    }
  }

  /**
   * 显示 NFC 备用方案
   */
  showNFCAlternative() {
    if (this.elements.nfcStatus) {
      const nfcTitle = this.elements.nfcStatus.querySelector('.nfc-title');
      const nfcText = this.elements.nfcStatus.querySelector('.nfc-text');
      if (nfcTitle && nfcText) {
        nfcTitle.textContent = '设备兼容模式';
        nfcText.innerHTML = '点击墨水瓶按钮开始体验';
      }
    }
  }

  /**
   * 处理墨水瓶按钮点击
   */
  handleInkBottleClick(e) {
    // 添加点击涟漪效果
    this.addRippleEffect(e.currentTarget, e);
    
    // 播放真理故事
    this.playTruthStory();
  }

  /**
   * 添加涟漪效果
   */
  addRippleEffect(element, event) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('div');
    ripple.classList.add('ripple-effect');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    // 移除涟漪效果
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * 播放真理故事
   */
  playTruthStory() {
    if (!this.elements.audioPlayer || !this.elements.truthAudio) {
      console.error('音频播放器元素未找到');
      return;
    }
    
    // 显示音频播放器
    this.elements.audioPlayer.classList.remove('hidden');
    
    // 播放音频
    this.elements.truthAudio.currentTime = 0;
    this.elements.truthAudio.play().catch(error => {
      console.error('音频播放失败:', error);
      this.showError('音频播放失败，请检查设备设置');
    });
    
    // 更新播放按钮状态
    this.updatePlayPauseButton(true);
  }

  /**
   * 切换音频播放状态
   */
  toggleAudioPlayback() {
    if (!this.elements.truthAudio) return;
    
    if (this.elements.truthAudio.paused) {
      this.elements.truthAudio.play();
      this.updatePlayPauseButton(true);
    } else {
      this.elements.truthAudio.pause();
      this.updatePlayPauseButton(false);
    }
  }

  /**
   * 更新播放/暂停按钮状态
   */
  updatePlayPauseButton(isPlaying) {
    if (!this.elements.playPauseBtn) return;
    
    const playIcon = this.elements.playPauseBtn.querySelector('.play-icon');
    const pauseIcon = this.elements.playPauseBtn.querySelector('.pause-icon');
    
    if (playIcon && pauseIcon) {
      if (isPlaying) {
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
      } else {
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
      }
    }
  }

  /**
   * 更新音频进度
   */
  updateAudioProgress() {
    const audio = this.elements.truthAudio;
    if (!audio || !this.elements.progressFill || !this.elements.currentTime) return;
    
    const progress = (audio.currentTime / audio.duration) * 100;
    this.elements.progressFill.style.width = progress + '%';
    this.elements.currentTime.textContent = this.formatTime(audio.currentTime);
  }

  /**
   * 音频进度条点击跳转
   */
  seekAudio(event) {
    const audio = this.elements.truthAudio;
    if (!audio) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progress = clickX / rect.width;
    
    audio.currentTime = progress * audio.duration;
  }

  /**
   * 关闭音频播放器
   */
  closeAudioPlayer() {
    if (this.elements.audioPlayer) {
      this.elements.audioPlayer.classList.add('hidden');
    }
    
    if (this.elements.truthAudio) {
      this.elements.truthAudio.pause();
      this.elements.truthAudio.currentTime = 0;
    }
    
    this.resetAudioPlayer();
  }

  /**
   * 重置音频播放器
   */
  resetAudioPlayer() {
    this.updatePlayPauseButton(false);
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = '0%';
    }
    if (this.elements.currentTime) {
      this.elements.currentTime.textContent = '0:00';
    }
  }

  /**
   * 处理经典段落按钮点击
   */
  handlePassageClick(event) {
    const audioType = event.currentTarget.dataset.audio;
    if (!audioType || !this.audioFiles[audioType]) {
      console.error('音频文件未找到:', audioType);
      return;
    }
    
    // 播放对应的音频片段
    this.playPassageAudio(audioType);
  }

  /**
   * 播放段落音频
   */
  playPassageAudio(audioType) {
    // 创建临时音频元素
    const audio = new Audio(this.audioFiles[audioType]);
    
    audio.play().catch(error => {
      console.error('段落音频播放失败:', error);
      this.showError('音频播放失败');
    });
  }

  /**
   * 标记章节完成
   */
  markChapterCompleted() {
    const stampSlot = document.querySelector('.stamp-slot');
    if (stampSlot) {
      stampSlot.classList.add('completed');
    }
  }

  /**
   * 导航到下一馆
   */
  navigateToNextHall() {
    // 这里可以添加页面跳转逻辑
    console.log('导航到国歌馆');
    window.location.href = '../../02-anthem-hall/html/index.html';
  }

  /**
   * 格式化时间显示
   */
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 显示成功消息
   */
  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  /**
   * 显示错误消息
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * 显示消息提示
   */
  showMessage(message, type = 'info') {
    // 创建消息提示元素
    const messageElement = document.createElement('div');
    messageElement.className = `message-toast message-${type}`;
    messageElement.textContent = message;
    
    // 添加样式
    Object.assign(messageElement.style, {
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: '10000',
      opacity: '0',
      transition: 'opacity 0.3s ease-in-out'
    });
    
    // 根据类型设置背景色
    switch (type) {
      case 'success':
        messageElement.style.backgroundColor = '#16a34a';
        break;
      case 'error':
        messageElement.style.backgroundColor = '#dc2626';
        break;
      default:
        messageElement.style.backgroundColor = '#6b7280';
    }
    
    // 添加到页面
    document.body.appendChild(messageElement);
    
    // 显示动画
    setTimeout(() => {
      messageElement.style.opacity = '1';
    }, 100);
    
    // 3秒后移除
    setTimeout(() => {
      messageElement.style.opacity = '0';
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, 3000);
  }

  /**
   * 销毁模块
   */
  destroy() {
    // 停止 NFC 扫描
    if (this.nfcHandler) {
      this.nfcHandler.destroy();
    }
    
    // 停止音频播放
    if (this.elements.truthAudio) {
      this.elements.truthAudio.pause();
      this.elements.truthAudio.currentTime = 0;
    }
    
    // 清理事件监听器
    // (这里可以添加具体的清理逻辑)
    
    console.log('宣言馆模块已销毁');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.manifestoHall = new ManifestoHall();
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (window.manifestoHall) {
    window.manifestoHall.destroy();
  }
});