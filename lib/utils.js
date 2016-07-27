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
function vec(x, y, w, h)
{
    return new THREE.Vector2(x / w, y / h);
}

/**
 * Apply geometry's UV of the texture on the cube's side given 
 * the rectangle on the texture
 */
function apply_uv(ww, hh, geo, side, x, y, w, h)
{
    side = side * 2;
    
    var faces = [
		vec(x,     y + h, ww, hh), 
		vec(x + w, y + h, ww, hh),
		vec(x + w, y,     ww, hh),
		vec(x,     y,     ww, hh)
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
function apply_cube(ww, hh, geo, x, y, w, h, d)
{
	// front and back
	apply_uv(ww, hh, geo, 4, x + d, y, w, h);
	apply_uv(ww, hh, geo, 5, x + d + w + d, y, w, h);
	
	// right and left
	apply_uv(ww, hh, geo, 0, x + d + w, y, d, h);
	apply_uv(ww, hh, geo, 1, x, y, d, h);
	
	// top and bottom
	apply_uv(ww, hh, geo, 2, x + d, y + h, w, d);
	apply_uv(ww, hh, geo, 3, x + d + w, y + h, w, d);
	
	geo.uvsNeedUpdate = true;
}

/**
 * Create a Minecraft-like limb (3d rectangle)
 */
function limb(material, x, y, w, h, d)
{
	var geometry = new THREE.BoxGeometry(w / 8, h / 8, d / 8);
	var cube = new THREE.Mesh(geometry, material);
	
	cube.position.x = x ? x / 8 : 0;
	cube.position.y = y ? y / 8 : 0;
	
	return cube;
}

/**
 * Invert the given mesh on the X axis.
 */
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

module.exports =
{
    point: point,
    vec: vec,
    apply_uv: apply_uv,
    apply_cube: apply_cube,
    limb: limb,
    invert: invert
};