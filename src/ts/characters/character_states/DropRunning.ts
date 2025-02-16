import
{
	CharacterStateBase,
	EndWalk,
	JumpRunning,
	Sprint,
	Walk,
} from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';

export class DropRunning extends CharacterStateBase implements ICharacterState
{
	constructor(character: Character)
	{
		super(character);
		this.reset();
	}

	public reset(): void {
		this.timer = 0;
		this.animationLength = 0;
		this.character.velocitySimulator.damping = this.character.defaultVelocitySimulatorDamping;
		this.character.velocitySimulator.mass = this.character.defaultVelocitySimulatorMass;
		this.character.rotationSimulator.damping = this.character.defaultRotationSimulatorDamping;
		this.character.rotationSimulator.mass = this.character.defaultRotationSimulatorMass;
		this.character.arcadeVelocityIsAdditive = false;
		this.character.setArcadeVelocityInfluence(1, 0, 1);

		this.character.setArcadeVelocityTarget(0.8);
		this.playAnimation('drop_running', 0.1);
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		this.character.setCameraRelativeOrientationTarget();

		if (this.animationEnded(timeStep))
		{
			this.character.setState(this.character.walkState);
		}
	}

	public onInputChange(): void
	{
		super.onInputChange();
		
		if (this.noDirection())
		{
			this.character.setState(this.character.endWalkState);
		}

		if (this.anyDirection() && this.character.actions.run.justPressed)
		{
			this.character.setState(this.character.sprintState);
		}

		if (this.character.actions.jump.justPressed)
		{
			this.character.setState(this.character.jumpRunningState);
		}
	}
}
