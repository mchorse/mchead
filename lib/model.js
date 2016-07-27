var utils = require("./utils");

/**
 * Minecraft Steve's 3d model
 */
var Model = module.exports = function()
{
    this.createMesh();
    this.applyUV(64, 32);
};

Model.prototype = 
{
    createMesh: function()
    {
        /** Create stuffs */
        var material = new THREE.MeshBasicMaterial(),
            outerMaterial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true
            });
    
        var head = utils.limb(material, 0, 8, 8, 8, 8),
        	outer = utils.limb(outerMaterial, 0, 8, 8, 8, 8),
        	body = utils.limb(material, 0, -2, 8, 12, 4),
        	left_arm = utils.limb(material, -6, -2, 4, 12, 4),
        	right_arm = utils.limb(material, 6, -2, 4, 12, 4),
        	left_leg = utils.limb(material, -2, -14, 4, 12, 4),
        	right_leg = utils.limb(material, 2, -14, 4, 12, 4);
        
        var group = new THREE.Object3D();
        
        /** Transformations? Please. */
        utils.invert(right_arm);
        utils.invert(right_leg);
        
        group.position.set(0, 32, 0);
        group.scale.x = group.scale.y = group.scale.z = 96;
        
        outer.scale.x = outer.scale.y = outer.scale.z = 1.1;
        
        /** Welcome to the scene */
        group.add(head);
        group.add(outer);
        group.add(body);
        group.add(left_arm);
        group.add(right_arm);
        group.add(left_leg);
        group.add(right_leg);
        
        /** Export */
        this.material = material;
        this.outerMaterial = outerMaterial;
    
        this.head = head;
        this.outer = outer;
        this.body = body;
        this.left_arm = left_arm;
        this.left_leg = left_leg;
        this.right_arm = right_arm;
        this.right_leg = right_leg;
        
        this.group = group;
    },
    
    rotate: function(x, y)
    {
        this.group.rotation.x = y;
        this.group.rotation.y = x;
    },
    
    headOnly: function(flag)
    {
        if (flag)
        {
            this.group.remove(this.body);
            this.group.remove(this.left_arm);
            this.group.remove(this.left_leg);
            this.group.remove(this.right_arm);
            this.group.remove(this.right_leg);
            
            this.head.position.y = 0;
            this.outer.position.y = 0;
        }
        else
        {
            this.group.add(this.body);
            this.group.add(this.left_arm);
            this.group.add(this.left_leg);
            this.group.add(this.right_arm);
            this.group.add(this.right_leg);
            
            this.head.position.y = 1;
            this.outer.position.y = 1;
        }
    },
    
    includeHair: function(flag)
    {
        this.outer.visible = flag;
    },
    
    applyUV: function(w, h)
    {
        var y = h == 32 ? 0 : 32;
        
        utils.apply_cube(w, h, this.head.geometry,      0,  y + 16, 8, 8,  8);
        utils.apply_cube(w, h, this.outer.geometry,     32, y + 16, 8, 8,  8);
        utils.apply_cube(w, h, this.body.geometry,      16, y + 0,  8, 12, 4);
        utils.apply_cube(w, h, this.left_arm.geometry,  40, y + 0,  4, 12, 4);
        utils.apply_cube(w, h, this.right_arm.geometry, 40, y + 0,  4, 12, 4);
        utils.apply_cube(w, h, this.left_leg.geometry,  0,  y + 0,  4, 12, 4);
        utils.apply_cube(w, h, this.right_leg.geometry, 0,  y + 0,  4, 12, 4);
    },
    
    setTexture: function(texture)
    {
        texture.minFilter = texture.magFilter = THREE.NearestFilter;
        
        this.material.map = texture;
        this.material.map.needsUpdate = true;
        
        this.outerMaterial.map = texture;
        this.outerMaterial.map.needsUpdate = true;
    },
    
    setImage: function(image, w, h)
    {
        var scene = this.group.parent,
            headOnly = this.body.parent == null;
        
        scene.remove(this.group);
        
        this.createMesh();
        this.applyUV(w, h);
        
        scene.add(this.group);
        
        this.setTexture(new THREE.Texture(image));
        this.headOnly(headOnly);
    }
};