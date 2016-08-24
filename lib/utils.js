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
function apply_uv(ww, hh, geo, side, x, y, w, h, reflect)
{
    side = side * 2;
    
    var faces = [
		vec(x,     y + h, ww, hh), // 0 = 0, 1
		vec(x + w, y + h, ww, hh), // 1 = 1, 1
		vec(x + w, y,     ww, hh), // 2 = 1, 0
		vec(x,     y,     ww, hh)  // 3 = 0, 0
	];
	
	if (side != 6)
	{
        if (reflect)
        {
    		geo.faceVertexUvs[0][side] = [faces[1], faces[2], faces[0]];
    		geo.faceVertexUvs[0][side + 1] = [faces[2], faces[3], faces[0]];
        }
        else
        {
    		geo.faceVertexUvs[0][side] = [faces[0], faces[3], faces[1]];
    		geo.faceVertexUvs[0][side + 1] = [faces[3], faces[2], faces[1]];
        }
	}
	else 
	{
        if (reflect)
        {
    		geo.faceVertexUvs[0][side] = [faces[2], faces[1], faces[3]];
    		geo.faceVertexUvs[0][side + 1] = [faces[1], faces[0], faces[3]];
        }
        else
        {
    		geo.faceVertexUvs[0][side] = [faces[3], faces[0], faces[2]];
    		geo.faceVertexUvs[0][side + 1] = [faces[0], faces[1], faces[2]];
        }
	}
}

/**
 * Apply texture rect on cube's geometry
 */
function apply_cube(ww, hh, geo, x, y, w, h, d, reflect)
{
	// front and back
	apply_uv(ww, hh, geo, 4, x + d, y, w, h, reflect);
	apply_uv(ww, hh, geo, 5, x + d + w + d, y, w, h, reflect);
	
	// right and left
    if (reflect)
    {
    	apply_uv(ww, hh, geo, 0, x, y, d, h, reflect);
    	apply_uv(ww, hh, geo, 1, x + d + w, y, d, h, reflect);
    }
    else
    {
    	apply_uv(ww, hh, geo, 0, x + d + w, y, d, h);
    	apply_uv(ww, hh, geo, 1, x, y, d, h);
    }
	
	// top and bottom
	apply_uv(ww, hh, geo, 2, x + d, y + h, w, d, reflect);
	apply_uv(ww, hh, geo, 3, x + d + w, y + h, w, d, reflect);
	
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

module.exports =
{
    point: point,
    vec: vec,
    apply_uv: apply_uv,
    apply_cube: apply_cube,
    limb: limb
};