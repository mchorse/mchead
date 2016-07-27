/**
 * Combined camera.
 *
 * This class is basically combines to cameras together.
 */
var CombinedCamera = module.exports = function (width, height, fov, near, far, orthoNear, orthoFar) 
{
    this.fov = fov;

    var halfW = width / 2,
        halfH = height / 2;

    this.ortho = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, orthoNear, orthoFar);
    this.ortho.position.z = 4;
    
    this.perspec = new THREE.PerspectiveCamera(fov, width / height, near, far);
    this.perspec.position.z = 544;
    
    this.toOrtho();
};

CombinedCamera.prototype = Object.create(THREE.Camera.prototype);
CombinedCamera.prototype.constructor = THREE.CombinedCamera;

CombinedCamera.prototype.toOrtho = function()
{
    this.camera = this.ortho;
};

CombinedCamera.prototype.toPerspec = function()
{
    this.camera = this.perspec;
};