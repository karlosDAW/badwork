const {Cc,Ci} = require("chrome");
const data = require("sdk/self").data;
const toggleButtons = require('sdk/ui/button/toggle');
const tabs = require("sdk/tabs");
const panels = require("sdk/panel");
const urls = require("sdk/url");
const ss = require("sdk/simple-storage");
const pageMod = require("sdk/page-mod");

const security = require("./lib/security"); 
// variables
var lastDomain = "";
var title = "";
var conf = "config";
var isActive = false;
/*
==================        FUNCTIONS         ===========================================================
*/

// mostrar y posicionar el panel principal
function handleChange(state) {
	if (state.checked) {
		var check = security.statusPassword();

		if(check == security.PASSWORD_ACTIVE || isActive == security.PASSWORD_ACTIVE) {
			isActive = security.hasPassword();
			panel.show({
				position: button 
			});
			lastDomain = getCurrentUrl();
			
		} else {
			
			if(security.checkPassword()) {
				isActive = true;
				panel.show({
					position: button 
				});
				lastDomain = getCurrentUrl();
			} else {
				isActive = false;
				handleHide();		
			}
		}
	}
}

// dar la ultima url conocida
function getCurrentUrl(){
	if(tabs.activeTab.url == data.url("blocked.html")){
		tabs.on('activate', function(tab) {
			url = tab.title;
			panel.port.emit("load", url);
		});
	} else {
		url = urls.URL(tabs.activeTab.url).host;
		panel.port.emit("load", url);
	}
	panel.port.on("upload", function(page){
		url = page;
	});
	console.log(url);
	return url;
}

// ocultar el panel principal
function handleHide() {
	button.state('window', {checked: false});
}
// almacenar bloqueo
function storagePageBlocked(tab) {
	var exist = false;
	for each (page in ss.storage.pages) {
		if(page == tab) {
			exist = true;
			console.log('ya existe la pagina no se almacena');
		}
	}
	if (!exist) {
		ss.storage.pages.push(tab);
		console.log('se ha almacenado una pagina nueva');
	}
	var newStorage = ss.storage.pages;
	return newStorage;
}

// borrar pagina del almacen
function deletePage(tab) {
	for (var i = 0; i < ss.storage.pages.length; i++) {
		if(tab == ss.storage.pages[i]) {
			ss.storage.pages.splice(i,1);
		}
	}
}

// checkear la pagina
function checkedPage(tab){
	var blocked = false;	
	for each (page in ss.storage.pages) {
		if (page == tab) {
			blocked = true;
		}
	}
	return blocked;
}

/*
=========================    MODULES     =========================================================================
*/
// contructor del array de almacenamiento
if(!ss.storage.pages) {
	ss.storage.pages = ['simple.wikipedia.org'];
}

// contructor del boton principal
var button = toggleButtons.ToggleButton({
	id: "my-button",
	label: "BadWork",
	icon: {
		"16": "./img/icon-16.png",
		"32": "./img/icon-32.png",
		"64": "./img/icon-64.png"
	},
	onChange: handleChange
});

// cualquier pagina
pageMod.PageMod({
	include: "*",
	exclude:[data.url("blocked.html"),data.url("config.html")],
	contentScriptWhen : "ready",
	attachTo :  [ "existing" ,  "top" ] ,
	onAttach: function onAttach(worker) {
		lastDomain = getCurrentUrl();
		console.log('atacando a la pagina');
		if(checkedPage(lastDomain)) {
			worker.tab.url = data.url("blocked.html");
			console.log("se ha bloqueado la pagina");
		} else {
			console.log("no se bloquea la pagina");
		}
	}
});

// pagina de bloqueo
pageMod.PageMod({
	include: data.url("blocked.html"),
	contentScriptWhen : "end",
	contentScriptFile: [data.url("js/jquery.js"),data.url("js/bootstrap.min.js"),data.url("js/blocked.js")],
	onAttach: function onAttach(worker) {
		worker.tab.title = lastDomain;
		console.log("atacando a la pagina de bloqueo");
		worker.port.emit("domainPage", worker.tab.title);
	}
});

// pagina de configuracion
pageMod.PageMod({
	include: data.url("conf.html"),
	contentScriptWhen : "end",
	contentScriptFile: [data.url("js/jquery.js"),data.url("js/bootstrap.min.js"),data.url("js/conf.js")],
	onAttach: function onAttach(worker) {
		worker.tab.title = "config";
		console.log("atacando a la pagina de configuracion");
		worker.port.emit("storages", ss.storage.pages);
		// revisar codigoooooo no devuelve lo deseado
		worker.port.on("delete", function(index){
			console.log(index);
			ss.storage.pages.splice(index,1);
			console.log(ss.storage.pages);
			tabs.activeTab.reload();
		});
	}
});

// contructor del panel principal
var panel = panels.Panel({
	width: 350,
	height: 220,
	contentURL: data.url("panel.html"),
	contentScriptFile: data.url("js/panel.js"),
	onHide: handleHide
});
/*
==========================     MENSSAGES OF PANEL  =================================
*/

// bloqueo
panel.port.on("blocked", function() {
	lastDomain = getCurrentUrl();
	storagePageBlocked(lastDomain);
	//reloadPage();
	// recargar pagina configuracion
	for(let tab of tabs){
		title = tab.title;
		if(conf == title) {
			tab.reload();
		}
		if(lastDomain == urls.URL(tab.url).host) {
			tab.reload();
		}
	}	
	panel.hide();
});

// desbloqueo
panel.port.on("unblocked", function() {
	lastDomain = getCurrentUrl();
	if(lastDomain != "") {
		deletePage(lastDomain);
		console.log(lastDomain + " se ha borrado");
		// recorrer todas las pestañas
		for (let tab of tabs) {
			title = tab.title;
			// redireccionar paginas para desbloquearlas
			if(lastDomain == title) {
				tab.url = "http://" + lastDomain;
			}
			// recargar pagina configuracion
			if(conf == title) {
				tab.reload();
			}
		}
	}
	panel.hide();
});

// configuracion
panel.port.on("config", function() {
	tabs.activeTab.url = data.url("conf.html");
	panel.hide();
});
