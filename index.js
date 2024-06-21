const RESOLUTION = 800;

let canvas;
let ctxt;

let maze;
let frame = 0;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = RESOLUTION;
    canvas.height = RESOLUTION;
    ctxt = canvas.getContext("2d");

    maze = new Maze(51);

    ctxt.setTransform(RESOLUTION, 0, 0, RESOLUTION, 0, 0);

    loop();
}

function loop() {
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    maze.render(ctxt);

    if (frame % 1 === 0) {
        maze.update();
    }

    frame++;

    requestAnimationFrame(loop);
}

class Maze {
    constructor(size) {
        this.grid = [];
        for (let y = 0; y < size; y++) {
            let row = [];
            for (let x = 0; x < size; x++) {
                let isWall = Math.random() < 0.3;
                if (x === 1 || y === 1 || x === size - 2 || y === size - 2) {
                    isWall = true;
                }
                if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
                    isWall = false;
                }
                row.push(isWall);
            }
            this.grid.push(row);
        }

        this.exit = new MazeExit(size);
        this.solver = new Solver(Math.floor(size / 2), Math.floor(size / 2));

        // remove some walls to keep it interesting
        this.grid[this.exit.y][this.exit.x] = false;
        if (this.exit.y === 1) {
            this.grid[this.exit.y + 1][this.exit.x] = false;
        } else if (this.exit.x === size - 2) {
            this.grid[this.exit.y][this.exit.x - 1] = false;
        } else if (this.exit.y === size - 2) {
            this.grid[this.exit.y - 1][this.exit.x] = false;
        } else {
            this.grid[this.exit.y][this.exit.x + 1] = false;
        }

        this.grid[this.solver.y][this.solver.x] = false;
        this.grid[this.solver.y - 1][this.solver.x] = false;
        this.grid[this.solver.y][this.solver.x + 1] = false;
        this.grid[this.solver.y + 1][this.solver.x] = false;
        this.grid[this.solver.y][this.solver.x - 1] = false;
    }

    render(ctxt) {
        ctxt.save();
        ctxt.transform(1 / this.grid.length, 0, 0, 1 / this.grid[0].length, 0, 0);

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x]) {
                    ctxt.fillRect(x + 0.05, y + 0.05, 0.9, 0.9);
                }
            }
        }

        this.solver.render(ctxt);

        ctxt.restore();
    }

    update() {
        if (this.solver.x === this.exit.x && this.solver.y === this.exit.y) {
            return;
        }

        this.solver.update(this.grid);
    }
}

class MazeExit {
    constructor(mazeSize) {
        this.x;
        this.y;

        let wallCoordinate = Math.round(Math.random() * (mazeSize - 5)) + 2;
        let wallOption = Math.random();
        if (wallOption < 0.25) {
            this.x = wallCoordinate;
            this.y = 1;
        } else if (wallOption < 0.5) {
            this.x = mazeSize - 2;
            this.y = wallCoordinate;
        } else if (wallOption < 0.75) {
            this.x = wallCoordinate;
            this.y = mazeSize - 2;
        } else {
            this.x = 1;
            this.y = wallCoordinate;
        }
    }
}

class Solver {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = 0;
        this.state = 0;
    }

    render(ctxt) {
        ctxt.save();

        ctxt.transform(1, 0, 0, 1, this.x + 0.5, this.y + 0.5);
        ctxt.fillStyle = "#F90";
        ctxt.beginPath();
        let angle1 = (this.direction - 1) * Math.PI / 2;
        let angle2 = angle1 + 3 * Math.PI / 4;
        let angle3 = angle1 - 3 * Math.PI / 4;
        let r = 0.3;
        ctxt.moveTo(r * Math.cos(angle1), r * Math.sin(angle1));
        ctxt.lineTo(r * Math.cos(angle2), r * Math.sin(angle2));
        ctxt.lineTo(r * Math.cos(angle3), r * Math.sin(angle3));
        ctxt.closePath();
        ctxt.fill();

        ctxt.restore();
    }

    update(grid) {
        let absoluteDirection = mod(this.direction, 4);
        if (this.state === 0) {
            if (absoluteDirection === 0) {
                if (grid[this.y - 1][this.x]) {
                    this.direction++;
                    this.state = 1;
                } else {
                    this.y--;
                }
            } else if (absoluteDirection === 1) {
                if (grid[this.y][this.x + 1]) {
                    this.direction++;
                    this.state = 1;
                } else {
                    this.x++;
                }
            } else if (absoluteDirection === 2) {
                if (grid[this.y + 1][this.x]) {
                    this.direction++;
                    this.state = 1;
                } else {
                    this.y++;
                }
            } else {
                if (grid[this.y][this.x - 1]) {
                    this.direction++;
                    this.state = 1;
                } else {
                    this.x--;
                }
            }
        } else {
            if (absoluteDirection === 0) {
                if (grid[this.y - 1][this.x]) {
                    this.direction++;
                } else if (grid[this.y - 1][this.x - 1]) {
                    this.y--;
                } else {
                    this.y--;
                    this.direction--;
                }
            } else if (absoluteDirection === 1) {
                if (grid[this.y][this.x + 1]) {
                    this.direction++;
                } else if (grid[this.y - 1][this.x + 1]) {
                    this.x++;
                } else {
                    this.x++;
                    this.direction--;
                }
            } else if (absoluteDirection === 2) {
                if (grid[this.y + 1][this.x]) {
                    this.direction++;
                } else if (grid[this.y + 1][this.x + 1]) {
                    this.y++;
                } else {
                    this.y++;
                    this.direction--;
                }
            } else {
                if (grid[this.y][this.x - 1]) {
                    this.direction++;
                } else if (grid[this.y + 1][this.x - 1]) {
                    this.x--;
                } else {
                    this.x--;
                    this.direction--;
                }
            }

            if(this.direction === 0) {
                this.state = 0;
            }
        }
    }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}
