var gjs_timer_id = 0;
var gjs_console = '';
var gjs_stat = '';
var gjs_sub_stat = 0;

var gjs_continue = 'gjsystemnothignshappened';
var gjs_done     = 'gjsystemeverythingsdone';

var gjs_units = [];

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
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Constructor
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    if( gjs_sub_stat == 0){
      if( gjs_stat.begin) gjs_stat.begin();
      gjs_sub_stat = 1;
    }

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Main game loop
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //   Execute actions of objects throuth their attributes
    for( var i = 0; i < gjs_units.length; i++){
      obj = gjs_units[i];
      speed = obj.speed ? obj.speed : gjs_console.width() >> 7;
      for( var j = 0; j < obj.types.length; j++){
        switch(obj.types[j]){
	  case 'controllable':
            if( gjs_keys[gjs_key_left])   obj.move( -speed, 0);
	    if( gjs_keys[gjs_key_top])    obj.move( 0, -speed);
	    if( gjs_keys[gjs_key_right])  obj.move( speed, 0);
	    if( gjs_keys[gjs_key_bottom]) obj.move( 0, speed);
	    break;
	  case 'routine':
            var d = obj.routine();
            obj.move( d.x, d.y);
            break;
	}
      }
    }
    //   Execute process of game status and check if it has done or not
    var gjs_tmp_stat = {name:gjs_continue};
    if( gjs_stat.loop) gjs_tmp_stat = gjs_stat.loop();
    if( gjs_tmp_stat.name != gjs_continue) gjs_sub_stat = 2;
    //   Collision check
    for( var i = 0; i < gjs_units.length; i++){
      var me = gjs_units[i];
      var points = [ { x: me.x(),              y: me.y()},
                     { x: me.x(),              y: me.y() + me.height()},
                     { x: me.x() + me.width(), y: me.y() + me.height()},
                     { x: me.x() + me.width(), y: me.y()}
                   ];
      for( var j = 0; j < gjs_units.length; j++){
        if( i == j) continue;
        var enm = gjs_units[j];
        for( var k = 0; k < points.length; k++){
          var gls_x = points[k].x;
          var gls_y = points[k].y;
          if(    gls_x < enm.x() + enm.width()  && gls_x > enm.x()
              && gls_y < enm.y() + enm.height() && gls_y > enm.y() ) gjs_console.css('background-color', '#00ff99');
        }
      }
    }

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // Destructor
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
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
  obj.types = [];

  return obj;
}

function gj_attr( obj, attr, routine)
{
  gjs_units.push(obj);
  obj.types.push(attr);
  switch(attr){
    case 'controllable':
      break;
    case 'routine':
      obj.routine = routine;
      break;
  }
}