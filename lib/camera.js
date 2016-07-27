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

CombinedCamera.prototype = 
{
    toOrtho: function()
    {
        this.camera = this.ortho;
    },

    toPerspec: function()
    {
        this.camera = this.perspec;
    },
    
    /**
     * Toggle between orthographic and perspective cameras.
     */
    toggle: function()
    {
        if (this.camera == this.ortho) this.toPerspec();
        else this.toOrtho();
    }
};