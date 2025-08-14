// blockedWords.js
// Kata dasar (Indonesia + Inggris + slang + judol + pinjol)
const baseWords = [
  // =====================
  // Indonesia - kata kasar umum
  // =====================
  "anjing","bangsat","bajingan","brengsek","kontol","memek","ngentot",
  "pepek","perek","tolol","goblok","idiot","kampret","setan","pantek","bacot",
  "jancok","kimak","tai","asu","lonte","coli","sange","ngewe","tetek","pentil",
  "bencong","banci","homo","lesbi","pelacur","bokep","sex","seks","jav",
  "ngocok","bejat","hina","bodoh","kampungan","cabul",
  "najis","sialan","kafir","munafik","penipu","sundal","pelakor",'njing','ngentot',"kon","tol",

  
  // =====================
  // Inggris - kata kasar umum
  // =====================
  ,"fuck","shit","bitch","asshole","bastard","dick","pussy","motherfucker",
  "sonofabitch","cunt","jerk","moron","retard","slut","whore","damn","faggot",
  "hoe","cock","blowjob","handjob","rimjob","cum","cumshot","spank","dildo",
  "porn","porno","hentai","nude","nudes","boobs","tits","orgasm","suck",
  "rape","rapist","molest","molester","pedo","pedophile"
];

// Variasi pengganti huruf
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

// Fungsi buat variasi (dengan spasi antar huruf/suku kata)
function generateVariations(word) {
  let variations = new Set();
  variations.add(word);

  // Ganti huruf dengan semua opsinya
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    if (replacements[char]) {
      replacements[char].forEach(rep => {
        let newWord = word.substring(0, i) + rep + word.substring(i + 1);
        variations.add(newWord);
      });
    }
  }

  // Spasi antar huruf
  variations.add(word.split("").join(" "));

  // Spasi antar suku kata
  if (word.length > 3) {
    for (let i = 1; i < word.length; i++) {
      variations.add(word.slice(0, i) + " " + word.slice(i));
    }
  }

  return Array.from(variations);
}

// Gabungkan semua variasi jadi satu list unik
export const blockedWords = Array.from(new Set(baseWords.flatMap(generateVariations)));

console.log(`Total blocked words generated: ${blockedWords.length}`);
