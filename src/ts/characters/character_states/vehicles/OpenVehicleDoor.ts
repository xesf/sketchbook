import * as THREE from 'three';
import
{
	CharacterStateBase,
} from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { Side } from '../../../enums/Side';
import { Idle } from '../Idle';
import { EnteringVehicle } from './EnteringVehicle';
import * as Utils from '../../../core/FunctionLibrary';
import { SpringSimulator } from '../../../physics/spring_simulation/SpringSimulator';


export const SPRING_SIMULATOR = new SpringSimulator(60, 10, 0.5);


export class OpenVehicleDoor extends CharacterStateBase
{
	private seat: VehicleSeat;
	private entryPoint: THREE.Object3D;
	private hasOpenedDoor: boolean = false;

	private startPosition: THREE.Vector3 = new THREE.Vector3();
	private endPosition: THREE.Vector3 = new THREE.Vector3();
	private startRotation: THREE.Quaternion = new THREE.Quaternion();
	private endRotation: THREE.Quaternion = new THREE.Quaternion();

	private factorSimulator: SpringSimulator;

	constructor(character: Character, seat: VehicleSeat, entryPoint: THREE.Object3D)
	{
		super(character);

		this.seat = seat;
		this.entryPoint = entryPoint;
		
		this.factorSimulator = SPRING_SIMULATOR;
		this.factorSimulator.target = 1;
		
		this.reset();
	}
	
	public reset(): void {
		this.canFindVehiclesToEnter = false;
		const side = Utils.detectRelativeSide(this.entryPoint, this.seat.seatPointObject);
		if (side === Side.Left)
		{
			this.playAnimation('open_door_standing_left', 0.1);
		}
		else if (side === Side.Right)
		{
			this.playAnimation('open_door_standing_right', 0.1);
		}

		this.character.resetVelocity();
		this.character.rotateModel();

		this.character.setPhysicsEnabled(false);
		(this.seat.vehicle as unknown as THREE.Object3D).attach(this.character);

		this.startPosition.copy(this.character.position);
		this.endPosition.copy(this.entryPoint.position);
		this.endPosition.y += 0.53;

		this.startRotation.copy(this.character.quaternion);
		this.endRotation.copy(this.entryPoint.quaternion);

		this.factorSimulator.reset()
	}

	public update(timeStep: number): void
	{
		super.update(timeStep);

		if (this.timer > 0.3 && !this.hasOpenedDoor)
		{
			this.hasOpenedDoor = true;
			this.seat.door?.open();   
		}

		if (this.animationEnded(timeStep))
		{
			if (this.anyDirection())
			{
				this.character.vehicleEntryInstance = null;
				this.character.world.scene.attach(this.character);
				this.character.setPhysicsEnabled(true);
				this.character.setState(this.character.idleState);
			}
			else
			{
				this.character.setState(new EnteringVehicle(this.character, this.seat, this.entryPoint));
			}
		}
		else
		{
			this.factorSimulator.simulate(timeStep);

			let lerpPosition = new THREE.Vector3().lerpVectors(this.startPosition, this.endPosition, this.factorSimulator.position);
			this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z);
	
			//THREE.Quaternion.slerp(this.startRotation, this.endRotation, this.character.quaternion, this.factorSimulator.position);
			this.character.quaternion.slerpQuaternions(this.startRotation, this.endRotation, this.factorSimulator.position);
		}
	}
}