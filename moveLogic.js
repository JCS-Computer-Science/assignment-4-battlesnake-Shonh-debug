export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };
    
    let movePriorities = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
    };

    // We've included code to prevent your Battlesnake from moving backwards
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    
    if (myNeck.x < myHead.x) {        // Neck is left of head, don't move left
        moveSafety.left = false;
        
    } else if (myNeck.x > myHead.x) { // Neck is right of head, don't move right
        moveSafety.right = false;
        
    } else if (myNeck.y < myHead.y) { // Neck is below head, don't move down
        moveSafety.down = false;
        
    } else if (myNeck.y > myHead.y) { // Neck is above head, don't move up
        moveSafety.up = false;
    }

    // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
    // gameState.board contains an object representing the game board including its width and height
    // https://docs.battlesnake.com/api/objects/board
   
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;

    if (myHead.x === 0) { // Prevent moving left out of bounds
        moveSafety.left = false;
    }
    if (myHead.x === boardWidth - 1) { // Prevent moving right out of bounds
        moveSafety.right = false;
    }
    if (myHead.y === 0) { // Prevent moving down out of bounds
        moveSafety.down = false;
    }
     if (myHead.y === boardHeight - 1) { // Prevent moving up out of bounds
        moveSafety.up = false;
    }
    if (myHead.x == 1) {
        movePriorities.left = -5;
    }
    if (myHead.x == boardWidth - 2) {
        movePriorities.right = -5;
    }
    if (myHead.y == 1) {
        movePriorities.down = -5;
    }
    if (myHead.y == boardHeight - 2) {
        movePriorities.up = -5;
    }
    
    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    
    const myBody = gameState.you.body;
    for (let i = 1; i < (myBody.length - 1); i++) {
        //Ignores tail?
        const segment = myBody[i];
        if (segment.x == myHead.x && segment.y == myHead.y + 1) {
            moveSafety.up = false;
        }
        if (segment.x == myHead.x && segment.y == myHead.y - 1) {
            moveSafety.down = false;
        }
        if (segment.x == myHead.x - 1 && segment.y == myHead.y) {
            moveSafety.left = false;
        }
        if (segment.x == myHead.x + 1 && segment.y == myHead.y) {
            moveSafety.right = false;
        }
        // Optional: Break early if all moves are already marked unsafe
        if (!moveSafety.up && !moveSafety.down && !moveSafety.left && !moveSafety.right) {
                break;
             }
    }
     // Prevent colliding with the rest of the body
    for (let i = 1; i < myBody.length; i++) { // Start from 1 to skip the head
        const segment = myBody[i];

    if (segment.x === myHead.x && segment.y === myHead.y + 1) {
        moveSafety.up = false; // Block upward movement
    }
    if (segment.x === myHead.x && segment.y === myHead.y - 1) {
        moveSafety.down = false; // Block downward movement
    }
    if (segment.x === myHead.x - 1 && segment.y === myHead.y) {
        moveSafety.left = false; // Block left movement
    }
    if (segment.x === myHead.x + 1 && segment.y === myHead.y) {
        moveSafety.right = false; // Block right movement
    }
}

    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    let isDangerClose = false;

    for (let i = 0; i < gameState.board.snakes.length; i++) {
        const enemySnake = gameState.board.snakes[i];
        const enemyHead = enemySnake.body[0];

        if (
            Math.abs(enemyHead.x - myHead.x) <= 2 && 
            Math.abs(enemyHead.y - myHead.y) <= 2
        ){
            isDangerClose = true;
            break;
        }

        if (enemySnake.body.length > gameState.you.body.length) {
            isDangerClose = true;
            break;
            }
        }
    for (let i = 0; i < gameState.board.snakes.length; i++) {
        const snake = gameState.board.snakes[i];
        const enemyHead = snake.body[0];
        const enemyBody = snake.body; 
        
        // Avoid colliding with their head
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y + 2) {
            moveSafety.up = false;
            movePriorities.up = -15;
            movePriorities.down += isDangerClose ? 2 : 1; // Dynamically boost safer moves
            movePriorities.left += isDangerClose ? 2 : 1;
            movePriorities.right += isDangerClose ? 2 : 1;
        }
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y - 2) {
            moveSafety.down = false;
            movePriorities.down = -15;
            movePriorities.up += isDangerClose ? 2 : 1;
            movePriorities.left += isDangerClose ? 2 : 1;
            movePriorities.right += isDangerClose ? 2 : 1;
        }
        if (enemyHead.x == myHead.x - 2 && enemyHead.y === myHead.y) {
            moveSafety.left = false;
            movePriorities.left = -15;
            movePriorities.up += isDangerClose ? 2 : 1;
            movePriorities.down += isDangerClose ? 2 : 1;
            movePriorities.right += isDangerClose ? 2 : 1;
        }
        if (enemyHead.x == myHead.x + 2 && enemyHead.y === myHead.y) {
            moveSafety.right = false;
            movePriorities.right = -15;
            movePriorities.up += isDangerClose ? 2 : 1;
            movePriorities.down += isDangerClose ? 2 : 1;
            movePriorities.left += isDangerClose ? 2 : 1;
        }
    
        // Avoid diagonal spots
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y - 1) {
            movePriorities.down = -10;
            movePriorities.left = -10;
            movePriorities.up += isDangerClose ? 2 : 1;
            movePriorities.right += isDangerClose ? 2 : 1;
        }
        if (enemyHead.x == myHead.x + 1 && enemyHead.y === myHead.y + 1) {
            movePriorities.right = -10;
            movePriorities.up = -10;
            movePriorities.down += isDangerClose ? 2 : 1;
            movePriorities.left += isDangerClose ? 2 : 1;
        }
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y + 1) {
            movePriorities.up = -10;
            movePriorities.left = -10;
            movePriorities.down += isDangerClose ? 2 : 1;
            movePriorities.right += isDangerClose ? 2 : 1;
        }
        if (enemyHead.x == myHead.x + 1 && enemyHead.y === myHead.y - 1) {
            movePriorities.down = -10;
            movePriorities.right = -10;
            movePriorities.up += isDangerClose ? 2 : 1;
            movePriorities.left += isDangerClose ? 2 : 1;
        }
        
        // Avoid colliding with their body and tail
        for (let i = 1; i < enemyBody.length - 1; i++) {
            const segment = snake.body[i];
            if (segment.x == myHead.x && segment.y === myHead.y + 2) {
                moveSafety.up = false;
            }
            if (segment.x == myHead.x && segment.y === myHead.y - 2) {
                moveSafety.down = false;
            }
            if (segment.x == myHead.x + 2 && segment.y === myHead.y) {
                moveSafety.right = false;
            }
            if (segment.x == myHead.x - 2 && segment.y === myHead.y) {
                moveSafety.left = false;
            }
        }
    }
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board
    // gameState.board contains an array of food coordinates
    
    const food = gameState.board.food; // List of food positions on the board
    const health = gameState.you.health; // Current health of the snake
    const turn = gameState.turn; // Current turn number
    
    if (food.length > 0 && (turn <= 20 || health < 80)) {
        // Find the closest food
        let closestFood = food[0];
        let closestDistance = Math.abs(food[0].x - myHead.x) + Math.abs(food[0].y - myHead.y);
    
        for (let i = 1; i < food.length; i++) {
            const currentFood = food[i];
            const distance = Math.abs(currentFood.x - myHead.x) + Math.abs(currentFood.y - myHead.y);
    
            // Avoid contested food logic
            let contested = false;
            for (let j = 0; j < gameState.board.snakes.length; j++) {
                const enemySnake = gameState.board.snakes[j];
                const enemyHead = enemySnake.body[0];
                const enemyLength = enemySnake.body.length;
    
                const enemyDistanceToFood = Math.abs(enemyHead.x - currentFood.x) + Math.abs(enemyHead.y - currentFood.y);
    
                // If an enemy snake is closer to the food and is larger or equal in length
                if (enemyDistanceToFood < distance && enemyLength >= gameState.you.body.length) {
                    contested = true; // Mark the food as contested
                    break;
                }
            }
    
            // If the food is not contested and is closer, update closestFood
            if (!contested && distance < closestDistance) {
                closestFood = currentFood;
                closestDistance = distance;
            }
        }
    
        // Dynamically adjust priorities toward the closest food
        if (closestFood.x < myHead.x && moveSafety.left) {
            if (myHead.x - 1 > 0) { // Check if moving left keeps the snake in bounds
                movePriorities.left += 20;
            } else {
                movePriorities.left = -20; // Penalize out-of-bounds moves
            }
        }
        if (closestFood.x > myHead.x && moveSafety.right) {
            if (myHead.x + 1 < boardWidth) { // Check if moving right keeps the snake in bounds
                movePriorities.right += 20;
            } else {
                movePriorities.right = -20; // Penalize out-of-bounds moves
            }
        }
        if (closestFood.y < myHead.y && moveSafety.up) {
            if (myHead.y - 1 > 0) { // Check if moving up keeps the snake in bounds
                movePriorities.up += 20;
            } else {
                movePriorities.up = -20; // Penalize out-of-bounds moves
            }
        }
        if (closestFood.y > myHead.y && moveSafety.down) {
            if (myHead.y + 1 < boardHeight) { // Check if moving down keeps the snake in bounds
                movePriorities.down += 20;
            } else {
                movePriorities.down = -20; // Penalize out-of-bounds moves
            }
        }
    }
    // Are there any safe moves left?
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length == 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
        return { move: "down" };
    }

      // Dynamically boost safe moves
      for (const move of safeMoves) {
        movePriorities[move] += 5; // Boost priorities of safe moves
    }

    const prioritizedMoves = safeMoves.sort((a, b) => (movePriorities[b] || 0) - (movePriorities[a] || 0));
    const nextMove = prioritizedMoves[0];


    console.log(`MOVE ${gameState.turn}: Chosen move: ${nextMove}`);
    return { move: nextMove };

}