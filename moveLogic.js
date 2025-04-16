export default function move(gameState){
    let moveSafety = {
        up: true,
        down: true,
        left: true,
        right: true
    };
    let movePriorities = {
        //if the movePriority is negative then it will avoid that move unless its neccessary
        //if the movePriority is positive then it would priotize making that move
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };
    const boardWidth = gameState.board.width;
    const boardHeight = gameState.board.height;
    const myHead = gameState.you.body[0];
    const myNeck = gameState.you.body[1];
    const myBody = gameState.you.body;
    const foodLocations = gameState.board.food;
    const health = gameState.you.health;
    const hazards = gameState.board.hazards;
   
    // We've included code to prevent your Battlesnake from moving backwards
    if (myNeck.x < myHead.x) {  
        moveSafety.left = false;
    } else if (myNeck.x > myHead.x) {
        moveSafety.right = false;
    } else if (myNeck.y < myHead.y) {
        moveSafety.down = false;
    } else if (myNeck.y > myHead.y) {
        moveSafety.up = false;
    }
    // TODO: Step 1 - Prevent your Battlesnake from moving out of bounds
    // gameState.board contains an object representing the game board including its width and height
    // https://docs.battlesnake.com/api/objects/board
    //within real bounds
    if(myHead.x == 0){
        moveSafety.left = false;
        console.log("Dont go left: bounds");
    }
    if (myHead.y == 0){
        moveSafety.down = false;
        console.log("Dont go down: bounds");
    }
    if (myHead.x == gameState.board.width - 1){
        moveSafety.right = false;
        console.log("Dont go right: bounds");
    }
    if (myHead.y == gameState.board.height - 1){
        moveSafety.up = false;
        console.log("Dont go up: bounds");
    }
    //Stay within bounds I created, but can go out if necessary
    if (myHead.x == 1) {
        movePriorities.left = -5;
        console.log("Avoid left: created bounds");
    }
    if (myHead.x == boardWidth - 2) {
        movePriorities.right = -5;
        console.log("Avoid right: created bounds");
    }
    if (myHead.y == 1) {
        movePriorities.down = -5;
        console.log("Avoid down: created bounds");
    }
    if (myHead.y == boardHeight - 2) {
        movePriorities.up = -5;
        console.log("Avoid up: created bounds");
    }
    // TODO: Step 2 - Prevent your Battlesnake from colliding with itself
    // gameState.you contains an object representing your snake, including its coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    for (let i = 1; i < (myBody.length - 1); i++) {
        //Ignores tail?
        const segment = myBody[i];
        if (segment.x == myHead.x && segment.y == myHead.y + 1) {
            moveSafety.up = false;
            console.log("Dont go up: self collide");  
        }
        if (segment.x == myHead.x && segment.y == myHead.y - 1) {
            moveSafety.down = false;
            console.log("Dont go down: self collide");
        }
        if (segment.x == myHead.x - 1 && segment.y == myHead.y) {
            moveSafety.left = false;
            console.log("Dont go left: self collide");
        }
        if (segment.x == myHead.x + 1 && segment.y == myHead.y) {
            moveSafety.right = false;
            console.log("Dont go right: self collide");
        }
    }
    // TODO: Step 3 - Prevent your Battlesnake from colliding with other Battlesnakes
    // gameState.board.snakes contains an array of enemy snake objects, which includes their coordinates
    // https://docs.battlesnake.com/api/objects/battlesnake
    for (let i = 0; i < gameState.board.snakes.length; i++) {
        const snake = gameState.board.snakes[i];
        const enemyHead = snake.body[0];
        const enemyBody = snake.body
        //Dont collide with their head
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y + 1){
            moveSafety.up = false;
            console.log("Dont go up: enemy head");  
        }
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y - 1){
            moveSafety.down = false;
            console.log("Dont go down: enemy head");
        }
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y){
            moveSafety.left = false;  
            console.log("Dont go left: enemy head");          
        }
        if (enemyHead.x == myHead.x + 1 && enemyHead.y === myHead.y){
            moveSafety.right = false;  
            console.log("Dont go right: enemy head");          
        }
        //Avoid adjacent spots
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y + 2){
            movePriorities.up = -10;
            console.log("Avoid up: ememy head");
        }
        if (enemyHead.x == myHead.x && enemyHead.y === myHead.y - 2){
            movePriorities.down = -10;
            console.log("Avoid down: ememy head");                
        }
        if (enemyHead.x == myHead.x - 2 && enemyHead.y === myHead.y){
            movePriorities.left = -10;
            console.log("Avoid left: ememy head");
        }
        if (enemyHead.x == myHead.x + 2 && enemyHead.y === myHead.y){
            movePriorities.right = -10;
            console.log("Avoid right: ememy head");
        }
        //Avoid adjacent diagonal spots
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y - 1){
            movePriorities.down = -10;
            movePriorities.left = -10;
            movePriorities.up += 5;
            movePriorities.right += 5;
            console.log("Avoid down and left: enemy head");            
        }
        if (enemyHead.x == myHead.x + 1 && enemyHead.y === myHead.y + 1 ){
            movePriorities.right = -10;
            movePriorities.up = -10;
            movePriorities.down += 5;
            movePriorities.left += 5;
            console.log("Avoid right and up: enemy head");            
        }
        if (enemyHead.x == myHead.x - 1 && enemyHead.y === myHead.y + 1){
            movePriorities.up = -10;
            movePriorities.left = -10;
            movePriorities.down += 5;
            movePriorities.right += 5;
            console.log("Avoid up and left: enemy head");            
        }
        if (enemyHead.x == myHead.x + 1  && enemyHead.y === myHead.y - 1){
            movePriorities.down = -10;
            movePriorities.right= -10;
            movePriorities.up += 5;
            movePriorities.left += 5;
            console.log("Avoid down and right: enemy head");            
        }


        //Dont collide with their body
        for (let i = 1; i < (enemyBody.length - 1); i++) {
            //Doesnt collide with tail?
            const segment = snake.body[i];
            if (segment.x == myHead.x && segment.y === myHead.y + 1){
                moveSafety.up = false;
                console.log("Dont go up: enemy collide");              
            }
            if (segment.x == myHead.x && segment.y === myHead.y - 1){
                moveSafety.down = false;
                console.log("Dont go down: enemy collide");
            }
            if (segment.x == myHead.x - 1 && segment.y === myHead.y){
                moveSafety.left = false;
                console.log("Dont go left: enemy collide");
            }
            if (segment.x == myHead.x + 1 && segment.y === myHead.y){
                moveSafety.right = false;  
                console.log("Dont go right: enemy collide");              
            }
        }
    }
    // TODO: Step 4 - Move towards food instead of random, to regain health and survive longer
    // gameState.board.food contains an array of food coordinates https://docs.battlesnake.com/api/objects/board
    if (health < 50 && foodLocations.length > 0) {
        for (let i = 0; i < foodLocations.length; i++) {
            const food = foodLocations[i];
            const distanceUp = food.y - myHead.y;
            const distanceDown = myHead.y - food.y;
            const distanceLeft = myHead.x - food.xv;
            const distanceRight = food.x - myHead.x;
            //will be += so it doesnt override other priorities.
            if (distanceUp > 0) {
                movePriorities.up += 5;
                console.log("Prioritize up: food");        
            }
            if (distanceDown > 0) {
                movePriorities.down += 5;
                console.log("Prioritize down: food");
            }
            if (distanceLeft > 0) {
                movePriorities.left += 5;
                console.log("Prioritize left: food");
            }
            if (distanceRight > 0) {
                movePriorities.right += 5;
                console.log("Prioritize right: food");
            }
        }
    }


    //Avoids hazards
    for (let i = 0; i < hazards.length; i++) {
        let hazard = hazards[i];
        if (hazard.x === myHead.x && hazard.y === myHead.y + 1) {
            movePriorities.up = -6;
            console.log("Avoid up: hazard");
        }
        if (hazard.x === myHead.x && hazard.y === myHead.y - 1) {
            movePriorities.down = -6;
            console.log("Avoid down: hazard");
        }
        if (hazard.x === myHead.x - 1 && hazard.y === myHead.y) {
            movePriorities.left = -6;
            console.log("Avoid left: hazard");
        }
        if (hazard.x === myHead.x + 1 && hazard.y === myHead.y) {
            movePriorities.right = -6;
            console.log("Avoid right: hazard");
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
    const prioritizedMoves = safeMoves.sort((a, b) => (movePriorities[b] || 0) - (movePriorities[a] || 0));
    const nextMove = prioritizedMoves[0];


    console.log(`MOVE ${gameState.turn}: Chosen move: ${nextMove}`);
    return { move: nextMove };
}
