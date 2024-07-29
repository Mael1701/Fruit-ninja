window.onload = () => {
  const scoreElement = document.getElementsByClassName('score')[0];

  class Player {
    constructor() {
      this.score = 0;
    }

    incrementScore() {
      this.score++;
      scoreElement.innerHTML = this.score;
    }

    resetScore() {
      this.score = 0 ;
      scoreElement.innerHTML = this.score;
    }
  }

  const player = new Player();

  class Fruit {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.img = document.getElementById('logo');
      this.div = document.getElementById('game');
      this.init();
    }

    init() {
      this.img.onclick = () => {
        player.incrementScore();
        this.resetPosition();
      };
      this.resetPosition();
    }

    resetPosition() {
      this.img.style.left = `${Math.floor(Math.random() * (this.div.clientWidth - this.img.width))}px`;
      this.img.style.bottom = '570px';
    }

    move() {
      let currentBottom = parseInt(this.img.style.bottom, 10) || 0;
      this.img.style.bottom = `${currentBottom - 4}px`;

      if (currentBottom <= 0) {
        this.resetPosition();
        player.resetScore();
      }
    }
  }

  const fruit = new Fruit();

  setInterval(() => fruit.move(), 30);
};
