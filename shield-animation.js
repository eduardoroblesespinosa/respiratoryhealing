export class ShieldAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
         if (!this.canvas) {
            console.error('ShieldAnimation: Canvas not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.animationFrameId = null;
        this.rings = [];
        this.startTime = 0;
        this.duration = 3000; // 3 seconds

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    start() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.rings = [];
        this.startTime = Date.now();
        
        // Create initial rings
        for(let i=0; i<3; i++){
            setTimeout(() => {
                this.rings.push({
                    created: Date.now(),
                    color: i % 2 === 0 ? 'rgba(255, 215, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)', // Gold and White
                    lineWidth: 2 + Math.random() * 2,
                });
            }, i * 300); // Stagger ring creation
        }
        
        this.animate();
    }

    animate() {
        const now = Date.now();
        const elapsedTime = now - this.startTime;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) * 1.1;

        this.rings.forEach(ring => {
            const ringAge = now - ring.created;
            const progress = ringAge / (this.duration * 0.8); // Rings expand over part of total duration
            
            if (progress < 1) {
                const currentRadius = maxRadius * progress;
                const alpha = 1 - progress;

                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = ring.color.replace(/, [0-9.]+\)/, `, ${alpha})`);
                this.ctx.lineWidth = ring.lineWidth;
                this.ctx.stroke();
            }
        });

        if (elapsedTime < this.duration) {
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        } else {
            this.stop();
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
         setTimeout(() => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }, 500);
    }
}