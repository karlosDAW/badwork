$("article").hide();
var domain = $("#dominio");
var arr = [1,2,3,4,5];
var domainBlocked = "";
var random = Math.floor(Math.random() * (arr.length - 0)) + 0;
console.log(random);
var articlesDisplay = [arr[random], arr[(random - 1)]];
console.log(articlesDisplay);
$("#frase-animo" + articlesDisplay[0]).show();
$("#frase-animo" + articlesDisplay[1]).show();
self.port.on("domainPage", function(tab) {
	domain.html(tab);
	domainBlocked = domain.html();
});