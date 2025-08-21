/**
 * 滨江馆 - 城市之芯 JavaScript 主文件
 * 简化版本 - 只包含NFC访问、时空对比、发展时间轴三个核心功能
 */

class BinjiangHall {
    constructor() {
        this.isLoading = true;
        this.modules = {};
        
        // 绑定方法上下文
        this.init = this.init.bind(this);
        this.showMainContent = this.showMainContent.bind(this);
        
        // 初始化
        this.init();
    }
    
    async init() {
        console.log('滨江馆系统初始化开始...');
        
        try {
            // 显示加载动画
            this.showLoadingScreen();
            
            // 初始化核心模块
            await this.initializeModules();
            
            // 完成加载，显示主内容
            setTimeout(() => {
                this.showMainContent();
                console.log('滨江馆系统初始化完成');
            }, 2000);
            
        } catch (error) {
            console.error('滨江馆初始化失败:', error);
            this.handleInitError(error);
        }
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }
    
    async initializeModules() {
        // 1. 初始化时空对比滑动
        const comparisonContainer = document.querySelector('.comparison-container');
        if (comparisonContainer) {
            this.modules.imageComparison = new ImageComparison(comparisonContainer);
        }
        
        // 2. 初始化时间轴动画
        const timelineContainer = document.querySelector('.timeline-container');
        if (timelineContainer) {
            this.modules.timeline = new TimelineAnimation(timelineContainer);
        }
        
        // 3. 设置导航功能
        this.setupNavigation();
        
        // 4. 初始化NFC处理
        this.initNFCHandler();
    }
    
    showMainContent() {
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
        
        this.isLoading = false;
        
        // 触发模块激活
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.activate === 'function') {
                module.activate();
            }
        });
    }
    
    setupNavigation() {
        // 返回国歌馆
        const prevBtn = document.getElementById('prev-hall-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                window.location.href = '../../02-anthem-hall/html/index.html';
            });
        }
        
        // 返回首页
        const homeBtn = document.getElementById('home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }
    }
    
    initNFCHandler() {
        // 集成NFC处理器
        if (typeof NFCHandler !== 'undefined') {
            this.nfcHandler = new NFCHandler({
                hallId: 'binjiang-hall',
                expectedChipId: 'binjiang-chip-001',
                onNFCDetected: (data) => {
                    console.log('滨江馆NFC芯片检测成功:', data);
                    this.handleNFCSuccess(data);
                },
                onError: (error) => {
                    console.error('滨江馆NFC处理错误:', error);
                    this.handleNFCError(error);
                }
            });
        }
        
        // 检查URL参数，支持直接访问
        this.checkDirectAccess();
        
        // 默认显示NFC访问成功状态
        this.showNFCSuccess();
    }
    
    checkDirectAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        const fromNFC = urlParams.get('nfc');
        const chipId = urlParams.get('chip');
        
        if (fromNFC === 'true' && chipId) {
            console.log('通过NFC直接访问滨江馆，芯片ID:', chipId);
            this.handleNFCSuccess({ chipId, timestamp: Date.now() });
        }
    }
    
    handleNFCSuccess(data) {
        // 记录访问数据
        this.recordVisit(data);
        
        // 显示成功状态
        this.showNFCSuccess();
        
        // 触发轻微的欢迎效果（无自动滚动）
        this.playWelcomeEffect();
    }
    
    handleNFCError(error) {
        console.warn('NFC处理失败，使用备用访问方式:', error);
        
        // 仍然允许用户访问
        const nfcStatus = document.getElementById('nfc-status');
        if (nfcStatus) {
            const title = nfcStatus.querySelector('.nfc-title');
            const text = nfcStatus.querySelector('.nfc-text');
            
            if (title) title.textContent = '欢迎访问滨江馆';
            if (text) text.textContent = '开始您的城市发展之旅';
        }
    }
    
    recordVisit(nfcData) {
        // 记录访问信息到本地存储
        const visitData = {
            hall: 'binjiang-hall',
            chipId: nfcData.chipId,
            timestamp: nfcData.timestamp || Date.now(),
            sessionId: this.generateSessionId()
        };
        
        try {
            let visitHistory = JSON.parse(localStorage.getItem('nfc-visit-history') || '[]');
            visitHistory.push(visitData);
            
            // 只保留最近20次访问记录
            if (visitHistory.length > 20) {
                visitHistory = visitHistory.slice(-20);
            }
            
            localStorage.setItem('nfc-visit-history', JSON.stringify(visitHistory));
            console.log('访问记录已保存:', visitData);
        } catch (error) {
            console.warn('无法保存访问记录:', error);
        }
    }
    
    generateSessionId() {
        return 'binjiang-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    playWelcomeEffect() {
        // 播放轻微的欢迎效果（不包括自动滚动）
        const header = document.querySelector('.hall-header');
        
        if (header) {
            header.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                header.style.transition = 'transform 0.3s ease';
                header.style.transform = 'translateY(0)';
            }, 100);
        }
    }
    
    showNFCSuccess() {
        const nfcStatus = document.getElementById('nfc-status');
        if (nfcStatus) {
            nfcStatus.style.display = 'flex';
            
            // 添加轻微的成功动画
            setTimeout(() => {
                nfcStatus.style.transform = 'scale(1.01)';
            }, 100);
            
            setTimeout(() => {
                nfcStatus.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    handleInitError(error) {
        console.error('初始化错误:', error);
        
        // 显示错误信息但仍然继续加载
        setTimeout(() => {
            this.showMainContent();
        }, 1500);
    }
    
    // 公共方法：获取模块实例
    getModule(name) {
        return this.modules[name];
    }
    
    // 公共方法：销毁实例
    destroy() {
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        this.modules = {};
        console.log('滨江馆系统已销毁');
    }
}

/**
 * 时空对比滑动组件
 * 实现历史与现代照片的左右滑动对比效果
 */
class ImageComparison {
    constructor(container) {
        if (!container) return;
        
        this.container = container;
        this.slider = container.querySelector('#comparison-range');
        this.beforeImage = container.querySelector('.before-image');
        this.afterImage = container.querySelector('.after-image');
        this.sliderHandle = container.querySelector('.slider-handle');
        this.sliderLine = container.querySelector('.slider-line');
        
        this.isDragging = false;
        this.currentValue = 50;
        
        this.init();
    }
    
    init() {
        if (!this.slider || !this.beforeImage) return;
        
        // 设置初始状态
        this.updateComparison(this.currentValue);
        
        // 绑定事件
        this.bindEvents();
        
        console.log('时空对比滑动组件初始化完成');
    }
    
    bindEvents() {
        // 滑块输入事件
        this.slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.updateComparison(value);
        });
        
        // 鼠标事件
        this.slider.addEventListener('mousedown', () => {
            this.isDragging = true;
        });
        
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // 触摸事件支持
        this.addTouchSupport();
        
        // 键盘支持
        this.slider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.updateComparison(Math.max(0, this.currentValue - 5));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.updateComparison(Math.min(100, this.currentValue + 5));
            }
        });
    }
    
    updateComparison(percentage) {
        this.currentValue = Math.max(0, Math.min(100, percentage));
        
        // 更新滑块值
        if (this.slider) {
            this.slider.value = this.currentValue;
        }
        
        // 更新图片裁剪
        if (this.beforeImage) {
            this.beforeImage.style.clipPath = `polygon(0 0, ${this.currentValue}% 0, ${this.currentValue}% 100%, 0 100%)`;
        }
        
        // 更新滑块手柄位置
        if (this.sliderHandle) {
            this.sliderHandle.style.left = `${this.currentValue}%`;
        }
        
        // 更新分割线位置
        if (this.sliderLine) {
            this.sliderLine.style.left = `${this.currentValue}%`;
        }
    }
    
    addTouchSupport() {
        let startX, currentX;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.isDragging = true;
            e.preventDefault();
        }, { passive: false });
        
        this.container.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            
            currentX = e.touches[0].clientX;
            const rect = this.container.getBoundingClientRect();
            const percentage = ((currentX - rect.left) / rect.width) * 100;
            
            this.updateComparison(percentage);
            e.preventDefault();
        }, { passive: false });
        
        this.container.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }
    
    activate() {
        // 激活时的动画效果
        if (this.container) {
            this.container.style.opacity = '1';
        }
    }
    
    destroy() {
        // 清理事件监听器
        if (this.slider) {
            this.slider.removeEventListener('input', this.updateComparison);
        }
        
        console.log('时空对比组件已销毁');
    }
}

/**
 * 时间轴动画系统
 * 展示杨浦滨江从工业遗存到现代地标的发展历程
 */
class TimelineAnimation {
    constructor(container) {
        if (!container) return;
        
        this.container = container;
        this.items = container.querySelectorAll('.timeline-item');
        this.playBtn = document.getElementById('play-timeline');
        this.resetBtn = document.getElementById('reset-timeline');
        
        this.currentIndex = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.animationDuration = 2500; // 每个节点停留时间
        
        this.init();
    }
    
    init() {
        this.bindControls();
        this.resetTimeline();
        
        console.log('时间轴动画系统初始化完成');
    }
    
    bindControls() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.pauseTimeline();
                } else {
                    this.playTimeline();
                }
            });
        }
        
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.resetTimeline();
            });
        }
        
        // 点击时间节点直接跳转
        this.items.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.jumpToTimelineItem(index);
            });
        });
    }
    
    playTimeline() {
        this.isPlaying = true;
        this.updatePlayButton();
        
        this.playInterval = setInterval(() => {
            this.activateTimelineItem(this.currentIndex);
            this.currentIndex++;
            
            if (this.currentIndex >= this.items.length) {
                this.pauseTimeline();
                // 播放完成后重置到第一项
                setTimeout(() => {
                    this.resetTimeline();
                }, 1000);
            }
        }, this.animationDuration);
    }
    
    pauseTimeline() {
        this.isPlaying = false;
        this.updatePlayButton();
        
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
    }
    
    resetTimeline() {
        this.pauseTimeline();
        this.currentIndex = 0;
        
        // 清除所有激活状态
        this.items.forEach(item => {
            item.classList.remove('active');
        });
        
        console.log('时间轴已重置');
    }
    
    jumpToTimelineItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.pauseTimeline();
            this.currentIndex = index;
            this.activateTimelineItem(index);
        }
    }
    
    activateTimelineItem(index) {
        // 移除所有活动状态
        this.items.forEach(item => {
            item.classList.remove('active');
        });
        
        // 激活当前项和之前的项（显示进度）
        for (let i = 0; i <= index && i < this.items.length; i++) {
            this.items[i].classList.add('active');
        }
        
        // 温和的滚动到当前项（不强制）
        if (this.items[index]) {
            this.items[index].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
        
        // 触发动画效果
        this.animateTimelineMarker(index);
    }
    
    animateTimelineMarker(index) {
        if (this.items[index]) {
            const marker = this.items[index].querySelector('.timeline-marker');
            if (marker) {
                // 轻微的脉冲动画
                marker.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    marker.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }
    
    updatePlayButton() {
        if (this.playBtn) {
            const icon = this.playBtn.querySelector('.btn-icon');
            const text = this.playBtn.querySelector('.btn-text');
            
            if (this.isPlaying) {
                if (icon) icon.textContent = '⏸';
                if (text) text.textContent = '暂停播放';
            } else {
                if (icon) icon.textContent = '▶';
                if (text) text.textContent = '播放时间轴';
            }
        }
    }
    
    activate() {
        console.log('时间轴动画系统已激活');
    }
    
    destroy() {
        this.pauseTimeline();
        
        if (this.playBtn) {
            this.playBtn.removeEventListener('click', this.playTimeline);
        }
        if (this.resetBtn) {
            this.resetBtn.removeEventListener('click', this.resetTimeline);
        }
        
        console.log('时间轴动画系统已销毁');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 创建全局实例
    window.binjiangHall = new BinjiangHall();
    
    // 错误处理
    window.addEventListener('error', (e) => {
        console.error('页面错误:', e.error);
    });
    
    // 防止意外的页面滚动
    window.addEventListener('scroll', (e) => {
        // 允许正常滚动，但不执行自动滚动逻辑
    });
    
    console.log('滨江馆页面加载完成');
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BinjiangHall,
        ImageComparison,
        TimelineAnimation
    };
}