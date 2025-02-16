import { StartWalkBase } from './_stateLibrary';
import { Character } from '../Character';

export class StartWalkBackLeft extends StartWalkBase
{
	constructor(character: Character)
	{
		super(character);
		this.reset();
	}

	public reset(): void {
		this.character.rotationSimulator.mass = 20;
		this.character.rotationSimulator.damping = 0.7;
		this.character.setArcadeVelocityTarget(0.8);
		this.animationLength = this.character.setAnimation('start_back_left', 0.1);
	}
}
