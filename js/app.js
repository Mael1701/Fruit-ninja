window.onload = () => {
  const scoreElement = document.getElementsByClassName('score')[0];
  const gameOverFruitModal = document.getElementById('gameoverfruit');
  const gameOverBombModal = document.getElementById('gameoverbomb');
  const retryFruitButton = document.getElementById('retry-fruit');
  const retryBombButton = document.getElementById('retry-bomb');
  const scoreFruitElement = document.getElementById('score-fruit');
  const scoreBombElement = document.getElementById('score-bomb');
  const gameDiv = document.getElementById('game');
  const trailCanvas = document.createElement('canvas');
  trailCanvas.id = 'trail';
  gameDiv.appendChild(trailCanvas);
  const ctx = trailCanvas.getContext('2d');
  trailCanvas.width = gameDiv.clientWidth;
  trailCanvas.height = gameDiv.clientHeight;

  let gameInterval;
  let isGameOver = false;
  let isDragging = false;
  const fruits = [];
  const bombs = [];
  const mouseTrail = [];
  let ignoreNextPoint = false;

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
        if (distance >= 30 && super.checkCollision([trail[i], trail[i - 1]])) {
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
        if (distance >= 30 && super.checkCollision([trail[i], trail[i - 1]])) {
          scoreBombElement.innerHTML = player.getScore();
          showModal(gameOverBombModal);
          return true;
        }
      }
      return false;
    }
  }

  function createGameObjects(count, type) {
    const objects = [];
    for (let i = 0; i < count; i++) {
      const imgSrc = type === 'fruit' ? './assets/img/banane.jpg' : './assets/img/bomb.png';
      const speed = type === 'fruit' ? 1 : 1.5;
      const object = type === 'fruit' ? new Fruit(imgSrc, 'game', speed) : new Bomb(imgSrc, 'game', speed);
      objects.push(object);
    }
    return objects;
  }

  function createBombsWithDelay(count, delay) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const bomb = new Bomb('./assets/img/bomb.png', 'game', 1.5);
        bombs.push(bomb);
      }, i * delay);
    }
  }

  function showModal(modal) {
    isGameOver = true;
    clearInterval(gameInterval);
    modal.style.display = 'flex';
  }

  function resetGame() {
    isGameOver = false;
    player.resetScore();
    fruits.forEach(fruit => fruit.resetPosition());
    bombs.forEach(bomb => bomb.resetPosition());
    gameInterval = setInterval(() => {
      fruits.forEach(fruit => fruit.move());
      bombs.forEach(bomb => bomb.move());
    }, 30);
  }

  retryFruitButton.onclick = () => {
    gameOverFruitModal.style.display = 'none';
    resetGame();
  };

  retryBombButton.onclick = () => {
    gameOverBombModal.style.display = 'none';
    resetGame();
  };

  // Create multiple fruits
  fruits.push(...createGameObjects(5, 'fruit')); // Adjust the number to add more fruits
  // Create multiple bombs with delay
  createBombsWithDelay(5, 1000); // Adjust the number to add more bombs and set delay in milliseconds

  function drawTrail() {
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    ctx.beginPath();
    if (mouseTrail.length > 0) {
      ctx.moveTo(mouseTrail[0].x, mouseTrail[0].y);
      for (let i = 1; i < mouseTrail.length; i++) {
        ctx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
      }
    }
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  function updateTrail(e) {
    if (!isDragging) return;
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
      if (distance >= 30) {
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
    isDragging = true;
    mouseTrail.length = 0;  // Clear the mouse trail
    const clickPoint = { x: e.clientX, y: e.clientY };
    ignoreNextPoint = fruits.some(fruit => fruit.isPointInside(clickPoint)) ||
      bombs.some(bomb => bomb.isPointInside(clickPoint));
  });

  gameDiv.addEventListener('mouseup', () => {
    isDragging = false;
    mouseTrail.length = 0;
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  });

  gameDiv.addEventListener('mousemove', updateTrail);

  gameDiv.addEventListener('mouseleave', () => {
    isDragging = false;
    mouseTrail.length = 0;
    ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
  });

  resetGame();
};
