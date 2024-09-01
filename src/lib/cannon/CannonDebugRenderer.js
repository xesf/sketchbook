
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Detector } from '../utils/Detector';

/**
 * Adds Three.js primitives into the scene where all the Cannon bodies and shapes are.
 * @class CannonDebugRenderer
 * @param {THREE.Scene} scene
 * @param {CANNON.World} world
 * @param {object} [options]
 */
export var CannonDebugRenderer = function(scene, world, options){
    options = options || {};

    this.scene = scene;
    this.world = world;

    this._meshes = [];

    this._boxMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    this._triMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    this._sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    this._sphereGeometry = new THREE.SphereGeometry(1);
    this._boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this._planeGeometry = new THREE.PlaneGeometry( 10, 10, 10, 10 );
    this._cylinderGeometry = new THREE.CylinderGeometry( 1, 1, 10, 10 );
};

CannonDebugRenderer.prototype = {

    tmpVec0: new CANNON.Vec3(),
    tmpVec1: new CANNON.Vec3(),
    tmpVec2: new CANNON.Vec3(),
    tmpQuat0: new CANNON.Vec3(),

    update: function(){

        var bodies = this.world.bodies;
        var meshes = this._meshes;
        var shapeWorldPosition = this.tmpVec0;
        var shapeWorldQuaternion = this.tmpQuat0;

        var meshIndex = 0;

        for (var i = 0; i !== bodies.length; i++) {
            var body = bodies[i];

            for (var j = 0; j !== body.shapes.length; j++) {
                var shape = body.shapes[j];

                this._updateMesh(meshIndex, body, shape);

                var mesh = meshes[meshIndex];

                if(mesh){

                    // Get world position
                    body.interpolatedQuaternion.vmult(body.shapeOffsets[j], shapeWorldPosition);
                    body.interpolatedPosition.vadd(shapeWorldPosition, shapeWorldPosition);

                    // Get world quaternion
                    body.quaternion.mult(body.shapeOrientations[j], shapeWorldQuaternion);

                    // Copy to meshes
                    mesh.position.copy(shapeWorldPosition);
                    mesh.quaternion.copy(shapeWorldQuaternion);
                }

                meshIndex++;
            }
        }

        for(var i = meshIndex; i < meshes.length; i++){
            var mesh = meshes[i];
            if(mesh){
                this.scene.remove(mesh);
            }
        }

        meshes.length = meshIndex;
    },

    _updateMesh: function(index, body, shape){
        var mesh = this._meshes[index];
        if(!this._typeMatch(mesh, shape)){
            if(mesh){
                this.scene.remove(mesh);
            }
            mesh = this._meshes[index] = this._createMesh(shape);
        }
        this._scaleMesh(mesh, shape);
    },

    _typeMatch: function(mesh, shape){
        if(!mesh){
            return false;
        }
        var geo = mesh.geometry;
        return (
            (geo instanceof THREE.SphereGeometry && shape instanceof CANNON.Sphere) ||
            (geo instanceof THREE.BoxGeometry && shape instanceof CANNON.Box) ||
            (geo instanceof THREE.PlaneGeometry && shape instanceof CANNON.Plane) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.ConvexPolyhedron) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.Trimesh) ||
            (geo.id === shape.geometryId && shape instanceof CANNON.Heightfield)
        );
    },

    _createMesh: function(shape){
        var mesh;

        var yellow = this._sphereMaterial;
        var cyan = this._boxMaterial;
        var purple = this._triMaterial;

        switch(shape.type){

        case CANNON.Shape.types.SPHERE:
            mesh = new THREE.Mesh(this._sphereGeometry, yellow);
            break;

        case CANNON.Shape.types.BOX:
            mesh = new THREE.Mesh(this._boxGeometry, cyan);
            break;

        case CANNON.Shape.types.PLANE:
            mesh = new THREE.Mesh(this._planeGeometry, yellow);
            break;

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
            // Create mesh
            var geometry = new THREE.BufferGeometry();
            shape.id = geometry.id;

            // Add vertices
            var points = [];
            for (var i = 0; i < shape.vertices.length; i += 1) {
                var v = shape.vertices[i];
                points.push(new THREE.Vector3(v.x, v.y, v.z));
            }
            geometry.setFromPoints(points);

            // Add triangles
            var indices = [];
            for (var i = 0; i < shape.faces.length; i++) {
                var face = shape.faces[i];
                var a = face[0];
                for (var j = 1; j < face.length - 1; j++) {
                    var b = face[j];
                    var c = face[j + 1];
                    indices.push(a, b, c);
                }
            }
            geometry.setIndex(indices);
            geometry = geometry.toNonIndexed();
            geometry.computeBoundingSphere();
            geometry.computeVertexNormals();

            mesh = new THREE.Mesh(geometry, cyan);
            break;

        case CANNON.Shape.types.TRIMESH:
            geometry = new THREE.BufferGeometry();
            shape.id = geometry.id;
            //console.log(shape);
            //console.log(shape.vertices);
            var points = [];
            for (var i = 0; i < shape.vertices.length; i += 3) {
                points.push(new THREE.Vector3(shape.vertices[i], shape.vertices[i + 1], shape.vertices[i + 2]));
            }
            geometry.setFromPoints(points);
            geometry.computeBoundingSphere();
            geometry.computeVertexNormals();
            mesh = new THREE.Mesh(geometry, purple);
            break;

        case CANNON.Shape.types.HEIGHTFIELD:
            geometry = new THREE.BufferGeometry();
            v0 = this.tmpVec0;
            v1 = this.tmpVec1;
            v2 = this.tmpVec2;
            for (var xi = 0; xi < shape.data.length - 1; xi++) {
                for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
                    for (var k = 0; k < 2; k++) {
                        ;
                        shape.getConvexTrianglePillar(xi, yi, k === 0);
                        v0.copy(shape.pillarConvex.vertices[0]);
                        v1.copy(shape.pillarConvex.vertices[1]);
                        v2.copy(shape.pillarConvex.vertices[2]);
                        v0.vadd(shape.pillarOffset, v0);
                        v1.vadd(shape.pillarOffset, v1);
                        v2.vadd(shape.pillarOffset, v2);
                        points.push(new THREE.Vector3(v0.x, v0.y, v0.z), new THREE.Vector3(v1.x, v1.y, v1.z), new THREE.Vector3(v2.x, v2.y, v2.z));
                        //const i = geometry.vertices.length - 3
                        //geometry.faces.push(new THREE.Face3(i, i + 1, i + 2))
                    }
                }
            }
            geometry.setFromPoints(points);
            geometry.computeBoundingSphere()
            geometry.computeFaceNormals()
            mesh = new THREE.Mesh(geometry, purple);
            shape.id = geometry.id;
            break;
        }

        if(mesh){
            this.scene.add(mesh);
        }

        return mesh;
    },

    _scaleMesh: function(mesh, shape){
        switch(shape.type){

        case CANNON.Shape.types.SPHERE:
            var radius = shape.radius;
            mesh.scale.set(radius, radius, radius);
            break;

        case CANNON.Shape.types.BOX:
            mesh.scale.copy(shape.halfExtents);
            mesh.scale.multiplyScalar(2);
            break;

        case CANNON.Shape.types.CONVEXPOLYHEDRON:
            mesh.scale.set(1,1,1);
            break;

        case CANNON.Shape.types.TRIMESH:
            mesh.scale.copy(shape.scale);
            break;

        case CANNON.Shape.types.HEIGHTFIELD:
            mesh.scale.set(1,1,1);
            break;

        }
    },

    clearMeshes: function(){
        this._meshes.forEach((mesh) => {
            this.scene.remove(mesh);
        });
    }

};