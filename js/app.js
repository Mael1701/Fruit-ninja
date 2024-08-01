window.onload = () => {
  const scoreElement = document.getElementsByClassName('score')[0];
  const gameOverFruitModal = document.getElementById('gameoverfruit');
  const gameOverBombModal = document.getElementById('gameoverbomb');
  const retryFruitButton = document.getElementById('retry-fruit');
  const retryBombButton = document.getElementById('retry-bomb');
  const scoreFruitElement = document.getElementById('score-fruit');
  const scoreBombElement = document.getElementById('score-bomb');

  let gameInterval;
  let isGameOver = false;
  const fruits = [];
  const bombs = [];

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
  }

  class Fruit extends GameObject {
    constructor(imgSrc, containerId, speed) {
      super(imgSrc, containerId, speed, 'fruit');
      this.img.onclick = () => {
        if (!isGameOver) {
          player.incrementScore();
          this.resetPosition();
        }
      };
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
  }

  class Bomb extends GameObject {
    constructor(imgSrc, containerId, speed) {
      super(imgSrc, containerId, speed, 'bomb');
      this.img.onclick = () => {
        if (!isGameOver) {
          scoreBombElement.innerHTML = player.getScore();
          showModal(gameOverBombModal);
        }
      };
    }

    move() {
      super.move();
    }
  }

  function createGameObjects(count, type) {
    const objects = [];
    for (let i = 0; i < count; i++) {
      const imgSrc = type === 'fruit' ? './assets/img/banane.jpg' : './assets/img/bomb.png';
      const speed = type === 'fruit' ? 1 : 2;
      const object = type === 'fruit' ? new Fruit(imgSrc, 'game', speed) : new Bomb(imgSrc, 'game', speed);
      objects.push(object);
    }
    return objects;
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
    }, 21);
  }

  retryFruitButton.onclick = () => {
    gameOverFruitModal.style.display = 'none';
    resetGame();
  };

  retryBombButton.onclick = () => {
    gameOverBombModal.style.display = 'none';
    resetGame();
  };

  // Create multiple fruits and bombs
  fruits.push(...createGameObjects(5, 'fruit'));
  bombs.push(...createGameObjects(5, 'bomb'));

  resetGame();
};
