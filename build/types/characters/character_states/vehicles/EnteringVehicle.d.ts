import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../Character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { Object3D } from 'three';
export declare class EnteringVehicle extends CharacterStateBase {
    private vehicle;
    private animData;
    private seat;
    private entryPoint;
    private initialPositionOffset;
    private startPosition;
    private endPosition;
    private startRotation;
    private endRotation;
    private factorSimulator;
    private drivingState;
    private sittingState;
    constructor(character: Character, seat: VehicleSeat, entryPoint: Object3D);
    reset(): void;
    update(timeStep: number): void;
    private getEntryAnimations;
}
