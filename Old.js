function Alphabet(prompt) {
  var that = this;
  const ALPHABET_FREQUENCES = [ // english letter frequences
  	0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228,
  	0.02015, 0.06094, 0.06966, 0.00253, 0.01772, 0.04025,
  	0.02406, 0.06749, 0.07507, 0.01929, 0.00095, 0.05987,
  	0.06327, 0.09056, 0.02758, 0.00978, 0.02360, 0.00250,
  	0.01974, 0.00074];
  var records = [];
  var totalLength = 0;
  this.randomizePower = 2;

  function create() {
    var totalLetters = 0, emptyLetters = 0;
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
    totalLength = totalLetters;
  }

  function convertFreqRatio(freq, arrFreq) {
  	var minRatio = Math.min(freq / arrFreq, arrFreq / freq);
  	// return Math.pow(minRatio, 2);
  	return Math.pow(-1 / Math.log(minRatio), that.randomizePower);
  }

  function createFreqArray(freq) {
    var result = [];
    for (var i = 0; i < LETTERS; ++i)
      result.push(convertFreqRatio(freq, ALPHABET_FREQUENCES[i]));
    return result;
  }

  var sumArray = arr => arr.reduce((accum, elem) => accum + elem, 0);

  function pickRandomLetter(weights) {
  	var sum = sumArray(weights);
  	var result;
  	do {
  		var rnd = Math.random() * sum;
  		var cumsum = 0;
  		result = weights.length - 1;
  		for (var i = 0; i < weights.length; ++i) {
  			cumsum += weights[i];
  			if (cumsum >= rnd) {
  				result = i;
  				break;
  			}
  		}
  	} while (that.hasLetter(result) !== false);
  	return result;
  }

  function arrayHasArray(arrOfArrs, arr) {
    return arrOfArrs.some(existingArray =>
      existingArray.length === arr.length &&
      existingArray.every((value, index) => value === arr[index])
    );
  }

  this.length    = () => records.length;
  this.cipher    = index => records[index].cipher;
  this.frequency = index => records[index].count / totalLength;
  this.decoded   = index => records[index].decode;

  this.hasCipher = sign => {
    for (var i = 0; i < records.length; ++i)
      if (records[i].cipher === sign && records[i].decode !== false)
        return i;
    return false;
  }

  this.hasDuplicates = () => {
    var arr = [];
    for (var i = 0; i < records.length; ++i)
      if (records[i].decode) arr.push(records[i].decode);
    return new Set(arr).size != arr.length;
  }

  this.firstUnsetIndex = () => {
    for (var i = 0; i < records.length; ++i)
      if (records[i].decode === false)
        return i;
    return -1;
  }

  this.hasLetter = letter => { // either index of letter in the alphabet or letter itself
    if (typeof letter === "string") letter = letter.charCodeAt(0) - A_CODE;
    for (var i = 0; i < records.length; ++i)
      if (records[i].decode === letter)
        return i;
    return false;
  }

  this.clear = function() {
    for (var i = 0; i < records.length; ++i)
      records[i].decode = false;
  }

  this.setNextUnsetLetter = function(letterIndex) {
    for (var i = 0; i < records.length; ++i) {
      if (records[i].decode !== false) continue;
      if (arguments.length > 0) {
        records[i].decode = letterIndex;
        return i;
      }
      var arr = createFreqArray(this.frequency(i));
    	var index = pickRandomLetter(arr);
    	records[i].decode = index;
      return i;
    }
    return false;
  }

  this.unsetLetter = index => records[index].decode = false;

  this.print = function(simple = false) {
    var joined = prompt.join(" "), result = "";
    for (var char of joined) {
      if (char == " ") { result += char; continue; }
      var found = this.hasCipher(char);
      if (found === false) result += simple ? "_" : char;
      else result += String.fromCharCode(records[found].decode + A_CODE);
    }
  	// console.log(result);
    return result;
  }

  this.wordMatches = function(wordPromptIndex, dictionaryWord) {
    var word = prompt[wordPromptIndex];
    var foundLetters = 0;
    for (var i = 0; i < word.length; ++i) {
      var charCipher = word[i], charDictionary = dictionaryWord[i];
      var decoded = this.hasCipher(charCipher);
      var dictionaryLetterDecoded = this.hasLetter(charDictionary);
      if (decoded !== dictionaryLetterDecoded) return false; // either both should be unknown, or both point to the same index
      foundLetters += (decoded !== false);
    }
    return foundLetters;
  }

  this.makeSample = function(iterations, depth) {
    var result = [];
    for (var i = 0; i < iterations; ++i) {
      var sample = [];
      for (var j = 0; j < depth; ++j) {
        this.setNextUnsetLetter();
        sample.push(records[j].decode);
      }
      if (!arrayHasArray(result, sample)) result.push(sample.slice());
      this.clear();
    }
    return result;
  }

  create();
}

const LETTERS = 26;
const START_LETTERS = 3;
const LETTERS_GUESSED_ENOUGH = 0.7;
const TESTS = 200;
const FREQUENT_ENOUGH_RATING = 200;

var alphabet, prompt;

function solveAcrostic(text) {
	prompt = text.split(/\s+/);
	alphabet = new Alphabet(prompt);
	alphabet.randomizePower = 1;
	var cases = alphabet.makeSample(TESTS, START_LETTERS);
	// console.log(cases);
	for (var i = 0; i < cases.length; ++i) {
		for (var j = 0; j < START_LETTERS; ++j)
			alphabet.setNextUnsetLetter(cases[i][j]);
		cases[i][START_LETTERS] = countFrequentWords(FREQUENT_ENOUGH_RATING);
		alphabet.clear();
	}
	cases = cases.filter(arr => arr[START_LETTERS] > 0).sort((a, b) => b[START_LETTERS] - a[START_LETTERS]);
	var bestMatches = [];
	for (var i = 0; i < cases.length; ++i) {
		for (var j = 0; j < START_LETTERS; ++j) {
			alphabet.setNextUnsetLetter(cases[i][j]);
		}

		do {
			var currentRating = totalRating();
			var gains = [];
			for (var j = 0; j < LETTERS; ++j) {
				if (alphabet.hasLetter(j) !== false) {
					gains.push(0);
					continue;
				}
				var index = alphabet.setNextUnsetLetter(j);
				if (countFrequentWords(FREQUENT_ENOUGH_RATING) < cases[i][START_LETTERS]) {
					gains.push(0);
					alphabet.unsetLetter(index);
					continue;
				}
				gains.push(totalRating() - currentRating);
				alphabet.unsetLetter(index);
			}
			var idx = gains.indexOf(Math.max(...gains));
			var unsetIndex = alphabet.firstUnsetIndex();
			if (gains[idx] == 0) break;
			alphabet.setNextUnsetLetter(idx);
			// console.log("Gain " + gains[idx] + ": " + alphabet.cipher(unsetIndex) + " -> " + String.fromCharCode(alphabet.decoded(unsetIndex) + 97));
			// alphabet.print();
		} while (1);

		var frequent = countFrequentWords(FREQUENT_ENOUGH_RATING);
		if (frequent >= 1) {
			bestMatches.push([frequent, alphabet.print(true)]);
			// console.log(frequent);
			// alphabet.print(true);
		}
		alphabet.clear();
	}
	bestMatches = bestMatches.sort((a, b) => b[0] - a[0]);
	for (var i = 0; i < bestMatches.length; ++i)
		console.log(bestMatches[i][1] + " " + bestMatches[i][0]);
}

function countFrequentWords(rating) {
	var result = 0;
	for (var i = 0; i < prompt.length; ++i) { // looping through all words
		var len = prompt[i].length;
		for (var j = 0; j < WORDS[len].length; ++j) {
			var word  = WORDS[len][j][0];
			var place = WORDS[len][j][1];
			if (place > rating) break;
			var match = alphabet.wordMatches(i, word);
			if (match > 0) {
				var rate = 1 - 0.8 * place / rating;
				if (place < 10) rate = [22.7, 2.06, 9.67, 3.58, 13.24, 8.27, 7.22, 2.35, 1, 2.45][place];
				result += match / word.length * rate;
				break;
			}
		}
	}
	return result;
}

function totalRating() {
	var result = 0;
	for (var i = 0; i < prompt.length; ++i)
		result += wordWorstRating(i);
	return result;
}

function wordWorstRating(index) {
	var len = prompt[index].length;
	for (var j = WORDS[len].length - 1; j >= 0; --j) {
		var match = alphabet.wordMatches(index, WORDS[len][j][0]);
		var part = match / WORDS[len][j][0].length;
		if (match > 0)
			return WORDS[len][j][1] * (1 - part);
		}
	return 12000;
}
