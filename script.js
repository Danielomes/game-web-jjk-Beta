const game = document.getElementById('game');
const player1 = document.getElementById('player1');
const player2 = document.getElementById('player2');
const health1 = document.getElementById('health1').querySelector('.health');
const lostHealth1 = document.getElementById('health1').querySelector('.lost-health');
const health2 = document.getElementById('health2').querySelector('.health');
const lostHealth2 = document.getElementById('health2').querySelector('.lost-health');
const ultimate1 = document.getElementById('ultimate1').querySelector('.ultimate');
const ultimate2 = document.getElementById('ultimate2').querySelector('.ultimate');
const specialElement = document.getElementById('special2').querySelector('.special');

let pachinko = 0;
let player1Health = 10;
let player2Health = 10;
let player1Ultimate = 0;
let player2Ultimate = 0;
let player1Paralyzed = false;
let player1UltimateActive = false;
let player2UltimateActive = false;
let backgroundColorChanged = false;

const pachinkoFullCharge = 20;
const pachinkoChargeSpeed = 1;
const playerSpeed = 15;
const ultimateChargeSpeed = 1;
const ultimateFullCharge = 100;
const paralysisDuration = 6000; // 6 seconds
const portas = 1000;

const cooldownDurations = {
    'q': 1000, // Lançar bola para Player 1
    'm': 1500, // Lançar bola para Player 2
    'e': 3000, // Ultimate para Player 1
    'n': 3000, // Ultimate para Player 2
    'r': 2000, // Habilidade corpo a corpo Player 1
    ',': 2000, // Habilidade corpo a corpo Player 2
    't': 5000, // Mudança de fundo ou barra horizontal Player 1
    'b': 5000,  // Mudança de fundo ou mina Player 2
    '7': 2000, // Nova tecla 7
    '8': 1000, // Nova tecla 8
    '4': 1000, // Lançar bola para Player 1
    'h': 1500
};

// Cooldown status
const cooldownStatus = {
    'q': false,
    'm': false,
    'e': false,
    'n': false,
    'r': false,
    ',': false,
    't': false,
    'b': false,
    '7': false,
    '8': false,
    'h': false
};

// Estado inicial: todas as teclas desativadas
let allowedKeys = {};

// Função para exibir uma mensagem na tela
function showMessage(message) {
    const existingMessage = document.querySelector('.game-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    const messageElement = document.createElement('h1');
    messageElement.classList.add('game-message');
    messageElement.innerText = message;
    game.appendChild(messageElement);
    setTimeout(() => {
        messageElement.remove();
    }, 7000); // Remover mensagem após 7 segundos
}

let keysPressed = {};
let dashEnabled = false; // Flag to control dash availability

// Função para ativar teclas permitidas
function enableKeys(keys) {
    keys.forEach(key => {
        allowedKeys[key] = true;
    });
}


// Lista de personagens selecionados
let selectedCharacters = [];



// Função para selecionar um personagem
function selectCharacter(character, keys) {
    if (selectedCharacters.includes(character)) return;
    if (selectedCharacters.length >= 2) return;

    enableKeys(keys);
    selectedCharacters.push(character);

    if (selectedCharacters.includes('sukuna') && selectedCharacters.includes('play2')) {
        judas('sounds/Judas.mp3');
    }

    if (selectedCharacters.length >= 2) {
        hideButtons();
    }
}

function hideButtons() {
    document.getElementById('itadori').style.display = 'none';
    document.getElementById('sukuna').style.display = 'none';
    document.getElementById('play2').style.display = 'none';
    document.getElementById('addCharacter').style.display = 'none';
}

// Event listener para Itadori
document.getElementById('itadori').addEventListener('click', () => {
    selectCharacter('itadori', ['w', 'a', 's', 'd', 'q', 'f', 'g', 'h']);

});

// Event listener para Sukuna
document.getElementById('sukuna').addEventListener('click', () => {
    selectCharacter('sukuna', ['w', 'a', 's', 'd', 'q', 'e', 'r', 't']);
    
});

// Event listener para Gojo
document.getElementById('play2').addEventListener('click', () => {
    selectCharacter('play2', ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', ',', 'm', 'n', 'b']);

});

// Event listener para Hakari
document.getElementById('addCharacter').addEventListener('click', () => {
    selectCharacter('hakari', ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', '7', '8', '9', '4']);

});

// comandos
document.addEventListener('keydown', (event) => {
    if (!allowedKeys[event.key]) return; // Ignorar teclas não permitidas

    keysPressed[event.key] = true;

    if (player1Paralyzed && ['w', 'a', 's', 'd'].includes(event.key)) return;
    if (cooldownStatus[event.key]) return; // If the key is on cooldown, return

    switch (event.key) {
        // Controles do Jogador 1 (WASD)
        case 'w':
            if (keysPressed['h'] && dashEnabled) {
                dashPlayer('up');
            } else {
                movePlayer(player1, 0, -playerSpeed);
            }
            break;
        case 'a':
            if (keysPressed['h'] && dashEnabled) {
                dashPlayer('left');
            } else {
                movePlayer(player1, -playerSpeed, 0);
            }
            break;
        case 's':
            if (keysPressed['h'] && dashEnabled) {
                dashPlayer('down');
            } else {
                movePlayer(player1, 0, playerSpeed);
            }
            break;
        case 'd':
            if (keysPressed['h'] && dashEnabled) {
                dashPlayer('right');
            } else {
                movePlayer(player1, playerSpeed, 0);
            }
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
                showMessage('fuga');
                open('sounds/som-de-fogo-fire-sound-effect-efeito-sonoro-112953.mp3');
            } else {
                shootBall(player1, 'right', false);
                showMessage('');
            }
            triggerCooldown('q'); // Trigger cooldown for 'q'
            break;
        case 'm':
            if (player2UltimateActive) {
                launchPurpleProjectile(player2, 'left'); // Lança um projétil roxo para a esquerda
                player2UltimateActive = false;
                showMessage('muryo kusho');
            } else {
                shootBall(player2, 'left', false);
                showMessage('');
            }
            triggerCooldown('m'); // Trigger cooldown for 'm'
            break;

        // Ultimate
        case 'e':
            if (player1Ultimate === ultimateFullCharge) {
                player1UltimateActive = true;
                player1Ultimate = 0;
                updateUltimate(ultimate1, player1Ultimate);
                showMessage('Rei das maldições');
                open('sounds/laught.mp3');
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
        case '9':
            meleeAttack(player2, player1, false);
            break;

        // Habilidade especial de mudança de fundo ou barra horizontal
        case 't':
            if (!backgroundColorChanged && player1UltimateActive) {  
                fukumamizushi('https://wallpapercave.com/wp/wp10302006.png', 'ds');
                dealDamage(player2, 5);
                player1UltimateActive = false;
                triggerCooldown('t'); // Trigger cooldown for 't'
                showMessage('fukuma mizushi');
                fukuma('sounds/dominsukuna.mp3');
                fukumas('sounds/ryokitenkaisukuna.mp3');
            } else if (!player1UltimateActive && player1Ultimate >= ultimateFullCharge / 2) {
                launchHalfMapAttack(player1, 'down');
                triggerCooldown('t'); // Trigger cooldown for 't'
                showMessage('scale of the dragon recoil twin meteors');
                fukumas('sounds/anime-slash-sound-effect-made-with-Voicemod.mp3');
            } else if (!player1UltimateActive) {
                launchHorizontalBar(player1);
                triggerCooldown('t'); // Trigger cooldown for 't'
                showMessage('dismantle');
                fukumas('sounds/anime-slash-sound-effect-made-with-Voicemod.mp3');
            }
            break;
        case 'b':
            if (!backgroundColorChanged && player2UltimateActive) {
                changeBackgroundImage('https://i.pinimg.com/736x/25/1f/49/251f49b9061e3ef0b3a862135258f151.jpg', 'Six eyes');
                paralyzePlayer(player1, paralysisDuration);
                player2UltimateActive = false;
                triggerCooldown('b'); // Trigger cooldown for 'b'
                showMessage('muryo kusho');
            } else if (!player2UltimateActive) {
                launchMine(player2, 'left');
                triggerCooldown('b'); // Trigger cooldown for 'b'
                showMessage('Azul');
            }
            break;

        // Atualizações das funções para teclas numéricas
        case '7':
            roletaDeNumeros();
            triggerCooldown('7'); // Trigger cooldown for '7'
            break;
        case '8':
            doors();
            triggerCooldown('8'); // Trigger cooldown for '8'
            judas('sounds/pipe.mp3')
            break;
        case '4':
            shootBall(player2, 'left', false);
            showMessage('');
            triggerCooldown('4'); // Trigger cooldown for 'q'
          
            break;

        case 'f':
            switchPlayerPositions();
            showMessage('');
            fukumas('sounds/clap.mp3');
            break;

        case 'h':
            fukumas('sounds/clap.mp3');
            if (keysPressed['d']) {
                dashPlayer('right');
            } else if (keysPressed['a']) {
                dashPlayer('left');
            } else if (keysPressed['w']) {
                dashPlayer('up');
            } else if (keysPressed['s']) {
                dashPlayer('down');
            }
            triggerCooldown('h');
            break;
    }
});




// colldown
function triggerCooldown(key) {
    cooldownStatus[key] = true;
    setTimeout(() => {
        cooldownStatus[key] = false;
    }, cooldownDurations[key]);
}


// movimentação / ARENA
function movePlayer(player, dx, dy) {
    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    let newLeft = playerRect.left - gameRect.left + dx;
    let newTop = playerRect.top - gameRect.top + dy;


    // para que o jogo continue fucionando bug porta
    // Garantir que o jogador não saia da área do jogo
    if (newLeft < 30) newLeft = 30;
    // Verifica e ajusta o limite direito
    if (newLeft + playerRect.width > gameRect.width - 30) newLeft = gameRect.width - playerRect.width - 30;
    // Verifica e ajusta o limite superior
    if (newTop < 10) newTop = 10;
    // Verifica e ajusta o limite inferior
    if (newTop + playerRect.height > gameRect.height - 10) newTop = gameRect.height - playerRect.height - 10;
    player.style.left = newLeft + 'px';
    player.style.top = newTop + 'px';
}
// ataque a distancia nun sei :)
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
// azul normal
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

// vazio irrestrito
function causeFullMapExplosion() {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');
    game.appendChild(explosion);

    player1Health -= 7;
    player2Health -= 7;

    updateHealth(health1, lostHealth1, player1Health);
    updateHealth(health2, lostHealth2, player2Health);

    showMessage('VAZIO IMENSURAVEL');

    setTimeout(() => {
        explosion.remove();
    }, 500); // Remove explosão após 0,5 segundos
}

// sukuna

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
// corte do sukuna
function launchHorizontalBar(player) {
    const bar = document.createElement('div');
    bar.classList.add('horizontal-bar');
    game.appendChild(bar);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    bar.style.left = playerRect.left - gameRect.left + 'px';
    bar.style.top = playerRect.top - gameRect.top + (playerRect.height / 2 - 10) + 'px';

    let moveInterval = setInterval(() => {
        let currentLeft = parseInt(bar.style.left);
        bar.style.left = currentLeft + 5 + 'px';

        const barRect = bar.getBoundingClientRect();
        const player2Rect = player2.getBoundingClientRect();

        // Checa se a barra colidiu com o player 2
        if (isColliding(barRect, player2Rect)) {
            player2Health -= 3;
            updateHealth(health2, lostHealth2, player2Health);
            clearInterval(moveInterval);
            bar.remove();
        } else if (barRect.right > gameRect.width) {
            clearInterval(moveInterval);
            bar.remove();
        }
    }, 20);
}
// corte que corta o mundo
function launchHalfMapAttack(player, direction) {
    const attack = document.createElement('div');
    attack.classList.add('half-map-attack');
    game.appendChild(attack);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    attack.style.width = gameRect.width + 'px';
    attack.style.height = gameRect.height / 2 + 'px';
    attack.style.left = '0px';
    attack.style.top = playerRect.top - gameRect.top + 'px';

    setTimeout(() => {
        const attackRect = attack.getBoundingClientRect();
        const player1Rect = player1.getBoundingClientRect();
        const player2Rect = player2.getBoundingClientRect();

        // Checa se a habilidade colidiu com algum jogador
        if (isColliding(attackRect, player2Rect)) {
            player2Health -= 7;
            updateHealth(health2, lostHealth2, player2Health);
        }

        attack.remove();
    }, 1000); // Tempo que a habilidade permanece na tela
}


// gojo
// vermelho
function launchPurpleProjectile(player, direction) {
    const purpleProjectile = document.createElement('div');
    purpleProjectile.classList.add('purple-projectile');
    game.appendChild(purpleProjectile);

    const playerRect = player.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    purpleProjectile.style.left = playerRect.left - gameRect.left - 25 + 'px';
    purpleProjectile.style.top = playerRect.top - gameRect.top + (playerRect.height / 2) + 'px';

    let distanceTraveled = 0;
    const maxDistance = 800; // Ajuste conforme necessário

    const interval = setInterval(() => {
        let currentLeft = parseInt(purpleProjectile.style.left);

        if (direction === 'left') {
            purpleProjectile.style.left = (currentLeft - 10) + 'px';
        } else {
            purpleProjectile.style.left = (currentLeft + 10) + 'px';
        }

        distanceTraveled += 10;

        const purpleProjectileRect = purpleProjectile.getBoundingClientRect();

        if (purpleProjectileRect.right < gameRect.left || purpleProjectileRect.left > gameRect.right || distanceTraveled >= maxDistance) {
            purpleProjectile.remove();
            clearInterval(interval);
        } else {
            if (checkCollision(purpleProjectile, player1, player2, true)) {
                purpleProjectile.remove();
                clearInterval(interval);
            } else {
                const mines = document.querySelectorAll('.mine');
                mines.forEach(mine => {
                    const mineRect = mine.getBoundingClientRect();
                    if (isColliding(purpleProjectileRect, mineRect)) {
                        causeFullMapExplosion();
                        mine.remove();
                        purpleProjectile.remove();
                        clearInterval(interval);
                    }
                });
            }
        }
    }, 50);
}


// HAKARI

// JACKPOT
function roletaDeNumeros() {
    if (player2Ultimate >= 15) { // Verifica se há pelo menos 10% de ultimate disponível
        player2Ultimate -=15; // Consome 10% da ultimate do player2
    } else {
        showMessage("nao pode usar a roleta."); // Mensagem de aviso se não houver ultimate suficiente
        return; // Retorna sem executar o resto da função se não houver ultimate suficiente
    }playAudio

    // Restante da função roletaDeNumeros continua aqui...

    const numerosIguais = Math.random() < 0.5;
    let numero1, numero2, numero3;

    if (numerosIguais) {
        numero1 = Math.floor(Math.random() * 7) + 1;
        numero2 = numero1;
        numero3 = numero1;
    } else {
        numero1 = Math.floor(Math.random() * 7) + 1;
        numero2 = Math.floor(Math.random() * 7) + 1;
        numero3 = Math.floor(Math.random() * 7) + 1;
    }

    showMessage(` ${numero1}, ${numero2}, ${numero3}`);
    // rastle('https://pbs.twimg.com/media/F6zFGOgWYAApwDU.jpg', 'ds');
    
    if (numero1 === numero2 && numero2 === numero3) {
        showMessage(` ${numero1}, ${numero2}, ${numero3} `);  
        jackpot();
        changeBackgroundImage('https://i.pinimg.com/originals/d7/4b/67/d74b6737ae912d33bba82f3a4dcc4a30.gif', 'ds');
        playAudio('sounds/tuca.mp3');
    }
    if (7 === numero1 === numero2 && numero2 === numero3) {
        showMessage(` ${numero1}, ${numero2}, ${numero3} `);  
        jackpot();
        changeBackgroundImage('https://i.pinimg.com/originals/d7/4b/67/d74b6737ae912d33bba82f3a4dcc4a30.gif', 'ds');
        playAudio('sounds/tuca.mp3');
    }
}
function jackpot() {
    let timeElapsed = 0; // Inicializa o contador de tempo

    let interval = setInterval(() => {
        if (timeElapsed < 30) { // Continua enquanto não passaram 30 segundos
            if (player2Health < 10) {
                player2Health++;
                updateHealth(health2, lostHealth2, player2Health);
                
            }
            timeElapsed += 0.3; // Incrementa o tempo em 0.3 segundos (300ms)
        } else {
            clearInterval(interval); // Para o intervalo após 30 segundos
        }
    }, 300); // Intervalo de 300ms (0.3 segundos)
}
function playAudio(audioFile) {
    const audio = new Audio(audioFile);
    audio.volume = 0.009;
    audio.currentTime = 20;
    audio.play();

    // Parar o áudio após 30 segundos
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; // Reinicia para o início do áudio
    }, 30000); // 30000 milissegundos = 30 segundos
}
function fukuma(audioFile) {
    const audio = new Audio(audioFile);
    audio.volume = 0.9;
    audio.currentTime = 50;
    audio.play();

    // Parar o áudio após 30 segundos
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; // Reinicia para o início do áudio
    }, 15000); // 30000 milissegundos = 30 segundos
}
function fukumas(audioFile) {
    const audio = new Audio(audioFile);
    audio.volume = 1;
    audio.play();

    // Parar o áudio após 30 segundos
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; // Reinicia para o início do áudio
    }, 15000); // 30000 milissegundos = 30 segundos
}
function open(audioFile) {
    const audio = new Audio(audioFile);
    audio.volume = 1;
    audio.currentTime = 2.2;
    audio.play();

    // Parar o áudio após 30 segundos
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; // Reinicia para o início do áudio
    }, 4000); // 30000 milissegundos = 30 segundos
}
function judas(audioFile) {
    const audio = new Audio(audioFile);
    audio.volume = 0.2;
    audio.play();

    // Parar o áudio após 30 segundos
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; // Reinicia para o início do áudio
    }, 540000); // 30000 milissegundos = 30 segundos
}



// ataque de fechar de portas

function doors() { 
    const activationDelay = 1000; // Atraso de ativação em milissegundos

    // Cria o elemento de ataque especial
    const specialAttackElement = document.createElement('div');
    specialAttackElement.style.position = 'absolute';player1
    specialAttackElement.style.width = '200px';
    specialAttackElement.style.height = '100px';
    specialAttackElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Cor de exemplo

    document.body.appendChild(specialAttackElement);

    // Posiciona o elemento de ataque especial na mesma posição que o player1
    const player1Rect = player1.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    specialAttackElement.style.left = player1Rect.left - gameRect.left + (player1Rect. left / 2 + 1)+ 'px';
    specialAttackElement.style.bottom = player1Rect.bottom - gameRect.bottom + (player1Rect. bottom / 2 - 90)+ 'px';
    specialAttackElement.style.top = player1Rect.top - gameRect.top + (player1Rect. top / 2 -  90)+ 'px';
    // Ativa o ataque especial após o atraso
    setTimeout(() => {
        if (isColliding(specialAttackElement.getBoundingClientRect(), player1.getBoundingClientRect())) {
     
            paralyzePlayer(player1,portas);
        }
        // Remove o elemento de ataque especial após a ativação
        document.body.removeChild(specialAttackElement);
    }, activationDelay);
}


// AOI TODO E YUJI ITADORI
function switchPlayerPositions() {
    const player1Rect = player1.getBoundingClientRect();
    const player2Rect = player2.getBoundingClientRect();

    // Calcular a diferença de posição em relação ao contêiner do jogo
    const gameRect = game.getBoundingClientRect();
    
    const player1Left = player1Rect.left - gameRect.left;
    const player1Top = player1Rect.top - gameRect.top;

    const player2Left = player2Rect.left - gameRect.left;
    const player2Top = player2Rect.top - gameRect.top;

    // Trocar a posição dos jogadores
    player1.style.left = player2Left + 'px';
    player1.style.top = player2Top + 'px';

    player2.style.left = player1Left + 'px';
    player2.style.top = player1Top + 'px';

    showMessage('Players trocaram de posição!');
}

// PUNHO DIVERGENTE

const initialDamage = 1;
const increasedDamage = 3;

function createDamageBox(player, key) {
    let box;

    function showDamageBox() {
        box = document.createElement('div');
        box.classList.add('damage-box');
        game.appendChild(box);
        updateBoxPosition();
    }

    function updateBoxPosition() {
        const playerRect = player.getBoundingClientRect();
        const gameRect = game.getBoundingClientRect();
        box.style.left = playerRect.left - gameRect.left + 35 + 'px'; // Position 35px to the right of the player
        box.style.top = playerRect.top - gameRect.top + (playerRect.height / 2 - 10) + 'px';
    }

    // Update the position of the box at a regular interval
    const positionUpdateInterval = setInterval(() => {
        if (box) {
            updateBoxPosition();
        }
    }, 20);

    let pressStartTime;

    document.addEventListener('keydown', function onKeyPress(event) {
        if (event.key === key && !box) {
            pressStartTime = Date.now();
            showDamageBox();
        }
    });

    document.addEventListener('keyup', function onKeyRelease(event) {
        if (event.key === key) {
            const pressDuration = (Date.now() - pressStartTime) / 1000; // Convert to seconds

            let damage;
            if (pressDuration >= 0.20 && pressDuration <= 0.50) {
                damage = increasedDamage;
                box.style.background = 'black';
                fukumas('sounds/kokusen.mp3')
            } else {
                damage = initialDamage;
                box.style.background = 'cyan';
            }

            // Remove the damage box after 1 second
            setTimeout(() => {
                const boxRect = box.getBoundingClientRect();
                const player2Rect = player2.getBoundingClientRect();

                if (isColliding(boxRect, player2Rect)) {
                    applyDamage(player, damage);
                }

                if (box) {
                    game.removeChild(box);
                    box = null;
                }
            }, 500);

            clearInterval(positionUpdateInterval);
        }
    });
}



function applyDamage(player, damage) {
    if (player === player1) {
        player2Health -= damage;
        updateHealth(health2, lostHealth2, player2Health);
    } else if (player === player2) {
        player1Health -= damage;
        updateHealth(health1, lostHealth1, player1Health);
    }
}

function updateHealth(healthElement, lostHealthElement, health) {
    healthElement.style.width = health + '%';
    lostHealthElement.style.width = (100 - health) + '%';
}

function isColliding(rect1, rect2) {
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

// Use a tecla 'A' para testar
createDamageBox(player1, 'g');

// clap dash
document.addEventListener('keyup', (event) => {
    delete keysPressed[event.key];
    if (event.key === 'h') {
        dashEnabled = false; // Disable dash when 'h' is released
    }
});
function dashPlayer(direction) {
    const playerRect = player1.getBoundingClientRect();
    const gameRect = game.getBoundingClientRect();

    switch (direction) {
        case 'right':
            player1.style.left = Math.min(gameRect.width - playerRect.width, playerRect.left - gameRect.left + 200) + 'px';
            break;
        case 'left':
            player1.style.left = Math.max(0, playerRect.left - gameRect.left - 200) + 'px';
            break;
        case 'up':
            player1.style.top = Math.max(0, playerRect.top - gameRect.top - 200) + 'px';
            break;
        case 'down':
            player1.style.top = Math.min(gameRect.height - playerRect.height, playerRect.top - gameRect.top + 200) + 'px';
            break;
    }

    
    dashEnabled = false; // Disable dash after use
}
// arremeso de pedra





// final dos codigos de ataques

// colisao de playes
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

function updateHealth(healthElement, lostHealthElement, health, playerId) {
    healthElement.style.width = (health * 10) + '%';
    lostHealthElement.style.width = ((10 - health) * 10) + '%';
    if (health <= 0) {
        alert(`Game Over! Player ${playerId} perdeu.`);
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
function updatePachinko(pachinkoElement, pachinkoCharge) {
    pachinkoElement.style.width = pachinkoCharge + '%';
}

function chargePachinko() {
    if (pachinko < pachinkoFullCharge) {
        pachinko += pachinkoChargeSpeed;
        updatePachinko(specialElement, pachinko);
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
        player2Health -= damage;  // Subtrai o dano da saúde do player2
        updateHealth(player2, player2Health);  // Atualiza a exibição da saúde do player2
    }
}

// nao sei oque isso faz //nao mexer\\
function dealDamage(player, damage) {
    if (player === player1) {
        player1Health -= damage;
        updateHealth(health1, lostHealth1, player1Health);
        if (player1Health <= 0) {
            alert('Jogador 2 venceu!');
            resetGame();
        }
    } else {
        player2Health -= damage;
        updateHealth(health2, lostHealth2, player2Health);
        if (player2Health <= 0) {
            alert('Jogador 1 venceu!');
            resetGame();
        }
    }
}

// expansao de dominio
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
function rastle(imageUrl) {
    if (backgroundColorChanged) return;

    let originalBackgroundImage = window.getComputedStyle(game).backgroundImage;
    game.style.backgroundImage = `url(${imageUrl})`;
    backgroundColorChanged = true;

    setTimeout(() => {
        game.style.backgroundImage = originalBackgroundImage;
        backgroundColorChanged = false;
    }, 1000);
}
// sukuna tempo de dominio
function fukumamizushi(imageUrl) {
    if (backgroundColorChanged) return;

    let originalBackgroundImage = window.getComputedStyle(game).backgroundImage;
    game.style.backgroundImage = `url(${imageUrl})`;
    backgroundColorChanged = true;

    setTimeout(() => {
        game.style.backgroundImage = originalBackgroundImage;
        backgroundColorChanged = false;
    }, 15000);
}

// soco
function meleeAttack(attacker, defender, isUltimate) {
    const attackerRect = attacker.getBoundingClientRect();
    const defenderRect = defender.getBoundingClientRect();

    // black flash
    if (isColliding(attackerRect, defenderRect)) {
        const damage = isUltimate ? 2 : 1; // Aumente o dano durante a ultimate
        if (defender === player1) {
            updateHealth(health1, lostHealth1, player1Health -= damage);
        } else {
            updateHealth(health2, lostHealth2, player2Health -= damage);
        }
    }
}
// reset game 

function resetGame() {
    player1Health = 10;
    player2Health = 10;
    player1Ultimate = 0;
    player2Ultimate = 0;
    player1Paralyzed = false;
    player1UltimateActive = false;
    player2UltimateActive = false;
    backgroundColorChanged = false;
    updateHealth(health1, lostHealth1, player1Health, 1);  // Adiciona o playerId aqui
    updateHealth(health2, lostHealth2, player2Health, 2);  // Adiciona o playerId aqui
    updateUltimate(ultimate1, player1Ultimate);
    updateUltimate(ultimate2, player2Ultimate);
    player1.style.left = '100px';
    player1.style.bottom = '50px';
    player2.style.right = '100px';
    player2.style.bottom = '50px';
}

setInterval(chargeUltimate, 1000);