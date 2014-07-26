$(document).ready(function(){

    //grab all the frontend controller variables
    var left = $('.left');
    var right = $('.right');
    var neutral = $('.neutral');
	
	//Grab the socket connection
	var socket = io.connect(window.location.hostname);

	socket.on('democracy',function(data){
        //update the width of the frontend
        left.css('width',data.percentage.left + "%");
        right.css('width',data.percentage.right + "%");
        neutral.css('width',data.percentage.neutral + "%");

        //check if they are grater than 50% and add most voted

        if (data.currentState.direction == -1 ) {
            left.addClass('most-voted');
        } else {
            left.removeClass('most-voted');
        }

        if (data.currentState.direction == 1 ) {
            right.addClass('most-voted');
        } else {
            right.removeClass('most-voted');
        }

        if (data.currentState.direction == 0 ) {
            neutral.addClass('most-voted');
        } else {
            neutral.removeClass('most-voted');
        }
	});

	var keys = {
                'direction': 0,
                'accelerate': false,
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

            var threshold = 30;
        
            if(percent < -threshold){
            	 keys.direction = -1;
            } else if (percent > threshold) {
            	keys.direction = 1;
            } else {
            	keys.direction = 0;
            }
        }

    $('.accelerate').on('touchstart',function(e){
        e.preventDefault();
        keys.accelerate = true;
    });

    $('.accelerate').on('touchend',function(e){
        e.preventDefault();
        keys.accelerate = false;
    });

    $('.drift').on('touchstart',function(e){
        e.preventDefault();
        keys.drift = true;
    });

    $('.drift').on('touchend',function(e){
        e.preventDefault();
        keys.drift = false;
    });

    function loop() {
    	sendKeyState();

    	setTimeout(loop,50);
    }

    function sendKeyState() {
    	socket.emit('keys',keys);
    }

    loop();

});