window.onload = function() {
	var body = document.body;
}

const freq = [
	0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228,
	0.02015, 0.06094, 0.06966, 0.00253, 0.01772, 0.04025,
	0.02406, 0.06749, 0.07507, 0.01929, 0.00095, 0.05987,
	0.06327, 0.09056, 0.02758, 0.00978, 0.02360, 0.00250,
	0.01974, 0.00074];
var newText;
var arr = [];
for (var i = 0; i < 15; ++i) arr[i] = [];

function fetchWords(f) {
	var reader = new FileReader();
	reader.onload = () => parseFile(reader.result);
	reader.readAsText(f.files[0]);
}

function parseFile(text) {
	var strs = text.split("\r\n");
	for (var i = 0; i < strs.length; ++i)
		arr[strs[i].length].push([strs[i], i]);
	newText = "[";
	for (var i = 0; i < arr.length; ++i) {
		newText += "[";
		var str = "[";
		for (var j = 0; j < arr[i].length; ++j)
			str += "['" + arr[i][j][0] + "', " + arr[i][j][1] + "], ";
		if (str.length > 1) str = str.slice(0, str.length - 2);
		str += "], ";
		newText += str;
		newText += "], ";
	}
	newText += "]";
}
