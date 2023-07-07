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
	console.log(`Received /compile post from ${userid}.`);
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
	let code = req.body.code;
	if (!/\S/.test(code)) {
		res.send("Source code is empty.");
		return;
	} else if (/(?:^|\n)[ \t]*#[ \t]*include[ \t]*"/.test(code)) {
		res.send(
			'Trying to include headers from the filesystem:<br>#include "header.h".<br><br>Use standard includes with angle brackets instead:<br>#include &ltheader.h&gt'
		);
		return;
	}
	// Force includes to only be able to access files from /usr/include
	code = code.replace(
		/(?:^|\n)[ \t]*#[ \t]*include[ \t]*</g,
		"\n#include </usr/include/"
	);
	/** @type {string} */
	const output = compile(compiler, language, flag, code);
	res.send(output);
});

/**
 *
 * @param {string} compiler
 * @param {string} language
 * @param {string} flag
 * @param {string} code
 * @returns {string}
 */
function compile(compiler, language, flag, code) {
	/** @type {string} */
	const file_dir = path.join(TMPDIR, "__tmp__");
	/** @type {string} */
	const file_path = str.mktemp(file_dir);
	/** @type {string} */
	const file_out = str.mktemp(file_dir);
	try {
		fs.writeFileSync(file_path, code);
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
	console.log("Compiled successfuly.");
	return "Compiled successfuly.";
}
