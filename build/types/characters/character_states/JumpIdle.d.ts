import { CharacterStateBase } from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../Character';
export declare class JumpIdle extends CharacterStateBase implements ICharacterState {
    private alreadyJumped;
    constructor(character: Character);
    reset(): void;
    update(timeStep: number): void;
}
