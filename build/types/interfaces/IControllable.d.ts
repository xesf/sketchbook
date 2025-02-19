import { Character } from '../characters/Character';
import { IInputReceiver } from './IInputReceiver';
import { VehicleSeat } from '../vehicles/VehicleSeat';
import { EntityType } from '../enums/EntityType';
import * as THREE from 'three';
export interface IControllable extends IInputReceiver {
    entityType: EntityType;
    seats: VehicleSeat[];
    position: THREE.Vector3;
    controllingCharacter: Character;
    triggerAction(actionName: string, value: boolean): void;
    resetControls(): void;
    allowSleep(value: boolean): void;
    onInputChange(): void;
    noDirectionPressed(): boolean;
}
