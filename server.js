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
	const input = req.body.input;
	const flag = req.body.flag;
	// process user input
	const output = compile(input, flag);
	// return output to user
	res.send(output);
});

function compile(input, flag) {
	try {
		// compile user input with shell
		cp.execSync(`printf "%s" "${input}" | gcc ${flag} -Werror -x c -`);
		// return compiler output
		return 'Compiled successfully!'
	} catch (error) {
		return error.message;
	}
}
