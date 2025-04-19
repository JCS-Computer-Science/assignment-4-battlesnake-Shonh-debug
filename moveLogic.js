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

    // Determine target based on hunger state
    const isHungry = gameState.you.health < 30 || gameState.you.body.length % 2 !== 0 ||
        gameState.board.snakes.some(s => s.id !== gameState.you.id && s.body.length >= gameState.you.body.length - 2);

    let targetNode;
    if (isHungry && gameState.board.food.length > 0) {
        targetNode = nearestFood(gameState, board, myHead, myHead);
    } else {
        targetNode = getNodeId(myTail, gameState);
    }

    if (checkEnclosure(board, headNode, gameState)) {
        const escape = findClosestOpening(gameState, board, headNode);
        if (escape) targetNode = escape.opening || targetNode;
    }

    const path = aStar(board, headNode, targetNode);
    let nextMove = calculateNextMove(path.path[1], board, headNode);

    // New: Ensure selected move doesn't crash into wall or body
    const allMoves = ['up', 'down', 'left', 'right'];
    const safeMoves = allMoves.filter(move => isMoveSafe(move, gameState));

    if (!safeMoves.includes(nextMove)) {
        for (let move of safeMoves) {
            const neighbor = getNextPosition(myHead, move);
            const neighborNode = getNodeId(neighbor, gameState);
            if (neighborNode !== undefined && bfs(board, neighborNode) > gameState.you.body.length / 2) {
                nextMove = move;
                break;
            }
        }
    }

    if (!safeMoves.includes(nextMove)) {
        nextMove = safeMoves[0] || 'up';
    }

    console.log(`MOVE ${gameState.turn}: ${nextMove}`);
    return { move: nextMove };
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
        if (p.path.length < best.dist && p.cost <= 50) {
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
