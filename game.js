// Game Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const storyScreen = document.getElementById('story');
const startButton = document.getElementById('startButton');

// Game State Variables
let gameState = 'story';
let score = 0;
let lives = 3;
let level = 1;
let crystalsCollected = 0;
const crystalsNeeded = 3;

// Player Configuration
const player = {
    x: 50,
    y: 400,
    width: 30,
    height: 40,
    velX: 0,
    velY: 0,
    speed: 5,
    jumpPower: 15,
    grounded: false,
    color: '#FF6B6B',
    direction: 1
};

// Level Design - Platforms
const platforms = [
    {x: 0, y: 550, width: 200, height: 50},
    {x: 250, y: 450, width: 150, height: 20},
    {x: 450, y: 350, width: 100, height: 20},
    {x: 600, y: 250, width: 200, height: 20},
    {x: 300, y: 200, width: 100, height: 20},
    {x: 0, y: 150, width: 150, height: 20},
    {x: 650, y: 450, width: 150, height: 20}
];

// Collectible Items - Crystals
let crystals = [
    {x: 320, y: 160, width: 20, height: 20, collected: false},
    {x: 470, y: 310, width: 20, height: 20, collected: false},
    {x: 680, y: 210, width: 20, height: 20, collected: false}
];

// Enemy Configuration
let enemies = [
    {x: 260, y: 420, width: 25, height: 25, velX: 2, direction: 1, color: '#8B0000'},
    {x: 610, y: 220, width: 25, height: 25, velX: 1.5, direction: 1, color: '#4B0082'},
    {x: 460, y: 320, width: 25, height: 25, velX: 1, direction: 1, color: '#006400'}
];

// Input Management
const keys = {};

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startButton.addEventListener('click', () => {
    gameState = 'playing';
    storyScreen.style.display = 'none';
    gameLoop();
});

// Game Functions
function updatePlayer() {
    // Handle input
    if (keys['ArrowLeft'] || keys['a']) {
        player.velX = -player.speed;
        player.direction = -1;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.velX = player.speed;
        player.direction = 1;
    } else {
        player.velX *= 0.8; // Friction
    }

    if ((keys[' '] || keys['ArrowUp'] || keys['w']) && player.grounded) {
        player.velY = -player.jumpPower;
        player.grounded = false;
    }

    // Apply gravity
    player.velY += 0.8;
    
    // Update position
    player.x += player.velX;
    player.y += player.velY;

    // Platform collision detection
    player.grounded = false;
    for (let platform of platforms) {
        if (isColliding(player, platform)) {
            if (player.velY > 0) { // Falling
                player.y = platform.y - player.height;
                player.velY = 0;
                player.grounded = true;
            }
        }
    }

    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Fall off screen
    if (player.y > canvas.height) {
        lives--;
        resetPlayer();
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.velX * enemy.direction;
        
        // Bounce off platform edges or screen boundaries
        let onPlatform = false;
        for (let platform of platforms) {
            if (enemy.x > platform.x - enemy.width && 
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y - 5 &&
                enemy.y + enemy.height <= platform.y + 5) {
                onPlatform = true;
                break;
            }
        }
        
        if (!onPlatform || enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            enemy.direction *= -1;
        }

        // Check collision with player
        if (isColliding(player, enemy)) {
            lives--;
            resetPlayer();
        }
    });
}

function updateCrystals() {
    crystals.forEach(crystal => {
        if (!crystal.collected && isColliding(player, crystal)) {
            crystal.collected = true;
            crystalsCollected++;
            score += 100;
            
            if (crystalsCollected >= crystalsNeeded) {
                nextLevel();
            }
        }
    });
}

function resetPlayer() {
    player.x = 50;
    player.y = 400;
    player.velX = 0;
    player.velY = 0;
    
    if (lives <= 0) {
        gameState = 'gameover';
    }
}

function nextLevel() {
    level++;
    crystalsCollected = 0;
    score += 500;
    
    // Reset crystals
    crystals.forEach(crystal => crystal.collected = false);
    
    // Make enemies faster
    enemies.forEach(enemy => {
        enemy.velX *= 1.2;
    });
    
    resetPlayer();
}

// Collision Detection Helper
function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Enhanced Drawing Functions
function drawPlayer() {
    const time = Date.now() * 0.01;
    const bounce = Math.abs(Math.sin(time)) * 2;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(player.x + player.width/2, player.y + player.height + 2, player.width/2, 5, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Main body (gradient)
    const gradient = ctx.createLinearGradient(player.x, player.y, player.x, player.y + player.height);
    gradient.addColorStop(0, '#FF8E8E');
    gradient.addColorStop(0.5, '#FF6B6B');
    gradient.addColorStop(1, '#E55555');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(player.x + 2, player.y + 8, player.width - 4, player.height - 8);
    
    // Head (circular)
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + 12, 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFB366';
    ctx.fill();
    
    // Hair
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + 8, 10, Math.PI, 2 * Math.PI);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 10, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 20, player.y + 10, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eye pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + 10 + (player.direction * 1), player.y + 10, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 20 + (player.direction * 1), player.y + 10, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Nose
    ctx.fillStyle = '#E6A366';
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + 13, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mouth (happy expression)
    ctx.strokeStyle = '#D4941E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + player.width/2, player.y + 14, 3, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Arms (animated)
    ctx.strokeStyle = '#FFB366';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    const armSwing = Math.sin(time * 0.5) * 0.3;
    
    // Left arm
    ctx.beginPath();
    ctx.moveTo(player.x + 5, player.y + 20);
    ctx.lineTo(player.x - 2 + Math.cos(armSwing) * 8, player.y + 25 + Math.sin(armSwing) * 5);
    ctx.stroke();
    
    // Right arm
    ctx.beginPath();
    ctx.moveTo(player.x + 25, player.y + 20);
    ctx.lineTo(player.x + 32 + Math.cos(-armSwing) * 8, player.y + 25 + Math.sin(-armSwing) * 5);
    ctx.stroke();
    
    // Legs (animated walking)
    if (Math.abs(player.velX) > 0.1) {
        const legSwing = Math.sin(time * 0.8) * 0.5;
        
        // Left leg
        ctx.beginPath();
        ctx.moveTo(player.x + 10, player.y + 35);
        ctx.lineTo(player.x + 8 + Math.cos(legSwing) * 6, player.y + 42 + Math.sin(Math.abs(legSwing)) * 3);
        ctx.stroke();
        
        // Right leg
        ctx.beginPath();
        ctx.moveTo(player.x + 20, player.y + 35);
        ctx.lineTo(player.x + 22 + Math.cos(-legSwing) * 6, player.y + 42 + Math.sin(Math.abs(legSwing)) * 3);
        ctx.stroke();
    } else {
        // Standing legs
        ctx.beginPath();
        ctx.moveTo(player.x + 10, player.y + 35);
        ctx.lineTo(player.x + 8, player.y + 42);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(player.x + 20, player.y + 35);
        ctx.lineTo(player.x + 22, player.y + 42);
        ctx.stroke();
    }
    
    // Cape (hero effect)
    if (Math.abs(player.velX) > 2) {
        ctx.fillStyle = 'rgba(30, 144, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(player.x + player.width/2, player.y + 18);
        ctx.lineTo(player.x + player.width/2 - (player.direction * 15), player.y + 15);
        ctx.lineTo(player.x + player.width/2 - (player.direction * 20), player.y + 30);
        ctx.lineTo(player.x + player.width/2, player.y + 35);
        ctx.closePath();
        ctx.fill();
    }
}

function drawPlatforms() {
    ctx.fillStyle = '#8B4513';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Add grass texture
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(platform.x, platform.y, platform.width, 5);
        ctx.fillStyle = '#8B4513';
    });
}

function drawCrystals() {
    const time = Date.now() * 0.005;
    
    crystals.forEach((crystal, index) => {
        if (!crystal.collected) {
            const crystalTime = time + index * 2;
            const glow = Math.sin(crystalTime) * 0.3 + 0.7;
            const float = Math.sin(crystalTime * 2) * 3;
            
            ctx.save();
            ctx.translate(crystal.x + crystal.width/2, crystal.y + crystal.height/2 + float);
            
            // Outer glow
            ctx.fillStyle = `rgba(255, 215, 0, ${glow * 0.3})`;
            ctx.beginPath();
            ctx.arc(0, 0, crystal.width * 1.5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Crystal rotation
            ctx.rotate(crystalTime * 0.8);
            
            // Main crystal (diamond shape)
            ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
            ctx.beginPath();
            ctx.moveTo(0, -crystal.height/2);
            ctx.lineTo(crystal.width/2, 0);
            ctx.lineTo(0, crystal.height/2);
            ctx.lineTo(-crystal.width/2, 0);
            ctx.closePath();
            ctx.fill();
            
            // Inner shine
            ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(0, -crystal.height/4);
            ctx.lineTo(crystal.width/4, 0);
            ctx.lineTo(0, crystal.height/4);
            ctx.lineTo(-crystal.width/4, 0);
            ctx.closePath();
            ctx.fill();
            
            // Center sparkle
            ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
            ctx.beginPath();
            ctx.arc(0, 0, 2, 0, 2 * Math.PI);
            ctx.fill();
            
            // Sparkle effects around crystal
            for (let i = 0; i < 4; i++) {
                const sparkleAngle = (i / 4) * Math.PI * 2 + crystalTime;
                const sparkleDistance = 15 + Math.sin(crystalTime * 2 + i) * 5;
                const sparkleX = Math.cos(sparkleAngle) * sparkleDistance;
                const sparkleY = Math.sin(sparkleAngle) * sparkleDistance;
                const sparkleAlpha = Math.sin(crystalTime * 3 + i) * 0.3 + 0.4;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 1.5, 0, 2 * Math.PI);
                ctx.fill();
            }
            
            ctx.restore();
        }
    });
}

function drawEnemies() {
    const time = Date.now() * 0.008;
    
    enemies.forEach((enemy, index) => {
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.x + enemy.width/2, enemy.y + enemy.height + 2, enemy.width/2, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        const enemyTime = time + index * 2;
        const hover = Math.sin(enemyTime * 2) * 1.5;
        
        if (enemy.color === '#8B0000') {
            // Red Enemy - Spiky Monster
            drawSpikyEnemy(enemy, enemyTime, hover);
        } else if (enemy.color === '#4B0082') {
            // Purple Enemy - Ghost-like
            drawGhostEnemy(enemy, enemyTime, hover);
        } else {
            // Green Enemy - Blob creature
            drawBlobEnemy(enemy, enemyTime, hover);
        }
    });
}

function drawSpikyEnemy(enemy, time, hover) {
    const y = enemy.y + hover;
    
    // Main body
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/2, y + enemy.height/2, enemy.width/2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Spikes
    ctx.fillStyle = '#FF0000';
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.5;
        const spikeX = enemy.x + enemy.width/2 + Math.cos(angle) * (enemy.width/2 + 3);
        const spikeY = y + enemy.height/2 + Math.sin(angle) * (enemy.height/2 + 3);
        
        ctx.beginPath();
        ctx.arc(spikeX, spikeY, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Angry eyes
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(enemy.x + 8, y + 8, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + 17, y + 8, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Angry eyebrows
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(enemy.x + 6, y + 6);
    ctx.lineTo(enemy.x + 10, y + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(enemy.x + 19, y + 6);
    ctx.lineTo(enemy.x + 15, y + 8);
    ctx.stroke();
}

function drawGhostEnemy(enemy, time, hover) {
    const y = enemy.y + hover;
    
    // Ghost body with transparency
    ctx.fillStyle = 'rgba(75, 0, 130, 0.8)';
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/2, y + 8, 12, Math.PI, 0);
    ctx.fill();
    
    // Ghost tail (wavy)
    ctx.fillStyle = 'rgba(75, 0, 130, 0.6)';
    for (let i = 0; i < 5; i++) {
        const waveX = enemy.x + 5 + i * 4;
        const waveY = y + 16 + Math.sin(time * 2 + i) * 3;
        ctx.beginPath();
        ctx.arc(waveX, waveY, 3, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Glowing eyes
    const eyeGlow = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 100, 255, ${eyeGlow})`;
    ctx.beginPath();
    ctx.arc(enemy.x + 8, y + 8, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + 17, y + 8, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Glow effect around ghost
    ctx.fillStyle = `rgba(147, 0, 211, ${eyeGlow * 0.3})`;
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/2, y + enemy.height/2, enemy.width, 0, 2 * Math.PI);
    ctx.fill();
}

function drawBlobEnemy(enemy, time, hover) {
    const y = enemy.y + hover;
    const squish = 1 + Math.sin(time * 3) * 0.1;
    
    // Blob body (squishing animation)
    ctx.fillStyle = '#006400';
    ctx.save();
    ctx.scale(squish, 1 / squish);
    ctx.beginPath();
    ctx.ellipse((enemy.x + enemy.width/2) / squish, y + enemy.height/2, enemy.width/2, enemy.height/2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // Blob shine
    ctx.fillStyle = 'rgba(144, 238, 144, 0.6)';
    ctx.beginPath();
    ctx.ellipse(enemy.x + 8, y + 6, 4, 6, 0.2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Simple eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(enemy.x + 7, y + 8, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(enemy.x + 18, y + 8, 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Cute mouth
    ctx.strokeStyle = 'darkgreen';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/2, y + 15, 3, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();
}

function drawBackground() {
    const time = Date.now() * 0.001;
    
    // Floating particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 15; i++) {
        const x = (i * 80 + time * 20 + Math.sin(time + i) * 30) % (canvas.width + 50);
        const y = 30 + Math.sin(time * 0.5 + i * 0.8) * 40;
        const size = 2 + Math.sin(time * 2 + i) * 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Background clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 3; i++) {
        const cloudX = (i * 300 + time * 10) % (canvas.width + 100) - 50;
        const cloudY = 80 + i * 30;
        
        // Simple cloud shape
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 20, 0, 2 * Math.PI);
        ctx.arc(cloudX + 25, cloudY, 25, 0, 2 * Math.PI);
        ctx.arc(cloudX + 50, cloudY, 20, 0, 2 * Math.PI);
        ctx.arc(cloudX + 25, cloudY - 15, 15, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Twinkling stars
    ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
    for (let i = 0; i < 8; i++) {
        const starX = (i * 120 + 50) % canvas.width;
        const starY = 20 + Math.sin(time * 2 + i) * 10;
        const twinkle = Math.sin(time * 4 + i) * 0.5 + 0.5;
        
        ctx.save();
        ctx.globalAlpha = twinkle;
        ctx.translate(starX, starY);
        ctx.rotate(time + i);
        
        // Star shape
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(1, -1);
        ctx.lineTo(4, 0);
        ctx.lineTo(1, 1);
        ctx.lineTo(0, 4);
        ctx.lineTo(-1, 1);
        ctx.lineTo(-4, 0);
        ctx.lineTo(-1, -1);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
    document.getElementById('crystals').textContent = crystalsCollected;
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 50);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Refresh to play again', canvas.width/2, canvas.height/2 + 60);
    
    ctx.textAlign = 'start';
}

// Main Game Loop
function gameLoop() {
    if (gameState !== 'playing' && gameState !== 'gameover') return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === 'playing') {
        // Update game state
        updatePlayer();
        updateEnemies();
        updateCrystals();
        
        // Draw everything
        drawBackground();
        drawPlatforms();
        drawCrystals();
        drawEnemies();
        drawPlayer();
        updateUI();
    } else if (gameState === 'gameover') {
        drawGameOver();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Crystal Quest loaded successfully!');
});