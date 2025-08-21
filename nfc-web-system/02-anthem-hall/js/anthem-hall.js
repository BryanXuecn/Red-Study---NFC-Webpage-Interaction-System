/**
 * 国歌馆 - 觉醒之声 主控制脚本
 * 包含音频可视化、歌词同步、NFC交互等功能
 */

// 音频可视化类
class AudioVisualizer {
    constructor(audioElement, canvasElement) {
        this.audio = audioElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.analyzer = null;
        this.dataArray = null;
        this.animationId = null;
        this.isInitialized = false;
        
        this.setupCanvas();
    }
    
    setupCanvas() {
        // 设置高DPI显示支持
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    async initAudioContext() {
        if (this.isInitialized) return true;
        
        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyzer = this.audioContext.createAnalyser();
            this.analyzer.fftSize = 256;
            this.analyzer.smoothingTimeConstant = 0.8;
            
            // 连接音频源
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyzer);
            this.analyzer.connect(this.audioContext.destination);
            
            this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
            this.isInitialized = true;
            
            console.log('音频可视化初始化成功');
            return true;
        } catch (error) {
            console.error('音频可视化初始化失败:', error);
            return false;
        }
    }
    
    startVisualization() {
        if (!this.isInitialized) return;
        
        const draw = () => {
            if (this.analyzer) {
                this.analyzer.getByteFrequencyData(this.dataArray);
                this.drawWaveform();
                this.updateFrequencyBars();
            }
            this.animationId = requestAnimationFrame(draw);
        };
        draw();
    }
    
    drawWaveform() {
        const { width, height } = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, width, height);
        
        const barWidth = width / this.dataArray.length * 2;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            const barHeight = (this.dataArray[i] / 255) * height * 0.8;
            
            // 创建渐变色彩
            const gradient = this.ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, '#dc2626');
            gradient.addColorStop(0.5, '#fbbf24');
            gradient.addColorStop(1, '#1e40af');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
            
            x += barWidth;
        }
    }
    
    updateFrequencyBars() {
        const frequencyBars = document.getElementById('frequency-bars');
        if (!frequencyBars || !this.dataArray) return;
        
        // 如果还没有创建频率柱，创建它们
        if (frequencyBars.children.length === 0) {
            for (let i = 0; i < 32; i++) {
                const bar = document.createElement('div');
                bar.className = 'frequency-bar';
                bar.style.cssText = `
                    width: 4px;
                    background: linear-gradient(to top, #dc2626, #fbbf24, #1e40af);
                    border-radius: 2px;
                    transition: height 0.1s ease;
                    min-height: 2px;
                `;
                frequencyBars.appendChild(bar);
            }
        }
        
        // 更新频率柱高度
        const bars = frequencyBars.children;
        for (let i = 0; i < Math.min(bars.length, this.dataArray.length); i++) {
            const height = (this.dataArray[i] / 255) * 100;
            bars[i].style.height = Math.max(2, height) + 'px';
        }
    }
    
    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // 清除画布
        if (this.ctx) {
            const { width, height } = this.canvas.getBoundingClientRect();
            this.ctx.clearRect(0, 0, width, height);
        }
    }
    
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('音频上下文已恢复');
            } catch (error) {
                console.error('恢复音频上下文失败:', error);
            }
        }
    }
}

// 歌词同步类
class LyricsSync {
    constructor() {
        this.lyrics = [
            { time: 0, text: "起来！不愿做奴隶的人们！", pinyin: "qǐ lái! bù yuàn zuò nú lì de rén men!" },
            { time: 4.5, text: "把我们的血肉，筑成我们新的长城！", pinyin: "bǎ wǒ men de xuè ròu, zhù chéng wǒ men xīn de cháng chéng!" },
            { time: 9.0, text: "中华民族到了最危险的时候，", pinyin: "zhōng huá mín zú dào le zuì wēi xiǎn de shí hou," },
            { time: 13.5, text: "每个人被迫着发出最后的吼声。", pinyin: "měi gè rén bèi pò zhe fā chū zuì hòu de hǒu shēng." },
            { time: 18.0, text: "起来！起来！起来！", pinyin: "qǐ lái! qǐ lái! qǐ lái!" },
            { time: 21.5, text: "我们万众一心，", pinyin: "wǒ men wàn zhòng yī xīn," },
            { time: 24.0, text: "冒着敌人的炮火，前进！", pinyin: "mào zhe dí rén de pào huǒ, qián jìn!" },
            { time: 27.5, text: "冒着敌人的炮火，前进！", pinyin: "mào zhe dí rén de pào huǒ, qián jìn!" },
            { time: 31.0, text: "前进！前进！进！", pinyin: "qián jìn! qián jìn! jìn!" }
        ];
        
        this.currentLineIndex = -1;
        this.lyricsContainer = document.getElementById('lyrics-container');
        this.showPinyin = false;
        this.autoScroll = true;
        
        this.init();
    }
    
    init() {
        this.createLyricsElements();
        this.bindControls();
    }
    
    createLyricsElements() {
        this.lyricsContainer.innerHTML = '';
        
        this.lyrics.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.className = 'lyrics-line';
            lineElement.dataset.index = index;
            lineElement.dataset.time = line.time;
            
            lineElement.innerHTML = `
                <span class="chinese">${line.text}</span>
                <span class="pinyin ${this.showPinyin ? 'show' : ''}">${line.pinyin}</span>
            `;
            
            // 添加点击事件，允许用户跳转到指定时间
            lineElement.addEventListener('click', () => {
                const audio = document.getElementById('anthem-audio');
                if (audio) {
                    audio.currentTime = line.time;
                }
            });
            
            this.lyricsContainer.appendChild(lineElement);
        });
    }
    
    bindControls() {
        // 拼音显示切换
        const pinyinBtn = document.getElementById('show-pinyin-btn');
        if (pinyinBtn) {
            pinyinBtn.addEventListener('click', () => {
                this.showPinyin = !this.showPinyin;
                this.togglePinyin();
                pinyinBtn.classList.toggle('active', this.showPinyin);
            });
        }
        
        // 自动滚动切换
        const autoScrollBtn = document.getElementById('auto-scroll-btn');
        if (autoScrollBtn) {
            autoScrollBtn.addEventListener('click', () => {
                this.autoScroll = !this.autoScroll;
                autoScrollBtn.classList.toggle('active', this.autoScroll);
            });
        }
    }
    
    togglePinyin() {
        const pinyinElements = this.lyricsContainer.querySelectorAll('.pinyin');
        pinyinElements.forEach(element => {
            element.classList.toggle('show', this.showPinyin);
        });
    }
    
    updateCurrentLine(currentTime) {
        // 找到当前应该高亮的歌词行
        let newIndex = -1;
        for (let i = this.lyrics.length - 1; i >= 0; i--) {
            if (currentTime >= this.lyrics[i].time) {
                newIndex = i;
                break;
            }
        }
        
        if (newIndex !== this.currentLineIndex) {
            // 移除之前的高亮
            if (this.currentLineIndex >= 0) {
                const prevLine = this.lyricsContainer.querySelector(`[data-index="${this.currentLineIndex}"]`);
                if (prevLine) {
                    prevLine.classList.remove('active');
                }
            }
            
            // 添加新的高亮
            if (newIndex >= 0) {
                const currentLine = this.lyricsContainer.querySelector(`[data-index="${newIndex}"]`);
                if (currentLine) {
                    currentLine.classList.add('active');
                    
                    // 自动滚动到当前行
                    if (this.autoScroll) {
                        currentLine.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }
            }
            
            this.currentLineIndex = newIndex;
        }
    }
    
    reset() {
        // 重置所有高亮状态
        const activeLines = this.lyricsContainer.querySelectorAll('.lyrics-line.active');
        activeLines.forEach(line => line.classList.remove('active'));
        this.currentLineIndex = -1;
    }
}

// 主控制类
class AnthemHall {
    constructor() {
        this.audioElement = null;
        this.visualizer = null;
        this.lyricsSync = null;
        this.nfcHandler = null;
        this.isPlaying = false;
        this.currentVolume = 0.7;
        this.isDragging = false;
        
        this.init();
    }
    
    async init() {
        console.log('初始化国歌馆...');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }
    
    async initializeComponents() {
        try {
            // 初始化DOM元素
            this.audioElement = document.getElementById('anthem-audio');
            const canvas = document.getElementById('waveform-canvas');
            
            if (!this.audioElement || !canvas) {
                throw new Error('必要的DOM元素未找到');
            }
            
            // 初始化组件
            this.visualizer = new AudioVisualizer(this.audioElement, canvas);
            this.lyricsSync = new LyricsSync();
            
            // 初始化NFC
            await this.initializeNFC();
            
            // 绑定事件
            this.bindEvents();
            
            // 设置初始音量
            this.audioElement.volume = this.currentVolume;
            this.updateVolumeSlider();
            
            // 隐藏加载屏幕
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 2500);
            
            console.log('国歌馆初始化完成');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showMessage('初始化失败，请刷新页面重试', 'error');
        }
    }
    
    async initializeNFC() {
        try {
            if (typeof NFCHandler !== 'undefined') {
                this.nfcHandler = new NFCHandler();
                
                this.nfcHandler.setCallbacks({
                    onRead: (data) => this.handleNFCRead(data),
                    onError: (type, error) => this.handleNFCError(type, error),
                    onStatusChange: (status) => this.handleNFCStatusChange(status)
                });
                
                // 自动开始扫描
                await this.nfcHandler.startScan();
            }
        } catch (error) {
            console.warn('NFC初始化失败:', error);
        }
    }
    
    bindEvents() {
        // 播放/暂停按钮
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.pauseAudio();
                } else {
                    this.playAudio();
                }
            });
        }
        
        // 进度条交互
        const progressBar = document.getElementById('audio-progress-bar');
        if (progressBar) {
            progressBar.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.updateProgressFromEvent(e);
            });
            
            progressBar.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    this.updateProgressFromEvent(e);
                }
            });
            
            document.addEventListener('mouseup', () => {
                this.isDragging = false;
            });
        }
        
        // 音量控制
        const volumeBtn = document.getElementById('volume-btn');
        const volumeSlider = document.getElementById('volume-slider');
        
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => this.toggleMute());
        }
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.currentVolume = e.target.value / 100;
                this.audioElement.volume = this.currentVolume;
                this.updateVolumeIcon();
            });
        }
        
        // 音频事件
        this.audioElement.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });
        
        this.audioElement.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
            }
            this.lyricsSync.updateCurrentLine(this.audioElement.currentTime);
        });
        
        this.audioElement.addEventListener('ended', () => {
            this.onAudioEnded();
        });
        
        this.audioElement.addEventListener('error', (e) => {
            console.error('音频加载错误:', e);
            this.showMessage('音频加载失败', 'error');
        });
        
        // 导航按钮
        const prevBtn = document.getElementById('prev-hall-btn');
        const nextBtn = document.getElementById('next-hall-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateToHall('prev'));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateToHall('next'));
        }
        
        // 窗口事件
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }
    
    updateProgressFromEvent(event) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        
        if (this.audioElement.duration) {
            this.audioElement.currentTime = percent * this.audioElement.duration;
        }
    }
    
    async playAudio() {
        try {
            // 初始化音频上下文（需要用户手势）
            await this.visualizer.initAudioContext();
            await this.visualizer.resumeAudioContext();
            
            await this.audioElement.play();
            this.isPlaying = true;
            this.updatePlayButton();
            this.visualizer.startVisualization();
            this.startVinylRotation();
            
            console.log('音频播放开始');
            
        } catch (error) {
            console.error('音频播放失败:', error);
            this.showMessage('音频播放失败，请检查设备设置', 'error');
        }
    }
    
    pauseAudio() {
        this.audioElement.pause();
        this.isPlaying = false;
        this.updatePlayButton();
        this.visualizer.stopVisualization();
        this.stopVinylRotation();
        
        console.log('音频播放暂停');
    }
    
    onAudioEnded() {
        this.isPlaying = false;
        this.updatePlayButton();
        this.visualizer.stopVisualization();
        this.stopVinylRotation();
        this.lyricsSync.reset();
        
        // 重置进度
        this.audioElement.currentTime = 0;
        this.updateProgress();
        
        console.log('音频播放结束');
    }
    
    updatePlayButton() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            if (this.isPlaying) {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            } else {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
        }
    }
    
    updateProgress() {
        if (!this.audioElement.duration) return;
        
        const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        const progressFill = document.getElementById('progress-fill');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        // 更新时间显示
        const currentTimeEl = document.getElementById('current-time');
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.audioElement.currentTime);
        }
    }
    
    updateDuration() {
        const durationEl = document.getElementById('duration');
        if (durationEl && this.audioElement.duration) {
            durationEl.textContent = this.formatTime(this.audioElement.duration);
        }
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    toggleMute() {
        if (this.audioElement.volume > 0) {
            this.audioElement.volume = 0;
        } else {
            this.audioElement.volume = this.currentVolume;
        }
        this.updateVolumeIcon();
        this.updateVolumeSlider();
    }
    
    updateVolumeIcon() {
        const volumeOn = document.querySelector('.volume-on');
        const volumeOff = document.querySelector('.volume-off');
        
        if (volumeOn && volumeOff) {
            if (this.audioElement.volume === 0) {
                volumeOn.classList.add('hidden');
                volumeOff.classList.remove('hidden');
            } else {
                volumeOn.classList.remove('hidden');
                volumeOff.classList.add('hidden');
            }
        }
    }
    
    updateVolumeSlider() {
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.audioElement.volume * 100;
        }
    }
    
    startVinylRotation() {
        const vinyl = document.querySelector('.vinyl-record');
        if (vinyl) {
            vinyl.style.animationPlayState = 'running';
        }
    }
    
    stopVinylRotation() {
        const vinyl = document.querySelector('.vinyl-record');
        if (vinyl) {
            vinyl.style.animationPlayState = 'paused';
        }
    }
    
    handleNFCRead(data) {
        console.log('NFC标签读取成功:', data);
        this.showMessage('NFC访问成功！', 'success');
        
        // 更新NFC状态显示
        const nfcStatus = document.getElementById('nfc-status');
        if (nfcStatus) {
            nfcStatus.style.display = 'flex';
        }
    }
    
    handleNFCError(type, error) {
        console.warn('NFC错误:', type, error);
        
        let message = 'NFC读取失败';
        switch (type) {
            case 'not_supported':
                message = '当前浏览器不支持NFC功能';
                break;
            case 'permission_denied':
                message = 'NFC权限被拒绝';
                break;
            default:
                message = 'NFC读取出现问题';
        }
        
        this.showMessage(message, 'warning');
    }
    
    handleNFCStatusChange(status) {
        console.log('NFC状态变化:', status);
    }
    
    navigateToHall(direction) {
        if (direction === 'prev') {
            // 返回宣言馆
            window.location.href = '../../01-manifesto-hall/html/index.html';
        } else if (direction === 'next') {
            // 前往滨江馆
            window.location.href = '../../03-riverside-hall/html/index.html';
        }
    }
    
    handleKeyboard(event) {
        // 防止在输入框中触发快捷键
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (this.isPlaying) {
                    this.pauseAudio();
                } else {
                    this.playAudio();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.skipTime(-10);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.skipTime(10);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.adjustVolume(0.1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.adjustVolume(-0.1);
                break;
        }
    }
    
    skipTime(seconds) {
        if (this.audioElement.duration) {
            const newTime = Math.max(0, Math.min(
                this.audioElement.duration,
                this.audioElement.currentTime + seconds
            ));
            this.audioElement.currentTime = newTime;
        }
    }
    
    adjustVolume(delta) {
        const newVolume = Math.max(0, Math.min(1, this.audioElement.volume + delta));
        this.audioElement.volume = newVolume;
        this.currentVolume = newVolume;
        this.updateVolumeIcon();
        this.updateVolumeSlider();
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContainer = document.getElementById('main-container');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        if (mainContainer) {
            mainContainer.classList.remove('hidden');
        }
    }
    
    showMessage(text, type = 'info') {
        // 创建消息提示
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // 根据类型设置背景色
        switch (type) {
            case 'success':
                message.style.background = '#16a34a';
                break;
            case 'warning':
                message.style.background = '#d97706';
                break;
            case 'error':
                message.style.background = '#dc2626';
                break;
            default:
                message.style.background = '#2563eb';
        }
        
        document.body.appendChild(message);
        
        // 显示动画
        setTimeout(() => {
            message.style.opacity = '1';
            message.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
        
        console.log(`${type.toUpperCase()}: ${text}`);
    }
    
    cleanup() {
        // 清理资源
        if (this.visualizer) {
            this.visualizer.stopVisualization();
        }
        
        if (this.nfcHandler) {
            this.nfcHandler.destroy();
        }
        
        if (this.audioElement) {
            this.audioElement.pause();
        }
    }
}

// 初始化应用
window.anthemHall = new AnthemHall();

// 导出到全局作用域以供调试
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnthemHall, AudioVisualizer, LyricsSync };
}