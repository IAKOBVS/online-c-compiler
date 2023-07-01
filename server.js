// @ts-check
"use strict";
const port = 3000;
const express = require('express');
const app = express();
const cp = require('child_process');
const path = require('path');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.post('/compile', (req, res) => {
	const flag = req.body.flag;
	if (!flag.match(/^[- _+=0-9A-Za-z]*$/)) {
		res.send('Passing illegal characters as flags!<br>Only use characters in [- _+=0-9A-Za-z].');
		return;
	}
	const compiler = req.body.compiler.toLowerCase();
	const text = req.body.text;
	const output = compile(compiler, flag, text);
	res.send(output);
});

function compile(compiler, flag, text)
{
	let ret;
	try {
		ret = cp.execSync(`printf "%s\n" "${text}" | ${compiler} ${flag} -Werror -fsyntax-only -x c -`);
	} catch (error) {
		return '<br>Compilation failed:<br>' + String(error.message)
			// remove newlines for regex
			.replace(/\n/g, '')
			// only show compiler warnings
			.replace(/^.*?-fsyntax-only -x c -/, '')
			// add newlines
			.replace(/<stdin>:/g, '<br>');
	}
	return 'Compiled successfuly!';
}
