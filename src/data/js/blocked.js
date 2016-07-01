$("article").hide();
var domain = $("#dominio");
var domainBlocked = "";
var p = $("p").length;
var a = Math.floor((Math.random() * 5) + 1);
var b = a - 1;
if(b == 0) {
	b = p;
}
$("#frase-animo" + a).show();
$("#frase-animo" + b).show();
self.port.on("domainPage", function(tab) {
	domain.html(tab);
	domainBlocked = domain.html();
});