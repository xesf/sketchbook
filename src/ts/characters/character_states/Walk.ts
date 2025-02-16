import
{
	CharacterStateBase,
} from './_stateLibrary';

import { Character } from '../Character';

export class Walk extends CharacterStateBase
{
	constructor(character: Character)
	{
		super(character);
		this.canEnterVehicles = true;
		
		this.reset();
	}

	public reset(): void {
		this.timer = 0;
		this.animationLength = 0;
		this.character.arcadeVelocityIsAdditive = false;
		
		this.character.setArcadeVelocityTarget(0.8);
		this.playAnimation('run', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		this.character.setCameraRelativeOrientationTarget();

		this.fallInAir();
	}

	public onInputChange(): void
	{
		super.onInputChange();

		if (this.noDirection())
		{
			this.character.setState(this.character.endWalkState);
		}
		
		if (this.character.actions.run.isPressed)
		{
			this.character.setState(this.character.sprintState);
		}
		
		if (this.character.actions.run.justPressed)
		{
			this.character.setState(this.character.sprintState);
		}

		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(this.character.jumpRunningState);
		}

		if (this.noDirection())
		{
			if (this.character.velocity.length() > 1)
			{
				this.character.setState(this.character.endWalkState);
			}
			else
			{
				this.character.setState(this.character.idleState);
			}
		}
	}
}
