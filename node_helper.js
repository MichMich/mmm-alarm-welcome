var NodeHelper = require("node_helper");
var mqtt    = require('mqtt');
var patterns = require('patterns')();
var player = require('play-sound')(opts = {});


module.exports = NodeHelper.create({
	start: function function_name () {
		this.config = {};
		this.client = false;
		this.lastNonDoorNotification = 0;
	},

	socketNotificationReceived: function(notification, payload) {
    	if (notification === "CONFIG") {
    		console.log("MMM-Alarm-Welcome: Configuration received.");
    		this.config = payload;
    		this.startConnection();
    	}

	},

	startConnection: function() {
		var self = this;
		self.client  = mqtt.connect('mqtt://' + self.config.server, {username:self.config.username, password:self.config.password, clientId:'mmm-alarm-welcome-'+self.makeid()});
		self.client.on('connect', function () {
			console.log("Connected to MQTT server.");
			connectionTimestamp = Date.now();
			self.client.subscribe('/homesensor/#');
		});

		patterns.add('/homesensor/{device}/{sensor}', function(data) {
		    if (data.sensor !== 'door' && data.message === '1') {
		    	self.lastNonDoorNotification = new Date();
		    	return;
		    }

		    if (data.sensor === 'door' && data.message === '1') {
		    	var now = new Date();
		    	if (now - self.lastNonDoorNotification > self.config.triggerDelay) {
		    		self.sendSocketNotification('WELCOME_HOME');
		    		setTimeout(function() {
			    		player.play(self.path +'/welcome.aiff', function(err){});
		    		}, 3000);
		    	}
		    }

		});

		self.client.on('message', function(topic, message) {
			var match = patterns.match(topic);
			if (match) {
                var data = match.params;
                data.message = message.toString();
                match.value(data);
	        }
		});
	},

	makeid: function()
	{
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ ) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }

	    return text;
	}
});
