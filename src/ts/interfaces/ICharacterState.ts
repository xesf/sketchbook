export interface ICharacterState {
	canFindVehiclesToEnter: boolean; // Find a suitable car and run towards it
	canEnterVehicles: boolean; // Actually get into the vehicle
	canLeaveVehicles: boolean;

	reset(): void;
	update(timeStep: number): void;
	onInputChange(): void;
}