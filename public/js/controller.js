$(document).ready(function(){
	
	//Grab the socket connection
	var socket = io.connect(window.location.hostname);

	socket.on('democracy',function(data){

	});

	var keys = {
                'direction': 0,
                'accelerate': false
                'drift': false
            };

    var alpha = 0,
    	beta = 0,
    	gamma = 0,
    	orient = 0;

	window.ondeviceorientation = function (event) {

			var percent = 0;
            
            alpha = Math.round(event.alpha);
            beta = Math.round(event.beta);
            gamma = Math.round(event.gamma);
            orient = window.orientation;
                     
         
         	if (orient == -90) percent = ((((-beta+90))/180)*200)-100;
			else if (orient == 90) percent = ((((beta+90))/180)*200)-100;
			else if (orient == 180) percent = ((((-gamma+90))/180)*200)-100;
			else {percent = ((((gamma+90))/180)*200)-100;}

            if(percent < -3.5){
            	 keys.direction = -1;
            } else if (percent > 3.5) {
            	keys.direction = 1;
            } else {
            	keys.direction = 0;
            }
        }

    function loop() {
    	sendKeyState();

    	setTimeout(loop,50);
    }

    function sendKeyState() {
    	socket.emit('keys',keys);
    }

    loop();

});