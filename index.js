// @ts-check
"use strict";

const port = 3000;
const express = require("express");
const app = express();
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const str = require("./lib/str");
/** @type {string} */
const TMPDIR = os.tmpdir();

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
	const userid = req.ip;
	console.log(userid);
	/** @type {string} */
	const flag = req.body.flag;
	if (/[^-\s_+=0-9A-Za-z]/.test(flag)) {
		res.send(
			"Passing illegal characters as compiler flags!<br>Only use characters in [- _+=0-9A-Za-z]."
		);
		return;
	}
	/** @type {string} */
	const compiler = req.body.compiler.toLowerCase();
	const allowedCompiler = "Use gcc-*, g++-*, or clang(++)-*.";
	if (!/\S/.test(compiler)) {
		res.send(`Compiler is empty.<br>${allowedCompiler}`);
		return;
	} else if (
		!/^\s*(?:gcc|g\+\+|clang|clang\+\+)-{0,1}[0-9]*\s*$/.test(compiler)
	) {
		res.send(`Passing illegal compiler!<br>${allowedCompiler}`);
		return;
	}
	/** @type {string} */
	let language = req.body.language.toLowerCase();
	if (!/\S/.test(compiler)) {
		language = compiler.indexOf("+") != -1 ? "c++" : "c";
	} else if (!/^\s*[-+0-9A-Za-z]{1,}\s*$/.test(language)) {
		res.send("Passing illegal language!");
		return;
	}
	/** @type {string} */
	const text = req.body.text;
	if (!/\S/.test(text)) {
		res.send("Source code is empty.");
		return;
	} else if (/(?:^|\n)[ \t]*#[ \t]*include[ \t]*"/.test(text)) {
		res.send(
			'Trying to include headers from the filesystem:<br>#include "header.h".<br><br>Use standard includes with angle brackets instead:<br>#include &ltheader.h&gt'
		);
		return;
	}
	/** @type {string} */
	const output = compile(compiler, language, flag, text);
	res.send(output);
});

/**
 *
 * @param {string} compiler
 * @param {string} language
 * @param {string} flag
 * @param {string} text
 * @returns {string}
 */
function compile(compiler, language, flag, text) {
	/** @type {string} */
	const file_dir = path.join(TMPDIR, "__tmp__");
	/** @type {string} */
	const file_path = str.mktemp(file_dir);
	const file_out = str.mktemp(file_dir);
	try {
		fs.writeFileSync(file_path, text);
	} catch (error) {
		return error.message;
	}
	try {
		cp.execSync(
			`${compiler} ${flag} -Werror -x ${language} ${file_path} -o ${file_out}`
		);
	} catch (error) {
		fs.rmSync(file_path);
		/** @type {string} */
		let err = error.message;
		err = err.substring(err.indexOf(file_out) + file_out.length);
		err = str.replace_all(err, file_path + ":", "");
		err = str.replace_all(err, "\n", "<br>");
		return "Compilation failed:<br>" + err;
	}
	try {
		fs.rmSync(file_path);
		fs.rmSync(file_out);
	} catch (error) {
		return error.message;
	}
	return "Compiled successfuly!";
}
