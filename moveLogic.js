export default function move(gameState) {
  gameState.board.snakes.forEach((snake) => console.log(snake.name));
  let moveSafety = {
    up: true,
    down: true,
    left: true,
    right: true,
  };
  let priorityMoves = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  let riskyMoves = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  let spaceScores = { up: 0, down: 0, left: 0, right: 0 };

  let myHead = gameState.you.body[0];
  let myNeck = gameState.you.body[1];

  let healthLimit = 100

  function safeBack() {
    moveSafety.left = myNeck.x < myHead.x ? false : moveSafety.left;
    moveSafety.right = myNeck.x > myHead.x ? false : moveSafety.right;
    moveSafety.down = myNeck.y < myHead.y ? false : moveSafety.down;
    moveSafety.up = myNeck.y > myHead.y ? false : moveSafety.up;
  }
  safeBack();

  function bounds() {
    moveSafety.left = myHead.x == 0 ? false : moveSafety.left;
    moveSafety.right =
      myHead.x == gameState.board.width - 1 ? false : moveSafety.right;
    moveSafety.down = myHead.y == 0 ? false : moveSafety.down;
    moveSafety.up =
      myHead.y == gameState.board.height - 1 ? false : moveSafety.up;
  }
  bounds();

  let myBody = gameState.you.body;

  function selfPreservation() {
    let ate = 1;
    if (gameState.you.health == 100) {
      ate = 0;
    }
    for (let i = 1; i < myBody.length - ate; i++) {
      moveSafety.right =
        myHead.x + 1 == myBody[i].x && myHead.y == myBody[i].y
          ? false
          : moveSafety.right;
      moveSafety.left =
        myHead.x - 1 == myBody[i].x && myHead.y == myBody[i].y
          ? false
          : moveSafety.left;
      moveSafety.up =
        myHead.x == myBody[i].x && myHead.y + 1 == myBody[i].y
          ? false
          : moveSafety.up;
      moveSafety.down =
        myHead.x == myBody[i].x && myHead.y - 1 == myBody[i].y
          ? false
          : moveSafety.down;

      riskyMoves.right =
        myHead.x + 1 == myBody[i].x && myHead.y == myBody[i].y
          ? false
          : riskyMoves.right;
      riskyMoves.left =
        myHead.x - 1 == myBody[i].x && myHead.y == myBody[i].y
          ? false
          : riskyMoves.left;
      riskyMoves.up =
        myHead.x == myBody[i].x && myHead.y + 1 == myBody[i].y
          ? false
          : riskyMoves.up;
      riskyMoves.down =
        myHead.x == myBody[i].x && myHead.y - 1 == myBody[i].y
          ? false
          : riskyMoves.down;
    }
  }

  function riskyPres() {
    let ate = 1;
    if (gameState.you.health == 100) {
      ate = 0;
    }
    for (let i = 1; i < myBody.length - ate; i++) {
      riskyMoves.right =
        myHead.x + 1 == myBody[i].x && myHead.y == myBody[i].y
          ? false
          : riskyMoves.right;
      riskyMoves.left =
        myHead.x - 1 == myBody[i].x && myHead.y == myBody[i].y
          ? false
          : riskyMoves.left;
      riskyMoves.up =
        myHead.x == myBody[i].x && myHead.y + 1 == myBody[i].y
          ? false
          : riskyMoves.up;
      riskyMoves.down =
        myHead.x == myBody[i].x && myHead.y - 1 == myBody[i].y
          ? false
          : riskyMoves.down;
    }
  }

  selfPreservation();
  riskyPres();
  // Add a new function to detect positions right behind enemy heads
  function detectEnemyNecks() {
    let enemyNecks = [];

    for (let snake of gameState.board.snakes) {
      if (snake.id == gameState.you.id) continue;
      let enemyNeck = snake.body[1];
      enemyNecks.push({ x: enemyNeck.x, y: enemyNeck.y });
    }
    return enemyNecks;
  }

  for (let j = 0; j < gameState.board.snakes.length; j++) {
    let enemySnake = gameState.board.snakes[j];
    if (enemySnake.id == gameState.you.id) continue;

    function enemyDodging() {
      let enemyNecks = detectEnemyNecks();
      let h = 1;
      if (enemySnake.health == 100) {
        h = 0;
      }

      for (let i = 0; i < enemySnake.body.length - h; i++) {
        let enemyBody = enemySnake.body[i];
        moveSafety.right =
          myHead.x + 1 == enemyBody.x && myHead.y == enemyBody.y
            ? false
            : moveSafety.right;
        moveSafety.left =
          myHead.x - 1 == enemyBody.x && myHead.y == enemyBody.y
            ? false
            : moveSafety.left;
        moveSafety.up =
          myHead.x == enemyBody.x && myHead.y + 1 == enemyBody.y
            ? false
            : moveSafety.up;
        moveSafety.down =
          myHead.x == enemyBody.x && myHead.y - 1 == enemyBody.y
            ? false
            : moveSafety.down;
      }

      for (let neck of enemyNecks) {
        moveSafety.right =
          myHead.x + 1 == neck.x && myHead.y == neck.y
            ? false
            : moveSafety.right;
        moveSafety.left =
          myHead.x - 1 == neck.x && myHead.y == neck.y
            ? false
            : moveSafety.left;
        moveSafety.up =
          myHead.x == neck.x && myHead.y + 1 == neck.y ? false : moveSafety.up;
        moveSafety.down =
          myHead.x == neck.x && myHead.y - 1 == neck.y
            ? false
            : moveSafety.down;
        riskyMoves.right =
          myHead.x + 1 == neck.x && myHead.y == neck.y
            ? false
            : riskyMoves.right;
        riskyMoves.left =
          myHead.x - 1 == neck.x && myHead.y == neck.y
            ? false
            : riskyMoves.left;
        riskyMoves.up =
          myHead.x == neck.x && myHead.y + 1 == neck.y ? false : riskyMoves.up;
        riskyMoves.down =
          myHead.x == neck.x && myHead.y - 1 == neck.y
            ? false
            : riskyMoves.down;
      }
    }
    enemyDodging();

    let enemyHead = enemySnake.body[0];
    let myLength = gameState.you.body.length;
    let enemyLength = enemySnake.body.length;

    if (enemyLength >= myLength) {
      let enemyMoves = [
        { x: enemyHead.x + 1, y: enemyHead.y },
        { x: enemyHead.x - 1, y: enemyHead.y },
        { x: enemyHead.x, y: enemyHead.y + 1 },
        { x: enemyHead.x, y: enemyHead.y - 1 },
      ];
      for (let move of enemyMoves) {
        if (myHead.x + 1 == move.x && myHead.y == move.y) {
          moveSafety.right = false;
          riskyMoves.right = true;
        }
        if (myHead.x - 1 == move.x && myHead.y == move.y) {
          moveSafety.left = false;
          riskyMoves.left = true;
        }
        if (myHead.x == move.x && myHead.y + 1 == move.y) {
          moveSafety.up = false;
          riskyMoves.up = true;
        }
        if (myHead.x == move.x && myHead.y - 1 == move.y) {
          moveSafety.down = false;
          riskyMoves.down = true;
        }
      }
      enemyDodging();
      selfPreservation();
      riskyPres();
    }

    if (enemyLength < myLength) {
      let enemyMoves = [
        { x: enemyHead.x + 1, y: enemyHead.y },
        { x: enemyHead.x - 1, y: enemyHead.y },
        { x: enemyHead.x, y: enemyHead.y + 1 },
        { x: enemyHead.x, y: enemyHead.y - 1 },
      ];
      for (let move of enemyMoves) {
        priorityMoves.right =
          myHead.x + 1 == move.x && myHead.y == move.y
            ? true
            : priorityMoves.right;
        priorityMoves.left =
          myHead.x - 1 == move.x && myHead.y == move.y
            ? true
            : priorityMoves.left;
        priorityMoves.up =
          myHead.x == move.x && myHead.y + 1 == move.y
            ? true
            : priorityMoves.up;
        priorityMoves.down =
          myHead.x == move.x && myHead.y - 1 == move.y
            ? true
            : priorityMoves.down;
      }
      enemyDodging();
      selfPreservation();
      riskyPres();
    }
  }
  function getNextPosition(pos, dir) {
    let newPos = { x: pos.x, y: pos.y };

    if (dir == "up") {
      newPos.y += 1;
    } else if (dir == "down") {
      newPos.y -= 1;
    } else if (dir == "left") {
      newPos.x -= 1;
    } else if (dir == "right") {
      newPos.x += 1;
    }

    return newPos;
  }
  // Updated evaluateSpace function with proper parameters
  function evaluateSpace() {
    let visited = new Set();
    Object.keys(moveSafety).forEach((dir) => {
      if (!moveSafety[dir]) {
        spaceScores[dir] = 0;
        return;
      }
      let nextPos = getNextPosition(myHead, dir);
      let space = floodFill(nextPos, 0, new Set(visited));
      let exitAnalysis = countExits(nextPos);

      spaceScores[dir] =
        space +
        exitAnalysis.scores.up * 0.2 +
        exitAnalysis.scores.down * 0.2 +
        exitAnalysis.scores.left * 0.2 +
        exitAnalysis.scores.right * 0.2 +
        exitAnalysis.count * 18; // Bonus for multiple good exits
    });
  }
  evaluateSpace();

  let myLength = gameState.you.body.length;
  let myHealth = gameState.you.health;

  for (let snake of gameState.board.snakes) {
    if (snake.id == gameState.you.id) continue;

    let enemyHead = snake.body[0];
    let enemyLength = snake.body.length;

    // Only hunt snakes that are strictly SMALLER than you
    if (myLength > enemyLength + 1 && myHealth > 60) {
      let distance =
        Math.abs(myHead.x - enemyHead.x) + Math.abs(myHead.y - enemyHead.y);

      if (distance <= 2) {
        priorityMoves.right = enemyHead.x > myHead.x || priorityMoves.right;
        priorityMoves.left = enemyHead.x < myHead.x || priorityMoves.left;
        priorityMoves.up = enemyHead.y > myHead.y || priorityMoves.up;
        priorityMoves.down = enemyHead.y < myHead.y || priorityMoves.down;
      }
    }
  }


  let longestSnake = 0
  for (const snake of gameState.board.snakes) { 
      if (snake.id == gameState.you.id) continue;
      if (snake.body.length > longestSnake) {
          longestSnake = snake.body.length;
      }
  }


  if (myHealth < healthLimit) {
    priorityMoves = { up: false, down: false, left: false, right: false };
    let bestFood = findBestFood(myHead, gameState.board.food, gameState);
    if (bestFood) {
      priorityMoves.right = bestFood.x > myHead.x;
      priorityMoves.left = bestFood.x < myHead.x;
      priorityMoves.up = bestFood.y > myHead.y;
      priorityMoves.down = bestFood.y < myHead.y;
    }

  }
  let safeMoves = Object.keys(moveSafety).filter(
    (direction) => moveSafety[direction]
  );
  let riskyOptions = Object.keys(riskyMoves).filter(
    (direction) => riskyMoves[direction]
  );
  let futureSafeMoves = safeMoves.filter((move) =>
    futureSense(move, gameState, 16)
  );
  let moveScores = {};
  futureSafeMoves = futureSafeMoves.filter((move) =>
    isValidMove(gameState, move)
  );
  futureSafeMoves.forEach((move) => {
    moveScores[move] = 0;
    moveScores[move] += spaceScores[move] * 2.5;

    for(let haz in gameState.board.hazards){
      if(move.x == haz.x){
        moveScores[move] -= 600;
      }
      if(move.y == haz.y){
        moveScores[move] -= 600;
      }
    }

    if (myHealth < healthLimit) {
      if(gameState.turn < 100){
        moveScores[move] += priorityMoves[move] ? 180 : 0;
      } else {
        moveScores[move] += priorityMoves[move] ? 200 : 0;
      }
      
      if (myHealth < 30) {
        moveScores[move] += priorityMoves[move] ? 850 : 0;
      }
      if (myHealth < 20) {
        moveScores[move] += priorityMoves[move] ? 1000000000 : 0;
      }
    }

    let nextPos = getNextPosition(myHead, move);
    let centerX = Math.floor(gameState.board.width / 2);
    let centerY = Math.floor(gameState.board.height / 2);
    let distanceToCenter =
      Math.abs(nextPos.x - centerX) + Math.abs(nextPos.y - centerY);

    if (gameState.turn < 150) {
      moveScores[move] += distanceToCenter * 10;
    }

    
    moveScores[move] = penalizeHeadProximity(moveScores[move], myHead, gameState)
    if (gameState.you.health > 40) {
      let nextMoves = countExits(nextPos, gameState.you.body.length).count;
      moveScores[move] += nextMoves * 5;
    }

    if (gameState.turn < 100 || myLength < longestSnake) {

      let bestFood = findBestFood(myHead, gameState.board.food, gameState);
      if (bestFood) {
        priorityMoves.right = bestFood.x > myHead.x;
        priorityMoves.left = bestFood.x < myHead.x;
        priorityMoves.up = bestFood.y > myHead.y;
        priorityMoves.down = bestFood.y < myHead.y;
      
        for (let dir in priorityMoves) {
          if (priorityMoves[dir]) {
            moveScores[dir] = moveScores[dir] || 0;
            moveScores[dir] += 300;
          }
        }
      }
      healthLimit = 35 * gameState.board.snakes.length; 
    } else {
      if (myLength + 1 <= longestSnake) {
        healthLimit = 30 * gameState.board.snakes.length - 0.5;
      } else {
        healthLimit = 25 * gameState.board.snakes.length - 1; 
      }
    }

    moveScores = centerControlStrategy(gameState, myHead, moveScores);

    moveScores = huntSmallerSnakes(gameState, myHead, myLength, myHealth, moveScores);

    moveScores = seekHeadCollisions(gameState, myHead, myLength, moveScores);

    moveScores = avoidTailsAboutToEat(gameState, myHead, moveScores);

    moveScores = enemyTrapped(gameState, moveScores)

    let myTail = myBody[myBody.length - 1];
    let tailPriorityMoves = [];

    if (myHead.x < myTail.x && moveSafety.right) {
      tailPriorityMoves.push("right");
    }
    if (myHead.x > myTail.x && moveSafety.left) {
      tailPriorityMoves.push("left");
    }
    if (myHead.y < myTail.y && moveSafety.up) {
      tailPriorityMoves.push("up");
    }
    if (myHead.y > myTail.y && moveSafety.down) {
      tailPriorityMoves.push("down");
    }
    const tailBias = Math.max(0, myBody.length - 4);

    for (const move of tailPriorityMoves) {
      if (moveScores[move] !== undefined) {
          moveScores[move] = moveScores[move] + (tailBias * 5);
      }
    }

    if (gameState.you.health > 50) {
      for (let snake of gameState.board.snakes) {
        if (snake.id == gameState.you.id) continue;

        if (snake.body.length < gameState.you.body.length) {
          let enemyHead = snake.body[0];
          let currentDistance =
            Math.abs(myHead.x - enemyHead.x) + Math.abs(myHead.y - enemyHead.y);
          let newDistance =
            Math.abs(nextPos.x - enemyHead.x) +
            Math.abs(nextPos.y - enemyHead.y);
          if (newDistance < currentDistance) {
            moveScores[move] += 10;
          }
        }
      }
    }
    for (let snake of gameState.board.snakes) {
      if (snake.id == gameState.you.id) continue;
      if(snake.length >= myLength){
        let enemyHead = snake.body[0];
        if (enemyHead.x > myHead.x) {
          moveScores.right -= 150;
        }
        if (enemyHead.y > myHead.y) {
          moveScores.up -= 150;
        }
        if (enemyHead.x < myHead.x) {
          moveScores.left -= 150;
        }
        if (enemyHead.y < myHead.y) {
          moveScores.down -= 150;
        }
      }
        
    }
    

    if (gameState.you.health < 100) {
      for (let snake of gameState.board.snakes) {
        if (snake.id == gameState.you.id) continue;

        if (snake.body.length > gameState.you.body.length) {
          let enemyHead = snake.body[0];
          let currentDistance =
            Math.abs(myHead.x - enemyHead.x) + Math.abs(myHead.y - enemyHead.y);
          let newDistance =
            Math.abs(nextPos.x - enemyHead.x) +
            Math.abs(nextPos.y - enemyHead.y);
          if (newDistance < currentDistance) {
            moveScores[move] -= 300 / gameState.board.snakes.length;
          }
        }
      }
    }
  });
  let bestMove = null;
  let bestScore = -100000;
  let futureSafeMovesFinal = safeMoves.filter((move) =>
    futureSense(move, gameState, 13)
  );
  if (futureSafeMovesFinal.length > 0) {
    futureSafeMovesFinal = futureSafeMovesFinal.filter(
      (move) => isValidMove(gameState, move) && moveSafety[move]
    );
    for (let move of futureSafeMovesFinal) {
      if (moveScores[move] > bestScore) {
        bestScore = moveScores[move];
        bestMove = move;
      }
    }
    if (bestMove && moveSafety[bestMove] && bestScore > 50) {
      console.log(
        `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - Choosing best future-safe move: ${bestMove} (score: ${moveScores[bestMove]})`
      );
      return { move: bestMove };
    }
  }
  for (let depth of [10,9,8,7,6,5]) {
    let bestMoveAtDepth = null;
    let bestScoreAtDepth = -100000;
    let validMovesAtDepth = [];
    for (let move of safeMoves) {
      if (moveSafety[move] && futureSense(move, gameState, depth)) {
        validMovesAtDepth.push(move);
      }
    }
    if (validMovesAtDepth.length > 0) {
      let depthMoveScores = {};
      for (let move of validMovesAtDepth) {
        depthMoveScores[move] = 0;
        depthMoveScores[move] += spaceScores[move] * 2.6;
        if (myHealth < 20) {
          depthMoveScores[move] += priorityMoves[move] ? 400 : 0;
        } else {
          depthMoveScores[move] += priorityMoves[move] ? 20 : 0;
        }
        if (depthMoveScores[move] > bestScoreAtDepth) {
          bestScoreAtDepth = depthMoveScores[move];
          bestMoveAtDepth = move;
        }
      }
      if (bestMoveAtDepth) {
        console.log(
          `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - Choosing best-scored safe move with ${depth} future-sense: ${bestMoveAtDepth} (score: ${bestScoreAtDepth})`
        );
        return { move: bestMoveAtDepth };
      }
    }
  }
  if (riskyOptions.length > 0) {
    let riskyMoveScores = {};
    let riskyMoveSurvival = {}; // Track how many future moves each risky option allows
    
    riskyOptions.forEach(move => {
        riskyMoveScores[move] = 0;
        riskyMoveSurvival[move] = 0;
        
        // Calculate how many future moves this risky option allows
        for (let depth = 10; depth >= 1; depth--) {
            if (futureSense(move, gameState, depth)) {
                riskyMoveSurvival[move] = depth;
                riskyMoveScores[move] += depth * 10;
                break;
            }
        }
        
        riskyMoveScores[move] += spaceScores[move];

        let myTail = myBody[myBody.length - 1];
        if ((myHead.x < myTail.x && move == "right") ||
            (myHead.x > myTail.x && move == "left") ||
            (myHead.y < myTail.y && move == "up") ||
            (myHead.y > myTail.y && move == "down")) {
            riskyMoveScores[move] += 600;
        }
        
        if ((move.x == 0 || move.x == gameState.board.width - 1) && 
            (move.y == 0 || move.y == gameState.board.height - 1)) {
            riskyMoveScores[move] -= 100;
        }
        
        for (let snake of gameState.board.snakes) {
            if (snake.id == gameState.you.id) continue;
            if ((snake.body[snake.length-1].x == move.x) && (snake.body[snake.length-1].y == move.y)){
                riskyMoveScores[move] -= 40;
            }
            for(let food of gameState.board.food){
                if ((snake.body[0].x + 1 == food.x) && (snake.body[0].y == food.y)){
                    riskyMoveScores.right -= 40;
                }
                if ((snake.body[0].x - 1 == food.x) && (snake.body[0].y == food.y)){
                    riskyMoveScores.left -= 40;
                }
                if ((snake.body[0].x == food.x) && (snake.body[0].y + 1 == food.y)){
                    riskyMoveScores.up -= 40;
                }
                if ((snake.body[0].x == food.x) && (snake.body[0].y - 1 == food.y)){
                    riskyMoveScores.down -= 40;
                }
            }
        }

        
        if (priorityMoves[move]) {
            riskyMoveScores[move] += 15;
        }

        let nextPos = getNextPosition(myHead, move);
        let exitAnalysis = countExits(nextPos);
        riskyMoveScores[move] += exitAnalysis.count * 15;

        
    });
    
    let bestRiskyScore = -Infinity;
    let bestRiskyMove = null;
  
    let viableRiskyOptions = riskyOptions.filter(move => riskyMoveSurvival[move] > myLength/5);
    riskyMoveScores = adjustScoresForHeadCollisions(gameState, riskyMoveScores)
    if (viableRiskyOptions.length > 0) {
        for (let move of viableRiskyOptions) {
            if (riskyMoveScores[move] > bestRiskyScore) {
                bestRiskyScore = riskyMoveScores[move];
                bestRiskyMove = move;
            }
        }
        if(bestRiskyScore > 0){
          bestMove = bestRiskyMove || viableRiskyOptions[0];
        console.log(
            `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - Using fallback (1) risky move: ${bestMove} ` +
            `(score: ${bestRiskyScore}, future survival: ${riskyMoveSurvival[bestMove]})`
        );
        return { move: bestMove };
        }
        
    } else {
        console.log(
            `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - No risky moves allow sufficient future survival`
        );
    }
}
if (safeMoves.length > 0) {
  let bestSafeScore = -10000000;
  let bestSafeMove = null;
  for (let move of safeMoves) {
    let score = 0;
    let nextPos = getNextPosition(myHead, move);
    score += spaceScores[move] * 3;
    for (let depth = 10; depth >= 1; depth -= 1) {
      if (futureSense(move, gameState, depth)) {
        score += depth * 10;
        break;
      }
    }
    let myTail = myBody[myBody.length - 1];
    if ((myHead.x < myTail.x && move == "right") ||
        (myHead.x > myTail.x && move == "left") ||
        (myHead.y < myTail.y && move == "up") ||
        (myHead.y > myTail.y && move == "down")) {
          score += 500;
    }
    let exitCount = countExits(nextPos).count;
    score += exitCount * 18;
    let floodSpace = floodFill(nextPos, 0, new Set());
    score += floodSpace * 2;
    if (score > bestSafeScore) {
      bestSafeScore = score;
      bestSafeMove = move;
    }
  }
  
  console.log(
    `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - Choosing best safe move: ${bestSafeMove} (score: ${bestSafeScore})`
  );
  return { move: bestSafeMove || safeMoves[0] };
} else {
  const allDirections = ["up", "down", "left", "right"];
  let riskyMoveScores = {};
  
  let myTail = myBody[myBody.length - 1];
  for (const move of allDirections) {
    riskyMoveScores[move] = 0;
    if (
      (myHead.x < myTail.x && move === "right") ||
      (myHead.x > myTail.x && move === "left") ||
      (myHead.y < myTail.y && move === "up") ||
      (myHead.y > myTail.y && move === "down")
    ) {
      riskyMoveScores[move] += 10;
    }
  }
  

    riskyOptions.sort((a, b) => riskyMoveScores[b] - riskyMoveScores[a]);
    if (riskyOptions.length > 0) {


      bestMove = riskyOptions[0];
      console.log(
        `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - Using fallback (2) risky move: ${bestMove}`
      );
      return { move: bestMove };
    }
    for (let dir of allDirections) {
      let nextPos = getNextPosition(myHead, dir);
      if (
        nextPos.x >= 0 &&
        nextPos.x < gameState.board.width &&
        nextPos.y >= 0 &&
        nextPos.y < gameState.board.height
      ) {
        let hitSelf = false;
        for (let i = 0; i < myBody.length - 1; i++) {
          if (nextPos.x == myBody[i].x && nextPos.y == myBody[i].y) {
            hitSelf = true;
            break;
          }
        }
        if (!hitSelf) {
          console.log(
            `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - Last resort move: ${dir}`
          );
          return { move: dir };
        }
      }
    }
    const randomDir =
      allDirections[Math.floor(Math.random() * allDirections.length)];
    console.log(
      `Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - No valid moves, using random direction: ${randomDir}`
    );
    return { move: randomDir };
  }

  //  floodFill and countExits functions
  function floodFill(pos, depth, visited, limit = 100) {
    const key = `${pos.x},${pos.y}`;
    if (visited.has(key) || depth > limit) return 0;
    visited.add(key);

    // Out of bounds
    if (
      pos.x < 0 ||
      pos.x >= gameState.board.width ||
      pos.y < 0 ||
      pos.y >= gameState.board.height
    )
      return 0;

    // Check if the tile is occupied by any body
    for (let snake of gameState.board.snakes) {
      for (let i = 0; i < snake.body.length; i++) {
        const segment = snake.body[i];
        if (segment.x == pos.x && segment.y == pos.y) return 0;
      }
    }

    // Avoid tiles enemy heads might move into
    const dangerousTiles = getEnemyHeadNextMoves();
    for (let danger of dangerousTiles) {
      if (danger.x == pos.x && danger.y == pos.y) return 0;
    }

    let space = 1;
    for (let dx of [-1, 1]) {
      space += floodFill(
        { x: pos.x + dx, y: pos.y },
        depth + 1,
        visited,
        limit
      );
    }
    for (let dy of [-1, 1]) {
      space += floodFill(
        { x: pos.x, y: pos.y + dy },
        depth + 1,
        visited,
        limit
      );
    }
    return space;
  }

  function countExits(pos, myLength) {
    const directions = {
      up: { x: pos.x, y: pos.y + 1 },
      down: { x: pos.x, y: pos.y - 1 },
      left: { x: pos.x - 1, y: pos.y },
      right: { x: pos.x + 1, y: pos.y },
    };

    const enemyHeadMoves = getEnemyHeadNextMoves(myLength);
    let scores = {};
    let count = 0;

    for (let dir in directions) {
      const p = directions[dir];
      let isSafe = true;

      // Check board boundaries
      if (
        p.x < 0 ||
        p.x > gameState.board.width - 1 ||
        p.y < 0 ||
        p.y > gameState.board.height - 1
      ) {
        isSafe = false;
      }

      // Check bodies
      if (isSafe) {
        for (let snake of gameState.board.snakes) {
          for (let segment of snake.body) {
            if (segment.x == p.x && segment.y == p.y) {
              isSafe = false;
              break;
            }
          }
          if (!isSafe) break;
        }
      }

      // Check if an enemy might move there next
      if (isSafe) {
        for (let danger of enemyHeadMoves) {
          if (danger.x == p.x && danger.y == p.y) {
            isSafe = false;
            break;
          }
        }
      }

      scores[dir] = isSafe ? 1 : 0;
      if (isSafe) count += 1;
    }

    return { scores, count };
  }

  function getEnemyHeadNextMoves(myLength = 0) {
    const dangerTiles = [];

    for (let snake of gameState.board.snakes) {
      if (snake.id == gameState.you.id) continue; // Skip yourself

      // Mark snakes of equal or greater length as dangerous
      const isDangerous = snake.body.length >= myLength;
      if (!isDangerous) continue;

      const head = snake.body[0];
      const possibleMoves = [
        { x: head.x + 1, y: head.y },
        { x: head.x - 1, y: head.y },
        { x: head.x, y: head.y + 1 },
        { x: head.x, y: head.y - 1 },
      ];

      for (let move of possibleMoves) {
        // Ignore out-of-bounds
        if (
          move.x >= 0 &&
          move.x < gameState.board.width &&
          move.y >= 0 &&
          move.y < gameState.board.height
        ) {
          dangerTiles.push(move);
        }
      }
    }

    return dangerTiles;
  }
}

// checking for dead ends and enemy movement
function futureSense(move, gameState, depth) {
  if (depth <= 0) {
    // base case
    return true;
  }

  let newGameState = JSON.parse(JSON.stringify(gameState));
  let mySnake = newGameState.you;
  let myBody = mySnake.body;

  let newHead = { ...myBody[0] }; // clone so it can't be changed
  if (move == "up") {
    newHead.y += 1;
  } else if (move == "down") {
    newHead.y -= 1;
  } else if (move == "left") {
    newHead.x -= 1;
  } else if (move == "right") {
    newHead.x += 1;
  }

  myBody.unshift(newHead);
  if (
    newHead.x < 0 ||
    newHead.x > newGameState.board.width - 1 ||
    newHead.y < 0 ||
    newHead.y > newGameState.board.height - 1
  ) {
    return false;
  }
  let x = 1
  if(mySnake.health == 100){
    x = 0
  }
  mySnake.health -= 1;
  for (let i = 1; i < myBody.length - x; i++) {
    if (newHead.x == myBody[i].x && newHead.y == myBody[i].y) {
      return false;
    }
  }

  for (let snake of newGameState.board.snakes) {
    if (snake.id == mySnake.id) continue;

    let enemyHead = snake.body[0];
    let possibleEnemyMoves = [];

    let directions = [
      { move: "up", x: enemyHead.x, y: enemyHead.y + 1 },
      { move: "down", x: enemyHead.x, y: enemyHead.y - 1 },
      { move: "left", x: enemyHead.x - 1, y: enemyHead.y },
      { move: "right", x: enemyHead.x + 1, y: enemyHead.y },
    ];

    for (let dir of directions) {
      if (
        dir.x < 0 ||
        dir.x > newGameState.board.width ||
        dir.y < 0 ||
        dir.y > newGameState.board.height
      ) {
        continue;
      }
      let hitBody = false;
      for (let i = 0; i < snake.body.length - 1; i++) {
        if (dir.x == snake.body[i].x && dir.y == snake.body[i].y) {
          hitBody = true;
          break;
        }
      }
      if (!hitBody) {
        possibleEnemyMoves.push(dir);
      }
    }
    if (possibleEnemyMoves.length == 0) continue;

    let randomMove =
      possibleEnemyMoves[Math.floor(Math.random() * possibleEnemyMoves.length)];

    snake.body.unshift({ x: randomMove.x, y: randomMove.y });
    if (snake.health != 100) {
      snake.body.pop();
    }
  }

  for (let snake of newGameState.board.snakes) {
    if (snake.id == mySnake.id) continue;

    if (snake.body.length > 0) {
      let enemyHead = snake.body[0];
      if (newHead.x == enemyHead.x && newHead.y == enemyHead.y) {
        if (myBody.length <= snake.body.length) {
          return false;
        }
      }
    }
    for (let i = 0; i < snake.body.length - 1; i++) {
      if (newHead.x == snake.body[i].x && newHead.y == snake.body[i].y) {
        return false;
      }
    }
  }
  let nextMoves = ["up", "down", "left", "right"];
  for (let nextMove of nextMoves) {
    if (futureSense(nextMove, newGameState, depth - 1)) {
      return true;
    }
  }
  return false;
}

function isValidMove(gameState, move) {
  const head = gameState.you.head;
  const boardWidth = gameState.board.width;
  const boardHeight = gameState.board.height;

  let newPos = { x: head.x, y: head.y };

  if (move == "up") {
    newPos.y += 1;
  } else if (move == "down") {
    newPos.y -= 1;
  } else if (move == "left") {
    newPos.x -= 1;
  } else if (move == "right") {
    newPos.x += 1;
  }
  if (
    newPos.x < 0 ||
    newPos.x >= boardWidth ||
    newPos.y < 0 ||
    newPos.y >= boardHeight
  ) {
    return false;
  }

  return true;
}

function penalizeHeadProximity(moveScores, myHead, gameState) {
  const myLength = gameState.you.body.length;

  for (const move in moveScores) {
    let nextPos = getNextPosition(myHead, move);
    for (const snake of gameState.board.snakes) {
      if (snake.id == gameState.you.id) continue;
      
      const enemyHead = snake.body[0];
      const enemyLength = snake.body.length;
      const distance = Math.abs(nextPos.x - enemyHead.x) + Math.abs(nextPos.y - enemyHead.y);
      let sizePenalty = 1;
      if (enemyLength >= myLength) {
        sizePenalty = 2.5;
      } else {
        sizePenalty = 0.5;
      }
      // Determine penalty based on distance
      if (distance <= 1) {
        moveScores[move] -= 200 * sizePenalty;
      } else if (distance == 2) {
        moveScores[move] -= 100 * sizePenalty;
      } else if (distance == 3) {
        moveScores[move] -= 50 * sizePenalty;
      } else if (distance <= 5) {
        moveScores[move] -= 20 * sizePenalty;
      }
    }
  }
  
  return moveScores;
}

function huntSmallerSnakes(gameState, myHead, myLength, myHealth, moveScores) {
  if (myLength < 5 || myHealth < 50) return moveScores;
  
  for (let snake of gameState.board.snakes) {
    if (snake.id == gameState.you.id) continue;
    
    const enemyHead = snake.body[0];
    const enemyLength = snake.body.length;

    if (myLength > enemyLength) {
      const distance = Math.abs(myHead.x - enemyHead.x) + Math.abs(myHead.y - enemyHead.y);

      const sizeDiff = myLength - enemyLength;
      const huntBonus = Math.min(sizeDiff * 10, 50);

      if (distance <= 5) {
        moveScores.right = enemyHead.x > myHead.x ? moveScores.right + 400 + huntBonus : moveScores.right;
        moveScores.left = enemyHead.x < myHead.x ? moveScores.left + 400 + huntBonus : moveScores.left;
        moveScores.up = enemyHead.y > myHead.y ? moveScores.up + 400 + huntBonus : moveScores.up;
        moveScores.down = enemyHead.y < myHead.y ? moveScores.down + 400 + huntBonus : moveScores.down;
      } else if (distance <= 8) {
        moveScores.right = enemyHead.x > myHead.x ? moveScores.right + 200 + huntBonus : moveScores.right;
        moveScores.left = enemyHead.x < myHead.x ? moveScores.left + 200 + huntBonus : moveScores.left;
        moveScores.up = enemyHead.y > myHead.y ? moveScores.up + 200 + huntBonus : moveScores.up;
        moveScores.down = enemyHead.y < myHead.y ? moveScores.down + 200 + huntBonus : moveScores.down;
      } else if (distance <= 10 && sizeDiff > 2) {
        moveScores.right = enemyHead.x > myHead.x ? moveScores.right + 50 : moveScores.right;
        moveScores.left = enemyHead.x < myHead.x ? moveScores.left + 50 : moveScores.left;
        moveScores.up = enemyHead.y > myHead.y ? moveScores.up + 50 : moveScores.up;
        moveScores.down = enemyHead.y < myHead.y ? moveScores.down + 50 : moveScores.down;
      }
    }
  }
  
  return moveScores;
}

function seekHeadCollisions(gameState, myHead, myLength, moveScores) {
  for (let snake of gameState.board.snakes) {
    if (snake.id == gameState.you.id) continue;
    
    const enemyHead = snake.body[0];
    const enemyLength = snake.body.length;

    if (myLength > enemyLength) {

      const enemyMoves = [
        { x: enemyHead.x + 1, y: enemyHead.y },
        { x: enemyHead.x - 1, y: enemyHead.y },
        { x: enemyHead.x, y: enemyHead.y + 1 },
        { x: enemyHead.x, y: enemyHead.y - 1 }
      ];
 
      for (let enemyMove of enemyMoves) {
        if (myHead.x + 1 == enemyMove.x && myHead.y == enemyMove.y) {
          moveScores.right += 1000;
        }
        if (myHead.x - 1 == enemyMove.x && myHead.y == enemyMove.y) {
          moveScores.left += 1000;
        }
        if (myHead.x == enemyMove.x && myHead.y + 1 == enemyMove.y) {
          moveScores.up += 1000;
        }
        if (myHead.x == enemyMove.x && myHead.y - 1 == enemyMove.y) {
          moveScores.down += 1000;
        }
      }
    }
  }
  
  return moveScores;
}

function centerControlStrategy(gameState, myHead, moveScores) {
  if (gameState.turn > 100) return moveScores;
  
  const centerX = Math.floor(gameState.board.width / 2);
  const centerY = Math.floor(gameState.board.height / 2);

  const distanceToCenter = Math.abs(myHead.x - centerX) + Math.abs(myHead.y - centerY);
  
  if (distanceToCenter <= 2) return moveScores;

  const moveTowardsCenter = {
    right: myHead.x < centerX,
    left: myHead.x > centerX,
    up: myHead.y < centerY,
    down: myHead.y > centerY
  };
  
  for (let dir in moveTowardsCenter) {
    if (moveTowardsCenter[dir]) {
      moveScores[dir] = moveScores[dir] || 0;
      const turnFactor = Math.max(1, 1000 - gameState.turn) / 100;
      moveScores[dir] += 75 * turnFactor;
    } 
  }
  
  return moveScores;
}

function findBestFood(snakeHead, foodLocations, gameState) {
  let foodScores = [];
  const myLength = gameState.you.body.length;
  
  if (!foodLocations || foodLocations.length == 0) return null;
  for (let food of foodLocations) {
    const distance = Math.abs(snakeHead.x - food.x) + Math.abs(snakeHead.y - food.y);

    let score = 100 - distance * 5;

    const isCorner = 
      (food.x == 0 || food.x == gameState.board.width - 1) &&
      (food.y == 0 || food.y == gameState.board.height - 1);
    
    if (isCorner) score -= 400;
    const isEdge = 
      food.x == 0 || food.x == gameState.board.width - 1 ||
      food.y == 0 || food.y == gameState.board.height - 1;
    
    if (isEdge) score -= 50;
    for (let snake of gameState.board.snakes) {
      if (snake.id == gameState.you.id) continue;
      
      const enemyHead = snake.body[0];
      const enemyDistance = Math.abs(enemyHead.x - food.x) + Math.abs(enemyHead.y - food.y);
      const myDistance = Math.abs(snakeHead.x - food.x) + Math.abs(snakeHead.y - food.y);
      if (enemyDistance < myDistance) {
        if (snake.body.length > myLength) {
          score -= 200;
        } else {
          score -= 40;
        }
      }
      
      if (enemyDistance == myDistance && snake.body.length > myLength) {
        score -= 100;
      }
    }
  
    const centerX = Math.floor(gameState.board.width / 2);
    const centerY = Math.floor(gameState.board.height / 2);
    const centerDistance = Math.abs(food.x - centerX) + Math.abs(food.y - centerY);
    score -= centerDistance * 2;
    
    foodScores.push({ food, score });
  }
  foodScores.sort((a, b) => b.score - a.score);
  return foodScores[0].food;
}

function avoidTailsAboutToEat(gameState, myHead, moveScores) {
  const myNextPositions = {
    up: { x: myHead.x, y: myHead.y + 1 },
    down: { x: myHead.x, y: myHead.y - 1 },
    left: { x: myHead.x - 1, y: myHead.y },
    right: { x: myHead.x + 1, y: myHead.y }
  };
  
  for (const snake of gameState.board.snakes) {
    if (snake.id == gameState.you.id) continue;
    const enemyHead = snake.body[0];
    const enemyTail = snake.body[snake.body.length - 1];
    let aboutToEat = false;
    const enemyNextMoves = [
      { x: enemyHead.x + 1, y: enemyHead.y },
      { x: enemyHead.x - 1, y: enemyHead.y },
      { x: enemyHead.x, y: enemyHead.y + 1 },
      { x: enemyHead.x, y: enemyHead.y - 1 }
    ];
    for (const food of gameState.board.food) {
      for (const nextMove of enemyNextMoves) {
        if (nextMove.x == food.x && nextMove.y == food.y) {
          aboutToEat = true;
          break;
        }
      }
      if (aboutToEat) break;
    }
    if (aboutToEat) {
      for (const [direction, nextPos] of Object.entries(myNextPositions)) {
        if (nextPos.x == enemyTail.x && nextPos.y == enemyTail.y) {
          moveScores[direction] -= 300;
          console.log(`Snake ID: ${gameState.you.id} Turn: ${gameState.turn} - Avoiding move ${direction} - enemy about to eat, tail won't move!`);
        } else {
          moveScores[direction] += 250;
        }
      }
    }
  }
  
  return moveScores;
}

function enemyTrapped(gameState, moveScores) {
  const enemySnakes = gameState.board.snakes.filter(snake => snake.id !== gameState.you.id);
  
  for (const enemy of enemySnakes) {
    if (enemy.body[0].x == 1 || enemy.body[0].x == gameState.board.width - 1) {

      let neckX = enemy.body[1].x;
      let neckY = enemy.body[1].y;
      let headY = enemy.body[0].y;
      if (neckX == enemy.body[0].x) {
        if (neckY > headY && gameState.you.body[0].x == enemy.body[0].x && gameState.you.body[0].y == headY - 1) {
          moveScores.down += 100; 
        }
        else if (neckY < headY && gameState.you.body[0].x == enemy.body[0].x && gameState.you.body[0].y == headY + 1) {
          moveScores.up += 100; 
        }
      }
    }
    
    if (enemy.body[0].y == 1 || enemy.body[0].y == gameState.board.height - 1) {

      let neckX = enemy.body[1].x;
      let neckY = enemy.body[1].y;
      let headX = enemy.body[0].x;
      
      if (neckY == enemy.body[0].y) {

        if (neckX > headX && gameState.you.body[0].y == enemy.body[0].y && gameState.you.body[0].x == headX - 1) {
          moveScores.right += 100;
        }
        else if (neckX < headX && gameState.you.body[0].y == enemy.body[0].y && gameState.you.body[0].x == headX + 1) {
          moveScores.left += 100;
        }
      }
    }
  }
  return moveScores;
}

function adjustScoresForHeadCollisions(gameState, moveScores) {
  const myHead = gameState.you.body[0];
  const myLength = gameState.you.body.length;
  
  // Define score adjustments
  const SHORTER_PENALTY = -1000;  
  const LONGER_BONUS = 500;      
  const EQUAL_PENALTY = -50;      

  const myPossibleMoves = {
    up: { x: myHead.x, y: myHead.y + 1 },
    down: { x: myHead.x, y: myHead.y - 1 },
    left: { x: myHead.x - 1, y: myHead.y },
    right: { x: myHead.x + 1, y: myHead.y }
  };
  
  for (let snake of gameState.board.snakes) {
    if (snake.id === gameState.you.id) continue;
    
    const enemyHead = snake.body[0];
    const enemyLength = snake.body.length;
    
    const enemyPossibleMoves = [
      { x: enemyHead.x + 1, y: enemyHead.y },
      { x: enemyHead.x - 1, y: enemyHead.y },
      { x: enemyHead.x, y: enemyHead.y + 1 },
      { x: enemyHead.x, y: enemyHead.y - 1 }
    ];

    for (const [direction, myNextPos] of Object.entries(myPossibleMoves)) {
      for (const enemyNextPos of enemyPossibleMoves) {
        if (myNextPos.x === enemyNextPos.x && myNextPos.y === enemyNextPos.y) {
          if (myLength < enemyLength) {
            moveScores[direction] += SHORTER_PENALTY;
          } else if (myLength > enemyLength) {
            moveScores[direction] += LONGER_BONUS;
          } else {
            moveScores[direction] += EQUAL_PENALTY;
          }
        }
      }
    }
  }
  
  return moveScores;
}