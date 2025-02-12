import * as THREE from 'three';
import { VehicleSeat } from '../vehicles/VehicleSeat';
import { Character } from './Character';

export class VehicleEntryInstance
{
	public character: Character;
	public targetSeat: VehicleSeat;
	public entryPoint: THREE.Object3D;

	public wantsToDrive: boolean = false;
	public entryPointWorldPos: THREE.Vector3 = new THREE.Vector3();

	constructor(character: Character)
	{
		this.character = character;
	}

	public update(timeStep: number): void
	{
		this.entryPointWorldPos.set(0, 0, 0);
		this.entryPoint.getWorldPosition(this.entryPointWorldPos);
		let viewVector = new THREE.Vector3().subVectors(this.entryPointWorldPos, this.character.position);
		this.character.setOrientation(viewVector);
		
		let heightDifference = viewVector.y;
		viewVector.y = 0;
		if (this.character.charState.canEnterVehicles && viewVector.length() < 0.2 && heightDifference < 2) {
			this.character.enterVehicle(this.targetSeat, this.entryPoint);
		}
	}
}
