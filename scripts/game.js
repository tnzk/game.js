var gjs_timer_id = 0;
var gjs_console = '';
var gjs_stat = '';
var gjs_sub_stat = 0;

var gjs_continue = 'gjsystemnothignshappened';
var gjs_done     = 'gjsystemeverythingsdone';

var gjs_controllables = [];

var gjs_keys = [];
var gjs_key_left   = 37;
var gjs_key_top    = 38;
var gjs_key_right  = 39;
var gjs_key_bottom = 40;

function handle_key_down(event){ gjs_keys[event.keyCode] = true;}
function handle_key_up(event){   gjs_keys[event.keyCode] = false;}

function gj_start(id)
{
  gjs_console = $('#'+id);
  gjs_debug = $('#debug');
  gjs_console.css('overflow', 'hidden');
  if (!document.addEventListener && document.attachEvent){
    document.attachEvent('onkeydown', handle_key_down);
    document.attachEvent('onkeyup',   handle_key_up);
  } else {
    window.addEventListener('keydown', handle_key_down, true);
    window.addEventListener('keyup',   handle_key_up,   true);
  }

  var gjs_system_loop = function(){

    // Constructor
    if( gjs_sub_stat == 0){
      if( gjs_stat.begin) gjs_stat.begin();
      gjs_sub_stat = 1;
    }

    // Apply
    for( var i = 0; i < gjs_controllables.length; i++){
      obj = gjs_controllables[i];
      speed = obj.speed ? obj.speed : gjs_console.width() >> 7;
      if( gjs_keys[gjs_key_left])   obj.move( -speed, 0);
      if( gjs_keys[gjs_key_top])    obj.move( 0, -speed);
      if( gjs_keys[gjs_key_right])  obj.move( speed, 0);
      if( gjs_keys[gjs_key_bottom]) obj.move( 0, speed);
    }

    // Game stasus loop
    var gjs_tmp_stat = {name:gjs_continue};
    if( gjs_stat.loop) gjs_tmp_stat = gjs_stat.loop();
    if( gjs_tmp_stat.name != gjs_continue) gjs_sub_stat = 2;
 
    // Destructor
    if(( gjs_sub_stat == 2) && gjs_stat.end){
      gjs_stat.end();
      gjs_sub_stat = 0;
      gjs_stat = gjs_tmp_stat;
      if( gjs_tmp_stat.name == gjs_done) clearInterval(gjs_timer_id);
    }
  }
  gjs_timer_id = setInterval( gjs_system_loop, 16.7)
}

function gj_status(status)
{
  gjs_stat = status;
}

function gj_continue(){ return { name: gjs_continue};}
function gj_end()
{
  return { name: 'gj system status to closing',
           loop: function(){ return {name:gjs_done};},
           end: function(){
             alert('Everything has done!');
           }
         };
}

function gj_add_unit( name, x, y, w, h){
  // Creating new element and
  // append extending methods
  var base_pos = gjs_console.offset();
  gjs_console.append("<div id=\""+name+"\"></div>");
  obj = $('#'+name)
  obj.css('background-color', 'red');

  // Utility methods to manupilate position
  obj.x = function( x){
    var base = gjs_console.offset().left;
    if( arguments.length == 0)
      return this.offset().left - base;
    if( arguments.length == 1)
      this.offset({left: base + x, top: this.offset().top});
  }
  obj.y = function( y){
    var base = gjs_console.offset().top;
    if( arguments.length == 0)
      return this.offset().top - base;
    if( arguments.length == 1)
      this.offset({left: this.offset().left, top: base + y});
  }
  obj.move = function(x,y){
    obj.x( obj.x() + x);
    obj.y( obj.y() + y);
  }
  obj.set_to = function(x,y){
    obj.x(x);
    obj.y(y);
  }

  // Initialize the position and the size
  obj.x(x);
  obj.y(y);
  obj.width(w);
  obj.height(h);

  return obj;
}

function gj_attr( element, attr)
{
  // Apply an attribute
  switch(attr){
    case 'controllable': gjs_controllables.push(element);
    case 'controllable': gjs_controllables.push(element);
  }
}