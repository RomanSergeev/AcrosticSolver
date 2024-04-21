const A_CODE = 97;
const EMPTY_CHAR = "_";
const LETTERS = 26;

var lettersBlank = 0; // flag - initially blanks '_' do not capture any letters
var lettersDecyphered = []; // array of 26 chars. lettersDecyphered[4] == '#' means that '#' decyphers into 'e'

var randomTo = x => Math.random() * x;
function pickRandomIndex(arr, picker = (arr, i) => arr[i]) {
  var sum = 0;
  for (var i = 0; i < arr.length; ++i) sum += picker(arr, i);
  if (sum == 0) return false;
  var rng = randomTo(sum);
  var cumsum = 0;
  for (var i = 0; i < arr.length; ++i) {
    cumsum += picker(arr, i);
    if (cumsum >= rng) return i;
  }
  return arr.length - 1;
}

function charIndex(char) { return char.charCodeAt(0) - A_CODE; }
function replaceCharAt(str, index, char) { return str.substring(0, index) + char + str.substring(index + 1); }
function hasFlagLetter(position, flag) { return (flag & (1 << position)) != 0; }
function setBlankLetter(position, oldFlag = lettersBlank) { return oldFlag | (1 << position); }
function removeUnknownLetter(position, oldFlag = lettersUnknown) { return oldFlag ^ (1 << position); }
function setDecypheredLetter(position, cypher, dest = lettersDecyphered) { dest[position] = cypher; }
function unsetDecypheredLetter(position, dest = lettersDecyphered) { dest[position] = undefined; }
function outputLettersDecyphered() {
  var s = "";
  for (var i = 0; i < LETTERS; ++i) {
    if (lettersDecyphered[i] === undefined) s = s + "_";
    else s = s + lettersDecyphered[i];
  }
  return s;
}

function Letter(cypher) {
  var decypheredAs = false;

  this.decypherAs = letter => decypheredAs = letter;

  this.matches = function(decypherAs, decypheredArray = lettersDecyphered, blankMask = lettersBlank) {
    if (decypheredAs) return decypherAs == decypheredAs;
    var code = charIndex(decypherAs);

    var ourIsBlank = cypher == EMPTY_CHAR; // x
    var decypherIsInArr = decypheredArray[code] !== undefined; // y
    var decypherIsInBlank = hasFlagLetter(code, blankMask); // z

    if (ourIsBlank) return !decypherIsInArr;
    if (decypherIsInBlank) return false;
    if (!decypherIsInArr) return true;
    return decypheredArray.indexOf(cypher) == code;
  }

  this.show = () => decypheredAs || "_";
}

function Word(cypher) { // example str: '4_+2'
  var that = this;
  /*var decyphered = ""; // example decyphered: 'this'
  var len = cypher.length;
  for (var i = 0; i < len; ++i)
    decyphered += EMPTY_CHAR;*/

  // fill decyphered on all cypherChar positions
  this.decypherOneLetter = function(cypherChar, decypherChar) { // example cypherChar: '#', example decypher: 'e'
    for (var i = 0; i < len; ++i)
      if (cypher[i] == cypherChar)
        decyphered = replaceCharAt(decyphered, i, decypherChar);
  }

  // fill the word entirely
  this.put = word => decyphered = word; // example word: 'the'

  // does our word match dictionary word
  this.matches = function(word) { // example word: 'the'
    if (word.length != len) return false;
    var newDecyphered = lettersDecyphered.slice();
    var newBlank = lettersBlank;
    for (var i = 0; i < len; ++i) {
      var char = word[i];
      var code = charIndex(char);
      if (decyphered[i] != EMPTY_CHAR && newDecyphered[code] != cypher[i]) return false;
      if (newDecyphered[code] !== undefined) return false;
      if (cypher[i] == EMPTY_CHAR) {
          newBlank = setBlankLetter(code, newBlank);
      } else {
        if (hasFlagLetter(code, newBlank)) return false;
        setDecypheredLetter(code, cypher[i], newDecyphered);
      }
    }
    return true;
  }

  this.length = () => cypher.length;

  // does any dictionary word match ours
  this.hasMatch = function() {
    for (var word of WORDS[len])
      if (this.matches(word[0])) return true;
    return false;
  }

  // for current lettersBlank, lettersDecyphered and word's decyphered letters,
  // find smallest index of the dictionary word that matches it
  this.bestMatch = function() {
    for (var i = 0; i < WORDS[len].length; ++i) {
      var pair = WORDS[len][i];
      if (this.matches(pair[0])) return pair[1];
    }
    return false;
  }

  // number of '_' in the cypher
  this.blanks = function() {
    var result = 0;
    for (var char of cypher) result += char == EMPTY_CHAR;
    return result;
  }

  this.show = () => decyphered;
}

function WordBag(prompt) {
  lettersBlank = 0;
  lettersDecyphered = [];

  var wordArr = [];
  var totalLetters = 0;

  var cyphers = prompt.split(/\s+/);
  var cypherFrequences = {};
	for (var cypher of cyphers) {
		wordArr.push(new Word(cypher));
		for (var char of cypher) {
      ++totalLetters;
      if (char == EMPTY_CHAR) continue;
			if (cypherFrequences.hasOwnProperty(char)) cypherFrequences[char]++;
			else cypherFrequences[char] = 1;
    }
	}

  // number of letters we will fill(gain) if we fully fill word by index wordIndex
  function letterGain(wordIndex) {
    var word = wordArr[wordIndex];
    if (!word.hasMatch()) return 0;
    var result = word.blanks();
    for (var i = 0; i < cyphers[wordIndex].length; ++i) {
      var char = cyphers[wordIndex][i]; // TODO continue from here
      if (char == EMPTY_CHAR) continue;
      if (cyphers[wordIndex].indexOf(char) == i) // first of a kind
        result += cypherFrequences[char];
    }
    return result;
  }

  // evaluate rating for each unfilled word and randomly choose which word to fill
  function pickWordIndexToFill() {
    var ratings = [];
    for (var i = 0; i < wordArr.length; ++i)
      ratings.push(letterGain(i) / Math.pow(wordArr[i].length(), 2));
    return pickRandomIndex(ratings);
  }

  // fill one entire word and update lettersBlank and lettersDecyphered
  function put(index, dictWord) {
    wordArr[index].put(dictWord);
    for (var i = 0; i < dictWord.length; ++i) {
      if (cyphers[index][i] != EMPTY_CHAR)
        for (var word of wordArr)
          word.decypherOneLetter(cyphers[index][i], dictWord[i]);
      var charAt = charIndex(dictWord[i]);
      if (cyphers[index][i] == EMPTY_CHAR) lettersBlank = setBlankLetter(charAt);
      else setDecypheredLetter(charAt, cyphers[index][i]);
    }
  }

  function wordRank(rank) { return 1. / Math.sqrt(rank + 1); }

  this.solve = function() {
    var wordIndex, ratings;
    while ((wordIndex = pickWordIndexToFill()) !== false) {
      var word = wordArr[wordIndex];
      var len = word.length();
      ratings = [];
      for (var i = 0; i < WORDS[len].length; ++i) {
        var dictWord = WORDS[len][i][0], dictRank = WORDS[len][i][1];
        if (!word.matches(dictWord)) continue;
        var totalRating = wordRank(dictRank);
        for (var j = 0; j < wordArr.length; ++j) {
          if (j == wordIndex) continue;
          var rank = wordArr[j].bestMatch();
          if (rank === false) continue;
          totalRating += wordRank(rank);
        }
        ratings.push([i, totalRating]);
      }
      var index = pickRandomIndex(ratings, (arr, i) => arr[i][1]);
      put(wordIndex, WORDS[len][index][0]);
      console.log("Word chosen: " + cyphers[wordIndex] + ", fill: " + WORDS[len][index][0] + ", newDecyphered: " + outputLettersDecyphered());
      this.show();
    }
  }

  this.show = function() {
    var str = "";
    for (var word of wordArr) str += word.show() + " ";
    console.log(str);
  }
}
