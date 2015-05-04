ig.module(
	'game.entities.red-player'
	)
.requires(
	'impact.entity',
	'game.entities.player'
	)
.defines(function(){
	RedPlayer = Player.extend({
		animSheet: new ig.AnimationSheet('media/red-player.png', 64, 64),

		checkInputs: function(){

			if(ig.input.state('red-left') && !ig.input.state('red-right')){

				this.vel.x = -this.walkVel;
			}
			else if(ig.input.state('red-right') && !ig.input.state('red-left')){

				this.vel.x = this.walkVel;
			}
			else{
				this.vel.x = 0;
			}
			if(ig.input.state('red-up') && !ig.input.state('red-down')){
				this.vel.y = -this.walkVel;
			}
			else if(ig.input.state('red-down') && !ig.input.state('red-up')){
				this.vel.y = this.walkVel;
			}
			else{
				this.vel.y = 0;
			}
		},

		checkBounds: function(){
			if(this.pos.x < ig.system.width/2){
				this.pos.x = ig.system.width/2;
			}
			this.parent();
		}
	})
});