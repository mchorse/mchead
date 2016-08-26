var utils = require("./utils");

/**
 * Minecraft Steve's 3d model
 */
var Model = module.exports = function()
{
    this.createMesh(64, 32);
    this.applyUV(64, 32);
    
    /** Flag for specifying alex's skin */
    this.alex = false;
};

Model.prototype = 
{
    /**
     * Create Minecraft steve's (with all its limbs).
     *
     * There's one issue with those models, when someone uses different size 
     * texture (was 64x32, became 64x64, and vice versa), something fucks up 
     * the texture mapping.
     * 
     * I checked my math and it seems to be legit. There's something wrong 
     * either with ThreeJS's materials, geometry or texture when I switch 
     * the dimension of the texture.
     * 
     * Btw, it's so random, that there are following cases happens when 
     * changing the dimension:
     * - Head's UV is cool, but body is messed up
     * - Body's UV is ok, but head is messed up
     * - Both of them are messed up
     * 
     * I probably need to read the docs very carefully (most of the stuff solved 
     * thanks to SO, loool).
     */
    createMesh: function(w, h)
    {
        /** Create stuffs */
        var material = new THREE.MeshBasicMaterial(),
            outerMaterial = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide,
                transparent: true
            });
        
        var wide = this.alex ? 3 : 4,
            dist = 2 + (this.alex ? 3.5 : 4);
        
        var head = utils.limb(material, 0, 8, 8, 8, 8),
        	outer = utils.limb(outerMaterial, 0, 8, 8, 8, 8),
        	body = utils.limb(material, 0, -2, 8, 12, 4),
        	left_arm = utils.limb(material, -dist, -2, wide, 12, 4),
        	right_arm = utils.limb(material, dist, -2, wide, 12, 4),
        	left_leg = utils.limb(material, -2, -14, 4, 12, 4),
        	right_leg = utils.limb(material, 2, -14, 4, 12, 4);
        
        var group = new THREE.Object3D();
        
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
        
        /** 1.8 skin overlays */
        if (h == 64)
        {
        	var outer_body = utils.limb(outerMaterial, 0, -2, 8, 12, 4),
            	outer_left_arm = utils.limb(outerMaterial, -dist, -2, wide, 12, 4),
            	outer_right_arm = utils.limb(outerMaterial, dist, -2, wide, 12, 4),
            	outer_left_leg = utils.limb(outerMaterial, -2, -14, 4, 12, 4),
            	outer_right_leg = utils.limb(outerMaterial, 2, -14, 4, 12, 4);
            
            group.add(outer_body);
            group.add(outer_left_arm);
            group.add(outer_right_arm);
            group.add(outer_left_leg);
            group.add(outer_right_leg);
            
            [outer_left_arm, outer_right_arm, outer_left_leg, outer_right_leg].forEach(function (limb) {
                limb.scale.set(1.1, 0.9, 1.1);
            });
            
            outer_body.scale.set(1.1, 1.1, 1.1);
            
            this.outer_body = outer_body;
        	this.outer_left_arm = outer_left_arm;
        	this.outer_right_arm = outer_right_arm;
        	this.outer_left_leg = outer_left_leg;
        	this.outer_right_leg = outer_right_leg;
        }
        else
        {
            this.outer_body = this.outer_left_arm = this.outer_right_arm = this.outer_left_leg = this.outer_right_leg = null;
        }
        
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
        this.head.position.y = this.outer.position.y = flag ? 0 : 1;
        
        this.body.visible = !flag;
        this.left_arm.visible = !flag;
        this.right_arm.visible = !flag;
        this.left_leg.visible = !flag;
        this.right_leg.visible = !flag;
        
        if (this.outer_body)
        {
            this.outer_body.visible = !flag;
            this.outer_left_arm.visible = !flag;
            this.outer_right_arm.visible = !flag;
            this.outer_left_leg.visible = !flag;
            this.outer_right_leg.visible = !flag;
        }
    },
    
    includeHair: function(flag)
    {
        this.outer.visible = flag;
    },
    
    applyUV: function(w, h)
    {
        if (h == 64)
        {
            var wide = this.alex ? 3 : 4;
            
            /* Body parts */
            utils.apply_cube(w, h, this.head.geometry, 0,  48, 8, 8,  8);
            utils.apply_cube(w, h, this.body.geometry, 16, 32, 8, 12, 4);
            
            utils.apply_cube(w, h, this.right_arm.geometry, 40, 32, wide, 12, 4);
            utils.apply_cube(w, h, this.right_leg.geometry, 0,  32, 4, 12, 4);
            
            utils.apply_cube(w, h, this.left_arm.geometry,  32, 0, wide, 12, 4);
            utils.apply_cube(w, h, this.left_leg.geometry,  16, 0, 4, 12, 4);
            
            /* Overlays */
            utils.apply_cube(w, h, this.outer.geometry,      32, 48, 8, 8,  8);
            utils.apply_cube(w, h, this.outer_body.geometry, 16, 16, 4, 12, 4);
            
            utils.apply_cube(w, h, this.outer_right_arm.geometry, 40, 16, wide, 12, 4);
            utils.apply_cube(w, h, this.outer_right_leg.geometry, 0,  16, 4, 12, 4);
            
            utils.apply_cube(w, h, this.outer_left_arm.geometry, 48, 0, wide, 12, 4);
            utils.apply_cube(w, h, this.outer_left_leg.geometry, 0,  0, 4, 12, 4);
        }
        else
        {
            utils.apply_cube(w, h, this.head.geometry,      0,  16, 8, 8,  8);
            utils.apply_cube(w, h, this.outer.geometry,     32, 16, 8, 8,  8);
            utils.apply_cube(w, h, this.body.geometry,      16, 0,  8, 12, 4);
            utils.apply_cube(w, h, this.left_arm.geometry,  40, 0,  4, 12, 4);
            utils.apply_cube(w, h, this.right_arm.geometry, 40, 0,  4, 12, 4, true);
            utils.apply_cube(w, h, this.left_leg.geometry,  0,  0,  4, 12, 4);
            utils.apply_cube(w, h, this.right_leg.geometry, 0,  0,  4, 12, 4, true);
        }
    },
    
    setTexture: function(texture)
    {
        texture.minFilter = texture.magFilter = THREE.NearestFilter;
        
        this.material.map = texture;
        this.material.map.needsUpdate = true;
        
        this.outerMaterial.map = texture;
        this.outerMaterial.map.needsUpdate = true;
    },
    
    /**
     * Set texture from image with given sizes. Also, this method creats the 
     * model from scratch, which pisses me out.
     * 
     * Would be helpful to rewrite it so it wouldn't require to create the 
     * model from scratch.
     * 
     * @see {Model.prototype.createMesh}
     */
    setImage: function(image, w, h)
    {
        var scene = this.group.parent,
            headOnly = !this.body.visible;
        
        scene.remove(this.group);
        
        this.createMesh(w, h);
        this.applyUV(w, h);
        
        scene.add(this.group);
        
        this.setTexture(new THREE.Texture(image));
        this.headOnly(headOnly);
    },
    
    setAlex: function(bool)
    {
        var texture = this.material.map,
            image = texture.image;
        
        var w = image.width,
            h = image.height;
        
        var scene = this.group.parent,
            headOnly = !this.body.visible;
        
        this.alex = bool;
        
        scene.remove(this.group);
        
        this.createMesh(w, h);
        this.applyUV(w, h);
        
        scene.add(this.group);
        
        this.setTexture(texture);
        this.headOnly(headOnly);
    }
};