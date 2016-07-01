var btnConf = window.document.getElementById('config');
var btnBlocked = window.document.getElementById('blocked');
var btnUnblocked = window.document.getElementById('unblocked'); 
var imgSetting = window.document.getElementById('setting');


// boton que envia al index para bloquear la url
btnBlocked.addEventListener('click', function onkeyup(event){
	self.port.emit('blocked');
},false);

// boton que envia al index para desbloquear la url
btnUnblocked.addEventListener('click', function onkeyup(event){
	self.port.emit('unblocked');
},false);

// envio mensaje a index para acceder a la configuracion
btnConf.addEventListener('click',function onkeyup(event){
	self.port.emit('config');
},false);

// cambiar imagen de color de enlace de configuracion al pasar el raton
imgSetting.addEventListener('mouseover', function onmouseover(event){
	event.target.src = 'img/setting-over.png';
});
imgSetting.addEventListener('mouseout', function onmouseout(event){
	event.target.src = 'img/setting-out.png';
});
// actualizar url activa al usar el panel
self.port.on("load", function(url) {
	self.port.emit("upload", url);
});