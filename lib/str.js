const fs = require("fs");
const path = require("path");

module.exports = {
	mktemp,
	replace_all,
};

/**
@param {string} dir
@returns {string}
*/
function mktemp(dir) {
	/** @type {string} */
	let tmp;
	while (
		(tmp = Math.random().toString(36).slice(2, 7)) == "" ||
		fs.existsSync(path.join(dir, tmp))
	);
	return dir + tmp; 
}

/**
@param {string} s
@param {string} search
@param {string} replace
@returns {string}
*/
function replace_all(s, search, replace) {
	/** @type {number} */
	let old_len;
	do {
		old_len = s.length;
		s = s.replace(search, replace);
	} while (old_len != s.length);
	return s;
}
