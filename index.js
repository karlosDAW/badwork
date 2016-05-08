const self = require("sdk/self");
const toggleButtons = require('sdk/ui/button/toggle');
const tabs = require("sdk/tabs");
const panels = require("sdk/panel");
const urls = require("sdk/url");
const ss = require("sdk/simple-storage");
const pageMod = require("sdk/page-mod"); 
// variables
var lastDomain = '';
var domain = '';
// contructor del array de almacenamiento
if(!ss.storage.pages) {
	ss.storage.pages = [];
	ss.storage.history = [];
}

// contructor del boton principal
var button = toggleButtons.ToggleButton({
	id: "my-button",
	label: "BadWork",
	icon: {
		"16": "./icon-16.png",
		"32": "./icon-32.png",
		"64": "./icon-64.png"
	},
	onChange: handleChange
});
// contructor de la pagina de bloqueo
pageMod.PageMod({
	include: "*",
	exclude:[self.data.url("blocked.html"),self.data.url("config.html")],
	contentScriptWhen : "end",
	attachTo: "top",
	onAttach: function onAttach(worker){
		console.log('atacando a la pagina con script');
		lastDomain = worker.tab.url;
		console.log(lastDomain);
		if(ss.storage.pages.length > 0) {
			console.log(ss.storage.pages);
			domain = urls.URL(lastDomain).host;
			for (var i = 0; i < ss.storage.pages.length; i++) {
				var pag = ss.storage.pages[i];
				if(domain == pag){
					worker.tab.url = self.data.url("blocked.html");
				}
			}
		} else {
			console.log('no hay nada almacenado, no se bloquea nada');
		}
	}
});
// contructor del panel principal
var panel = panels.Panel({
	width: 350,
	height: 220,
	contentURL: self.data.url("panel.html"),
	contentScriptFile: self.data.url("panel.js"),
	onHide: handleHide
});
// recogida del panel principal con mensaje blocked y almacenamiento de paginas bloqueadas
panel.port.on("blocked", function() {
	lastDomain = tabs.activeTab.url;
	var exist = false;
	var pag = '';
	if(urls.isValidURI(lastDomain) && lastDomain != null) {
		console.log('la uri es valida');
		pag = urls.URL(lastDomain).host;
		// comprobar paginas repetidas y almacenar en storage
		if(ss.storage.pages.length == 0) {
			ss.storage.pages.push(pag);
			tabs.activeTab.reload();
			panel.hide();
			console.log('se almacenado la primera pagina');	
		} else {
			for each (page in ss.storage.pages) {
				if(page == pag) {
					exist = true;
					console.log('ya existe la pagina no se almacena');
				}
			}
			if (!exist) {
				ss.storage.pages.push(pag);
				tabs.activeTab.reload();
				panel.hide();
				console.log('se ha almacenado una pagina nueva');
			}
		}
		// actualizar pagina para bloqueo
	} else {
		console.log('la uri no es valida');
	}
});

// recogida del panel principal con el mensaje unblocked
panel.port.on("unblocked", function() {
	var pageDelete = '';
	console.log(lastDomain);
	if(lastDomain != "") {
		lastDomain = urls.URL(lastDomain).host;
		if(ss.storage.pages.length > 0){
			for (var i = 0; i < ss.storage.pages.length; i++) {
				if (ss.storage.pages[i] == lastDomain) {
					pageDelete = ss.storage.pages[i];
					ss.storage.pages.splice(i,1);
					console.log(ss.storage.pages);
				}
			}
		} else {
			console.log('no hay paginas almacenadas');
		}
		if(pageDelete == ""){
			console.log('no hay coincidencia para desbloquear');
		} else {
			// actualizar pagina para desbloqueo
			tabs.activeTab.url = pageDelete;
			panel.hide();	
		}	
	}
	
	
	// var url = tabs.activeTab.url;
	// var pag = '';
	// var pageDelete = '';

	// if(urls.isValidURI(url) && url != null) {
	// 	console.log('la uri es valida');
	// 	console.log(ss.storage.pages);
	// 	pag = urls.URL(url).host;
		
	// 	// comprobar paginas existan y borrar en storage
	// 	for (var i = 0; i < ss.storage.pages.length; i++) {

	// 		if(ss.storage.pages[i] == pag) {
	// 			pageDelete = ss.storage.pages[i];
	// 			ss.storage.pages.splice(i,1);
	// 			console.log(ss.storage.pages +'| se ha borrado la pagina |' + pageDelete);
	// 		}
	// 	}
	// 	// actualizar pagina para desbloqueo
	// 	tabs.activeTab.url = pageDelete;
	// } else {
	// 	console.log('la uri no es valida');
	// }
});

// recogida del panel principal con el mensaje config
panel.port.on("config", function() {
	tabs.activeTab.url = self.data.url("conf.html");
});


/*
	FUNCIONES
*/
// mostrar y posicionar el panel principal
function handleChange(state) {
	if (state.checked) {
		panel.show({
			position: button
		});
	}
}
// ocultar el panel principal
function handleHide() {
	button.state('window', {checked: false});
}
