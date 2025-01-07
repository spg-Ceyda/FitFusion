include('request_url.js');
//----jquery-plagins----
include('jquery-1.8.3.min.js');
include('jquery.ba-resize.min.js');
include('jquery.image_resize.js');
include('jquery.easing.js');
include('jquery.animate-colors-min.js');
include('jquery.cycle.all.min.js');
include('gallery.js');
//----All-Scripts----
include('scroll_to_top.js');
include('ajax.js.switch.js');
include('uScroll.js');
include('jquery.fancybox-1.3.4.pack.js');
include('forms.js');
include('script.js');
//----Include-Function----
function include(url){ 
  document.write('<script type="text/javascript" src="js/'+ url + '"></script>'); 
  return false ;
}