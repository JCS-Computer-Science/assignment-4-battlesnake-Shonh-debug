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

    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
   
    for (let i = 0; i < gameState.board.snakes.length; i++) {
        const snake = gameState.board.snakes[i];
        const enemyHead = snake.body[0];
        const enemyBody = snake.body;
        //avoid colliding with their head
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y + 1) {
            moveSafety.up = false;
        }
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y - 1) {
            moveSafety.down = false;
        }
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y) {
            moveSafety.left = false;
        }
        if (enemyHead.x == myHead.x + 1 && enemyHead.y === myHead.y) {
            moveSafety.right = false;
        }
        // avoid colliding with their body and tail
        for (let i = 1; i < enemyBody.length - 1; i++) {
            const segment = snake.body[i];
            if (segment.x == myHead.x && segment.y === myHead.y + 1){
                moveSafety.up = false;          
            }
            if (segment.x == myHead.x && segment.y === myHead.y - 1){
                moveSafety.down = false;          
            }
            if (segment.x == myHead.x + 1 && segment.y === myHead.y){
                moveSafety.right = false;          
            }
            if (segment.x == myHead.x - 1 && segment.y === myHead.y){
                moveSafety.left = false;          
            }
        }
    }
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board
    
    // Are there any safe moves left?
    
    //Object.keys(moveSafety) returns ["up", "down", "left", "right"]
    //.filter() filters the array based on the function provided as an argument (using arrow function syntax here)
    //In this case we want to filter out any of these directions for which moveSafety[direction] == false
    const safeMoves = Object.keys(moveSafety).filter(direction => moveSafety[direction]);
    if (safeMoves.length == 0) {
        console.log(`MOVE ${gameState.turn}: No safe moves detected! Moving down`);
        return { move: "down" };
    }
    
    // Choose a random move from the safe moves
    const nextMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
    
    
    console.log(`MOVE ${gameState.turn}: ${nextMove}`)
    return { move: nextMove };
}