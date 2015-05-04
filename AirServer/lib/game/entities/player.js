ig.module(
	'game.entities.player'
	)
.requires(
	'impact.entity'
	)
.defines(function(){
	Player = ig.Entity.extend({
		maxVel: {x:500, y:500},
		size: {x:64, y:64},
		walkVel: 400,
		reflectVel: 100,
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.A,


		init: function(x, y, settings){
			this.parent(x, y, settings);

			this.addAnim('idle', 1, [0], true);
		},

		calculateVelocity: function(angle){
			this.vel.y = -Math.sin(angle) * this.reflectVel;
			this.vel.x = -Math.cos(angle) * this.reflectVel;
		},

		check: function(other){
		    if (other instanceof Player) {

                // Logs the impact for it's collision partner because it's slightly easier
		        var game = window.MyGame
		        var impact = { type: 2 }
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
				if(this.size.x/2 + other.size.x/2 >= distance) {
					if(this.pos.x === other.pos.x && this.pos.x === other.pos.x) {
						var randomVal = Math.random > 0.5 ? 1 : -1;
						this.pos.x += randomVal * 5;
						this.pos.y += randomVal * 5;
					}
					else{
						if(!this.vel.x && !this.vel.y) {
							this.calculateVelocity(this.angleTo(other));
						}
						else{
							this.vel.x = 0;
							this.vel.y = 0;	
						}
					}
				}
			}
		},

		checkBounds: function () {
		    var me = this
		    var game = window.MyGame;
		    var getImpact = function () {
		        var impact = {type: 1}
		        game.bluePlayers.forEach(function (player, i) {
		            if (player == me) {
		                impact.color = 'blue'
		                impact.index = i
		            }
		        })
		        game.redPlayers.forEach(function (player, i) {
		            if (player == me) {
		                impact.color = 'red'
		                impact.index = i
		            }
		        })
		        return impact
		    }
            
			if(this.pos.x > ig.system.width - this.size.x) {
			    this.pos.x = ig.system.width - this.size.x
                game.impacts.push(getImpact())
			}
			if(this.pos.x < 0) {
			    this.pos.x = 0
			    game.impacts.push(getImpact())
			}
			if(this.pos.y < 0) {
			    this.pos.y = 0
			    game.impacts.push(getImpact())
			}
			if(this.pos.y > ig.system.height - this.size.y) {
			    this.pos.y = ig.system.height - this.size.y
			    game.impacts.push(getImpact())
			}
		},

		update: function() {

			this.parent();

			this.checkBounds();

			this.checkInputs();
		},
	});
});