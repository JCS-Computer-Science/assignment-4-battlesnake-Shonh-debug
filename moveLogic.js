export default function move(game) {
    const gameState = game;
    const myHead = gameState.you.body[0];
    const myTail = gameState.you.body[gameState.you.body.length - 1];
    const headNode = getNodeId(myHead, gameState);
  
    let board = {};
    let c = 0;
    for (let y = 0; y < gameState.board.height; y++) {
      for (let x = 0; x < gameState.board.width; x++) {
        board[c] = { position: { x, y }, connections: [], id: c };
        c++;
      }
    }
    board = connectNodes(gameState, board);
  
    const enemySnakes = gameState.board.snakes.filter(s => s.id !== gameState.you.id);
    const largestEnemy = enemySnakes.reduce((biggest, s) => s.body.length > biggest.body.length ? s : biggest, { body: [] });
    const is1v1 = enemySnakes.length === 1;
    const riskFactor = is1v1 ? 1.5 : 1.0;
    const aggressiveMode = gameState.you.body.length < largestEnemy.body.length + 5;
    const isHungry = aggressiveMode || gameState.you.health < 60;
  
    let targetNode;
    if (isHungry && gameState.board.food.length > 0) {
      targetNode = nearestFood(gameState, board, myHead, myHead);
    } else {
      const boxingNode = boxEnemyInCorner(gameState, board);
      targetNode = boxingNode || getNodeId(myTail, gameState);
  
      const tailNode = getNodeId(myTail, gameState);
      const tailPath = aStar(board, headNode, tailNode);
      const reachableTail = bfs(board, tailNode);
  
      if (tailPath.path.length > 1 && reachableTail > gameState.you.body.length * 1.2) {
        targetNode = tailNode;
      }
    }
  
    if (checkEnclosure(board, headNode, gameState)) {
      const escape = findClosestOpening(gameState, board, headNode);
      if (escape) targetNode = escape.opening || targetNode;
    }
  
    let path = aStar(board, headNode, targetNode);
    if (!path || !path.path || path.path.length < 2 || detectLoopTrap(path.path, board, gameState)) {
      const tailNode = getNodeId(myTail, gameState);
      const tailPath = aStar(board, headNode, tailNode);
      if (tailPath.path.length > 1 && !detectLoopTrap(tailPath.path, board, gameState)) {
        path = tailPath;
      }
    }
  
    function hasDeadEnd(path) {
      if (!path || path.length === 0) return true;
      const finalNode = path[path.length - 1];
      const reachable = bfs(board, finalNode);
      return reachable < gameState.you.body.length * 1.2;
    }
  
    function pathSpaceEvaluation(path) {
      if (!path || path.length === 0) return 0;
      const lastNode = path[path.length - 1];
      return bfs(board, lastNode);
    }
  
    function forkFlexibility(node) {
      return board[node].connections.length;
    }
  
    const allMoves = ['up', 'down', 'left', 'right'];
    const safeMoves = allMoves.filter(move => isMoveSafe(move, gameState));
    const riskyMoves = allMoves.filter(move => !isHeadOnRisk(move, gameState));
    const superSafeMoves = safeMoves.filter(move => riskyMoves.includes(move));
    const validMoves = superSafeMoves.filter(move => isMoveSafe(move, gameState));
  
    const avoidMoves = new Set();
    for (const enemy of enemySnakes) {
      const enemyHead = enemy.body[0];
      const enemyNexts = ['up', 'down', 'left', 'right'].map(d => getNextPosition(enemyHead, d));
      for (const pos of enemyNexts) {
        if (pos.x === myHead.x + 1 && pos.y === myHead.y) avoidMoves.add('right');
        if (pos.x === myHead.x - 1 && pos.y === myHead.y) avoidMoves.add('left');
        if (pos.x === myHead.x && pos.y === myHead.y + 1) avoidMoves.add('up');
        if (pos.x === myHead.x && pos.y === myHead.y - 1) avoidMoves.add('down');
      }
    }
  
    const filteredMoves = validMoves.filter(move => !avoidMoves.has(move));
  
    function getForkBias(state) {
      const turn = state.turn;
      const snakes = state.board.snakes;
      const mySnake = state.you;
      const boardArea = state.board.height * state.board.width;
      const enemySnakes = snakes.filter(s => s.id !== mySnake.id);
  
      const is1v1 = snakes.length === 2;
      const isSolo = snakes.length === 1;
      const isEarly = turn < 80;
      const isLate = turn > 250;
      const lowHealth = mySnake.health < 30;
      const isHungry = mySnake.health < 50 || mySnake.body.length < 6;
      const isDominant = enemySnakes.every(s => mySnake.body.length > s.body.length + 2);
  
      if (isSolo) return 0.0;
      if (is1v1 && isDominant && mySnake.health > 50) return 0.5;
      if (isEarly) return boardArea > 150 ? 3.5 : 3.0;
      if (lowHealth) return 2.5;
      if (isLate) return 1.0;
      if (isHungry) return 3.0;
  
      return 2.0;
    }
  
    const forkWeight = getForkBias(gameState);
    console.log(`[DEBUG] Turn ${gameState.turn} | Snakes: ${gameState.board.snakes.length} | Fork Bias: ${forkWeight}`);
    const predictedSpace = pathSpaceEvaluation(path.path);
    const scoredMoves = filteredMoves.map(move => {
      const neighbor = getNextPosition(myHead, move);
      const neighborNode = getNodeId(neighbor, gameState);
      const zone = neighborNode !== undefined ? bfsZoneOwnership(board, neighborNode, gameState) : 0;
      const space = neighborNode !== undefined ? bfs(board, neighborNode) : 0;
      const forks = neighborNode !== undefined ? forkFlexibility(neighborNode) : 0;
      const midPathTrap = detectLoopTrap([headNode, neighborNode], board, gameState);
        return {
        move,
        score: midPathTrap ? -Infinity : zone * riskFactor + space * 1.3 + forks * forkWeight + predictedSpace * 0.1
        };
    }).sort((a, b) => b.score - a.score);
  
    let nextMove = path.path[1] ? calculateNextMove(path.path[1], board, headNode) : null;
    if (pathSpaceEvaluation(path.path) < gameState.you.body.length * 1.2 && scoredMoves.length > 0) {
      nextMove = scoredMoves[0].move;
    }
  
    if (!filteredMoves.includes(nextMove)) {
      if (scoredMoves.length > 0) {
        nextMove = scoredMoves[0].move;
      }
    }
  
    if (!nextMove || !isMoveSafe(nextMove, gameState)) {
        const emergencyMoves = allMoves.filter(m => isMoveSafe(m, gameState));
        if (emergencyMoves.length > 0) {
            // Choose the move with max space to survive longer
            nextMove = emergencyMoves.reduce((best, move) => {
                const pos = getNextPosition(myHead, move);
                const node = getNodeId(pos, gameState);
                const space = node !== undefined ? bfs(board, node) : 0;
                return space > best.space ? { move, space } : best;
            }, { move: null, space: -1 }).move;
        } else {
            nextMove = 'up'; // final desperation
        }
    }    
  
    for (const enemy of enemySnakes) {
      const tail = enemy.body[enemy.body.length - 1];
      const tailNode = getNodeId(tail, gameState);
      const tailPath = aStar(board, headNode, tailNode);
      if (tailPath.path.length > 0 && bfs(board, tailNode) < 20) {
        nextMove = calculateNextMove(tailPath.path[1], board, headNode);
      }
    }
  
    for (const enemy of enemySnakes) {
      const enemyHead = enemy.body[0];
      const distance = Math.abs(enemyHead.x - myHead.x) + Math.abs(enemyHead.y - myHead.y);
      if (gameState.you.body.length > enemy.body.length && (is1v1 || gameState.you.health > 40)) {
        if (distance <= 2) {
          const attackMove = allMoves.find(move => {
            const pos = getNextPosition(myHead, move);
            return pos.x === enemyHead.x && pos.y === enemyHead.y && isMoveSafe(move, gameState);
          });
          if (attackMove) {
            nextMove = attackMove;
            break;
          }
        }
      }
    }
  
    if (!isMoveSafe(nextMove, gameState)) {
      nextMove = safeMoves[0] || 'up';
    }
  
    console.log(`MOVE ${gameState.turn}: ${nextMove}`);
    return { move: nextMove };
  }

function bfsZoneOwnership(board, startNode, gameState) {
    const visited = new Set();
    const queue = [startNode];
    const enemyHeads = gameState.board.snakes.filter(s => s.id !== gameState.you.id).map(s => s.body[0]);
    let myControl = 0;

    while (queue.length > 0) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            const pos = board[node].position;
            const enemyNearby = enemyHeads.some(h => Math.abs(h.x - pos.x) + Math.abs(h.y - pos.y) <= 2);
            if (!enemyNearby) myControl++;

            for (const [neighbor] of board[node].connections) {
                if (!visited.has(neighbor)) queue.push(neighbor);
            }
        }
    }
    return myControl;
}


function boxEnemyInCorner(gameState, board) {
    const corners = [
        { x: 0, y: 0 },
        { x: 0, y: gameState.board.height - 1 },
        { x: gameState.board.width - 1, y: 0 },
        { x: gameState.board.width - 1, y: gameState.board.height - 1 }
    ];
    const enemies = gameState.board.snakes.filter(s => s.id !== gameState.you.id);
    for (const corner of corners) {
        for (const enemy of enemies) {
            const eHead = enemy.body[0];
            if (Math.abs(eHead.x - corner.x) <= 3 && Math.abs(eHead.y - corner.y) <= 3) {
                return getNodeId(corner, gameState);
            }
        }
    }
    return null;
}

function detectLoopTrap(path, board, gameState) {
    if (!path || path.length < 3) return false;

    const snakeLength = gameState.you.body.length;
    const lookahead = Math.min(path.length, 5); // Check first few steps

    for (let i = 1; i < lookahead; i++) {
        const node = path[i];
        const reachable = bfs(board, node);
        if (reachable < snakeLength * 1.1) {
            return true; // Trap detected at mid-path node
        }
    }

    const lastNode = path[path.length - 1];
    const finalReachable = bfs(board, lastNode);
    return finalReachable < snakeLength * 1.1;
}

function isMoveSafe(move, gameState) {
    const myHead = gameState.you.body[0];
    const newHead = getNextPosition(myHead, move);
    if (
        newHead.x < 0 || newHead.x >= gameState.board.width ||
        newHead.y < 0 || newHead.y >= gameState.board.height
    ) {
        return false;
    }
    for (const snake of gameState.board.snakes) {
        for (const segment of snake.body.slice(0, -1)) {
            if (segment.x === newHead.x && segment.y === newHead.y) {
                return false;
            }
        }
    }
    return true;
}

function isHeadOnRisk(move, gameState) {
    const myHead = gameState.you.body[0];
    const newHead = getNextPosition(myHead, move);
    for (const snake of gameState.board.snakes) {
        if (snake.id === gameState.you.id) continue;
        const enemyHead = snake.body[0];
        if (snake.body.length >= gameState.you.body.length) {
            if (beside(newHead, enemyHead)) {
                return true;
            }
        }
    }
    return false;
}

function getNextPosition(pos, move) {
    const delta = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };
    return {
        x: pos.x + delta[move][0],
        y: pos.y + delta[move][1]
    };
}
function connectNodes(gameState, board) {
    const snakeBodies = [];
    const snakeHeads = [];
    const food = [];
    const tailNode = getNodeId(gameState.you.body[gameState.you.body.length - 1], gameState);

    for (const snake of gameState.board.snakes) {
        if (snake.id !== gameState.you.id) {
            for (let i = 0; i < snake.body.length - 1; i++) {
                snakeBodies.push(getNodeId(snake.body[i], gameState));
            }
            const head = snake.body[0];
            if (snake.body.length >= gameState.you.body.length) {
                [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
                    snakeHeads.push(getNodeId({ x: head.x + dx, y: head.y + dy }, gameState));
                });
            }
        }
    }

    for (const segment of gameState.you.body) {
        const id = getNodeId(segment, gameState);
        if (id !== tailNode || (gameState.you.health === 100 && beside(gameState.you.body[0], gameState.you.body[gameState.you.body.length - 1]))) {
            snakeBodies.push(id);
        }
    }

    for (const f of gameState.board.food) {
        food.push(getNodeId(f, gameState));
    }

    for (const i in board) {
        for (const j in board) {
            const a = board[i].position;
            const b = board[j].position;
            if (beside(a, b) && !snakeBodies.includes(Number(j))) {
                if (snakeHeads.includes(Number(j))) board[i].connections.push([Number(j), 100]);
                else if (food.includes(Number(j))) board[i].connections.push([Number(j), 5]);
                else board[i].connections.push([Number(j), 1]);
            }
        }
    }
    return board;
}

function aStar(graph, start, target) {
    const open = [{ node: start, f: 0, path: [start] }];
    const gScores = { [start]: 0 };

    while (open.length > 0) {
        open.sort((a, b) => a.f - b.f);
        const current = open.shift();
        if (current.node === target) return { path: current.path, cost: gScores[target] };

        for (const [neighbor, cost] of graph[current.node].connections) {
            const g = gScores[current.node] + cost;
            if (!(neighbor in gScores) || g < gScores[neighbor]) {
                gScores[neighbor] = g;
                const f = g + heuristic(neighbor, target, graph);
                open.push({ node: neighbor, f, path: [...current.path, neighbor] });
            }
        }
    }
    return { path: [], cost: Infinity };
}

function heuristic(a, b, graph) {
    return Math.abs(graph[a].position.x - graph[b].position.x) + Math.abs(graph[a].position.y - graph[b].position.y);
}

function getNodeId(pos, gameState) {
    if (pos.y >= 0 && pos.y < gameState.board.height && pos.x >= 0 && pos.x < gameState.board.width) {
        return pos.y * gameState.board.width + pos.x;
    }
    return undefined;
}

function nearestFood(gameState, board, myHead, start) {
    const foodNodes = gameState.board.food.map(f => getNodeId(f, gameState));
    const safeFood = bfs(board, getNodeId(start, gameState), gameState, foodNodes);
    let best = { dist: Infinity, node: null };
    for (const node of safeFood) {
        const p = aStar(board, getNodeId(myHead, gameState), node);
        if (p.path.length < best.dist && p.cost <= 70) {
            best = { dist: p.path.length, node };
        }
    }
    return best.node || getNodeId(gameState.you.body[gameState.you.body.length - 1], gameState);
}

function checkEnclosure(board, headNode, gameState) {
    const directions = [[0, 1], [0, -1], [-1, 0], [1, 0]];
    return directions.every(([dx, dy]) => {
        const neighbor = getNodeId({ x: board[headNode].position.x + dx, y: board[headNode].position.y + dy }, gameState);
        return neighbor && bfs(board, neighbor) < gameState.you.body.length;
    });
}

function findClosestOpening(gameState, board, headNode) {
    const tailIdx = gameState.you.body.length - 1;
    for (let turn = 0; turn <= tailIdx; turn++) {
        const futureTail = gameState.you.body[tailIdx - turn];
        const node = getNodeId(futureTail, gameState);
        if (aStar(board, headNode, node).path.length > 0) return { opening: node, turns: turn };
    }
    return null;
}

function bfs(graph, start, gameState = undefined, targets = undefined) {
    const visited = new Set();
    const queue = [start];
    let count = 0;
    const foundTargets = [];
    while (queue.length > 0) {
        const node = queue.shift();
        if (!visited.has(node)) {
            visited.add(node);
            count++;
            if (targets && targets.includes(node)) foundTargets.push(node);
            for (const [neighbor] of graph[node].connections) {
                if (!visited.has(neighbor)) queue.push(neighbor);
            }
        }
    }
    return targets ? foundTargets : count;
}

function beside(a, b) {
    return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) === 1;
}

function calculateNextMove(target, board, head) {
    const dx = board[target].position.x - board[head].position.x;
    const dy = board[target].position.y - board[head].position.y;
    if (dx === 1) return 'right';
    if (dx === -1) return 'left';
    if (dy === 1) return 'up';
    if (dy === -1) return 'down';
} 
