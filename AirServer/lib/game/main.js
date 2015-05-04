ig.module( 
	'game.main' 
	)
.requires(
	'impact.game',
	'impact.font',
	'impact.debug.debug',
	'game.entities.player',
	'game.entities.red-player',
	'game.entities.blue-player',
	'game.entities.puck'
	)
.defines(function(){


	MyGame = ig.Game.extend({

		numPlayers: 3,
		bluePlayers: [],
		redPlayers: [],
		pucks: 0,
		running: true,

	    //Fitness Tracking Information
        startTime: 0,
		impacts: [],


		init: function() {
			ig.input.bind(ig.KEY.LEFT_ARROW, 'red-left');
			ig.input.bind(ig.KEY.RIGHT_ARROW, 'red-right');
			ig.input.bind(ig.KEY.UP_ARROW, 'red-up');
			ig.input.bind(ig.KEY.DOWN_ARROW, 'red-down');

			ig.input.bind(ig.KEY.A, 'blue-left');
			ig.input.bind(ig.KEY.D, 'blue-right');
			ig.input.bind(ig.KEY.W, 'blue-up');
			ig.input.bind(ig.KEY.S, 'blue-down');
			for(var i = 0;  i < this.numPlayers; i++){
				this.bluePlayers[i] = this.spawnEntity(BluePlayer, 20, 20 + (i * 80));
				this.redPlayers[i] = this.spawnEntity(RedPlayer, ig.system.width - 85, 20 + (i * 80));
			}

			this.puck = this.spawnEntity(PuckEntity, ig.system.width/2 - 18, ig.system.height/2);

			this.startTime = (new Date).getTime()
			window.MyGame = this
		},

		reinit: function () {
		    this.running = false

		    var blue = this.bluePlayers
		    var red = this.redPlayers
		    var numPlayers = this.numPlayers
		    var puck = this.puck

		    console.log('Reinitializing!')

		    communicator.exclusiveSend(JSON.stringify({
		        type: 'done',
		        blue: this.puck.blueScore,
                red: this.puck.redScore
		    }), true)
		    this.puck.blueScore = 0
		    this.puck.redScore = 0
		    
		    communicator.subscribe('done', function (message) {
		        if (message !== 'done') {
                    //console.log("Failure! Reinitializer received message " + message)
		            return false
		        }
		        var resetVel = function (o) {
		            o.vel.x = 0
                    o.vel.y = 0
		        }
		        for (var i = 0; i < numPlayers; i++) {
		            blue[i].pos.x = 20
		            blue[i].pos.y = 20 + (i * 80)
                    resetVel(blue[i])
		            red[i].pos.x = ig.system.width - 85
		            red[i].pos.y = 20 + (i * 80)
		            resetVel(red[i])
		        }

		        if (puck.hasOwnProperty('pos'))
		        {
		            puck.pos.x = ig.system.width / 2 - 18
		            puck.pos.y = ig.system.height / 2
		            resetVel(puck)
		        }
                

		        console.log('Reinitialization complete!')
		        window.MyGame.startTime = (new Date).getTime()
		        window.MyGame.running = true
                return true
		    })
		},

		update: function () {
		    if (!this.running)
		        return
		    this.parent()

		    var blue = this.bluePlayers
		    var red = this.redPlayers

		    var index = 0

		    //if (this.startTime + 1000 > (new Date).getTime())
		    //    return

		    // If we've played for 30sec already, reset
		    if ((new Date).getTime() >= this.startTime + 30000) {
		        this.reinit()
                return
		    }

		    var coords = [{ color: 'puck', index: 0, x: this.puck.pos.x / ig.system.width, y: this.puck.pos.y / ig.system.height, velX: this.puck.vel.x, velY: this.puck.vel.y }]
			blue.forEach(function (player) {
			    coords.push({ color: 'blue', index: index++, x: player.pos.x / ig.system.width, y: player.pos.y / ig.system.height, velX: player.vel.x, velY: player.vel.y })
			})
			index = 0
			red.forEach(function (player) {
			    coords.push({ color: 'red', index: index++, x: player.pos.x / ig.system.width, y: player.pos.y / ig.system.height, velX: player.vel.x, velY: player.vel.y })
			})

			communicator.exclusiveSend(JSON.stringify({
			    type: 'game',
			    coords: coords,
                impacts: this.impacts
			}), false)
			
			communicator.subscribe('game', function (moves) {
			    if (!window.MyGame.running) {
			        console.log("Failure! Game received message " + moves + ', while game not running')
			        return false
			    }
                moves.forEach(function(move) {
                    var player
                    if (move.Color === 'blue')
                        player = blue[move.Index]
                    else if (move.Color === 'red')
                        player = red[move.Index]
                    else
                        return
                    player.vel.x = move.VelX
                    player.vel.y = move.VelY
                })
                return true
            })
			this.impacts = []

		},

		draw: function() {
			this.parent();
			var ctx = ig.system.context;
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(ig.system.width/2 - 1, 0);
			ctx.lineTo(ig.system.width/2 - 1, ig.system.height);

			ctx.moveTo(0, 0);
			ctx.lineTo(0, ig.system.height);

			ctx.moveTo(ig.system.width, 0);
			ctx.lineTo(ig.system.width, ig.system.height);

			ctx.stroke();

		}
	});

ig.main( '#canvas', MyGame, 60, 1000, 600, 1 );

});
