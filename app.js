window.render = function() {};

function $(selector, reference)
{
    return (reference || document).querySelector(selector);
}

/* ThreeJS variables */
var scene, camera, renderer, loader;

/* Resolution */
var width = 256, height = 256;

var tw = 64, th = 32;

var rotation_x = 0,
	rotation_y = 0;

function vec(x, y)
{
	return new THREE.Vector2(x / tw, y / th);
}

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

function create_part(texture, x, y, w, h, d)
{
	var geometry = new THREE.BoxGeometry(w / 8, h / 8, d / 8);
	var material = new THREE.MeshPhongMaterial({
		map: texture,
		side: THREE.DoubleSide
	});
	
	var cube = new THREE.Mesh(geometry, material);
	
	cube.position.x = x ? x / 8 : 0;
	cube.position.y = y ? y / 8 : 0;
	
	return cube;
}

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
$(".main").appendChild(renderer.domElement);

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
		
		group.add(head);
		group.add(outer);
		
		camera.position.z = 1;
		
		outer.scale.x = outer.scale.y = outer.scale.z = 1.1;
		outer.material.transparent = true;
		
		scene.add(group);
        
        group.scale.x = group.scale.y = group.scale.z = 128;
        rotation_x = Math.PI / 4;
        rotation_y = Math.PI / 4;
		
		window.render = function()
		{
			group.rotation.y = rotation_x;
			group.rotation.x = rotation_y;
            
			renderer.render(scene, camera);
		};
        
        window.render();
	}
);

var elem = renderer.domElement;

var click = false, 
    lastx = 0, 
    lasty = 0, 
    tmpx = 0, 
    tmpy = 0, 
    lastrx = 0, 
    lastry = 0;

elem.addEventListener("mousedown", function (e)
{
    click = true;
    lastx = e.pageX;
    lasty = e.pageY;

    lastrx = rotation_x;
    lastry = rotation_y;
});

elem.addEventListener("mousemove", function (e)
{
    if (click)
    {
        tmpx = e.pageX - lastx;
        tmpy = e.pageY - lasty;

        rotation_x = lastrx + tmpx/90;
        rotation_y = lastry + tmpy/90;
    }

    render();
});

elem.addEventListener("mouseup", function ()
{
    click = false;
    rotation_x = lastrx + tmpx/90;
    rotation_y = lastry + tmpy/90;
});