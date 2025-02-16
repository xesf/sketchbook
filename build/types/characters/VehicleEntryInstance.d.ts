import * as THREE from 'three';
import { VehicleSeat } from '../vehicles/VehicleSeat';
import { Character } from './Character';
export declare class VehicleEntryInstance {
    character: Character;
    targetSeat: VehicleSeat;
    entryPoint: THREE.Object3D;
    wantsToDrive: boolean;
    entryPointWorldPos: THREE.Vector3;
    constructor(character: Character);
    reset(): void;
    update(timeStep: number): void;
}
