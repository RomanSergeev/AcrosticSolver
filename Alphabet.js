function Alphabet(prompt) {
  var records = [];

  function create() {
    var alphabet = {};
  	for (var word of prompt)
  		for (var letter of word) {
  			++totalLetters;
  			if (letter == EMPTY_CHAR) ++emptyLetters;
  			else if (letter in alphabet) ++alphabet[letter];
  			else alphabet[letter] = 1;
  		}
  	records = [];
  	for (var key in alphabet) {
  		if (!alphabet.hasOwnProperty(key)) continue;
  		records.push({cipher: key, count: alphabet[key], decode: false});
  	}
  	records = records.sort((a, b) => b.count - a.count); // sort descending
  }

  this.length = () => records.length;
}
