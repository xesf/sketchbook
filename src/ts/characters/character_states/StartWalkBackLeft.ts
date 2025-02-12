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
		this.animationLength = this.character.setAnimation('start_back_left', 0.1);
	}
}
