const {Cc, Ci} = require("chrome");
const ss = require("sdk/simple-storage");
const prompts = Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService);
const ch = Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
const converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Ci.nsIScriptableUnicodeConverter);

PASSWORD_CREATED = 2
PASSWORD_ACTIVE = 1             

// determina si existe password
function hasPassword() {
	return ss.storage.password ? true : false;
}
// encripta el password
function passwordHash(password) {
	converter.charset = "UTF-8";
	var arr = {};
	var data = converter.convertToByteArray(password, arr);
	ch.init(ch.SHA256);
	ch.update(data, data.length);
	var hash = ch.finish(false);
	// convert the binary hash data to a hex string.
	var stringHash = Array.from(hash, (c, i) => toHexString(hash.charCodeAt(i))).join("");
	return stringHash;
}
// determina estado del password
function statusPassword() {
	if(ss.storage.password) {
		return PASSWORD_CREATED;
	} else {         
		var input = {value: null};              
		var check = {value: true};    
		var admin = prompts.promptPassword(null, "BadWork - Admin", "Crea la clave de acceso:", input, "Guardar:", check);
		if (admin) {
			ss.storage.password = passwordHash(input.value);
		}
		return PASSWORD_ACTIVE;
	}
}
// return the two-digit hexadecimal code for a byte
function toHexString(charCode) {
  return ("0" + charCode.toString(16)).slice(-2);
}
// checkea el password
function checkPassword() {
	if(check) {
		return true;
	} else {
		var input = {value: null};              
		var check = {value: true};    
		var password = prompts.promptPassword(null, "BadWork - Security", "Verifica la clave de acceso:", input, "Guardar:", check);
		if(password) {
			if(passwordHash(input.value) == ss.storage.password) {
				return true;	
			} else {
				prompts.alert(null, "BadWork - ERROR", "contraseña incorrecta.");
				return false;
			}
		}
		return false;
	}
}
// exportamos al fichero index.js
exports.passwordHash = passwordHash;
exports.PASSWORD_CREATED = PASSWORD_CREATED;
exports.PASSWORD_ACTIVE = PASSWORD_ACTIVE;
exports.statusPassword = statusPassword;
exports.checkPassword = checkPassword;
exports.hasPassword = hasPassword;
