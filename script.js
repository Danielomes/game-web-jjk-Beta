const game = document.getElementById('game');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const health1 = document.getElementById('health1').querySelector('.health');
const lostHealth1 = document.getElementById('health1').querySelector('.lost-health');
const health2 = document.getElementById('health2').querySelector('.health');
const lostHealth2 = document.getElementById('health2').querySelector('.lost-health');
const ultimate1 = document.getElementById('ultimate1').querySelector('.ultimate');
const ultimate2 = document.getElementById('ultimate2').querySelector('.ultimate');


let player1Health = 10;
let player2Health = 10;
let player1Ultimate = 0;
let player2Ultimate = 0;
let player1Paralyzed = false;
let player1UltimateActive = false;
let player2UltimateActive = false;
let backgroundColorChanged = false;


const playerSpeed = 15;
const ultimateChargeSpeed = 100;
const ultimateFullCharge = 100;
const paralysisDuration = 6000;  // 6 seconds

document.addEventListener('keydown', (event) => {
    if (player1Paralyzed && ['w', 'a', 's', 'd'].includes(event.key)) return;

    switch(event.key) {
        // Controles do Jogador 1 (WASD)
        case 'w':
            movePlayer(player1, 0, -playerSpeed);
            break;
        case 'a':
            movePlayer(player1, -playerSpeed, 0);
            break;
        case 's':
            movePlayer(player1, 0, playerSpeed);
            break;
        case 'd':
            movePlayer(player1, playerSpeed, 0);
            break;
        // Controles do Jogador 2 (Setas direcionais)
        case 'ArrowUp':
            movePlayer(player2, 0, -playerSpeed);
            break;
        case 'ArrowLeft':
            movePlayer(player2, -playerSpeed, 0);
            break;
        case 'ArrowDown':
            movePlayer(player2, 0, playerSpeed);
            break;
        case 'ArrowRight':
            movePlayer(player2, playerSpeed, 0);
            break;
        // Lançar bola
        case 'q':
            if (player1UltimateActive) {
                launchUltimateRectangle(player1, 'right');
            } else {
                shootBall(player1, 'right', false);
            }
            break;
        case 'm':
            if (player2UltimateActive) {
                launchPurpleProjectile(player2, 'left'); // Lançar projétil roxo
            } else {
                shootBall(player2, 'left', false);
            }
            break;
        // Ultimate
        case 'e':
            if (player1Ultimate === ultimateFullCharge) {
                player1UltimateActive = true;
                player1Ultimate = 0;
                updateUltimate(ultimate1, player1Ultimate);
            }
            break;
        case 'n':
            if (player2Ultimate === ultimateFullCharge) {
                player2UltimateActive = true;
                player2Ultimate = 0;
                updateUltimate(ultimate2, player2Ultimate);
            }
            break;
        // Habilidade corpo a corpo
        case 'r':
            meleeAttack(player1, player2, false);
            break;
        case ',':
            meleeAttack(player2, player1, false);
            break;
        // Habilidade especial de mudança de fundo
        case 't':
            if (!backgroundColorChanged && player1UltimateActive) {
                changeBackgroundImage('https://wallpapercave.com/wp/wp10302006.png', 'Ultimate de Player 1 Ativada!');
                dealGuaranteedDamage(player2, 5);
                player1UltimateActive = false;
                
            }
            break;
        case 'b':
            if (!backgroundColorChanged && player2UltimateActive) {
                changeBackgroundImage('https://i.pinimg.com/736x/25/1f/49/251f49b9061e3ef0b3a862135258f151.jpg', 'Ultimate de Player 2 Ativada!');
                paralyzePlayer(player1, paralysisDuration);
                player2UltimateActive = false;
            } else if (!player2UltimateActive) {
                launchMine(player2, 'left');
            }
            break;
    }
});




function movePlayer(player, dx, dy) {
    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    let newLeft = playerRect.left - gameRect.left + dx;
    let newTop = playerRect.top - gameRect.top + dy;

    // Garantir que o jogador não saia da área do jogo
    if (newLeft < 0) newLeft = 0;
    if (newLeft + playerRect.width > gameRect.width) newLeft = gameRect.width - playerRect.width;
    if (newTop < 0) newTop = 0;
    if (newTop + playerRect.height > gameRect.height) newTop = gameRect.height - playerRect.height;

    player.style.left = newLeft + 'px';
    player.style.top = newTop + 'px';
}

function shootBall(player, direction, isUltimate) {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    if (isUltimate) {
        ball.classList.add('ultimate');
    }
    game.appendChild(ball);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    if (direction === 'right') {
        ball.style.left = playerRect.right - gameRect.left + 'px';
    } else {
        ball.style.left = playerRect.left - gameRect.left - 10 + 'px';
    }
    ball.style.top = playerRect.top - gameRect.top + (playerRect.height / 2 - 5) + 'px';

    let moveInterval = setInterval(() => {
        let currentLeft = parseInt(ball.style.left);

        if (direction === 'right') {
            ball.style.left = currentLeft + 5 + 'px';
        } else {
            ball.style.left = currentLeft - 5 + 'px';
        }

        // Checar colisão com os jogadores
        checkCollision(ball, player1, player2, isUltimate);

        if (currentLeft > gameRect.width || currentLeft < 0) {
            clearInterval(moveInterval);
            ball.remove();
        }
    }, 20);
}
function launchMine(player, direction) {
    const mine = document.createElement('div');
    mine.classList.add('mine');
    game.appendChild(mine);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();
    const randomDistance = Math.floor(Math.random() * (300 - 23 + 1)) + 23;

    if (direction === 'left') {
        mine.style.left = playerRect.left - gameRect.left - randomDistance + 'px';
    } else {
        mine.style.left = playerRect.right - gameRect.left + randomDistance + 'px';
    }

    mine.style.top = playerRect.top - gameRect.top + (playerRect.height / 2 - 10) + 'px';

    checkMineCollision(mine);
}

function checkMineCollision(mine) {
    let collisionInterval = setInterval(() => {
        const mineRect = mine.getBoundingClientRect();
        const player1Rect = player1.getBoundingClientRect();
        const player2Rect = player2.getBoundingClientRect();
        const purpleProjectileRect = purpleProjectile ? purpleProjectile.getBoundingClientRect() : null;

        if (isColliding(mineRect, player1Rect)) {
            player1Health -= 3;
            updateHealth(health1, lostHealth1, player1Health);
            mine.remove();
            clearInterval(collisionInterval);
        } else if (isColliding(mineRect, player2Rect)) {
            player2Health -= 3;
            updateHealth(health2, lostHealth2, player2Health);
            mine.remove();
            clearInterval(collisionInterval);
        } else if (purpleProjectileRect && isColliding(mineRect, purpleProjectileRect)) {
            causeFullMapExplosion();
            mine.remove();
            purpleProjectile.remove();
            clearInterval(collisionInterval);
        }
    }, 100);
}

function causeFullMapExplosion() {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    game.appendChild(explosion);

    player1Health -= 7;
    player2Health -= 7;

    updateHealth(health1, lostHealth1, player1Health);
    updateHealth(health2, lostHealth2, player2Health);

    setTimeout(() => {
        explosion.remove();
    }, 500); // Remove explosão após 0,5 segundos
}

function launchUltimateRectangle(player, direction) {
    const rect = document.createElement('div');
    rect.classList.add('rect', 'ultimate');
    game.appendChild(rect);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    rect.style.left = playerRect.right - gameRect.left + 'px';
    rect.style.top = playerRect.top - gameRect.top + 'px';

    setTimeout(() => {
        rect.style.transition = 'width 0.5s ease-out, height 0.5s ease-out';
        rect.style.width = '50px';
        rect.style.height = '50px';

        let moveInterval = setInterval(() => {
            let currentLeft = parseInt(rect.style.left);
            rect.style.left = direction === 'right' ? currentLeft + 5 + 'px' : currentLeft - 5 + 'px';

            // Checar colisão com parede ou outro jogador
            if (currentLeft > gameRect.width || currentLeft < 0) {
                clearInterval(moveInterval);
                rect.remove();
                if (player === player1) player1UltimateActive = false;
                if (player === player2) player2UltimateActive = false;
            } else {
                checkCollision(rect, player1, player2, true);
            }
        }, 20);
    }, 500);
}

function launchPurpleProjectile(player, direction) {
    purpleProjectile = document.createElement('div');
    purpleProjectile.classList.add('purple-projectile');
    game.appendChild(purpleProjectile);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    purpleProjectile.style.left = playerRect.left - gameRect.left - 32 + 'px';
    purpleProjectile.style.top = playerRect.top - gameRect.top + (playerRect.height / 2) + 'px';

    const interval = setInterval(() => {
        const currentLeft = parseInt(purpleProjectile.style.left);

        if (direction === 'left') {
            purpleProjectile.style.left = (currentLeft - 10) + 'px';
        } else {
            purpleProjectile.style.left = (currentLeft + 10) + 'px';
        }

        const purpleProjectileRect = purpleProjectile.getBoundingClientRect();
        const gameRect = game.getBoundingClientRect();

        if (purpleProjectileRect.right < gameRect.left || purpleProjectileRect.left > gameRect.right) {
            purpleProjectile.remove();
            clearInterval(interval);
        } else {
            if (checkCollision(purpleProjectile, player1, player2, true)) {
                clearInterval(interval);
            }
        }
    }, 50);
}

function checkCollision(projectile, player1, player2, isUltimate) {
    const projectileRect = projectile.getBoundingClientRect();
    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();

    if (isColliding(projectileRect, player1Rect)) {
        const damage = isUltimate ? 5 : 1;
        player1Health -= damage;
        updateHealth(health1, lostHealth1, player1Health);
        projectile.remove();
        return true; // Collision detected
    } else if (isColliding(projectileRect, player2Rect)) {
        const damage = isUltimate ? 7 : 1;
        player2Health -= damage;
        updateHealth(health2, lostHealth2, player2Health);
        projectile.remove();
        return true; // Collision detected
    }
    return false; // No collision
}

function isColliding(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

function updateHealth(healthElement, lostHealthElement, health) {
    healthElement.style.width = (health * 10) + '%';
    lostHealthElement.style.width = ((10 - health) * 10) + '%';
    if (health <= 0) {
        alert('Game Over');
        // Reiniciar o jogo
        resetGame();
    }
}

function updateUltimate(ultimateElement, ultimateCharge) {
    ultimateElement.style.width = ultimateCharge + '%';
}

function chargeUltimate() {
    if (player1Ultimate < ultimateFullCharge) {
        player1Ultimate += ultimateChargeSpeed;
        updateUltimate(ultimate1, player1Ultimate);
    }
    if (player2Ultimate < ultimateFullCharge) {
        player2Ultimate += ultimateChargeSpeed;
        updateUltimate(ultimate2, player2Ultimate);
    }
}

function paralyzePlayer(player, duration) {
    if (player === player1) {
        player1Paralyzed = true;
        setTimeout(() => {
            player1Paralyzed = false;
        }, duration);
    }
}

function dealGuaranteedDamage(player, damage) {
    if (player === player2) {
        player2Health -= damage;
        updateHealth(health2, lostHealth2, player2Health);
    }
}

function changeBackgroundImage(imageUrl) {
    if (backgroundColorChanged) return;

    let originalBackgroundImage = window.getComputedStyle(game).backgroundImage;
    game.style.backgroundImage = `url(${imageUrl})`;
    backgroundColorChanged = true;

    setTimeout(() => {
        game.style.backgroundImage = originalBackgroundImage;
        backgroundColorChanged = false;
    }, 5000);
}
function meleeAttack(attacker, defender, isUltimate) {
    const attackerRect = attacker.getBoundingClientRect();
    const defenderRect = defender.getBoundingClientRect();

    if (isColliding(attackerRect, defenderRect)) {
        const damage = isUltimate ? 7 : 2; // Aumente o dano durante a ultimate
        if (defender === player1) {
            updateHealth(health1, lostHealth1, player1Health -= damage);
        } else {
            updateHealth(health2, lostHealth2, player2Health -= damage);
        }
    }
}

function resetGame() {
    player1Health = 10;
    player2Health = 10;
    player1Ultimate = 0;
    player2Ultimate = 0;
    player1Paralyzed = false;
    player1UltimateActive = false;
    player2UltimateActive = false;
    backgroundColorChanged = false;
    updateHealth(health1, lostHealth1, player1Health);
    updateHealth(health2, lostHealth2, player2Health);
    updateUltimate(ultimate1, player1Ultimate);
    updateUltimate(ultimate2, player2Ultimate);
    player1.style.left = '100px';
    player1.style.bottom = '50px';
    player2.style.right = '100px';
    player2.style.bottom = '50px';
}

setInterval(chargeUltimate, 1000);
