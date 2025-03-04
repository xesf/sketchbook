import
{
	CharacterStateBase,
	Falling,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class JumpIdle extends CharacterStateBase implements ICharacterState
{
	private alreadyJumped: boolean;

	constructor(character: Character)
	{
		super(character);
		this.reset();
	}

	public reset(): void
	{
		this.timer = 0;
		this.animationLength = 0;
		this.character.velocitySimulator.damping = this.character.defaultVelocitySimulatorDamping;
		this.character.velocitySimulator.mass = this.character.defaultVelocitySimulatorMass;
		this.character.rotationSimulator.damping = this.character.defaultRotationSimulatorDamping;
		this.character.rotationSimulator.mass = this.character.defaultRotationSimulatorMass;
		this.character.arcadeVelocityIsAdditive = false;
		this.character.setArcadeVelocityInfluence(1, 0, 1);
		
		this.alreadyJumped = false;
		this.character.velocitySimulator.mass = 50;
		this.character.setArcadeVelocityTarget(0);
		this.playAnimation('jump_idle', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		// Move in air
		if (this.alreadyJumped)
		{
			this.character.setCameraRelativeOrientationTarget();
			this.character.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);
		}

		// Physically jump
		if (this.timer > 0.2 && !this.alreadyJumped)
		{
			this.character.jump();
			this.alreadyJumped = true;

			this.character.velocitySimulator.mass = 100;
			this.character.rotationSimulator.damping = 0.3;

			if (this.character.rayResult.body.velocity.length() > 0)
			{
				this.character.setArcadeVelocityInfluence(0, 0, 0);
			}
			else
			{
				this.character.setArcadeVelocityInfluence(0.3, 0, 0.3);
			}
			
		}
		else if (this.timer > 0.3 && this.character.rayHasHit)
		{
			this.setAppropriateDropState();
		}
		else if (this.animationEnded(timeStep))
		{
			this.character.setState(this.character.fallingState);
		}
	}
}
