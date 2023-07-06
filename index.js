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
	/** @type {string} */
	const flag = req.body.flag;
	if (/[^-\s_+=0-9A-Za-z]/.test(flag)) {
		res.send(
			"Passing illegal characters as compiler flags!<br>Only use characters in [- _+=0-9A-Za-z]."
		);
		return;
	}
	/** @type {string} */
	const compiler = req.body.compiler;
	/** @type {string} */
	const text = req.body.text;
	if (!/\S/.test(text)) {
		res.send("Source code is empty.");
		return;
	} else if (/(?:^|\n)\s*#\s*include\s*"/.test(text)) {
		res.send("Trying to include headers from the filesystem:<br>#include \"header.h\".<br><br>Please use standard includes with angle brackets instead:<br>#include &ltheader.h&gt");
		return;
	}
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
		cp.execSync(`${compiler} ${flag} -Werror -x c ${file_path} -o ${file_out}`);
	} catch (error) {
		fs.rmSync(file_path);
		/** @type {string} */
		let err = error.message;
		err = err.substring(err.indexOf(file_out) + file_out.length);
		err = str.replace_all(err, file_path + ":", "");
		err = str.replace_all(err, "\n", "<br>");
		return "<br>Compilation failed:<br>" + err;
	}
	try {
		fs.rmSync(file_path);
		fs.rmSync(file_out);
	} catch (error) {
		return error.message;
	}
	return "<br>Compiled successfuly!";
}
