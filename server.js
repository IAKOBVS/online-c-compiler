const port = 3000;
const express = require('express');
const app = express();
const cp = require('child_process');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
	// render html
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.post('/compile', (req, res) => {
	// capture user input
	const compiler = req.body.compiler.toLowerCase();
	if (!compiler.startsWith('gcc')
	&& !compiler.startsWith('clang')) {
		res.send('Selected compiler is unavailable! Available compilers: gcc, clang.');
		return;
	}
	const flag = req.body.flag;
	if (!flag.match(/^[- _+=()0-9A-Za-z]*$/)) {
		res.send('Passing illegal characters as flags! Only use characters in [- _+=()0-9A-Za-z].')
		return;
	}
	const text = req.body.text;
	// process user text
	const output = compile(compiler, flag, text);
	// return output to user
	res.send(output);
});

function compile(compiler, flag, text) {
	try {
		// compile user text with shell
		cp.execSync(`printf "%s" "${text}" | ${compiler} ${flag} -Werror -x c -`);
		// return compiler output
		return 'Compiled successfully!';
	} catch (error) {
		return error.message;
	}
}
