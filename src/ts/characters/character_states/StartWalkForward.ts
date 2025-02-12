import {StartWalkBase} from './_stateLibrary';
import { Character } from '../Character';

export class StartWalkForward extends StartWalkBase
{
	constructor(character: Character)
	{
		super(character);
		this.reset();
	}

	public reset(): void {
		this.animationLength = this.character.setAnimation('start_forward', 0.1);
	}
}
