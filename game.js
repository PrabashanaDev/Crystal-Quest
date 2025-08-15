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

// Drawing Functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Simple face
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 8, 4, 4); // Left eye
    ctx.fillRect(player.x + 15, player.y + 8, 4, 4); // Right eye
    
    // Direction indicator
    ctx.fillStyle = 'black';
    if (player.direction === 1) {
        ctx.fillRect(player.x + 20, player.y + 8, 2, 4);
    } else {
        ctx.fillRect(player.x + 8, player.y + 8, 2, 4);
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
    crystals.forEach(crystal => {
        if (!crystal.collected) {
            // Animated crystal
            const time = Date.now() * 0.005;
            const glow = Math.sin(time) * 0.3 + 0.7;
            
            ctx.save();
            ctx.translate(crystal.x + crystal.width/2, crystal.y + crystal.height/2);
            ctx.rotate(time);
            
            ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
            ctx.fillRect(-crystal.width/2, -crystal.height/2, crystal.width, crystal.height);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.8})`;
            ctx.fillRect(-crystal.width/4, -crystal.height/4, crystal.width/2, crystal.height/2);
            
            ctx.restore();
        }
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Simple enemy face
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 3, 3);
        ctx.fillRect(enemy.x + 15, enemy.y + 5, 3, 3);
    });
}

function drawBackground() {
    // Add some simple background elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 10; i++) {
        const x = (i * 100 + Date.now() * 0.01) % canvas.width;
        const y = 50 + Math.sin(Date.now() * 0.001 + i) * 20;
        ctx.fillRect(x, y, 3, 3);
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