// blockedWords.js
// Daftar kata dasar (Indonesia + Inggris + slang)
const baseWords = [
  // Indonesia
  "anjing","bangsat","bajingan","brengsek","kontol","memek","ngentot",
  "pepek","perek","tolol","goblok","idiot","kampret","setan","pantek","bacot",
  "jancok","kimak","tai","asu","lonte","coli","sange","ngewe","tetek","pentil",
  "bencong","banci","homo","lesbi","pelacur","bokep","sex","seks","jav",
  "ngocok","bejat","hina","brengsek","brengs","bodoh","kampungan","cabul",
  "najis","sialan","kafir","munafik","palsu","penipu","sundal","cungur","pelakor",

  // Inggris
  "fuck","shit","bitch","asshole","bastard","dick","pussy","motherfucker",
  "sonofabitch","cunt","jerk","moron","retard","slut","whore","damn","faggot",
  "hoe","cock","blowjob","handjob","rimjob","cum","cumshot","spank","dildo",
  "porn","porno","hentai","nude","nudes","boobs","tits","orgasm","suck",
  "rape","rapist","molest","molester","pedo","pedophile"
];

// Variasi pengganti huruf (l33t, simbol, aksen)
const replacements = {
  a: ["a", "4", "@", "à", "á", "â", "ä", "å"],
  b: ["b", "8", "ß"],
  c: ["c", "ç", "¢", "(", "{"],
  d: ["d", "đ"],
  e: ["e", "3", "€", "ë", "é", "è", "ê"],
  g: ["g", "9", "6", "ĝ"],
  i: ["i", "1", "!", "|", "í", "ì", "ï"],
  l: ["l", "1", "|", "ł"],
  o: ["o", "0", "ø", "ö", "ó", "ò"],
  s: ["s", "5", "$", "š"],
  t: ["t", "7", "+", "ť"],
  u: ["u", "ü", "ù", "ú", "û", "µ"],
  k: ["k", "x", "ķ"]
};

// Fungsi buat variasi
function generateVariations(word) {
  let variations = new Set();
  variations.add(word);
  
  // Ganti setiap huruf dengan semua opsinya
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    if (replacements[char]) {
      replacements[char].forEach(rep => {
        let newWord = word.substring(0, i) + rep + word.substring(i + 1);
        variations.add(newWord);
      });
    }
  }
  return Array.from(variations);
}

// Generate semua kata + variasinya
export const blockedWords = Array.from(new Set(baseWords.flatMap(generateVariations)));

// Cek jumlah kata
console.log(`Total blocked words: ${blockedWords.length}`);
