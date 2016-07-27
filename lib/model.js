var utils = require("./utils");

/**
 * Minecraft Steve's 3d model
 */
var Model = module.exports = function()
{
    var material = new THREE.MeshBasicMaterial(),
        outerMaterial = new THREE.MeshBasicMaterial();
    
    var group = new THREE.Object3D();
    
    var head = utils.limb(material, 0, 8, 8, 8, 8),
    	outer = utils.limb(outerMaterial, 0, 8, 8, 8, 8),
    	body = utils.limb(material, 0, -2, 8, 12, 4),
    	left_arm = utils.limb(material, -6, -2, 4, 12, 4),
    	right_arm = utils.limb(material, 6, -2, 4, 12, 4),
    	left_leg = utils.limb(material, -2, -14, 4, 12, 4),
    	right_leg = utils.limb(material, 2, -14, 4, 12, 4);
        
    this.material = material;
    this.outerMaterial = outerMaterial;
    
    this.group = group;
    
    this.head = head;
    this.outer = outer;
    this.body = body;
    this.left_arm = left_arm;
    this.left_leg = left_leg;
    this.right_arm = right_arm;
    this.right_leg = right_leg;

    this.applyUV();

    utils.invert(right_arm);
    utils.invert(right_leg);

    group.position.set(0, 32, 0);
    group.add(head);
    group.add(outer);
    group.add(body);
    group.add(left_arm);
    group.add(right_arm);
    group.add(left_leg);
    group.add(right_leg);

    group.scale.x = group.scale.y = group.scale.z = 96;
    outer.scale.x = outer.scale.y = outer.scale.z = 1.1;
    outer.material.transparent = true;
};

Model.prototype = 
{
    rotate: function(x, y)
    {
        this.group.rotation.x = x;
        this.group.rotation.y = y;
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
    
    applyUV: function()
    {
        utils.apply_cube(this.head.geometry, 0, 16, 8, 8, 8);
        utils.apply_cube(this.outer.geometry, 32, 16, 8, 8, 8);
        utils.apply_cube(this.body.geometry, 16, 0, 8, 12, 4);
        utils.apply_cube(this.left_arm.geometry, 40, 0, 4, 12, 4);
        utils.apply_cube(this.right_arm.geometry, 40, 0, 4, 12, 4);
        utils.apply_cube(this.left_leg.geometry, 0, 0, 4, 12, 4);
        utils.apply_cube(this.right_leg.geometry, 0, 0, 4, 12, 4);
    },
    
    setTexture: function(texture)
    {
        this.material.map = texture;
        this.outerMaterial.map = texture;
    },
    
    setImage: function(image)
    {
        this.material.map.image = image;
        this.material.map.needsUpdate = true;
        
        this.outerMaterial.map.image = image;
        this.outerMaterial.map.needsUpdate = true;
    }
};