const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let raf;

const goalWidth = 10;
const goalHeight = 30;
const goal1 = { x: 0, y: canvas.height / 2 - goalHeight / 2, width: goalWidth, height: goalHeight };
const goal2 = { x: canvas.width - goalWidth, y: canvas.height / 2 - goalHeight / 2, width: goalWidth, height: goalHeight };

let score1 = 0;
let score2 = 0;
const goalLimit = 7;

const goalImage1 = new Image();
goalImage1.src = "bilder/goal1.jpg";
const goalImage2 = new Image();
goalImage2.src = "bilder/goal2.jpg";

class Ball {
    constructor(x, y, vx, vy, radius, color, startvy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.startvy = startvy;
        this.image = new Image();
        this.image.src = "bilder/ball.png";
    }

    draw() {
        if (this.color === "black") {
            ctx.drawImage(this.image, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    checkWallCollision() {
        if (this.x > canvas.width - this.radius) {
            this.vx = -this.vx;
            this.x = canvas.width - this.radius;
        }
        if (this.x < this.radius) {
            this.vx = -this.vx;
            this.x = this.radius;
        }
        if (this.y > canvas.height - this.radius) {
            this.vy = -this.vy;
            this.y = canvas.height - this.radius;
        }
        if (this.y < this.radius) {
            this.vy = -this.vy;
            this.y = this.radius;
        }
    }

    checkCollision(ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + ball.radius;
    }

    handleCollision(ball) {
        if (ball.color === "black") {
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const collisionAngle = Math.atan2(dy, dx);
            const speed1 = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const speed2 = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const direction1 = Math.atan2(this.vy, this.vx);
            const direction2 = Math.atan2(ball.vy, ball.vx);

            const newVelX1 = speed1 * Math.cos(direction1 - collisionAngle);
            const newVelY1 = speed1 * Math.sin(direction1 - collisionAngle);
            const newVelX2 = speed2 * Math.cos(direction2 - collisionAngle);
            const newVelY2 = speed2 * Math.sin(direction2 - collisionAngle);

            const finalVelX1 = ((this.radius - ball.radius) * newVelX1 + (ball.radius + ball.radius) * newVelX2) / (this.radius + ball.radius);
            const finalVelX2 = ((this.radius + this.radius) * newVelX1 + (ball.radius - this.radius) * newVelX2) / (this.radius + ball.radius);

            const finalVelY1 = newVelY1;
            const finalVelY2 = newVelY2;

            ball.vx = Math.cos(collisionAngle) * finalVelX2 + Math.cos(collisionAngle + Math.PI / 2) * finalVelY2;
            ball.vy = Math.sin(collisionAngle) * finalVelX2 + Math.sin(collisionAngle + Math.PI / 2) * finalVelY2;

            const overlap = this.radius + ball.radius - Math.sqrt(dx * dx + dy * dy);
            ball.x += Math.cos(collisionAngle) * overlap / 2;
            ball.y += Math.sin(collisionAngle) * overlap / 2;
        }
    }
}

const ball1 = new Ball(canvas.width * 3 / 4, canvas.height / 2, 0, 0, 10, "blue", -8);
const ball2 = new Ball(canvas.width * 1 / 4, canvas.height / 2, 0, 0, 10, "red", -7);
const ball3 = new Ball(canvas.width / 2, canvas.height / 2, 0, 0, 6, "black", 0);

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        ball1.vx = 0;
        ball1.vy = 0;
    }
    if (['w', 'a', 's', 'd'].includes(e.key)) {
        ball2.vx = 0;
        ball2.vy = 0;
    }
});

function updateVelocities() {
    if (keys['ArrowUp']) ball1.vy = -2;
    if (keys['ArrowDown']) ball1.vy = 2;
    if (keys['ArrowLeft']) ball1.vx = -2;
    if (keys['ArrowRight']) ball1.vx = 2;

    if (keys['w']) ball2.vy = -2;
    if (keys['s']) ball2.vy = 2;
    if (keys['a']) ball2.vx = -2;
    if (keys['d']) ball2.vx = 2;
}

function showWinningScreen(winner) {
    const winningScreen = document.getElementById('winning-screen');
    winningScreen.textContent = `${winner} Wins!`;
    winningScreen.style.display = 'flex';

    const playAgainButton = document.createElement('button');
    playAgainButton.id = 'play-again-button';
    playAgainButton.textContent = 'Play Again';
    playAgainButton.addEventListener('click', resetGame);
    winningScreen.appendChild(playAgainButton);
}

function updateScoreboard() {
    document.getElementById('score1').textContent = `Score: ${score1}`;
    document.getElementById('score2').textContent = `Score: ${score2}`;
}

function resetGame() {
    score1 = 0;
    score2 = 0;
    updateScoreboard();

    const winningScreen = document.getElementById('winning-screen');
    winningScreen.style.display = 'none';

    resetPositions();
    draw();
}

function draw() {
    if (score1 >= goalLimit || score2 >= goalLimit) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const winner = score1 >= goalLimit ? "Player 1" : "Player 2";
        showWinningScreen(winner);
        return;
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateVelocities();

    ball1.draw();
    ball1.move();
    ball1.checkWallCollision();

    ball2.draw();
    ball2.move();
    ball2.checkWallCollision();

    ball3.draw();
    ball3.move();
    ball3.checkWallCollision();

    if (ball1.checkCollision(ball3)) {
        ball1.handleCollision(ball3);
    }
    if (ball2.checkCollision(ball3)) {
        ball2.handleCollision(ball3);
    }

    if (ball3.x - ball3.radius < goal1.x + goal1.width - 6 && ball3.y + ball3.radius > goal1.y && ball3.y - ball3.radius < goal1.y + goal1.height) {

        score2++;
        updateScoreboard();
        resetPositions();
    }
    if (ball3.x + ball3.radius > goal2.x + 6 && ball3.y + ball3.radius > goal2.y && ball3.y - ball3.radius < goal2.y + goal2.height) {

        score1++;
        updateScoreboard();
        resetPositions();
    }


    ctx.drawImage(goalImage1, goal1.x, goal1.y, goal1.width, goal1.height);
    ctx.drawImage(goalImage2, goal2.x, goal2.y, goal2.width, goal2.height);

    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    ctx.fillText("Player 1", ball1.x - 17, ball1.y - 20);
    ctx.fillText("Player 2", ball2.x - 17, ball2.y - 20);

    const backgroundImage = new Image();
    backgroundImage.src = "bilder/bane.png";
    backgroundImage.onload = function () {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    };

    raf = window.requestAnimationFrame(draw);
}

function resetPositions() {

    ball1.x = canvas.width * 3 / 4;
    ball1.y = canvas.height / 2;
    ball2.x = canvas.width * 1 / 4;
    ball2.y = canvas.height / 2;
    ball3.x = canvas.width / 2;
    ball3.y = canvas.height / 2;
    ball3.vx = 0;
    ball3.vy = 0;
}

draw();