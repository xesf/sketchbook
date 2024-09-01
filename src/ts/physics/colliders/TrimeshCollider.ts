import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import * as Utils from '../../core/FunctionLibrary';
import {ICollider} from '../../interfaces/ICollider';
import {Object3D} from 'three';
//import { threeToCannon } from '../../../lib/utils/three-to-cannon';
import { threeToCannon, ShapeType } from 'three-to-cannon';

export class TrimeshCollider implements ICollider
{
	public mesh: any;
	public options: any;
	public body: CANNON.Body;
	public debugModel: any;

	constructor(mesh: Object3D, options: any)
	{
		this.mesh = mesh.clone();
		//this.mesh.geometry = this.mesh.geometry.toNonIndexed();
		// Above now implemented in World.ts. Uncomment above if that changes

		let defaults = {
			mass: 0,
			position: mesh.position,
			rotation: mesh.quaternion,
			friction: 0.3
		};
		options = Utils.setDefaults(options, defaults);
		this.options = options;

		let mat = new CANNON.Material('triMat');
		mat.friction = options.friction;
		// mat.restitution = 0.7;

		// Convert THREE.Trimesh to CANNON.Trimesh
		// NOTE: Only words if geometry is non-indexed
		let shape = threeToCannon(this.mesh, {type: ShapeType.MESH}).shape as CANNON.Trimesh;

		// Add phys sphere
		let physBox = new CANNON.Body({
			mass: options.mass,
			position: options.position,
			quaternion: options.rotation,
			shape: shape
		});

		physBox.material = mat;

		this.body = physBox;
	}
}