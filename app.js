/**
 * Creates a point structure.
 */
function point(x, y)
{
    return {x: x, y: y};
}

/**
 * Creates a ThreeJS vector (2d point) for UV.
 */
function vec(x, y)
{
	return new THREE.Vector2(x / tw, y / th);
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
function create_part(texture, x, y, w, h, d)
{
	var geometry = new THREE.BoxGeometry(w / 8, h / 8, d / 8);
	var material = new THREE.MeshLambertMaterial({
		map: texture,
		side: THREE.DoubleSide
	});
	
	var cube = new THREE.Mesh(geometry, material);
	
	cube.position.x = x ? x / 8 : 0;
	cube.position.y = y ? y / 8 : 0;
	
	return cube;
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

MouseHandler.prototype = {
    attach: function(element)
    {
        element.addEventListener("mousedown", this.down.bind(this));
        element.addEventListener("mousemove", this.move.bind(this));
        element.addEventListener("mouseup", this.up.bind(this));
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

window.render = function() {};

function $(selector, reference)
{
    return (reference || document).querySelector(selector);
}

/* ThreeJS variables */
var scene, camera, renderer, loader;

/* Resolution */
var width = 256, height = 256;

/* Texture size */
var tw = 64, th = 32;

/* ThreeJS initialization */
var ambientLight = new THREE.AmbientLight(0x333333);

scene = new THREE.Scene();
camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -1000, 1000);
loader = new THREE.TextureLoader();

renderer = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true,
    alpha: true 
});

renderer.setClearColor(0xffffff, 0.0);
renderer.setSize(width, height);

var lights = [
    new THREE.PointLight( 0xffffff, 1, 0 ),
    new THREE.PointLight( 0xffffff, 1, 0 ), 
    new THREE.PointLight( 0xffffff, 1, 0 )
];

lights[0].position.set( 0, 400, 0 );
lights[1].position.set( 2000, 0, 2000 );
lights[2].position.set( -100, 0, 100 );

scene.add(ambientLight);
scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

renderer.domElement.id = "renderer";
$(".canvas").appendChild(renderer.domElement);

loader.load(
	'steve.png',
	function(texture) 
    {
		texture.magFilter = texture.minFilter = THREE.NearestFilter;
		
		var head = create_part(texture, 0, 0, 8, 8, 8),
            outer = create_part(texture, 0, 0, 8, 8, 8);
		
		apply_cube(head.geometry, 0, 16, 8, 8, 8);
		apply_cube(outer.geometry, 32, 16, 8, 8, 8);
		
		var group = new THREE.Object3D();
		
        group.scale.x = group.scale.y = group.scale.z = 128;
		outer.scale.x = outer.scale.y = outer.scale.z = 1.1;
		outer.material.transparent = true;
        camera.position.z = 1;
		
		group.add(head);
		group.add(outer);
		scene.add(group);
		
		window.render = function(x, y)
		{
			group.rotation.y = x;
			group.rotation.x = y;
            
			renderer.render(scene, camera);
		};
        
        window.render(Math.PI/4, Math.PI/4);
	}
);

(new MouseHandler(window, Math.PI/4, Math.PI/4)).attach(renderer.domElement);