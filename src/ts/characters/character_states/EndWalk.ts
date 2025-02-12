import
{
	CharacterStateBase,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class EndWalk extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);
		this.reset();
	}

	public reset(): void {
		this.character.setArcadeVelocityTarget(0);
		this.animationLength = this.character.setAnimation('stop', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.animationEnded(timeStep))
		{
			this.character.setState(this.character.idleState);
		}

		this.fallInAir();
	}

	public onInputChange(): void
	{
		super.onInputChange();
		
		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(this.character.jumpIdleState);
		}

		if (this.anyDirection())
		{
			if (this.character.actions.run.isPressed)
			{
				this.character.setState(this.character.sprintState);
			}
			else
			{
				if (this.character.velocity.length() > 0.5)
				{
					this.character.setState(this.character.walkState);
				}
				else
				{
					this.setAppropriateStartWalkState();
				}
			}
		}
	}
}
