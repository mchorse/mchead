var dom = require("./dom"),
    utils = require("./utils");

/**
 * Mouse handler
 * 
 * Responsible for rotating the model.
 */
var MouseHandler = module.exports = function(target, x, y)
{
    this.target = target;
    this.on = false;
    
    this.result = utils.point(x, y);
    this.first = utils.point(0, 0);
    this.tmp = utils.point(0, 0);
    this.last = utils.point(0, 0);
};

MouseHandler.prototype = 
{
    attach: function(element)
    {
        dom.on(element, "mousedown", this.down.bind(this));
        dom.on(element, "mousemove", this.move.bind(this));
        dom.on(element, "mouseout", this.out.bind(this));
        dom.on(element, "mouseup", this.up.bind(this));
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