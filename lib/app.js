var dom = require("./dom"),
    utils = require("./utils");

var Camera = require("./camera"),
    Model = require("./model"),
    MouseHandler = require("./mouse");

/**
 * Read given file and set the image as the texture to the model
 *
 * @param {App} self
 * @param {File} file
 */
function readFile(self, file)
{
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
}

/**
 * Entry point of the application.
 * 
 * This code is a little bit unorganized, that's because it was long time 
 * since I wrote some front-end JS code :)
 * 
 * @author McHorse
 */
var App = module.exports = function(options, canvas, output, w, h)
{
    this.options = options;
    this.canvas = canvas;
    this.output = output;
    
    this.size = utils.point(w, h);
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

        /* Resolution */
        var width = this.size.x, 
            height = this.size.y;

        var halfW = width / 2,
            halfH = height / 2;
        
        /* ThreeJS initialization */
        var camera = new Camera(width, height, 50, 0.1, 1000, -1000, 1000);
            
        var scene = new THREE.Scene(),
            loader = new THREE.TextureLoader();

        var renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
            alpha: true 
        });

        renderer.setClearColor(0xffffff, 0.0);
        renderer.setSize(width, height);
        renderer.domElement.className = "renderer";
        
        this.canvas.appendChild(renderer.domElement);
        
        loader.load('steve.png', function(texture) 
        {
    		texture.magFilter = texture.minFilter = THREE.NearestFilter;
	        
            self.model.setTexture(texture);
            self.justRender();
        });
        
        /* Export */
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
    },
    
    /**
     * Initiate mouse handler and attach it to the renderer's canvas
     */
    initMouseHandler: function()
    {
        this.mouse = new MouseHandler(this, Math.PI/4, Math.PI/4);
        this.mouse.attach(this.renderer.domElement);
    },
    
    /**
     * Initiate the model
     */
    initModel: function()
    {
        this.model = new Model();
        this.scene.add(this.model.group);
        this.model.headOnly(true);
    },
    
    /**
     * Initiate the GUI handlers
     */
    initOptions: function()
    {
        var self = this;
        
        dom.$$("input", this.options).forEach(function (input)
        {
            dom.on(input, "change", function ()
            {   
                self.change(input.name, input);
            });
        });
        
        dom.on(dom.$("#reset"), "click", function()
        {
            dom.$("[name=x]").value = dom.$("[name=y]").value = 45;
            
            self.mouse.setX(45);
            self.mouse.setY(45);
            self.justRender();
        });
    },
    
    /**
     * Change one of the keys in the 
     */
    change: function(name, input)
    {
        if (name == "head")         this.model.headOnly(input.checked);
        else if (name == "outer")   this.model.includeHair(input.checked);
        else if (name == "flat")    this.camera.toggle();
        else if (name == "texture") readFile(this, input.files[0]);
        else if (name == "x")       this.mouse.setY(parseInt(input.value));
        else if (name == "y")       this.mouse.setX(parseInt(input.value));
        
        this.justRender();
    },
    
    /**
     * Mouse handler's mouse move hook. Used to change yaw and pitch fields 
     * to correspond to the values in the mouse handler.
     */
    changed: function(x, y)
    {
        dom.$("[name=x]").value = y.toFixed(4);
        dom.$("[name=y]").value = x.toFixed(4);
    },
    
    /**
     * Mouse handler's mouse up hook. This will be triggered when the mouse is 
     * up in the renderer's canvas. 
     */
    up: function()
    {
        this.output.src = this.renderer.domElement.toDataURL("image/png");
    },
    
    /**
     * Render the model with specified rotation
     */
    render: function (x, y)
    {
        this.model.rotate(x, y);
		this.renderer.render(this.scene, this.camera.camera);
    },
    
    /**
     * Just render (do) it!
     */
    justRender: function()
    {
        this.render(this.mouse.result.x, this.mouse.result.y);
        this.up();
    }
};