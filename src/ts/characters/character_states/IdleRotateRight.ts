import
{
	CharacterStateBase,
	Idle,
	JumpIdle,
	Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class IdleRotateRight extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);
		this.reset();		
	}

	public reset(): void {
		this.timer = 0;
		this.animationLength = 0;
		this.character.arcadeVelocityIsAdditive = false;
		
		this.character.rotationSimulator.mass = 30;
		this.character.rotationSimulator.damping = 0.6;

		this.character.velocitySimulator.damping = 0.6;
		this.character.velocitySimulator.mass = 10;

		this.character.setArcadeVelocityTarget(0);
		this.playAnimation('rotate_right', 0.1);
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
