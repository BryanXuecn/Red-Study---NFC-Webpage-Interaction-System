/**
 * 通用音频播放器组件
 * 为各个展馆提供音频播放功能支持
 */

class AudioPlayer {
    constructor(audioElement, options = {}) {
        this.audio = audioElement;
        this.options = {
            autoplay: false,
            loop: false,
            volume: 0.7,
            showControls: true,
            enableVisualization: false,
            ...options
        };
        
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = this.options.volume;
        
        this.callbacks = {
            onPlay: null,
            onPause: null,
            onTimeUpdate: null,
            onEnded: null,
            onError: null
        };
        
        this.init();
    }
    
    init() {
        if (!this.audio) {
            console.error('Audio element not provided');
            return;
        }
        
        this.bindEvents();
        this.audio.volume = this.volume;
        
        if (this.options.loop) {
            this.audio.loop = true;
        }
    }
    
    bindEvents() {
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration;
        });
        
        this.audio.addEventListener('timeupdate', () => {
            this.currentTime = this.audio.currentTime;
            if (this.callbacks.onTimeUpdate) {
                this.callbacks.onTimeUpdate(this.currentTime, this.duration);
            }
        });
        
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            if (this.callbacks.onPlay) {
                this.callbacks.onPlay();
            }
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            if (this.callbacks.onPause) {
                this.callbacks.onPause();
            }
        });
        
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            if (this.callbacks.onEnded) {
                this.callbacks.onEnded();
            }
        });
        
        this.audio.addEventListener('error', (error) => {
            console.error('Audio error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError(error);
            }
        });
    }
    
    play() {
        return this.audio.play();
    }
    
    pause() {
        this.audio.pause();
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            return this.play();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.volume;
    }
    
    setCurrentTime(time) {
        if (this.duration > 0) {
            this.audio.currentTime = Math.max(0, Math.min(this.duration, time));
        }
    }
    
    setCallbacks(callbacks) {
        Object.assign(this.callbacks, callbacks);
    }
    
    getState() {
        return {
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            duration: this.duration,
            volume: this.volume
        };
    }
    
    destroy() {
        this.pause();
        // Remove event listeners if needed
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioPlayer;
} else {
    window.AudioPlayer = AudioPlayer;
}