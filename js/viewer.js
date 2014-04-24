/************************************* CLASS: Viewer ************************************/

//----------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------
Viewer = function(element_id, cache)
{
    // Initialisations
    var element = document.getElementById(element_id);

    this.canvas        = document.createElement('canvas');
    this.canvas.id     = element_id + '-canvas';
    this.canvas.width  = element.clientWidth;
    this.canvas.height = element.clientHeight;
    element.appendChild(this.canvas);

    this.canvas.viewer = this;

    this.context = this.canvas.getContext('2d');
    this.data    = null;
    this.cache   = cache;

    this.camera = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        zoom: 0.4,
    };

    this.mouse_position = { x: 0, y: 0 };
    this.moving = false;

    this._addEventListener(this.canvas, 'mousewheel', this._onMouseWheel);
    this._addEventListener(this.canvas, 'mousemove', this._onMouseMove);
    this._addEventListener(this.canvas, 'mouseout', this._onMouseOut);
    this._addEventListener(this.canvas, 'mousedown', this._onMouseDown);
    this._addEventListener(this.canvas, 'mouseup', this._onMouseUp);
}


//----------------------------------------------------------------------------------------
// Retrieve an image from the cache
//----------------------------------------------------------------------------------------
Viewer.prototype.display = function(data)
{
    this.data = data;

    this.camera.x = this.canvas.width / 2;
    this.camera.y = this.canvas.height / 2;

    var min_x = null;
    var min_y = null;


    for (var i = 0; i < this.data.nodes.length; ++i)
    {
        var node = this.data.nodes[i];

        node.position = {
            x: node.x,
            y: node.y,
        }

        if (min_x === null)
        {
            min_x = node.x;
            min_y = node.y;
        }
        else if (min_y == node.y)
        {
            if (min_x > node.x)
                min_x = node.x;
        }
        else if (min_y > node.y)
        {
            min_x = node.x;
            min_y = node.y;
        }

        node.width = null;
    }

    this.camera.x = min_x;
    this.camera.y = (this.canvas.height - 100) / 2 / this.camera.zoom;

    for (var i = 0; i < this.data.edges.length; ++i)
    {
        var edge = this.data.edges[i];
        edge.color = '#000000';
    }

    this.refresh();
}


//----------------------------------------------------------------------------------------
// Refresh the displayed content
//----------------------------------------------------------------------------------------
Viewer.prototype.refresh = function()
{
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i = 0; i < this.data.edges.length; ++i)
    {
        var edge = this.data.edges[i];

        this.context.strokeStyle = edge.color;

        this.context.beginPath();

        var p = {
            x: edge.coords[0][0],
            y: edge.coords[0][1]
        }

        p = this._transforms(p);
        this.context.moveTo(p.x, p.y);

        for (var j = 1; j < edge.coords.length; ++j)
        {
            var p = {
                x: edge.coords[j][0],
                y: edge.coords[j][1]
            }

            p = this._transforms(p);
            this.context.lineTo(p.x, p.y);
        }

        this.context.stroke();
        this.context.closePath();


        // if (edge.source && edge.target &&
        //     (this._isVisible(edge.source.position) ||
        //      this._isVisible(edge.target.position)))
        // {
        //     this.context.strokeStyle = edge.color;
        // 
        //     this.context.beginPath();
        // 
        //     var p = this._transforms(edge.source.position);
        //     this.context.moveTo(p.x, p.y);
        // 
        //     p = this._transforms(edge.target.position);
        //     this.context.lineTo(p.x, p.y);
        // 
        //     this.context.stroke();
        //     this.context.closePath();
        // }
    }


    for (var i = 0; i < this.data.nodes.length; ++i)
    {
        var node = this.data.nodes[i];

        if (this._isVisible(node.position, 200, 100))
        {
            if (this.camera.zoom > 0.5)
            {
                // Compute the width of the box
                if (!node.width)
                {
                    this.context.font = 'Bold 16px Arial';;

                    var title_width = this.context.measureText(node.label).width;

                    node.width = 115 + title_width;
                    if (node.width < 300)
                        node.width = 300;
                }


                // Box
                this.context.fillStyle = '#DDDDDD';

                var p = {
                    x: node.position.x - node.width / 2,
                    y: node.position.y - 80,
                };

                var p2 = this._transforms(p);

                this._roundedRect(p2.x, p2.y, node.width * this.camera.zoom,
                                  160 * this.camera.zoom, 8 * this.camera.zoom);

                this.context.fill();


                // Comic title & issue number
                this.context.font         = 'Bold ' + (16 * this.camera.zoom) + 'px Arial';
                this.context.fillStyle    = '#000000';
                this.context.textBaseline = 'top';

                p2 = {
                    x: p.x + 110,
                    y: p.y + 5,
                };

                p2 = this._transforms(p2);

                this.context.fillText(node.label, p2.x, p2.y);


                // Comic date
                this.context.font         = 'Italic ' + (14 * this.camera.zoom) + 'px Arial';
                this.context.fillStyle    = '#000000';
                this.context.textBaseline = 'top';

                p2 = {
                    x: p.x + 110,
                    y: p.y + 24,
                };

                p2 = this._transforms(p2);

                this.context.fillText(node.date, p2.x, p2.y);


                // Cover
                if (node.thumbnail)
                {
                    var img = this.cache.get(node.thumbnail);

                    if (img)
                    {
                        p2 = {
                            x: p.x + 5,
                            y: p.y + 5,
                        };

                        p2 = this._transforms(p2);

                        this.context.drawImage(img, p2.x, p2.y, 100 * this.camera.zoom,
                                               150 * this.camera.zoom);
                    }
                    else
                    {
                        var viewer = this;
                        this.cache.load(node.thumbnail, function() {
                            viewer.refresh();
                        });
                    }
                }


                // Characters
                var x = 0;
                var y = 0;
                for (var character_index = 0; character_index < node.characters.length; ++character_index)
                {
                    var character = node.characters[character_index];

                    var img = this.cache.get(character.thumbnail);

                    if (img)
                    {
                        p2 = {
                            x: p.x + 110 + x,
                            y: p.y + 50 + y,
                        };

                        p2 = this._transforms(p2);

                        this.context.drawImage(img, p2.x, p2.y, 40 * this.camera.zoom,
                                               40 * this.camera.zoom);

                       x += 45;
                       if (x + 155 > node.width)
                       {
                           x = 0;
                           y += 45;
                       }
                    }
                    else
                    {
                        var viewer = this;
                        this.cache.load(character.thumbnail, function() {
                            viewer.refresh();
                        });
                    }
                }
            }

            // Too much zoom out to display everything
            else
            {
                if (node.thumbnail)
                {
                    var img = this.cache.get(node.thumbnail);

                    if (img)
                    {
                        p2 = {
                            x: node.position.x - 50,
                            y: node.position.y - 75,
                        };

                        p2 = this._transforms(p2);

                        this.context.drawImage(img, p2.x, p2.y, 100 * this.camera.zoom,
                                               150 * this.camera.zoom);
                    }
                    else
                    {
                        var viewer = this;
                        this.cache.load(node.thumbnail, function() {
                            viewer.refresh();
                        });
                    }
                }
                else
                {
                    // Box
                    this.context.fillStyle = '#DDDDDD';

                    var p = {
                        x: node.position.x - node.width / 2,
                        y: node.position.y - 80,
                    };

                    var p2 = this._transforms(p);

                    this._roundedRect(p2.x, p2.y, 160 * this.camera.zoom,
                                      160 * this.camera.zoom, 8 * this.camera.zoom);

                    this.context.fill();
                }
            }
        }
    }
}


//----------------------------------------------------------------------------------------
// Retrieve the informations about a node
//----------------------------------------------------------------------------------------
Viewer.prototype.node = function(id)
{
    for (var i = 0; i < this.data.nodes.length; ++i)
    {
        var node = this.data.nodes[i];

        if (node.id == id)
            return node;
    }

    return null;
}


Viewer.prototype._roundedRect = function(x, y, width, height, radius)
{
    this.context.beginPath();
    this.context.moveTo(x,y+radius);
    this.context.lineTo(x,y+height-radius);
    this.context.quadraticCurveTo(x,y+height,x+radius,y+height);
    this.context.lineTo(x+width-radius,y+height);
    this.context.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
    this.context.lineTo(x+width,y+radius);
    this.context.quadraticCurveTo(x+width,y,x+width-radius,y);
    this.context.lineTo(x+radius,y);
    this.context.quadraticCurveTo(x,y,x,y+radius);
    this.context.closePath();
}


Viewer.prototype._isVisible = function(point, margin_x, margin_y)
{
    if (margin_x === undefined)
        margin_x = 0;

    if (margin_y === undefined)
        margin_y = 0;

    var left   = this.camera.x - this.canvas.width / (2 * this.camera.zoom);
    var right  = this.camera.x + this.canvas.width / (2 * this.camera.zoom);
    var top    = this.camera.y - this.canvas.height / (2 * this.camera.zoom);
    var bottom = this.camera.y + this.canvas.height / (2 * this.camera.zoom);

    return (point.x + margin_x >= left) && (point.x - margin_x <= right) &&
           (point.y + margin_y >= top) && (point.y - margin_y <= bottom);
}


Viewer.prototype._transforms = function(point)
{
    return {
        x: this.canvas.width / 2 + (point.x - this.camera.x) * this.camera.zoom,
        y: this.canvas.height / 2 + (point.y - this.camera.y) * this.camera.zoom,
    }
}


Viewer.prototype._getMousePos = function(e)
{
    var rect = this.canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}


Viewer.prototype._addEventListener = function(element, name, handler)
{
    if (element.addEventListener)
    {
        // IE9, Chrome, Safari, Opera, Firefox
        element.addEventListener(name, handler, false);

        // Firefox only
        if (name == 'mousewheel')
            element.addEventListener('DOMMouseScroll', handler, false);
    }

    // IE 6/7/8
    else
    {
        element.attachEvent('on' + name, handler);
    }
}


Viewer.prototype._onMouseWheel = function(e)
{
    // Cross-browser wheel delta
    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    if (delta > 0)
        this.viewer.camera.zoom = Math.min(1.0, this.viewer.camera.zoom + 0.1);
    else
        this.viewer.camera.zoom = Math.max(0.2, this.viewer.camera.zoom - 0.1);

    this.viewer.refresh();
}


Viewer.prototype._onMouseDown = function(e)
{
    var e = window.event || e; // old IE support

    if (e.button == 0)
    {
        this.viewer.moving = true;
        this.style.cursor = 'move';
    }
}


Viewer.prototype._onMouseUp = function(e)
{
    var e = window.event || e; // old IE support

    if (e.button == 0)
    {
        this.viewer.moving = false;
        this.style.cursor = 'default';
    }
}


Viewer.prototype._onMouseMove = function(e)
{
    var e = window.event || e; // old IE support

    var previous_position = this.viewer.mouse_position;

    this.viewer.mouse_position = this.viewer._getMousePos(e);

    if (this.viewer.moving)
    {
        this.viewer.camera.x -= (this.viewer.mouse_position.x - previous_position.x) / this.viewer.camera.zoom;
        this.viewer.camera.y -= (this.viewer.mouse_position.y - previous_position.y) / this.viewer.camera.zoom;

        this.viewer.refresh();
    }
}


Viewer.prototype._onMouseOut = function(e)
{
    this.viewer.moving = false;
    this.style.cursor = 'default';
}
