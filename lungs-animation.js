export class LungsAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('LungsAnimation: Canvas not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationFrameId = null;
        
        // --- CONFIGURATION ---
        this.baseParticleCount = 200;
        this.healingLevel = 0; // 0 (not started) to 1 (fully healed)
        this.initialDarkness = 0.8; // 0.2 (light) to 1.0 (dark)
        this.particleColor = `rgba(50, 50, 50, ${this.initialDarkness})`;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.start();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.initParticles();
    }

    createParticle() {
        const size = Math.random() * 4 + 1;
        // Spawn in two oval areas representing lungs
        const side = Math.random() > 0.5 ? 1 : -1;
        const x = this.canvas.width / 2 + side * (this.canvas.width / 5 + (Math.random() - 0.5) * 60);
        const y = this.canvas.height / 2 + (Math.random() - 0.3) * (this.canvas.height / 3);

        return {
            x,
            y,
            size,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
        };
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.baseParticleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Adjust particle count based on healing level
        const currentParticleCount = this.baseParticleCount * (1 - this.healingLevel);
        
        this.particles.slice(0, Math.floor(currentParticleCount)).forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            // Simple boundary check
            if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
            
            this.drawParticle(p);
        });

        this.animationFrameId = requestAnimationFrame(() => this.update());
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.particleColor;
        this.ctx.fill();
    }

    setHealingLevel(level) {
        this.healingLevel = Math.max(0, Math.min(1, level));
    }
    
    setInitialDarkness(darkness) { // from 0.2 to 1.0
        this.initialDarkness = Math.max(0.2, Math.min(1.0, darkness));
        this.particleColor = `rgba(50, 50, 50, ${this.initialDarkness})`;
    }

    start() {
        this.initParticles();
        if (!this.animationFrameId) {
            this.update();
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}