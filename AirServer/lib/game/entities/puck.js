ig.module(
	'game.entities.puck'
	)
.requires(
	'impact.entity',
	'impact.font'
	)
.defines(function(){
	PuckEntity = ig.Entity.extend({
		font: new ig.Font( 'media/font.png' ),
		animSheet: new ig.AnimationSheet('media/puck.png', 36, 36),
		maxVel: {x:500, y:500},
		size: {x:36, y:36},
		checkAgainst: ig.Entity.TYPE.A,
		bounciness: 1,
		reflectVel: 450,
		blueScore: 0,
		redScore: 0,

		init: function(x, y, settings){
			this.parent(x, y, settings);

			this.addAnim('idle', 1, [0], true);
		},

		calculateVelocity: function(angle){
			this.vel.y = -Math.sin(angle) * this.reflectVel;
			this.vel.x =  -Math.cos(angle) * this.reflectVel;
		},

		getAngle: function(){
			return Math.atan(this.vel.y/this.vel.x);
		},

		check: function(other){
			if (other instanceof Player) {

                // Logs the impact for it's collision partner because it's slightly easier
		        var game = window.MyGame
		        var impact = { type: 0 }
		        game.bluePlayers.forEach(function (player, i) {
		            if (player == other) {
		                impact.color = 'blue'
		                impact.index = i
		            }
		        })
		        game.redPlayers.forEach(function (player, i) {
		            if (player == other) {
		                impact.color = 'red'
		                impact.index = i
		            }
		        })
		        game.impacts.push(impact)

				var distance = this.distanceTo(other);
				if(this.size.x/2 + other.size.x/2 > distance){
					this.calculateVelocity(this.angleTo(other));

					if(!other.vel.x && !other.vel.y){
						other.calculateVelocity(other.angleTo(this));
					}
					else{
						other.vel.x = 0;
						other.vel.y = 0;	
					}
					this.pos.x = this.last.x;
					this.pos.y = this.last.y;
				}
			}
		},

		checkBounds: function(){
			if(this.pos.x < 0 - 40){
				if(this.vel.x < 0) this.redScore++;
				this.pos.x = 0 - 40;
				this.vel.x = -this.vel.x;
			}
			if(this.pos.x > ig.system.width - this.size.x + 40){
				if(this.vel.x > 0) this.blueScore++;
				this.pos.x = ig.system.width - this.size.x + 40;
				this.vel.x = -this.vel.x;
			}
			if(this.pos.y < 0){
				this.pos.y = 0;
				this.vel.y = -this.vel.y;
				this.accel.y = 0;
			}
			if(this.pos.y > ig.system.height - this.size.x){
				this.pos.y = ig.system.height - this.size.x;
				this.vel.y = -this.vel.y;
				this.accel.y = 0;
			}
		},

		update: function() {

			this.parent();
			
			this.checkBounds();
		},

		draw: function(){
			this.parent();
			this.font.draw("Blue Score: " +  this.blueScore, 10, 0);
			this.font.draw("Red Score: " +  this.redScore, ig.system.width - 140, 0);
		}
	});
});