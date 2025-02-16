export interface ICharacterState {
    canFindVehiclesToEnter: boolean;
    canEnterVehicles: boolean;
    canLeaveVehicles: boolean;
    reset(): void;
    update(timeStep: number): void;
    onInputChange(): void;
}
