export class TextTransmute {
    constructor(canvasId, textareaId) {
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.textarea = document.getElementById(textareaId);
        this.particles = [];
        this.animationFrameId = null;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    dissolve() {
        if (!this.textarea || this.textarea.value.trim() === '') return;
        
        this.textarea.classList.add('dissolving');
        
        this.initParticles();
        this.animate();

        setTimeout(() => {
            this.textarea.value = '';
            this.textarea.classList.remove('dissolving');
        }, 2000);
    }

    initParticles() {
        this.particles = [];
        const particleCount = 200;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedY: -Math.random() * 1 - 0.5, // Move upwards
                alpha: 1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            p.y += p.speedY;
            p.alpha -= 0.01;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 215, 0, ${p.alpha})`; // Luminous gold particles
            this.ctx.fill();
        });

        this.particles = this.particles.filter(p => p.alpha > 0);

        if (this.particles.length > 0) {
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}