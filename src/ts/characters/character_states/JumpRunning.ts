import
{
	CharacterStateBase,
	Falling,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class JumpRunning extends CharacterStateBase implements ICharacterState
{
	private alreadyJumped: boolean;
	private fallingState: Falling;

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
		this.character.velocitySimulator.mass = 100;
		this.playAnimation('jump_running', 0.03);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		this.character.setCameraRelativeOrientationTarget();

		// Move in air
		if (this.alreadyJumped)
		{
			this.character.setArcadeVelocityTarget(this.anyDirection() ? 0.8 : 0);
		}
		// Physically jump
		if (this.timer > 0.13 && !this.alreadyJumped)
		{
			this.character.jump(4);
			this.alreadyJumped = true;

			this.character.rotationSimulator.damping = 0.3;
			this.character.arcadeVelocityIsAdditive = true;
			this.character.setArcadeVelocityInfluence(0.05, 0, 0.05);
		}
		else if (this.timer > 0.24 && this.character.rayHasHit)
		{
			this.setAppropriateDropState();
		}
		else if (this.animationEnded(timeStep))
		{
			this.character.setState(this.character.fallingState);
		}
	}
}
