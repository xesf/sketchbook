import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { SimulationFrame } from '../physics/spring_simulation/SimulationFrame';
import { World } from '../world/World';
import { Side } from '../enums/Side';
import { Object3D } from 'three';
import { Space } from '../enums/Space';

export function createCapsuleGeometry(radius: number = 1, height: number = 2, N: number = 32): THREE.CapsuleGeometry
{
	const geometry = new THREE.CapsuleGeometry(radius, height, N, N);
	return geometry;
}

//#endregion

//#region Math

/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param {Vector3} a Vector to construct 2D matrix from
 * @param {Vector3} b Vector to apply basis to
 */
export function appplyVectorMatrixXZ(a: THREE.Vector3, b: THREE.Vector3): THREE.Vector3
{
	return new THREE.Vector3(
		(a.x * b.z + a.z * b.x),
		b.y,
		(a.z * b.z + -a.x * b.x)
	);
}

export function round(value: number, decimals: number = 0): number
{
	return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function roundVector(vector: THREE.Vector3, decimals: number = 0): THREE.Vector3
{
	return new THREE.Vector3(
		this.round(vector.x, decimals),
		this.round(vector.y, decimals),
		this.round(vector.z, decimals),
	);
}

/**
 * Finds an angle between two vectors
 * @param {THREE.Vector3} v1 
 * @param {THREE.Vector3} v2 
 */
export function getAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, dotTreshold: number = 0.0005): number
{
	let angle: number;
	let dot = v1.dot(v2);

	// If dot is close to 1, we'll round angle to zero
	if (dot > 1 - dotTreshold)
	{
		angle = 0;
	}
	else
	{
		// Dot too close to -1
		if (dot < -1 + dotTreshold)
		{
			angle = Math.PI;
		}
		else
		{
			// Get angle difference in radians
			angle = Math.acos(dot);
		}
	}

	return angle;
}

/**
 * Finds an angle between two vectors with a sign relative to normal vector
 */
export function getSignedAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, normal: THREE.Vector3 = new THREE.Vector3(0, 1, 0), dotTreshold: number = 0.0005): number
{
	let angle = this.getAngleBetweenVectors(v1, v2, dotTreshold);

	// Get vector pointing up or down
	let cross = new THREE.Vector3().crossVectors(v1, v2);
	// Compare cross with normal to find out direction
	if (normal.dot(cross) < 0)
	{
		angle = -angle;
	}

	return angle;
}

export function haveSameSigns(n1: number, n2: number): boolean
{
	return (n1 < 0) === (n2 < 0);
}

export function haveDifferentSigns(n1: number, n2: number): boolean
{
	return (n1 < 0) !== (n2 < 0);
}

//#endregion

//#region Miscellaneous

export function setDefaults(options: {}, defaults: {}): {}
{
	return Object.assign({}, defaults, options);
}

export function getGlobalProperties(prefix: string = ''): any[]
{
	let keyValues = [];
	let global = window; // window for browser environments
	for (let prop in global)
	{
		// check the prefix
		if (prop.indexOf(prefix) === 0) {
			keyValues.push(prop /*+ "=" + global[prop]*/);
		}
	}
	return keyValues; // build the string
}

export function spring(source: number, dest: number, velocity: number, mass: number, damping: number): SimulationFrame
{
	let acceleration = dest - source;
	acceleration /= mass;
	velocity += acceleration;
	velocity *= damping;

	let position = source + velocity;

	return new SimulationFrame(position, velocity);
}

export function springV(source: THREE.Vector3, dest: THREE.Vector3, velocity: THREE.Vector3, mass: number, damping: number): void
{
	let acceleration = new THREE.Vector3().subVectors(dest, source);
	acceleration.divideScalar(mass);
	velocity.add(acceleration);
	velocity.multiplyScalar(damping);
	source.add(velocity);
}

export function threeVector(vec: CANNON.Vec3): THREE.Vector3
{
	return new THREE.Vector3(vec.x, vec.y, vec.z);
}

export function cannonVector(vec: THREE.Vector3): CANNON.Vec3
{
	let out = new CANNON.Vec3();
	out.set(vec.x, vec.y, vec.z);
	return out;
}

export function threeQuat(quat: CANNON.Quaternion): THREE.Quaternion
{
	return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
}

export function cannonQuat(quat: THREE.Quaternion): CANNON.Quaternion
{
	let out = new CANNON.Quaternion();
	out.set(quat.x, quat.y, quat.z, quat.w);
	return out;
}

export function setupMeshProperties(child: any): void
{
	child.castShadow = true;
	child.receiveShadow = true;

	if (child.material.map !== null)
	{
		let mat = new THREE.MeshPhongMaterial();
		mat.shininess = 0;
		mat.name = child.material.name;
		mat.map = child.material.map;
		mat.map.anisotropy = 4;
		mat.aoMap = child.material.aoMap;
		mat.transparent = child.material.transparent;
		//mat.skinning = child.material.skinning; FIGURE OUT THIS PROBLEM
		// mat.map.encoding = THREE.LinearEncoding;
		child.material = mat;
	}
}

export function detectRelativeSide(from: Object3D, to: Object3D): Side
{
	const right = getRight(from, Space.Local);
	const viewVector = to.position.clone().sub(from.position).normalize();

	return right.dot(viewVector) > 0 ? Side.Left : Side.Right;
}

export function easeInOutSine(x: number): number
{
	return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function easeOutQuad(x: number): number
{
	return 1 - (1 - x) * (1 - x);
}

export function getRight(obj: THREE.Object3D, space: Space = Space.Global): THREE.Vector3
{
	const matrix = getMatrix(obj, space);
	return new THREE.Vector3(
		matrix.elements[0],
		matrix.elements[1],
		matrix.elements[2]
		);
}

export function getUp(obj: THREE.Object3D, space: Space = Space.Global): THREE.Vector3
{
	const matrix = getMatrix(obj, space);
	return new THREE.Vector3(
		matrix.elements[4],
		matrix.elements[5],
		matrix.elements[6]
		);
}

export function getForward(obj: THREE.Object3D, space: Space = Space.Global): THREE.Vector3
{
	const matrix = getMatrix(obj, space);
	return new THREE.Vector3(
		matrix.elements[8],
		matrix.elements[9],
		matrix.elements[10]
		);
}

export function getBack(obj: THREE.Object3D, space: Space = Space.Global): THREE.Vector3
{
	const matrix = getMatrix(obj, space);
	return new THREE.Vector3(
		-matrix.elements[8],
		-matrix.elements[9],
		-matrix.elements[10]
		);
}

export function getMatrix(obj: THREE.Object3D, space: Space): THREE.Matrix4
{
	switch (space)
	{
		case Space.Local: return obj.matrix;
		case Space.Global: return obj.matrixWorld;
	}
}

export function countSleepyBodies(): any
{
	// let awake = 0;
	// let sleepy = 0;
	// let asleep = 0;
	// this.physicsWorld.bodies.forEach((body) =>
	// {
	//     if (body.sleepState === 0) awake++;
	//     if (body.sleepState === 1) sleepy++;
	//     if (body.sleepState === 2) asleep++;
	// });
}

// From online for converting Geometry to BufferGeometry
export function isIndexed(mesh: THREE.Mesh) {
	return mesh.geometry.index != null;
}

export function getFaces(mesh: THREE.Mesh) {
	const faces = [];
	const position = mesh.geometry.getAttribute( 'position' );
	
	if (isIndexed(mesh)) {
	   const index = mesh.geometry.getIndex();
	   
	   for ( let i = 0; i < index.count; i += 3 ) {
		   const face = {
			   a: index.getX(i),
			   b: index.getX(i+1),
			   c: index.getX(i+2),
			   normal: new THREE.Vector3()
		   };
		   faces.push(face);
	   }
	}
	else {
	   for ( let i = 0; i < position.count; i += 3 ) {
		   const face = {
			   a: i,
			   b: i+1,
			   c: i+2
		   };
		   faces.push(face);
	   }
	}
	
   for( let j = 0; j < faces.length; j ++ ) {
	   let face = faces[j];
	   let pointA = new THREE.Vector3(
		   position.getX(face.a),
		   position.getY(face.a),
		   position.getZ(face.a)
	   );
	   let pointB = new THREE.Vector3(
		   position.getX(face.b),
		   position.getY(face.b),
		   position.getZ(face.b)
	   );
	   let pointC = new THREE.Vector3(
		   position.getX(face.c),
		   position.getY(face.c),
		   position.getZ(face.c)
	   );
	   
	   let faceTriangle = new THREE.Triangle(
		   pointA,
		   pointB,
		   pointC
	   );
	   
	   faceTriangle.getNormal(faces[j].normal);
   }
	
	return faces;
}

export function getVertices(mesh: THREE.Mesh) {
	const position = mesh.geometry.getAttribute( 'position' );
	const vertices = [];
	
	for ( let i = 0; i < position.count / position.itemSize; i++ ) {
	   const vertex = new THREE.Vector3(
		   position.getX(i),
		   position.getY(i),
		   position.getZ(i)
	   );
	   
	   vertices.push(vertex);
   }
   
   return vertices;
}

export function getFaceVertexUvs(mesh: THREE.Mesh) {
	const faceVertexUvs = [];
	const uv = mesh.geometry.getAttribute( 'uv' );
	
	if (isIndexed(mesh)) {
	   const index = mesh.geometry.getIndex();
	   
	   for ( let i = 0; i < index.count; i += 3 ) {
		   const faceVertexUv = [
			   new THREE.Vector2(
				   uv.getX( index.getX(i) ),
				   uv.getY( index.getX(i) )
			   ),
			   new THREE.Vector2(
				   uv.getX( index.getX(i+1) ),
				   uv.getY( index.getX(i+1) )
			   ),
			   new THREE.Vector2(
				   uv.getX( index.getX(i+2) ),
				   uv.getY( index.getX(i+2) )
			   )
		   ];
		   
		   faceVertexUvs.push(faceVertexUv);
	   }
	}
	else {
	   for ( let i = 0; i < uv.count; i += 3 ) {
		   const faceVertexUv = [
			   new THREE.Vector2(
				   uv.getX(i),
				   uv.getY(i)
			   ),
			   new THREE.Vector2(
				   uv.getX(i+1),
				   uv.getY(i+1)
			   ),
			   new THREE.Vector2(
				   uv.getX(i+2),
				   uv.getY(i+2)
			   )
		   ];
		   
		   faceVertexUvs.push(faceVertexUv);
	   }
	}
	
	return faceVertexUvs;
}

//#endregion