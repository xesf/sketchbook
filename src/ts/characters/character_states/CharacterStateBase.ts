import * as THREE from 'three';
import * as Utils from '../../core/FunctionLibrary';
import { Character } from '../Character';
import { ICharacterState } from '../../interfaces/ICharacterState';

export abstract class CharacterStateBase implements ICharacterState
{
	public character: Character;
	public timer: number = 0;
	public animationLength: any = 0;

	public canFindVehiclesToEnter: boolean;
	public canEnterVehicles: boolean;
	public canLeaveVehicles: boolean;

	constructor(character: Character)
	{
		this.character = character;
		this.canFindVehiclesToEnter = true;
		this.canEnterVehicles = false;
		this.canLeaveVehicles = true;
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
	}

	public update(timeStep: number): void
	{
		this.timer += timeStep;
	}

	public onInputChange(): void
	{
		if (this.canFindVehiclesToEnter && this.character.actions.enter.justPressed)
		{
			this.character.findVehicleToEnter(true);
		}
		else if (this.canFindVehiclesToEnter && this.character.actions.enter_passenger.justPressed)
		{
			this.character.findVehicleToEnter(false);
		}
		else if (this.canEnterVehicles && this.character.vehicleEntryInstance !== null)
		{
			if (this.character.actions.up.justPressed ||
				this.character.actions.down.justPressed ||
				this.character.actions.left.justPressed ||
				this.character.actions.right.justPressed)
				{
					this.character.vehicleEntryInstance = null;
					this.character.actions.up.isPressed = false;
				}
		}
	}

	public noDirection(): boolean
	{
		return !this.character.actions.up.isPressed && !this.character.actions.down.isPressed && !this.character.actions.left.isPressed && !this.character.actions.right.isPressed;
	}

	public anyDirection(): boolean
	{
		return this.character.actions.up.isPressed || this.character.actions.down.isPressed || this.character.actions.left.isPressed || this.character.actions.right.isPressed;
	}

	public fallInAir(): void
	{
		if (!this.character.rayHasHit) { this.character.setState(this.character.fallingState); }
	}

	public animationEnded(timeStep: number): boolean
	{
		if (this.character.mixer !== undefined)
		{
			if (this.animationLength === undefined)
			{
				console.error(this.constructor.name + 'Error: Set this.animationLength in state constructor!');
				return false;
			}
			else
			{
				return this.timer > this.animationLength - timeStep;
			}
		}
		else { return true; }
	}

	public setAppropriateDropState(): void
	{
		if (this.character.groundImpactData.velocity.y < -6)
		{
			this.character.setState(this.character.dropRollingState);
		}
		else if (this.anyDirection())
		{
			if (this.character.groundImpactData.velocity.y < -2)
			{
				this.character.setState(this.character.dropRunningState);
			}
			else
			{
				if (this.character.actions.run.isPressed)
				{
					this.character.setState(this.character.sprintState);
				}
				else
				{
					this.character.setState(this.character.walkState);
				}
			}
		}
		else
		{
			this.character.setState(this.character.dropIdleState);
		}
	}

	public setAppropriateStartWalkState(): void
	{
		let range = Math.PI;
		let angle = Utils.getSignedAngleBetweenVectors(this.character.orientation, this.character.getCameraRelativeMovementVector());

		if (angle > range * 0.8)
		{
			this.character.setState(this.character.startWalkBackLeftState);
		}
		else if (angle < -range * 0.8)
		{
			this.character.setState(this.character.startWalkBackRightState);
		}
		else if (angle > range * 0.3)
		{
			this.character.setState(this.character.startWalkLeftState);
		}
		else if (angle < -range * 0.3)
		{
			this.character.setState(this.character.startWalkRightState);
		}
		else
		{
			this.character.setState(this.character.startWalkForwardState);
		}
	}

	protected playAnimation(animName: string, fadeIn: number): void
	{
		this.animationLength = this.character.setAnimation(animName, fadeIn);
	}
}