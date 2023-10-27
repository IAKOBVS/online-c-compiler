const fs = require("fs");
const path = require("path");

module.exports = {
	mktemp,
	replaceall,
};

/**
 * @param {string} dir
 * @returns {string}
 */
function mktemp(dir)
{
	/**
	 * @type {string}
	 */
	let tmp;
	while ((tmp = Math.random().toString(36).slice(2, 7)) == "" || fs.existsSync(path.join(dir, tmp)))
		;
	return dir + tmp;
}

/**
 * @param {string} s
 * @param {string} search
 * @param {string} replace
 * @returns {string}
 */
function replaceall(s, search, replace)
{
	search = search.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
	return s.replace(/${search}/g, replace);
}
