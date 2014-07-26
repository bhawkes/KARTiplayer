var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
    mc = require("mac-control");

server.listen(3000);

io.set( 'log level', 1 );
io.set( 'close timeout', 30 );

app.use(express.static(__dirname + "/public"));

app.get('/',function(req,res){
    res.sendFile('index.html');
});

var playerCount = 0;
var players = {};

var currentState = {
    "direction":0,
    "accelerate":false,
    "drift":false
};

var newState = {};

var threshold = .50;

io.sockets.on('connection', function(socket){
        
    playerCount++;
    
    console.log('connect ' + socket.id.substring(0,3) + " " + playerCount);
    
    players[socket.id] = {
        keys:{
            "direction":0,
            "accelerate":false,
            "drift":false
        }
    };

    socket.on('keys', function(data){
        
        players[socket.id].keys = data;
        updateKeys();
        
        console.log(data.direction);
    });

    socket.on('disconnect', function(){
        delete players[socket.id];
        playerCount--;
        console.log('disconnect ' + socket.id.substring(0,3) + " " +playerCount);
    });

});


function updateKeys(){
    // set counts to 0
    var leftCount = 0;
    var neutralCount = 0;
    var rightCount = 0;
    var accelerateCount = 0;
    var driftCount = 0;
        
    // then count each player pressing a button
    for ( var id in players) {
            
        var player = players[id];
            
        if(player.keys.direction == -1) {
            leftCount++
        } else if(player.keys.direction == 0){
            neutralCount++
        } else if(player.keys.direction == 1){
            rightCount++
        }
        
        if(player.keys.accelerate) accelerateCount++;
        
        if(player.keys.drift) driftCount++;
                	
    }
    
    newState = {};
    
    if(leftCount == neutralCount){
          if(leftCount == rightCount){
                //console.log('l = n = r');
                newState.direction = 0;
        } else {
                if(rightCount> leftCount){
                    //console.log('l = n < r');
                    newState.direction = 0;
                } else if(rightCount < leftCount){
                    //console.log('l = n > r');
                    newState.direction = 0;
                }    
            } 
    } else if(leftCount == rightCount){
            if(neutralCount > leftCount){
                //console.log('l = r < n');
                newState.direction = 0;
            } else if(neutralCount < leftCount){
                console.log('l = r > n');
                newState.direction = 0;
            }    
    } else if(neutralCount == rightCount) {
             if(leftCount > neutralCount){
                //console.log('n = r < l');
                 newState.direction = 0;
            } else if(leftCount < neutralCount){
                //console.log('n = r > l');
                newState.direction = 0;
            }     
    } else {
            if(leftCount > neutralCount){
                if(leftCount > rightCount){
                    //console.log('l > n & r');
                    newState.direction = -1;
                }
            } else if(neutralCount > leftCount){
                if(neutralCount > rightCount){
                    //console.log('n > l & r');
                    newState.direction = 0;
                }
            } else if(rightCount > leftCount){
                if(rightCount > neutralCount){
                   //console.log('r > l & n');
                    newState.direction = 1;
                }
            }
    }
    
    newState.accelerate = (accelerateCount / playerCount) >= threshold ? true : false;
    newState.drift = (driftCount / playerCount) >= threshold ? true : false;
    
    //checkKeys();
    
    
    // create object ready for sending to clients
    var democracy = {
        	"playerCount": playerCount,
        	"percentage":{
                "left":Math.round((leftCount / playerCount)*100),
                "neutral":Math.round((neutralCount / playerCount)*100),
                "right":Math.round((rightCount / playerCount)*100),
                "accelerate":Math.round((accelerateCount / playerCount)*100),
                "drift":Math.round((driftCount / playerCount)*100)
            }
        }
        
    // then send the object
    io.sockets.emit('democracy', democracy);
    
    //console.log(democracy);
        
}

function checkKeys(){
    
    //console.log(playerCount + currentState.a + "->" + newState.a);
    if(newState.direction != currentState.direction){
        if(currentState.direction == -1){
            mc.keyRelease("left");
            if(currentState.direction == 1){
                mc.keyHold("right");   
            }
        } else if(currentState.direction == 0){
            if(currentState.direction == -1){
                mc.keyHold("left");   
            } else if(currentState.direction == 1){
                mc.keyHold("right");   
            }
        } else if(currentState.direction == 1){
            mc.keyRelease("right");
            if(currentState.direction == -1){
                mc.keyHold("left");   
            }
        }
    }
    
    
    if(newState.accelerate != currentState.accelerate){
        if(newState.accelerate){
         mc.keyHold("z");
        } else {
         mc.keyRelease("z");
        }
    }
    
    if(newState.drift != currentState.drift){
        if(newState.drift){
         mc.keyHold("x");
        } else {
         mc.keyRelease("x");
        }
    }
    
    

    currentState= newState;
    
}
