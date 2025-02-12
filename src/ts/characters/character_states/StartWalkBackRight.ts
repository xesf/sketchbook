import {StartWalkBase} from './_stateLibrary';
import { Character } from '../Character';

export class StartWalkBackRight extends StartWalkBase
{
	constructor(character: Character)
	{
		super(character);
		this.reset();
	}

	public reset(): void {
		this.animationLength = this.character.setAnimation('start_back_right', 0.1);
	}
}
