const port = 3000;
const express = require('express');
const app = express();
const system = require('child_process');

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
	const input = req.body.input;
	const output = compile(input);
	res.send(output);
});

function compile(input) {
	const ret = system.execSync(`echo "${input}" | gcc -Wall -Wextra -x c -`);
	console.log(ret.toString());
	return ret.toString();
}
