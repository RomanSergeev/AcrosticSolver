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
		"_5240 =8_9 410 97+0 8_ 410 407+ 386 &655094#3 %#73 89", // write down the name of the team you currently play on
		"4169 2& 943 _%5& 82_0 92=0& 835+ =275& 7270 =275& 907", // what is two plus five times four minus nine minus ten
		"9&61 _2=0974 +27%571 7=1168 _47#431980 =3+5_61980 80% 9=7__5061980", // what country borders russia kyrgyzstan uzbekistan and turkmenistan
		"48&7 2_7 5=%089 30#4 =_ 2_7 _763=4 +=64 =4 2_7 _0632 =_ &81", // name the zodiac sign of the person born on the first of may
		"67428 62493352+ 3826_ 1521 242392+ 451 %=20 9& 288 0=9&", // coral caribbean black dead arabian red what is all this
		"6&1 7274 7274 34547 7274 6&1 &_06 _143 6_23 34_94784 +407", // two nine nine seven nine two what does this sequence mean
		"92 _87 72041& 8=52+ 1236 54 725 =445 41 %441" // he was second after neil to set foot on moon
	];
	input.value = prompts[2].slice();
	var button = document.getElementById("btn");
	button.addEventListener("click", () => solveAcrostic(input.value));
}

function solveAcrostic(text) {
	var wordBag = new WordBag(text);
	wordBag.solve();
	wordBag.show();
}
