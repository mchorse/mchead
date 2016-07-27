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
function create_part(texture, material, x, y, w, h, d)
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
}

MouseHandler.prototype = 
{
    attach: function(element)
    {
        on(element, "mousedown", this.down.bind(this));
        on(element, "mousemove", this.move.bind(this));
        on(element, "mouseup", this.up.bind(this));
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
        this.target.render(this.result.x, this.result.y);
    },
    
    up: function(e)
    {
        this.on = false;
        this.applyRotation();
    },
    
    applyRotation: function()
    {
        this.result.x = this.last.x + this.tmp.x / 90;
        this.result.y = this.last.y + this.tmp.y / 90;
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
    
    this.material = new THREE.MeshBasicMaterial({depthWrite: false});
};

App.prototype = 
{
    init: function()
    {
        this.initThree();
        this.initMouseHandler();
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
        camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, -1000, 1000);
        loader = new THREE.TextureLoader();

        renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: true 
        });

        renderer.setClearColor(0xffffff, 0.0);
        renderer.setSize(width, height);

        renderer.domElement.classList.add("renderer");
        this.canvas.appendChild(renderer.domElement);
        
        loader.load(
        	'steve.png',
        	function(texture) 
            {
        		texture.magFilter = texture.minFilter = THREE.NearestFilter;
		        self.material.map = texture;
                
    			var head = create_part(texture, self.material, 0, 8, 8, 8, 8),
    				outer = create_part(texture, self.material, 0, 8, 8, 8, 8),
    				body = create_part(texture, self.material, 0, -2, 8, 12, 4),
    				left_arm = create_part(texture, self.material, -6, -2, 4, 12, 4),
    				right_arm = create_part(texture, self.material, 6, -2, 4, 12, 4),
    				left_leg = create_part(texture, self.material, -2, -14, 4, 12, 4),
    				right_leg = create_part(texture, self.material, 2, -14, 4, 12, 4);
			
    			apply_cube(head.geometry, 0, 16, 8, 8, 8);
    			apply_cube(outer.geometry, 32, 16, 8, 8, 8);
    			apply_cube(body.geometry, 16, 0, 8, 12, 4);
    			apply_cube(left_arm.geometry, 40, 0, 4, 12, 4);
    			apply_cube(right_arm.geometry, 40, 0, 4, 12, 4);
    			apply_cube(left_leg.geometry, 0, 0, 4, 12, 4);
    			apply_cube(right_leg.geometry, 0, 0, 4, 12, 4);
                
                invert(right_arm);
                invert(right_leg);
                
    			var group = new THREE.Object3D();
			
                group.position.set(0, 32, 0);
    			group.add(head);
    			group.add(outer);
    			group.add(body);
    			group.add(left_arm);
    			group.add(right_arm);
    			group.add(left_leg);
    			group.add(right_leg);
			
    			camera.position.z = 4;
			
                group.scale.x = group.scale.y = group.scale.z = 96;
    			outer.scale.x = outer.scale.y = outer.scale.z = 1.1;
    			outer.material.transparent = true;
    			scene.add(group);
		
        		self.render = function(x, y)
        		{
                    group.rotation.y = x;
        			group.rotation.x = y;
            
        			renderer.render(scene, camera);
        		};
        
                self.render(Math.PI/4, Math.PI/4);
        	}
        );
        
        /* Export */
        this.scene = scene;
        this.renderer = renderer;
    },
    
    initMouseHandler: function()
    {
        this.mouse = new MouseHandler(this, Math.PI/4, Math.PI/4);
        this.mouse.attach(this.renderer.domElement);
    },
    
    render: function (){}
};