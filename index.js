// @ts-check
"use strict";
const port = 3000;
const express = require("express");
const app = express();
const cp = require("child_process");
const path = require("path");

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
		res.send("Passing illegal characters as flags!<br>Only use characters in [- _+=0-9A-Za-z].");
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
@return {string}
@param {string} compiler
@param {string} flag
@param {string} text
*/
function compile(compiler, flag, text) {
	/** @type {string} */
	const fifoDir = "/tmp/__online_c_compiler__";
	/** @type {string} */
	const fifoFile = "__fifo__";
	mkfifo(fifoFile, fifoDir);
	writeToFifo(text, `${fifoDir}/${fifoFile}`);
	try {
		cp.execSync(`<${fifoDir}/${fifoFile} ${compiler} ${flag} -Werror -fsyntax-only -x c -`);
	} catch (error) {
		return (
			"<br>Compilation failed:<br>" +
			String(error.message)
				// remove newlines
				.replace(/\n/g, "")
				// only show compiler warnings
				.replace(/^.*?-fsyntax-only -x c -/, "")
				// add newlines
				.replace(/<stdin>:/g, "<br>")
		);
	}
	return "Compiled successfuly!";
}

/**
@return {void}
@param {string} file
@param {string} dir
*/
function mkfifo(file, dir) {
	cp.execSync(`test -e ${dir} || mkdir ${dir}`);
	/** @type {string} */
	const fifoPath = `${dir}/${file}`;
	cp.execSync(`test -e ${fifoPath} || mkfifo ${fifoPath}`);
}

/**
@return {void}
@param {string} buf
@param {string} path
*/
function writeToFifo(buf, path) {
	cp.execFile(`${__dirname}/bin/write_to_file`, [buf, path]);
}
