// recibir el array con las paginas almacenadas
self.port.on("storages", function(array){
	console.log("se recibio el array");
	contenedorLista = $("#lista");
	for (var i = 1; i < array.length; i++) {
		var li = $('<li/>', {
		    'class' : 'list-group-item',
		});
		var span = $('<span/>',{
			html : "<i><a href='http://"+array[i]+"'> " + array[i] + "</a></i>",
		    'class' : 'pagina glyphicon glyphicon-globe'
		});
		var btn = $('<button/>', {
			'id': i,
			html: '<span class="glyphicon glyphicon-trash"></span>',
			'class': 'btn btn-danger fl-drch btn-lg'
		});
		li.append(span);
		li.append(btn);
		contenedorLista.append(li);
		$("#" + i).click(function(event){
			var index = $(this).attr("id")
			self.port.emit("delete", index);
			console.log("se pulso el boton "+index);
		});
	}
});
// enviar contraseña




// grupos de almacenaje
$("footer").hide();