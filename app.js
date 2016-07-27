/**
 * McHead – avatar generator based on Minecraft skins.
 * 
 * @author McHorse
 * @license MIT
 */

function to_a(arrayLike)
{
    return Array.prototype.slice.call(arrayLike);
}

/* DOM stuff */

function $(selector, reference)
{
    return (reference || document).querySelector(selector);
}

function $$(selector, reference)
{
    return to_a((reference || document).querySelectorAll(selector));
}

function on(node, event, listener)
{
    node.addEventListener(event, listener);
}

/* ThreeJS stuff */

/**
 * Creates a point structure.
 */
function point(x, y)
{
    return {x: x, y: y};
}

window.tw = 64;
window.th = 32;

/**
 * Creates a ThreeJS vector (2d point) for UV.
 */
function vec(x, y)
{
	return new THREE.Vector2(x / 64, y / 32);
}

/**
 * Apply geometry's UV of the texture on the cube's side given 
 * the rectangle on the texture
 */
function apply_uv(geo, side, x, y, w, h)
{
	side = side * 2;
	
	var faces = [
		vec(x, y + h), 
		vec(x + w, y + h),
		vec(x + w, y),
		vec(x, y)
	];
	
	if (side != 6)
	{
		geo.faceVertexUvs[0][side] = [faces[0], faces[3], faces[1]];
		geo.faceVertexUvs[0][side + 1] = [faces[3], faces[2], faces[1]];
	}
	else 
	{
		geo.faceVertexUvs[0][side] = [faces[3], faces[0], faces[2]];
		geo.faceVertexUvs[0][side + 1] = [faces[0], faces[1], faces[2]];
	}
}

/**
 * Apply texture rect on cube's geometry
 */
function apply_cube(geo, x, y, w, h, d)
{
	// front and back
	apply_uv(geo, 4, x + d, y, w, h);
	apply_uv(geo, 5, x + d + w + d, y, w, h);
	
	// right and left
	apply_uv(geo, 0, x + d + w, y, d, h);
	apply_uv(geo, 1, x, y, d, h);
	
	// top and bottom
	apply_uv(geo, 2, x + d, y + h, w, d);
	apply_uv(geo, 3, x + d + w, y + h, w, d);
	
	geo.uvsNeedUpdate = true;
}

/**
 * Create a Minecraft-like limb (3d rectangle)
 */
function create_part(material, x, y, w, h, d)
{
	var geometry = new THREE.BoxGeometry(w / 8, h / 8, d / 8);
	var cube = new THREE.Mesh(geometry, material);
	
	cube.position.x = x ? x / 8 : 0;
	cube.position.y = y ? y / 8 : 0;
	
	return cube;
}

function invert(mesh)
{
    var geo = mesh.geometry;
    
    geo.scale(-1, 1, 1);
    geo.scale(-1, 1, 1);
    
    geo.dynamic = true
    geo.__dirtyVertices = true;
    geo.__dirtyNormals = true;

    mesh.flipSided = true;
    
    for (var i = 0, count = geo.faces.length; i < count; i ++)
    {
        var face = geo.faces[i];
        
        face.normal.x *= -1;
        face.normal.y *= -1;
        face.normal.z *= -1;
    }
    
    geo.computeVertexNormals();
    geo.computeFaceNormals();
}

/**
 * Mouse handler
 * 
 * Responsible for rotating the model.
 */
var MouseHandler = function(target, x, y)
{
    this.target = target;
    this.on = false;
    
    this.result = point(x, y);
    this.first = point(0, 0);
    this.tmp = point(0, 0);
    this.last = point(0, 0);
};

MouseHandler.prototype = 
{
    attach: function(element)
    {
        on(element, "mousedown", this.down.bind(this));
        on(element, "mousemove", this.move.bind(this));
        on(element, "mouseout", this.out.bind(this));
        on(element, "mouseup", this.up.bind(this));
    },
    
    out: function()
    {
        this.on = false;
    },
    
    down: function(e)
    {
        this.on = true;
        
        this.first.x = e.pageX;
        this.first.y = e.pageY;
        
        this.last.x = this.result.x;
        this.last.y = this.result.y;
    },
    
    move: function(e)
    {
        if (!this.on) return;

        this.tmp.x = e.pageX - this.first.x;
        this.tmp.y = e.pageY - this.first.y;

        this.applyRotation();
        this.render();
    },
    
    up: function(e)
    {
        this.on = false;
        this.applyRotation();
        this.target.up();
    },
    
    applyRotation: function()
    {
        var fullPie = Math.PI * 2;
        
        this.result.x = (this.last.x + this.tmp.x / 90) % fullPie;
        this.result.y = (this.last.y + this.tmp.y / 90) % fullPie;
        
        this.target.changed(this.getX(), this.getY());
    },
    
    setX: function(x)
    {
        this.result.x = x / 180 * Math.PI;
        this.render();
    },
    
    setY: function(y)
    {
        this.result.y = y / 180 * Math.PI;
        this.render();
    },
    
    getX: function()
    {
        return this.result.x * 180 / Math.PI;
    },
    
    getY: function()
    {
        return this.result.y * 180 / Math.PI;
    },
    
    render: function()
    {
        this.target.render(this.result.x, this.result.y);
    }
};

var Model = function()
{
    var material = new THREE.MeshBasicMaterial(),
        outerMaterial = new THREE.MeshBasicMaterial();
    
    var group = new THREE.Object3D();
    
    var head = create_part(material, 0, 8, 8, 8, 8),
    	outer = create_part(outerMaterial, 0, 8, 8, 8, 8),
    	body = create_part(material, 0, -2, 8, 12, 4),
    	left_arm = create_part(material, -6, -2, 4, 12, 4),
    	right_arm = create_part(material, 6, -2, 4, 12, 4),
    	left_leg = create_part(material, -2, -14, 4, 12, 4),
    	right_leg = create_part(material, 2, -14, 4, 12, 4);
        
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

    invert(right_arm);
    invert(right_leg);

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
    
    applyUV: function()
    {
        apply_cube(this.head.geometry, 0, 16, 8, 8, 8);
        apply_cube(this.outer.geometry, 32, 16, 8, 8, 8);
        apply_cube(this.body.geometry, 16, 0, 8, 12, 4);
        apply_cube(this.left_arm.geometry, 40, 0, 4, 12, 4);
        apply_cube(this.right_arm.geometry, 40, 0, 4, 12, 4);
        apply_cube(this.left_leg.geometry, 0, 0, 4, 12, 4);
        apply_cube(this.right_leg.geometry, 0, 0, 4, 12, 4);
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

/**
 * Entry point of the application
 */
var App = function(options, canvas, w, h)
{
    this.options = options;
    this.canvas = canvas;
    this.size = point(w, h);
};

App.prototype = 
{
    init: function()
    {
        this.initThree();
        this.initModel();
        this.initMouseHandler();
        this.initOptions();
    },
    
    initThree: function()
    {
        var self = this;
        
        /* ThreeJS variables */
        var scene, camera, renderer, loader;

        /* Resolution */
        var width = this.size.x, 
            height = this.size.y;

        var halfW = width / 2,
            halfH = height / 2;
        
        /* ThreeJS initialization */
        scene = new THREE.Scene();
        camera = new THREE.CombinedCamera(width, height, 50, 0.1, 1000, -1000, 1000);
        loader = new THREE.TextureLoader();

        renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: true 
        });

        renderer.setClearColor(0xffffff, 0.0);
        renderer.setSize(width, height);
        renderer.domElement.classList.add("renderer");
        
        this.canvas.appendChild(renderer.domElement);
        
        loader.load('steve.png', function(texture) 
        {
    		texture.magFilter = texture.minFilter = THREE.NearestFilter;
	        
            self.model.setTexture(texture);
            self.render(Math.PI/4, Math.PI/4);
        });
        
        /* Export */
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
    },
    
    initMouseHandler: function()
    {
        this.mouse = new MouseHandler(this, Math.PI/4, Math.PI/4);
        this.mouse.attach(this.renderer.domElement);
    },
    
    initModel: function()
    {
        this.model = new Model();
        this.scene.add(this.model.group);
        this.model.headOnly(true);
    },
    
    initOptions: function()
    {
        var self = this;
        
        $$("input", this.options).forEach(function (input)
        {
            on(input, "change", function ()
            {   
                self.change(input.name, input);
            });
        });
        
        on($("#reset"), "click", function()
        {
            $("[name=x]").value = $("[name=y]").value = 45;
            
            self.mouse.setX(45);
            self.mouse.setY(45);
        });
    },
    
    change: function(name, input)
    {
        if (name == "head")
        {
            this.model.headOnly(input.checked);
        }
        else if (name == "outer")
        {
            this.model.includeHair(input.checked);
        }
        else if (name == "flat")
        {
            input.checked ? this.camera.toOrtho() : this.camera.toPerspec();
        }
        else if (name == "texture")
        {
            this.readFile(input.files[0]);
        }
        else if (name == "x")
        {
            this.mouse.setX(parseInt(input.value));
        }
        else if (name == "y")
        {
            this.mouse.setY(parseInt(input.value));
        }
        
        this.justRender();
    },
    
    changed: function(x, y)
    {
        $("[name=x]").value = x.toFixed(4);
        $("[name=y]").value = y.toFixed(4);
    },
    
    readFile: function(file)
    {
        var self = this;
        
        var reader = new FileReader(),
            image = new Image();
        
        image.onload = function()
        {
            self.model.setImage(this);
            self.justRender();
        };
        
        reader.onload = function(e)
        {
            image.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    },
    
    render: function (x, y)
    {
        this.model.rotate(x, y);
		this.renderer.render(this.scene, this.camera.camera);
    },
    
    justRender: function()
    {
        this.render(this.mouse.result.x, this.mouse.result.y);
    }
};