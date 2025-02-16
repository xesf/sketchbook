import * as THREE from 'three';
import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { IControllable } from '../../../interfaces/IControllable';
import { Driving } from './Driving';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { Side } from '../../../enums/Side';
import { Sitting } from './Sitting';
import { SeatType } from '../../../enums/SeatType';
import { EntityType } from '../../../enums/EntityType';
import { Object3D } from 'three';
import * as Utils from '../../../core/FunctionLibrary';
import { SpringSimulator } from '../../../physics/spring_simulation/SpringSimulator';
import { SPRING_SIMULATOR } from './OpenVehicleDoor';



export class EnteringVehicle extends CharacterStateBase
{
	private vehicle: IControllable;
	private animData: any;
	private seat: VehicleSeat;
	private entryPoint: Object3D;

	private initialPositionOffset: THREE.Vector3 = new THREE.Vector3();
	private startPosition: THREE.Vector3 = new THREE.Vector3();
	private endPosition: THREE.Vector3 = new THREE.Vector3();
	private startRotation: THREE.Quaternion = new THREE.Quaternion();
	private endRotation: THREE.Quaternion = new THREE.Quaternion();

	private factorSimulator: SpringSimulator;

	private drivingState: Driving;
	private sittingState: Sitting;

	constructor(character: Character, seat: VehicleSeat, entryPoint: Object3D)
	{
		super(character);

		this.vehicle = seat.vehicle;
		this.seat = seat;
		this.entryPoint = entryPoint;

		this.factorSimulator = SPRING_SIMULATOR;
		this.factorSimulator.target = 1;
		
		this.reset();
	}

	public reset(): void {
		this.canFindVehiclesToEnter = false;

		this.drivingState = new Driving(this.character, this.seat);
		this.sittingState = new Sitting(this.character, this.seat);

		const side = Utils.detectRelativeSide(this.entryPoint, this.seat.seatPointObject);
		this.animData = this.getEntryAnimations(this.seat.vehicle.entityType);
		this.playAnimation(this.animData[side], 0.1);

		this.character.resetVelocity();
		this.character.tiltContainer.rotation.z = 0;
		this.character.setPhysicsEnabled(false);
		(this.seat.vehicle as unknown as THREE.Object3D).attach(this.character);

		this.startPosition.copy(this.entryPoint.position);
		this.startPosition.y += 0.53;
		this.endPosition.copy(this.seat.seatPointObject.position);
		this.endPosition.y += 0.6;
		this.initialPositionOffset.copy(this.startPosition).sub(this.character.position);

		this.startRotation.copy(this.character.quaternion);
		this.endRotation.copy(this.seat.seatPointObject.quaternion);

		this.factorSimulator.reset()

		this.drivingState.reset();
		this.sittingState.reset();
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.animationEnded(timeStep))
		{
			this.character.occupySeat(this.seat);
			this.character.setPosition(this.endPosition.x, this.endPosition.y, this.endPosition.z);

			if (this.seat.type === SeatType.Driver)
			{
				if (this.seat.door) this.seat.door.physicsEnabled = true;
				this.character.setState(this.drivingState);
			}
			else if (this.seat.type === SeatType.Passenger)
			{
				this.character.setState(this.sittingState);
			}
		}
		else
		{
			if (this.seat.door)
			{
				this.seat.door.physicsEnabled = false;
				this.seat.door.rotation = 1;
			}

			let factor = THREE.MathUtils.clamp(this.timer / (this.animationLength - this.animData.end_early), 0, 1);
			let sineFactor = Utils.easeInOutSine(factor);
			this.factorSimulator.simulate(timeStep);
			
			let currentPosOffset = new THREE.Vector3().lerpVectors(this.initialPositionOffset, new THREE.Vector3(), this.factorSimulator.position);
			let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition.clone().sub(currentPosOffset), this.endPosition, sineFactor);
			this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);

			//THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, this.factorSimulator.position);
			this.character.quaternion.slerpQuaternions(this.startRotation, this.endRotation, this.factorSimulator.position);
		}
	}

	private getEntryAnimations(type: EntityType): any
	{
		switch (type)
		{
			case EntityType.Airplane:
				return {
					[Side.Left]: 'enter_airplane_left',
					[Side.Right]: 'enter_airplane_right',
					end_early: 0.3
				};
			default:
				return {
					[Side.Left]: 'sit_down_left',
					[Side.Right]: 'sit_down_right',
					end_early: 0.0
				};
		}
	}
}