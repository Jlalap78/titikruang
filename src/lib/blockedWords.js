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
  "najis","sialan","kafir","munafik","penipu","sundal","pelakor",

  // =====================
  // Judol & Pinjol - variasi kata
  // =====================
  "judi","judol","judi online","jud1","jvdi","jvdi0nline","judi slot",
  "slot","sl0t","sl0tt","slott","sl0ttgacor","slotgacor","slot gacor",
  "togel","t0gel","t0g3l","tog3l","togel online","togell",
  "casino","kasino","kas1no","kasyno","kaseno","kas1n0",
  "poker","p0ker","p0k3r","p0kerr","poker online","pokerr",
  "taruhan","betting","bet","b3t","bett","b3tting","b3tt",
  "jackpot","j4ckpot","j4ckp0t","jackp0t","j4ckp0tt","jackpott",
  "gacor","g4cor","g@cor","gac0r","gacorr","g4c0r","g4corr",
  "scatter","scatt3r","sc4tter","sc4tt3r","scatt3rr",
  "spin","sp1n","spinn","sp1nn",
  
  // Pinjol
  "pinjol","p1njol","p1njal","p1nj0l","p1nj0","p1nj0l","p1nj0ll",
  "pinjaman online","pinjaman","pinjem","pinj4m","pinj4m4n","p1njam",
  "utang","hutang","u-tang","h-tang","ut4ng","hut4ng",
  "kredit online","kred1t","kr3dit","kr3d1t","kredit",
  "paylater","pay later","p4ylater","p4y l4t3r","payl4t3r",
  "cicilan","c1c1lan","c1cilan","c1c1l4n","cic1lan",
  "bunga tinggi","bunga mencekik","bunga besar","bung4","bung4 tinggi",
  "rentenir","renten1r","rent3nir","r3ntenir"
  
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
