/**
 * A general perpose camera, for setting FOV, Lens Focal Length,
 * and switching between perspective and orthographic views easily.
 * Use this only if you do not wish to manage both a Orthographic and 
 * Perspective Camera
 *
 * @author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
 */

THREE.CombinedCamera = function (width, height, fov, near, far, orthoNear, orthoFar) 
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

THREE.CombinedCamera.prototype = Object.create(THREE.Camera.prototype);
THREE.CombinedCamera.prototype.constructor = THREE.CombinedCamera;

THREE.CombinedCamera.prototype.toOrtho = function()
{
    this.camera = this.ortho;
};

THREE.CombinedCamera.prototype.toPerspec = function()
{
    this.camera = this.perspec;
};