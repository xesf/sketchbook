import
{
	CharacterStateBase,
} from './_stateLibrary';
import { Character } from '../Character';

export class Sprint extends CharacterStateBase
{
	constructor(character: Character)
	{
		super(character);
		this.canEnterVehicles = true;
		
		this.reset();
	}

	public reset(): void {
		this.character.velocitySimulator.mass = 10;
		this.character.rotationSimulator.damping = 0.8;
		this.character.rotationSimulator.mass = 50;
		this.character.setArcadeVelocityTarget(1.4);
		this.playAnimation('sprint', 0.1);
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

		if (!this.character.actions.run.isPressed)
		{
			this.character.setState(this.character.walkState);
		}

		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(this.character.jumpRunningState);
		}

		if (this.noDirection())
		{
			this.character.setState(this.character.endWalkState);
		}
	}
}
