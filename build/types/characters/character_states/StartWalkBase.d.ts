import { CharacterStateBase } from './_stateLibrary';
import { Character } from '../Character';
export declare class StartWalkBase extends CharacterStateBase {
    constructor(character: Character);
    reset(): void;
    update(timeStep: number): void;
    onInputChange(): void;
}
