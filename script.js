const game = document.getElementById('game');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const health1 = document.getElementById('health1');
const health2 = document.getElementById('health2');
const ultimate1 = document.getElementById('ultimate1');
const ultimate2 = document.getElementById('ultimate2');

let player1Health = 10;
let player2Health = 10;
let player1Ultimate = 0;
let player2Ultimate = 0;
let player1Paralyzed = false;
let player1UltimateActive = false;
let player2UltimateActive = false;

const playerSpeed = 10;
const ultimateChargeSpeed = 100;
const ultimateFullCharge = 100;
const paralysisDuration = 3000;  // 3 seconds

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
                launchUltimateBall(player2, 'left');
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
            rect.style.left = currentLeft + 5 + 'px';

            // Checar colisão com parede ou player2
            if (currentLeft > gameRect.width) {
                clearInterval(moveInterval);
                rect.remove();
                player1UltimateActive = false;
            } else {
                checkCollision(rect, player1, player2, true);
                if (player2UltimateActive) {
                    clearInterval(moveInterval);
                    rect.remove();
                    player1UltimateActive = false;
                }
            }
        }, 20);

    }, 500);
}

function launchUltimateBall(player, direction) {
    const ball = document.createElement('div');
    ball.classList.add('ball', 'purple', 'ultimate');
    game.appendChild(ball);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    if (direction === 'right') {
        ball.style.left = playerRect.right - gameRect.left + 'px';
    } else {
        ball.style.left = playerRect.left - gameRect.left - 10 + 'px';
    }
    ball.style.top = playerRect.top - gameRect.top + (playerRect.height / 2 - 5) + 'px';

    setTimeout(() => {
        checkCollision(ball, player1, player2, true);
        ball.remove();
        player2UltimateActive = false;
    }, 1000);
}

function checkCollision(ball, player1, player2, isUltimate) {
    const ballRect = ball.getBoundingClientRect();
    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();

    if (isColliding(ballRect, player1Rect)) {
        const damage = isUltimate ? 5 : 1;
        updateHealth(health1, player1Health -= damage);
        ball.remove();
    } else if (isColliding(ballRect, player2Rect)) {
        const damage = isUltimate ? 7 : 1;
        updateHealth(health2, player2Health -= damage);
        ball.remove();
    }
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function updateHealth(healthElement, health) {
    healthElement.style.width = (health * 10) + '%';
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

function activateUltimate2() {
    player1Paralyzed = true;
    setTimeout(() => {
        player1Paralyzed = false;
    }, paralysisDuration);
}

function meleeAttack(attacker, defender, isUltimate) {
    const attackerRect = attacker.getBoundingClientRect();
    const defenderRect = defender.getBoundingClientRect();

    if (isColliding(attackerRect, defenderRect)) {
        const damage = isUltimate ? 5 : 2;
        if (attacker === player1) {
            updateHealth(health2, player2Health -= damage);
        } else {
            updateHealth(health1, player1Health -= damage);
        }
    }
}

function resetGame() {
    player1Health = 10;
    player2Health = 10;
    health1.style.width = '100%';
    health2.style.width = '100%';
    player1Ultimate = 0;
    player2Ultimate = 0;
    ultimate1.style.width = '0%';
    ultimate2.style.width = '0%';
    player1.style.left = '50px';
    player1.style.bottom = '50px';
    player2.style.right = '50px';
    player2.style.bottom = '50px';
}

// Carregar a barra de ultimate a cada segundo
setInterval(chargeUltimate, 1000);