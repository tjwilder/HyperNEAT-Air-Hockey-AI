ig.module(
	'game.entities.blue-player'
	)
.requires(
	'impact.entity',
	'game.entities.player'
	)
.defines(function(){
	BluePlayer = Player.extend({
		animSheet: new ig.AnimationSheet('media/blue-player.png', 64, 64),

		checkInputs: function(){

			if(ig.input.state('blue-left') && !ig.input.state('blue-right')){

				this.vel.x = -this.walkVel;
			}
			else if(ig.input.state('blue-right') && !ig.input.state('blue-left')){

				this.vel.x = this.walkVel;
			}
			else{
				this.vel.x = 0;
			}
			if(ig.input.state('blue-up') && !ig.input.state('blue-down')){
				this.vel.y = -this.walkVel;
			}
			else if(ig.input.state('blue-down') && !ig.input.state('blue-up')){
				this.vel.y = this.walkVel;
			}
			else{
				this.vel.y = 0;
			}
		},

		checkBounds: function(){
			if(this.pos.x > ig.system.width/2 - this.size.x){
				this.pos.x = ig.system.width/2 - this.size.x;
			}
			this.parent();
		}
	})
});