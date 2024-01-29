window.onload = function() {
	var body = document.body;
	var input = document.getElementById("prompt");
	var prompts = [
		"_+12 345_ 9_ 154_16 _907 7_9580-9- +1_0", // what kind of animal does spongebob have
		"8162 _021635 13&27 _02 _3&5474 _9 43_756+3 054 287_053", // this fashion house was founded by domenico and stefano
		"29 _43 04+_20 =_ 456308079 4__ 0263 297&9_ 26_ =918_9 _5940", // he was taught by aristotle and this helped him become great
		"8%2 _3208936 9_ 8%+6 _+=& %07 89 1_+=7 05 258+32 4+==0_2 +5 52_ _20=057", // the creators of this film had to build an entire village in new zealand
		"4_+2 059=71_ =85__032 76&31+ 6_17 &+2%839 _7663_ 71_ 54_38 055%+32", // this company produces albeni luna biskrem halley and other cookies
		"_756 _54 3_ 679 _99+ 8= _9102504 6_9&64 &8&67", // what day of the week is february twenty ninth
		"7_35 51&_ 27453 9_70# %0_=3 207_3+70#9 83651_ 25 24&9 %5+_71_", // aveo onix tahoe spark cruze trademarks belong to this company
		"_5240 =8_9 410 97+0 8_ 410 407+ 386 &655094#3 %#73 89" // write down the name of the team you currently play on
	];
	input.value = prompts[0].slice();
	var button = document.getElementById("btn");
	button.addEventListener("click", () => solveAcrostic(input.value));
}

const A_CODE = 97;
const LETTERS = 26;
const EMPTY_CHAR = "_";
const START_LETTERS = 5;
const LETTERS_GUESSED_ENOUGH = 0.7;
const POWER = 2;
const TESTS = 25;
const FREQUENT_ENOUGH_RATING = 100;
const frequences = [ // english letter frequences
	0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228,
	0.02015, 0.06094, 0.06966, 0.00253, 0.01772, 0.04025,
	0.02406, 0.06749, 0.07507, 0.01929, 0.00095, 0.05987,
	0.06327, 0.09056, 0.02758, 0.00978, 0.02360, 0.00250,
	0.01974, 0.00074];
var alphabet, prompt, alphLen, totalLetters = 0, emptyLetters = 0;

var sumArray = arr => arr.reduce((accum, elem) => accum + elem, 0);

function output() {
	var result = prompt.slice();
	for (var h = 0; h < result.length; ++h) {
		var word = result[h];
		for (var i = 0; i < word.length; ++i) {
			for (var j = 0; j < alphLen; ++j)
			if (alphabet[j][0] == word[i] && alphabet[j][2]) {
				word = word.split("");
				word[i] = String.fromCharCode(alphabet[j][2] + A_CODE);
				word = word.join("");
				result[h] = word;
				break;
			}
		}
	}
	console.log(result);
}

function solveAcrostic(text) {
	prompt = text.split(/\s+/);
	fillAlphabet();
	var alphabetCopy = alphabet.map(elem => elem.slice()); // copy
	for (var i = 0; i < TESTS; ++i) {
		var letterIndex = 0;
		for (; letterIndex < START_LETTERS; ++letterIndex)
			randomizeAlphabetLetter(letterIndex);
		var frequentWord = hasFrequentWord(FREQUENT_ENOUGH_RATING);
		if (!frequentWord) continue;
		console.log(frequentWord);
		output();

		do {
			var currentRating = totalRating();
			var nextLetterIndex = 0;
			while (alphabet[nextLetterIndex][2]) ++nextLetterIndex;
			if (nextLetterIndex == LETTERS) break;
			var gains = [];
			for (var j = 0; j < LETTERS; ++j) {
				if (letterCaptured(j)) { gains.push(0); continue; }
				alphabet[nextLetterIndex][2] = j;
				gains.push(totalRating() - currentRating);
				alphabet[nextLetterIndex][2] = false;
			}
			var idx = gains.indexOf(Math.max(...gains));
			if (gains[idx] == 0) break;
			alphabet[nextLetterIndex][2] = idx;
		} while (1);
		// TODO choose next letter
		// output();
		alphabet = alphabetCopy.map(elem => elem.slice()); // restore
	}
	// output();
}

function randomizeAlphabetLetter(i) {
	if (alphabet[i][2]) return;
	var freq = alphabet[i][1] / totalLetters;
	var arr = [];
	for (var j = 0; j < LETTERS; ++j)
	arr.push(convertFreqRatio(freq, frequences[j]));
	var index = pickRandomLetter(arr);
	alphabet[i][2] = index;
}

function pickRandomLetter(arr) {
	var sum = sumArray(arr);
	var result;
	do {
		var rnd = Math.random() * sum;
		var cumsum = 0;
		result = arr.length - 1;
		for (var i = 0; i < arr.length; ++i) {
			cumsum += arr[i];
			if (cumsum >= rnd) {
				result = i;
				break;
			}
		}
	} while (letterCaptured(result));
	return result;
}

function hasFrequentWord(rating) {
	// var regex = constructRegex();
	for (var i = 0; i < prompt.length; ++i) { // looping through all words
		var word = prompt[i];
		var len = word.length;
		for (var j = 0; j < words[len].length; ++j) {
			if (words[len][j][1] > rating) break;
			if (wordMatches(word, words[len][j][0])) return words[len][j][0];
		}
	}
	return false;
}

function totalRating() {
	var result = 0;
	for (var word of prompt)
		result += wordWorstRating(word);
	return result;
}

function wordWorstRating(word) {
	var len = word.length;
	for (var j = words[len].length - 1; j >= 0; --j)
	if (wordMatches(word, words[len][j][0]))
	return words[len][j][1];
	return 5050;
}

function wordMatches(promptWord, dictionaryWord) {
	var foundAny = false;
	var usedLetters = "", usedCipher = "";
	for (var j = 0; j < alphLen; ++j)
		if (alphabet[j][2]) {
			usedCipher  += alphabet[j][0];
			usedLetters += String.fromCharCode(alphabet[j][2] + A_CODE);
		}
	for (var i = 0; i < promptWord.length; ++i) {
		var char = promptWord[i];
		if (!usedCipher.includes(char)) {
			if (usedLetters.includes(dictionaryWord[i])) return false;
			continue;
		}
		for (var j = 0; j < alphLen; ++j) {
			if (alphabet[j][0] != char || !alphabet[j][2]) continue; // now we found prompt letter that has decoding
			if (dictionaryWord[i] != String.fromCharCode(alphabet[j][2] + A_CODE)) return false;
			foundAny = true;
			break;
		}
	}
	return foundAny;
}

/*function constructRegex() {
	var result = [];
	for (var i = 0; i < alphLen; ++i)
		if (alphabet[i][2])
			result.push(alphabet[i][2]);
	result = result.join("|");
	return new RegExp(result);
}*/

function letterCaptured(index) {
	for (var i = 0; i < alphLen; ++i)
	if (alphabet[i][2] == index) return true;
	return false;
}

function convertFreqRatio(freq, arrFreq) {
	var minRatio = Math.min(freq / arrFreq, arrFreq / freq);
	// return Math.pow(minRatio, 2);
	return Math.pow(-1 / Math.log(minRatio), POWER);
}

function fillAlphabet() {
	alphabet = {};
	for (var word of prompt)
		for (var letter of word) {
			++totalLetters;
			if (letter == EMPTY_CHAR) ++emptyLetters;
			else if (letter in alphabet) ++alphabet[letter];
			else alphabet[letter] = 1;
		}
	var alphabetArray = [];
	for (var key in alphabet) {
		if (!alphabet.hasOwnProperty(key)) continue;
		alphabetArray.push([key, alphabet[key], false]);
	}
	alphabet = alphabetArray;
	alphLen = alphabet.length;
	alphabet = alphabet.sort((a, b) => b[1] - a[1]); // sort descending
}

function clearAlphabet() {
	for (var i = 0; i < alphLen; ++i)
	alphabet[i][2] = false;
}

function equalArrays(arr1, arr2) {
	if (arr1.length != arr2.length) return false;
	for (var i = 0; i < arr1.length; ++i)
		if (arr1[i] != arr2[i]) return false;
	return true;
}
