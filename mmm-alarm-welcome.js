Module.register("mmm-alarm-welcome",{

	defaults: {
		welcomeText: 'Welcome home!',
		server: 'http://test.mosquitto.org',
		username: '',
		password: '',
		triggerDelay: 10000,
		animationSpeed: 1000,
		displayTime: 15000

	},

	start: function() {
		this.waitTimer = null;
		this.sendSocketNotification('CONFIG', this.config);
		
	},

	socketNotificationReceived: function(notification, payload) {
    	if (notification === "WELCOME_HOME") {
    		this.displayMessage();
    	}
	},

	notificationReceived: function(notification, payload) {
    	if (notification === "DOM_OBJECTS_CREATED") {
    		this.hide();
    	}
	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.welcomeText;
		wrapper.className = 'xlarge bright light';
		return wrapper;
	},

	displayMessage: function() {
		var self = this;
		var otherModules = MM.getModules().exceptModule(self);
		otherModules.enumerate(function(module) {
			module.hide(self.config.animationSpeed, function() {
				//module hidden.
				self.show(self.config.animationSpeed, function() {
					//message shown.
					//wait a while...
					clearTimeout(self.waitTimer);
					self.waitTimer = setTimeout(function() {
						// ready waiting.
						self.hide(self.config.animationSpeed, function() {
							otherModules.enumerate(function(module) {
								//show other modules;
								module.show(self.config.animationSpeed);
							});
						});
					}, self.config.displayTime);
				});
			});
		});
	}
});
