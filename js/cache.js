/************************************* CLASS: Cache *************************************/

//----------------------------------------------------------------------------------------
// Constructor
//----------------------------------------------------------------------------------------
Cache = function()
{
    // Initialisations
    this.cached_images = {};
    this.loading       = {};
    this.callbacks     = {};
}


//----------------------------------------------------------------------------------------
// Retrieve an image from the cache
//----------------------------------------------------------------------------------------
Cache.prototype.get = function(url)
{
    return this.cached_images[url];
}


//----------------------------------------------------------------------------------------
// Load an image in the cache
//----------------------------------------------------------------------------------------
Cache.prototype.load = function(url, callback)
{
    if (callback)
        this.callbacks[url] = callback;

    if (this.loading[url])
        return;

    var img = new Image();

    var cache = this;

    img.onload = function() {
        delete cache.loading[url];
        cache.cached_images[url] = img;

        if (cache.callbacks[url])
        {
            cache.callbacks[url].call(cache, img);
            delete cache.callbacks[url];
        }
    };

    this.loading[url] = true;
    img.src = url;
}
