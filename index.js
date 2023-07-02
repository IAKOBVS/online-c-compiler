// @ts-check
"use strict";

const port = 3000;
const express = require("express");
const app = express();
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
/** @type {string} */
const TMP_DIR = os.tmpdir();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/compile", (req, res) => {
	/** @type {string} */
	const flag = req.body.flag;
	if (!flag.match(/^[- _+=0-9A-Za-z]*$/g)) {
		res.send(
			"Passing illegal characters as flags!<br>Only use characters in [- _+=0-9A-Za-z]."
		);
		return;
	}
	/** @type {string} */
	const compiler = req.body.compiler.toLowerCase();
	/** @type {string} */
	const text = req.body.text;
	/** @type {string} */
	const output = compile(compiler, flag, text);
	res.send(output);
});

/**
 *
 * @param {string} compiler
 * @param {string} flag
 * @param {string} text
 * @returns {string}
 */
function compile(compiler, flag, text) {
	/** @type {string} */
	const file_dir = path.join(TMP_DIR, "__tmp__");
	/** @type {string} */
	const file_path = mktemp(file_dir);
	try {
		fs.writeFileSync(file_path, text);
		cp.execSync(`${compiler} ${flag} -Werror -fsyntax-only -x c ${file_path}`);
	} catch (error) {
		fs.rmSync(file_path);
		error.message = error.message.substring(
			error.message.indexOf(file_path) + file_path.length
		);
		error.message = replace_all(error.message, file_path + ":", "");
		error.message = replace_all(error.message, "\n", "<br>");
		return "<br>Compilation failed:<br>" + error.message;
	}
	fs.rmSync(file_path);
	return "<br>Compiled successfuly!";
}

/**
@param {string} dir
@returns {string}
*/
function mktemp(dir) {
	/** @type {string} */
	let ret;
	while (
		(ret = Math.random().toString(36).slice(2, 7)) == "" ||
		fs.existsSync(path.join(dir, ret))
	);
	return dir + ret;
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
