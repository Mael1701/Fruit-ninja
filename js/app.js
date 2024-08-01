window.onload = () => {
  const scoreElement = document.getElementsByClassName('score')[0];
  const gameOverFruitModal = document.getElementById('gameoverfruit');
  const gameOverBombModal = document.getElementById('gameoverbomb');
  const retryFruitButton = document.getElementById('retry-fruit');
  const retryBombButton = document.getElementById('retry-bomb');
  const scoreFruitElement = document.getElementById('score-fruit');
  const scoreBombElement = document.getElementById('score-bomb');
  const gameDiv = document.getElementById('game');

  let gameInterval;
  let isGameOver = false;
  let isDragging = false;
  let fruits = [];
  let bombs = [];
  const mouseTrail = [];
  let ignoreNextPoint = false;
  const timeouts = [];

  class Player {
    constructor() {
      this.score = 0;
    }

    incrementScore() {
      this.score++;
      scoreElement.innerHTML = this.score;
    }

    resetScore() {
      this.score = 0;
      scoreElement.innerHTML = this.score;
    }

    getScore() {
      return this.score;
    }
  }

  const player = new Player();

  class GameObject {
    constructor(imgSrc, containerId, speed, className) {
      this.img = document.createElement('img');
      this.img.src = imgSrc;
      this.img.className = className;
      this.div = document.getElementById(containerId);
      this.speed = speed;
      this.div.appendChild(this.img);
      this.init();
    }

    init() {
      this.resetPosition();
    }

    resetPosition() {
      this.img.style.left = `${Math.floor(Math.random() * (this.div.clientWidth - this.img.width))}px`;
      this.img.style.bottom = '570px';
    }

    move() {
      if (!isGameOver) {
        let currentBottom = parseInt(this.img.style.bottom, 10) || 0;
        this.img.style.bottom = `${currentBottom - this.speed}px`;

        if (currentBottom <= 0) {
          this.resetPosition();
        }
      }
    }

    checkCollision(trail) {
      const rect = this.img.getBoundingClientRect();
      const gameRect = gameDiv.getBoundingClientRect();
      return trail.some(point =>
        point.x > rect.left - gameRect.left &&
        point.x < rect.right - gameRect.left &&
        point.y > rect.top - gameRect.top &&
        point.y < rect.bottom - gameRect.top
      );
    }

    isPointInside(point) {
      const rect = this.img.getBoundingClientRect();
      const gameRect = gameDiv.getBoundingClientRect();
      return (
        point.x > rect.left - gameRect.left &&
        point.x < rect.right - gameRect.left &&
        point.y > rect.top - gameRect.top &&
        point.y < rect.bottom - gameRect.top
      );
    }
  }

  class Fruit extends GameObject {
    constructor(imgSrc, containerId, speed) {
      super(imgSrc, containerId, speed, 'fruit');
    }

    move() {
      super.move();
      if (parseInt(this.img.style.bottom, 10) <= 0) {
        if (!isGameOver) {
          scoreFruitElement.innerHTML = player.getScore();
          showModal(gameOverFruitModal);
        }
      }
    }

    checkCollision(trail) {
      if (trail.length < 2) return false;
      for (let i = 1; i < trail.length; i++) {
        const dx = trail[i].x - trail[i - 1].x;
        const dy = trail[i].y - trail[i - 1].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= 10 && super.checkCollision([trail[i], trail[i - 1]])) {
          player.incrementScore();
          this.resetPosition();
          return true;
        }
      }
      return false;
    }
  }

  class Bomb extends GameObject {
    constructor(imgSrc, containerId, speed) {
      super(imgSrc, containerId, speed, 'bomb');
    }

    checkCollision(trail) {
      if (trail.length < 2) return false;
      for (let i = 1; i < trail.length; i++) {
        const dx = trail[i].x - trail[i - 1].x;
        const dy = trail[i].y - trail[i - 1].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= 10 && super.checkCollision([trail[i], trail[i - 1]])) {
          scoreBombElement.innerHTML = player.getScore();
          showModal(gameOverBombModal);
          return true;
        }
      }
      return false;
    }
  }

  function createGameObjectsWithDelay(count, delay, type) {
    const objects = [];
    for (let i = 0; i < count; i++) {
      const timeoutId = setTimeout(() => {
        const imgSrc = type === 'fruit' ? './assets/img/banane.jpg' : './assets/img/bomb.png';
        const speed = type === 'fruit' ? 5 : 1.5;
        const object = type === 'fruit' ? new Fruit(imgSrc, 'game', speed) : new Bomb(imgSrc, 'game', speed);
        objects.push(object);
        if (type === 'fruit') {
          fruits.push(object);
        } else {
          bombs.push(object);
        }
      }, i * delay);
      timeouts.push(timeoutId);
    }
    return objects;
  }

  function showModal(modal) {
    isGameOver = true;
    isDragging = false; // Stop dragging when game over
    clearInterval(gameInterval);
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    modal.style.display = 'flex';
  }

  function startGame() {
    isGameOver = false;
    player.resetScore();
    fruits.forEach(fruit => fruit.resetPosition());
    bombs.forEach(bomb => bomb.resetPosition());
    gameInterval = setInterval(() => {
      fruits.forEach(fruit => fruit.move());
      bombs.forEach(bomb => bomb.move());
    }, 30);
  }

  function restart() {
    // Delete all bombs
    bombs.forEach(bomb => bomb.img.remove());
    bombs = [];

    // Generate new bombs
    createGameObjectsWithDelay(8, 1000, 'bomb');

    // Reset position of all fruits
    fruits.forEach(fruit => fruit.resetPosition());
  }

  retryFruitButton.onclick = () => {
    gameOverFruitModal.style.display = 'none';
    restart();
    startGame();
  };

  retryBombButton.onclick = () => {
    gameOverBombModal.style.display = 'none';
    restart();
    startGame();
  };

  // Create multiple fruits and bombs with delay
  createGameObjectsWithDelay(8, 300, 'fruit');
  createGameObjectsWithDelay(8, 1000, 'bomb');

  function drawTrail() {
    const trailContainer = document.createElement('div');
    trailContainer.className = 'trail-container';
    gameDiv.appendChild(trailContainer);

    mouseTrail.forEach((point, index) => {
      if (index === 0) return;
      const previousPoint = mouseTrail[index - 1];
      const trailSegment = document.createElement('div');
      trailSegment.className = 'trail-segment';
      trailSegment.style.left = `${previousPoint.x}px`;
      trailSegment.style.top = `${previousPoint.y}px`;
      trailSegment.style.width = `${Math.sqrt((point.x - previousPoint.x) ** 2 + (point.y - previousPoint.y) ** 2)}px`;
      trailSegment.style.transform = `rotate(${Math.atan2(point.y - previousPoint.y, point.x - previousPoint.x)}rad)`;
      trailContainer.appendChild(trailSegment);

      setTimeout(() => {
        trailSegment.remove();
      }, 1000);
    });
  }

  function updateTrail(e) {
    if (!isDragging || isGameOver) return;
    const rect = gameDiv.getBoundingClientRect();
    const currentPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (ignoreNextPoint) {
      ignoreNextPoint = false;
      return;
    }
    if (mouseTrail.length > 0) {
      const lastPoint = mouseTrail[mouseTrail.length - 1];
      const dx = currentPoint.x - lastPoint.x;
      const dy = currentPoint.y - lastPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance >= 10) {
        mouseTrail.push(currentPoint);
      }
    } else {
      mouseTrail.push(currentPoint);
    }
    if (mouseTrail.length > 20) mouseTrail.shift();
    drawTrail();
    fruits.forEach(fruit => fruit.checkCollision(mouseTrail));
    bombs.forEach(bomb => bomb.checkCollision(mouseTrail));
  }

  gameDiv.addEventListener('mousedown', (e) => {
    if (isGameOver) return;
    isDragging = true;
    mouseTrail.length = 0;
    const clickPoint = { x: e.clientX, y: e.clientY };
    ignoreNextPoint = fruits.some(fruit => fruit.isPointInside(clickPoint)) ||
      bombs.some(bomb => bomb.isPointInside(clickPoint));
  });

  gameDiv.addEventListener('mouseup', () => {
    isDragging = false;
    mouseTrail.length = 0;
    gameDiv.querySelectorAll('.trail-container').forEach(container => container.remove());
  });

  gameDiv.addEventListener('mousemove', updateTrail);

  gameDiv.addEventListener('mouseleave', () => {
    isDragging = false;
    mouseTrail.length = 0;
    gameDiv.querySelectorAll('.trail-container').forEach(container => container.remove());
  });

  startGame();
};
