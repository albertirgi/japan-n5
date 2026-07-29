import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";

/* =====================================================================
   Minna no Nihongo — Belajar & Latihan N5
   Kosakata Bab 1–25 · Kanji N5 · Audio · Menulis · SRS · Tata Bahasa
   Tema visual: GENKOUYOUSHI (原稿用紙 / kertas naskah Jepang)
   ===================================================================== */

const C = {
  paper: "#F2EEE3", paper2: "#E8E2D2", ink: "#1C1A24",
  indigo: "#253A5E", indigo2: "#3D5A8A", shu: "#C1352A",
  ochre: "#B08D57", line: "rgba(37,58,94,0.18)", lineSoft: "rgba(37,58,94,0.10)",
  good: "#2E7D53",
};
const FONT_DISPLAY = "'Zen Old Mincho', 'Noto Serif JP', serif";
const FONT_BODY = "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif";

/* ------------------------- AUDIO (Web Speech API) ------------------------- */
function speak(text) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const jp = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("ja"));
    if (jp) u.voice = jp;
    window.speechSynthesis.speak(u);
  } catch (e) { /* audio tak tersedia */ }
}

/* =========================== DATA: KOSAKATA =========================== */
const LESSONS = [
  { id: 1, title: "Perkenalan", words: [
    { jp: "わたし", romaji: "watashi", id: "saya" }, { jp: "あなた", romaji: "anata", id: "kamu / Anda" },
    { jp: "あのひと", romaji: "ano hito", id: "orang itu" }, { jp: "せんせい", romaji: "sensei", id: "guru" },
    { jp: "がくせい", romaji: "gakusei", id: "pelajar" }, { jp: "かいしゃいん", romaji: "kaishain", id: "karyawan" },
    { jp: "いしゃ", romaji: "isha", id: "dokter" }, { jp: "だいがく", romaji: "daigaku", id: "universitas" },
    { jp: "びょういん", romaji: "byouin", id: "rumah sakit" }, { jp: "なんさい", romaji: "nansai", id: "umur berapa" },
  ]},
  { id: 2, title: "Ini & Itu (benda)", words: [
    { jp: "これ", romaji: "kore", id: "ini" }, { jp: "それ", romaji: "sore", id: "itu" },
    { jp: "あれ", romaji: "are", id: "itu (jauh)" }, { jp: "ほん", romaji: "hon", id: "buku" },
    { jp: "じしょ", romaji: "jisho", id: "kamus" }, { jp: "ざっし", romaji: "zasshi", id: "majalah" },
    { jp: "しんぶん", romaji: "shinbun", id: "koran" }, { jp: "えんぴつ", romaji: "enpitsu", id: "pensil" },
    { jp: "かぎ", romaji: "kagi", id: "kunci" }, { jp: "とけい", romaji: "tokei", id: "jam" },
    { jp: "かさ", romaji: "kasa", id: "payung" }, { jp: "かばん", romaji: "kaban", id: "tas" },
  ]},
  { id: 3, title: "Tempat", words: [
    { jp: "ここ", romaji: "koko", id: "di sini" }, { jp: "そこ", romaji: "soko", id: "di situ" },
    { jp: "あそこ", romaji: "asoko", id: "di sana" }, { jp: "きっさてん", romaji: "kissaten", id: "kafe" },
    { jp: "へや", romaji: "heya", id: "kamar" }, { jp: "トイレ", romaji: "toire", id: "toilet" },
    { jp: "かいだん", romaji: "kaidan", id: "tangga" }, { jp: "くに", romaji: "kuni", id: "negara" },
    { jp: "かいしゃ", romaji: "kaisha", id: "perusahaan" }, { jp: "うち", romaji: "uchi", id: "rumah" },
  ]},
  { id: 4, title: "Waktu", words: [
    { jp: "いま", romaji: "ima", id: "sekarang" }, { jp: "ごぜん", romaji: "gozen", id: "pagi (AM)" },
    { jp: "ごご", romaji: "gogo", id: "siang/sore (PM)" }, { jp: "あさ", romaji: "asa", id: "pagi" },
    { jp: "ひる", romaji: "hiru", id: "siang" }, { jp: "ばん", romaji: "ban", id: "malam" },
    { jp: "きのう", romaji: "kinou", id: "kemarin" }, { jp: "きょう", romaji: "kyou", id: "hari ini" },
    { jp: "あした", romaji: "ashita", id: "besok" }, { jp: "まいあさ", romaji: "maiasa", id: "setiap pagi" },
  ]},
  { id: 5, title: "Pergi & Datang", words: [
    { jp: "いきます", romaji: "ikimasu", id: "pergi" }, { jp: "きます", romaji: "kimasu", id: "datang" },
    { jp: "かえります", romaji: "kaerimasu", id: "pulang" }, { jp: "でんしゃ", romaji: "densha", id: "kereta listrik" },
    { jp: "ちかてつ", romaji: "chikatetsu", id: "kereta bawah tanah" }, { jp: "しんかんせん", romaji: "shinkansen", id: "kereta cepat" },
    { jp: "ひこうき", romaji: "hikouki", id: "pesawat" }, { jp: "くるま", romaji: "kuruma", id: "mobil" },
    { jp: "じてんしゃ", romaji: "jitensha", id: "sepeda" }, { jp: "えき", romaji: "eki", id: "stasiun" },
  ]},
  { id: 6, title: "Makan & Minum", words: [
    { jp: "たべます", romaji: "tabemasu", id: "makan" }, { jp: "のみます", romaji: "nomimasu", id: "minum" },
    { jp: "みます", romaji: "mimasu", id: "melihat / menonton" }, { jp: "よみます", romaji: "yomimasu", id: "membaca" },
    { jp: "かきます", romaji: "kakimasu", id: "menulis" }, { jp: "かいます", romaji: "kaimasu", id: "membeli" },
    { jp: "します", romaji: "shimasu", id: "melakukan" }, { jp: "ごはん", romaji: "gohan", id: "nasi / makanan" },
    { jp: "みず", romaji: "mizu", id: "air" }, { jp: "おちゃ", romaji: "ocha", id: "teh" }, { jp: "コーヒー", romaji: "koohii", id: "kopi" },
  ]},
  { id: 7, title: "Memberi & Menerima", words: [
    { jp: "あげます", romaji: "agemasu", id: "memberi" }, { jp: "もらいます", romaji: "moraimasu", id: "menerima" },
    { jp: "かします", romaji: "kashimasu", id: "meminjamkan" }, { jp: "かります", romaji: "karimasu", id: "meminjam" },
    { jp: "おしえます", romaji: "oshiemasu", id: "mengajar" }, { jp: "ならいます", romaji: "naraimasu", id: "belajar (dari)" },
    { jp: "てがみ", romaji: "tegami", id: "surat" }, { jp: "はし", romaji: "hashi", id: "sumpit" },
    { jp: "はな", romaji: "hana", id: "bunga" }, { jp: "プレゼント", romaji: "purezento", id: "hadiah" },
    { jp: "かぞく", romaji: "kazoku", id: "keluarga" }, { jp: "パソコン", romaji: "pasokon", id: "komputer" },
  ]},
  { id: 8, title: "Kata Sifat", words: [
    { jp: "きれい", romaji: "kirei", id: "cantik / bersih" }, { jp: "しずか", romaji: "shizuka", id: "tenang" },
    { jp: "にぎやか", romaji: "nigiyaka", id: "ramai" }, { jp: "ゆうめい", romaji: "yuumei", id: "terkenal" },
    { jp: "しんせつ", romaji: "shinsetsu", id: "baik hati" }, { jp: "べんり", romaji: "benri", id: "praktis" },
    { jp: "おおきい", romaji: "ookii", id: "besar" }, { jp: "ちいさい", romaji: "chiisai", id: "kecil" },
    { jp: "あつい", romaji: "atsui", id: "panas" }, { jp: "さむい", romaji: "samui", id: "dingin (cuaca)" },
    { jp: "むずかしい", romaji: "muzukashii", id: "sulit" }, { jp: "おいしい", romaji: "oishii", id: "enak" },
  ]},
  { id: 9, title: "Suka & Bisa", words: [
    { jp: "わかります", romaji: "wakarimasu", id: "mengerti" }, { jp: "すき", romaji: "suki", id: "suka" },
    { jp: "きらい", romaji: "kirai", id: "benci" }, { jp: "じょうず", romaji: "jouzu", id: "pandai" },
    { jp: "へた", romaji: "heta", id: "tidak pandai" }, { jp: "りょうり", romaji: "ryouri", id: "masakan" },
    { jp: "おんがく", romaji: "ongaku", id: "musik" }, { jp: "スポーツ", romaji: "supootsu", id: "olahraga" },
    { jp: "おかね", romaji: "okane", id: "uang" }, { jp: "たくさん", romaji: "takusan", id: "banyak" },
    { jp: "すこし", romaji: "sukoshi", id: "sedikit" }, { jp: "ぜんぜん", romaji: "zenzen", id: "sama sekali (tidak)" },
  ]},
  { id: 10, title: "Keberadaan", words: [
    { jp: "います", romaji: "imasu", id: "ada (makhluk hidup)" }, { jp: "あります", romaji: "arimasu", id: "ada (benda)" },
    { jp: "いぬ", romaji: "inu", id: "anjing" }, { jp: "ねこ", romaji: "neko", id: "kucing" },
    { jp: "うえ", romaji: "ue", id: "atas" }, { jp: "した", romaji: "shita", id: "bawah" },
    { jp: "まえ", romaji: "mae", id: "depan" }, { jp: "うしろ", romaji: "ushiro", id: "belakang" },
    { jp: "みぎ", romaji: "migi", id: "kanan" }, { jp: "ひだり", romaji: "hidari", id: "kiri" },
    { jp: "なか", romaji: "naka", id: "dalam" }, { jp: "となり", romaji: "tonari", id: "sebelah" },
  ]},
  { id: 11, title: "Kata Bilangan", words: [
    { jp: "ひとり", romaji: "hitori", id: "satu orang" }, { jp: "ふたり", romaji: "futari", id: "dua orang" },
    { jp: "りんご", romaji: "ringo", id: "apel" }, { jp: "きって", romaji: "kitte", id: "perangko" },
    { jp: "りょうしん", romaji: "ryoushin", id: "orang tua" }, { jp: "あに", romaji: "ani", id: "kakak laki-laki" },
    { jp: "あね", romaji: "ane", id: "kakak perempuan" }, { jp: "おとうと", romaji: "otouto", id: "adik laki-laki" },
    { jp: "いもうと", romaji: "imouto", id: "adik perempuan" }, { jp: "どのぐらい", romaji: "dono gurai", id: "berapa lama" },
    { jp: "ぜんぶで", romaji: "zenbu de", id: "semuanya" },
  ]},
  { id: 12, title: "Perbandingan & Musim", words: [
    { jp: "かんたん", romaji: "kantan", id: "mudah" }, { jp: "ちかい", romaji: "chikai", id: "dekat" },
    { jp: "とおい", romaji: "tooi", id: "jauh" }, { jp: "はやい", romaji: "hayai", id: "cepat" },
    { jp: "おそい", romaji: "osoi", id: "lambat" }, { jp: "はる", romaji: "haru", id: "musim semi" },
    { jp: "なつ", romaji: "natsu", id: "musim panas" }, { jp: "あき", romaji: "aki", id: "musim gugur" },
    { jp: "ふゆ", romaji: "fuyu", id: "musim dingin" }, { jp: "てんき", romaji: "tenki", id: "cuaca" },
    { jp: "うみ", romaji: "umi", id: "laut" }, { jp: "まつり", romaji: "matsuri", id: "festival" },
  ]},
  { id: 13, title: "Keinginan", words: [
    { jp: "あそびます", romaji: "asobimasu", id: "bermain" }, { jp: "およぎます", romaji: "oyogimasu", id: "berenang" },
    { jp: "むかえます", romaji: "mukaemasu", id: "menjemput" }, { jp: "つかれます", romaji: "tsukaremasu", id: "lelah" },
    { jp: "けっこんします", romaji: "kekkon shimasu", id: "menikah" }, { jp: "かいものします", romaji: "kaimono shimasu", id: "berbelanja" },
    { jp: "さんぽします", romaji: "sanpo shimasu", id: "jalan-jalan" }, { jp: "ほしい", romaji: "hoshii", id: "ingin (benda)" },
    { jp: "ひろい", romaji: "hiroi", id: "luas" }, { jp: "せまい", romaji: "semai", id: "sempit" },
    { jp: "まち", romaji: "machi", id: "kota" }, { jp: "おなか", romaji: "onaka", id: "perut" },
  ]},
  { id: 14, title: "Permintaan (bentuk -te)", words: [
    { jp: "つけます", romaji: "tsukemasu", id: "menyalakan" }, { jp: "けします", romaji: "keshimasu", id: "mematikan" },
    { jp: "あけます", romaji: "akemasu", id: "membuka" }, { jp: "しめます", romaji: "shimemasu", id: "menutup" },
    { jp: "いそぎます", romaji: "isogimasu", id: "bergegas" }, { jp: "まちます", romaji: "machimasu", id: "menunggu" },
    { jp: "てつだいます", romaji: "tetsudaimasu", id: "membantu" }, { jp: "つかいます", romaji: "tsukaimasu", id: "memakai" },
    { jp: "すわります", romaji: "suwarimasu", id: "duduk" }, { jp: "namae... ", romaji: "-", id: "-" },
    { jp: "ゆっくり", romaji: "yukkuri", id: "pelan-pelan" }, { jp: "すぐ", romaji: "sugu", id: "segera" },
  ]},
  { id: 15, title: "Izin & Larangan", words: [
    { jp: "みせます", romaji: "misemasu", id: "menunjukkan" }, { jp: "すみます", romaji: "sumimasu", id: "tinggal" },
    { jp: "しります", romaji: "shirimasu", id: "mengetahui" }, { jp: "つくります", romaji: "tsukurimasu", id: "membuat" },
    { jp: "うります", romaji: "urimasu", id: "menjual" }, { jp: "びょうき", romaji: "byouki", id: "sakit" },
    { jp: "くすり", romaji: "kusuri", id: "obat" }, { jp: "ざんぎょう", romaji: "zangyou", id: "lembur" },
    { jp: "しゅっちょう", romaji: "shucchou", id: "dinas luar" }, { jp: "よてい", romaji: "yotei", id: "rencana" },
    { jp: "けんきゅう", romaji: "kenkyuu", id: "penelitian" },
  ]},
  { id: 16, title: "Menyambung Kalimat", words: [
    { jp: "のります", romaji: "norimasu", id: "naik (kendaraan)" }, { jp: "おります", romaji: "orimasu", id: "turun" },
    { jp: "のりかえます", romaji: "norikaemasu", id: "berganti kendaraan" }, { jp: "あびます", romaji: "abimasu", id: "mandi (shower)" },
    { jp: "からだ", romaji: "karada", id: "tubuh" }, { jp: "あたま", romaji: "atama", id: "kepala" },
    { jp: "かみ", romaji: "kami", id: "rambut" }, { jp: "かお", romaji: "kao", id: "wajah" },
    { jp: "わかい", romaji: "wakai", id: "muda" }, { jp: "あかるい", romaji: "akarui", id: "terang" },
    { jp: "くらい", romaji: "kurai", id: "gelap" }, { jp: "こうさてん", romaji: "kousaten", id: "persimpangan" },
  ]},
  { id: 17, title: "Bentuk -nai", words: [
    { jp: "おぼえます", romaji: "oboemasu", id: "menghafal" }, { jp: "わすれます", romaji: "wasuremasu", id: "lupa" },
    { jp: "なくします", romaji: "nakushimasu", id: "kehilangan" }, { jp: "はらいます", romaji: "haraimasu", id: "membayar" },
    { jp: "かえします", romaji: "kaeshimasu", id: "mengembalikan" }, { jp: "でかけます", romaji: "dekakemasu", id: "pergi keluar" },
    { jp: "しんぱいします", romaji: "shinpai shimasu", id: "khawatir" }, { jp: "だいじょうぶ", romaji: "daijoubu", id: "tidak apa-apa" },
    { jp: "あぶない", romaji: "abunai", id: "berbahaya" }, { jp: "ねつ", romaji: "netsu", id: "demam" },
    { jp: "あさって", romaji: "asatte", id: "lusa" },
  ]},
  { id: 18, title: "Bentuk Kamus & Bisa", words: [
    { jp: "ひきます", romaji: "hikimasu", id: "memainkan (alat petik)" }, { jp: "うたいます", romaji: "utaimasu", id: "bernyanyi" },
    { jp: "あつめます", romaji: "atsumemasu", id: "mengumpulkan" }, { jp: "すてます", romaji: "sutemasu", id: "membuang" },
    { jp: "うんてんします", romaji: "unten shimasu", id: "mengemudi" }, { jp: "よやくします", romaji: "yoyaku shimasu", id: "memesan" },
    { jp: "ピアノ", romaji: "piano", id: "piano" }, { jp: "しゅみ", romaji: "shumi", id: "hobi" },
    { jp: "にっき", romaji: "nikki", id: "buku harian" }, { jp: "どうぶつ", romaji: "doubutsu", id: "binatang" },
    { jp: "インターネット", romaji: "intaanetto", id: "internet" },
  ]},
  { id: 19, title: "Bentuk -ta & Pengalaman", words: [
    { jp: "のぼります", romaji: "noborimasu", id: "mendaki" }, { jp: "とまります", romaji: "tomarimasu", id: "menginap" },
    { jp: "そうじします", romaji: "souji shimasu", id: "membersihkan" }, { jp: "せんたくします", romaji: "sentaku shimasu", id: "mencuci baju" },
    { jp: "れんしゅうします", romaji: "renshuu shimasu", id: "berlatih" }, { jp: "なります", romaji: "narimasu", id: "menjadi" },
    { jp: "ねむい", romaji: "nemui", id: "mengantuk" }, { jp: "つよい", romaji: "tsuyoi", id: "kuat" },
    { jp: "よわい", romaji: "yowai", id: "lemah" }, { jp: "せいかつ", romaji: "seikatsu", id: "kehidupan" },
    { jp: "しゅくだい", romaji: "shukudai", id: "PR" },
  ]},
  { id: 20, title: "Bentuk Biasa (Kasual)", words: [
    { jp: "いります", romaji: "irimasu", id: "perlu" }, { jp: "しらべます", romaji: "shirabemasu", id: "memeriksa" },
    { jp: "なおします", romaji: "naoshimasu", id: "memperbaiki" }, { jp: "きぶん", romaji: "kibun", id: "perasaan / mood" },
    { jp: "ぼく", romaji: "boku", id: "saya (laki-laki)" }, { jp: "きみ", romaji: "kimi", id: "kamu" },
    { jp: "うん", romaji: "un", id: "ya (kasual)" }, { jp: "ううん", romaji: "uun", id: "tidak (kasual)" },
    { jp: "ことば", romaji: "kotoba", id: "kata / bahasa" }, { jp: "けいざい", romaji: "keizai", id: "ekonomi" },
  ]},
  { id: 21, title: "Pendapat (~to omoimasu)", words: [
    { jp: "おもいます", romaji: "omoimasu", id: "berpikir" }, { jp: "いいます", romaji: "iimasu", id: "berkata" },
    { jp: "かちます", romaji: "kachimasu", id: "menang" }, { jp: "まけます", romaji: "makemasu", id: "kalah" },
    { jp: "ニュース", romaji: "nyuusu", id: "berita" }, { jp: "せいじ", romaji: "seiji", id: "politik" },
    { jp: "ぶんか", romaji: "bunka", id: "budaya" }, { jp: "いけん", romaji: "iken", id: "pendapat" },
    { jp: "しあい", romaji: "shiai", id: "pertandingan" }, { jp: "たぶん", romaji: "tabun", id: "mungkin" },
    { jp: "きっと", romaji: "kitto", id: "pasti" }, { jp: "ほんとうに", romaji: "hontou ni", id: "sungguh" },
  ]},
  { id: 22, title: "Modifikasi Kata Benda", words: [
    { jp: "きます", romaji: "kimasu", id: "memakai (atasan)" }, { jp: "はきます", romaji: "hakimasu", id: "memakai (bawahan)" },
    { jp: "かぶります", romaji: "kaburimasu", id: "memakai (topi)" }, { jp: "かけます", romaji: "kakemasu", id: "memakai (kacamata)" },
    { jp: "うまれます", romaji: "umaremasu", id: "lahir" }, { jp: "コート", romaji: "kooto", id: "mantel" },
    { jp: "スーツ", romaji: "suutsu", id: "setelan jas" }, { jp: "ぼうし", romaji: "boushi", id: "topi" },
    { jp: "めがね", romaji: "megane", id: "kacamata" }, { jp: "おめでとう", romaji: "omedetou", id: "selamat" },
  ]},
  { id: 23, title: "~toki & ~to", words: [
    { jp: "ききます", romaji: "kikimasu", id: "bertanya / mendengar" }, { jp: "まわします", romaji: "mawashimasu", id: "memutar" },
    { jp: "さわります", romaji: "sawarimasu", id: "menyentuh" }, { jp: "あるきます", romaji: "arukimasu", id: "berjalan" },
    { jp: "わたります", romaji: "watarimasu", id: "menyeberang" }, { jp: "きをつけます", romaji: "ki o tsukemasu", id: "hati-hati" },
    { jp: "みち", romaji: "michi", id: "jalan" }, { jp: "はし", romaji: "hashi", id: "jembatan" },
    { jp: "ちゅうしゃじょう", romaji: "chuushajou", id: "tempat parkir" }, { jp: "たてもの", romaji: "tatemono", id: "bangunan" },
  ]},
  { id: 24, title: "Memberi Aktivitas (kuremasu)", words: [
    { jp: "くれます", romaji: "kuremasu", id: "memberi (ke saya)" }, { jp: "つれていきます", romaji: "tsurete ikimasu", id: "membawa (orang) pergi" },
    { jp: "つれてきます", romaji: "tsurete kimasu", id: "membawa (orang) datang" }, { jp: "しょうかいします", romaji: "shoukai shimasu", id: "memperkenalkan" },
    { jp: "あんないします", romaji: "annai shimasu", id: "memandu" }, { jp: "せつめいします", romaji: "setsumei shimasu", id: "menjelaskan" },
    { jp: "おじいさん", romaji: "ojiisan", id: "kakek" }, { jp: "おばあさん", romaji: "obaasan", id: "nenek" },
    { jp: "じぶん", romaji: "jibun", id: "diri sendiri" }, { jp: "みんな", romaji: "minna", id: "semua orang" },
    { jp: "おかし", romaji: "okashi", id: "kue / camilan" },
  ]},
  { id: 25, title: "Bentuk Lampau Biasa & ~tara", words: [
    { jp: "かんがえます", romaji: "kangaemasu", id: "berpikir / merenungkan" }, { jp: "つきます", romaji: "tsukimasu", id: "tiba" },
    { jp: "りゅうがくします", romaji: "ryuugaku shimasu", id: "belajar ke luar negeri" }, { jp: "いなか", romaji: "inaka", id: "kampung halaman" },
    { jp: "たいしかん", romaji: "taishikan", id: "kedutaan" }, { jp: "もし", romaji: "moshi", id: "seandainya" },
    { jp: "いっぱい", romaji: "ippai", id: "penuh" }, { jp: "きもち", romaji: "kimochi", id: "perasaan" },
    { jp: "おれい", romaji: "orei", id: "ucapan terima kasih" }, { jp: "せわ", romaji: "sewa", id: "bantuan / perhatian" },
  ]},
];
// bersihkan entri placeholder yang tak valid (mis. Bab 14 punya 1 entri kosong)
LESSONS.forEach((l) => { l.words = l.words.filter((w) => w.id && w.id !== "-"); });

/* =========================== DATA: KANJI N5 =========================== */
const KANJI = [
  { k: "一", on: "イチ", kun: "ひと(つ)", id: "satu", ex: "一つ (hitotsu) — satu buah" },
  { k: "二", on: "ニ", kun: "ふた(つ)", id: "dua", ex: "二人 (futari) — dua orang" },
  { k: "三", on: "サン", kun: "みっ(つ)", id: "tiga", ex: "三月 (sangatsu) — Maret" },
  { k: "四", on: "シ", kun: "よん / よ(つ)", id: "empat", ex: "四時 (yoji) — pukul empat" },
  { k: "五", on: "ゴ", kun: "いつ(つ)", id: "lima", ex: "五円 (goen) — lima yen" },
  { k: "六", on: "ロク", kun: "むっ(つ)", id: "enam", ex: "六日 (muika) — tanggal enam" },
  { k: "七", on: "シチ", kun: "なな(つ)", id: "tujuh", ex: "七つ (nanatsu) — tujuh buah" },
  { k: "八", on: "ハチ", kun: "やっ(つ)", id: "delapan", ex: "八百 (happyaku) — delapan ratus" },
  { k: "九", on: "キュウ / ク", kun: "ここの(つ)", id: "sembilan", ex: "九月 (kugatsu) — September" },
  { k: "十", on: "ジュウ", kun: "とお", id: "sepuluh", ex: "十時 (juuji) — pukul sepuluh" },
  { k: "百", on: "ヒャク", kun: "—", id: "seratus", ex: "百円 (hyakuen) — seratus yen" },
  { k: "千", on: "セン", kun: "ち", id: "seribu", ex: "千円 (sen'en) — seribu yen" },
  { k: "万", on: "マン", kun: "—", id: "sepuluh ribu", ex: "一万 (ichiman) — 10.000" },
  { k: "円", on: "エン", kun: "まる(い)", id: "yen / bulat", ex: "百円 (hyakuen) — 100 yen" },
  { k: "日", on: "ニチ / ジツ", kun: "ひ / か", id: "hari / matahari", ex: "日曜日 (nichiyoubi) — Minggu" },
  { k: "月", on: "ゲツ / ガツ", kun: "つき", id: "bulan", ex: "月曜日 (getsuyoubi) — Senin" },
  { k: "火", on: "カ", kun: "ひ", id: "api", ex: "火曜日 (kayoubi) — Selasa" },
  { k: "水", on: "スイ", kun: "みず", id: "air", ex: "水曜日 (suiyoubi) — Rabu" },
  { k: "木", on: "モク / ボク", kun: "き", id: "pohon / kayu", ex: "木曜日 (mokuyoubi) — Kamis" },
  { k: "金", on: "キン", kun: "かね", id: "emas / uang", ex: "金曜日 (kin'youbi) — Jumat" },
  { k: "土", on: "ド", kun: "つち", id: "tanah", ex: "土曜日 (doyoubi) — Sabtu" },
  { k: "上", on: "ジョウ", kun: "うえ / あ(げる)", id: "atas", ex: "上 (ue) — di atas" },
  { k: "下", on: "カ / ゲ", kun: "した / さ(げる)", id: "bawah", ex: "下 (shita) — di bawah" },
  { k: "中", on: "チュウ", kun: "なか", id: "tengah / dalam", ex: "中 (naka) — di dalam" },
  { k: "大", on: "ダイ / タイ", kun: "おお(きい)", id: "besar", ex: "大学 (daigaku) — universitas" },
  { k: "小", on: "ショウ", kun: "ちい(さい)", id: "kecil", ex: "小さい (chiisai) — kecil" },
  { k: "本", on: "ホン", kun: "もと", id: "buku / asal", ex: "日本 (nihon) — Jepang" },
  { k: "人", on: "ジン / ニン", kun: "ひと", id: "orang", ex: "日本人 (nihonjin) — orang Jepang" },
  { k: "男", on: "ダン / ナン", kun: "おとこ", id: "laki-laki", ex: "男の人 (otoko no hito) — pria" },
  { k: "女", on: "ジョ", kun: "おんな", id: "perempuan", ex: "女の人 (onna no hito) — wanita" },
  { k: "子", on: "シ", kun: "こ", id: "anak", ex: "子ども (kodomo) — anak" },
  { k: "父", on: "フ", kun: "ちち", id: "ayah", ex: "父 (chichi) — ayah saya" },
  { k: "母", on: "ボ", kun: "はは", id: "ibu", ex: "母 (haha) — ibu saya" },
  { k: "先", on: "セン", kun: "さき", id: "sebelum / duluan", ex: "先生 (sensei) — guru" },
  { k: "生", on: "セイ", kun: "い(きる) / う(まれる)", id: "hidup / lahir", ex: "学生 (gakusei) — pelajar" },
  { k: "学", on: "ガク", kun: "まな(ぶ)", id: "belajar", ex: "学校 (gakkou) — sekolah" },
  { k: "校", on: "コウ", kun: "—", id: "sekolah", ex: "高校 (koukou) — SMA" },
  { k: "山", on: "サン", kun: "やま", id: "gunung", ex: "山 (yama) — gunung" },
  { k: "川", on: "セン", kun: "かわ", id: "sungai", ex: "川 (kawa) — sungai" },
  { k: "田", on: "デン", kun: "た", id: "sawah", ex: "田中 (tanaka) — Tanaka (marga)" },
  { k: "口", on: "コウ", kun: "くち", id: "mulut", ex: "入口 (iriguchi) — pintu masuk" },
  { k: "目", on: "モク", kun: "め", id: "mata", ex: "目 (me) — mata" },
  { k: "耳", on: "ジ", kun: "みみ", id: "telinga", ex: "耳 (mimi) — telinga" },
  { k: "手", on: "シュ", kun: "て", id: "tangan", ex: "手 (te) — tangan" },
  { k: "足", on: "ソク", kun: "あし", id: "kaki", ex: "足 (ashi) — kaki" },
  { k: "見", on: "ケン", kun: "み(る)", id: "melihat", ex: "見ます (mimasu) — melihat" },
  { k: "行", on: "コウ", kun: "い(く)", id: "pergi", ex: "行きます (ikimasu) — pergi" },
  { k: "来", on: "ライ", kun: "く(る)", id: "datang", ex: "来ます (kimasu) — datang" },
  { k: "食", on: "ショク", kun: "た(べる)", id: "makan", ex: "食べます (tabemasu) — makan" },
  { k: "飲", on: "イン", kun: "の(む)", id: "minum", ex: "飲みます (nomimasu) — minum" },
  { k: "読", on: "ドク", kun: "よ(む)", id: "membaca", ex: "読みます (yomimasu) — membaca" },
  { k: "書", on: "ショ", kun: "か(く)", id: "menulis", ex: "書きます (kakimasu) — menulis" },
  { k: "話", on: "ワ", kun: "はな(す)", id: "bicara / cerita", ex: "話します (hanashimasu) — bicara" },
  { k: "買", on: "バイ", kun: "か(う)", id: "membeli", ex: "買います (kaimasu) — membeli" },
  { k: "時", on: "ジ", kun: "とき", id: "waktu / jam", ex: "時間 (jikan) — waktu" },
  { k: "分", on: "フン / ブン", kun: "わ(ける)", id: "menit / bagian", ex: "五分 (gofun) — lima menit" },
  { k: "半", on: "ハン", kun: "なか(ば)", id: "setengah", ex: "半分 (hanbun) — separuh" },
  { k: "今", on: "コン", kun: "いま", id: "sekarang", ex: "今日 (kyou) — hari ini" },
  { k: "年", on: "ネン", kun: "とし", id: "tahun", ex: "今年 (kotoshi) — tahun ini" },
  { k: "何", on: "カ", kun: "なに / なん", id: "apa / berapa", ex: "何 (nani) — apa" },
  { k: "電", on: "デン", kun: "—", id: "listrik", ex: "電車 (densha) — kereta listrik" },
  { k: "車", on: "シャ", kun: "くるま", id: "kendaraan", ex: "車 (kuruma) — mobil" },
  { k: "気", on: "キ / ケ", kun: "—", id: "semangat / udara", ex: "元気 (genki) — sehat" },
  { k: "天", on: "テン", kun: "あめ", id: "langit", ex: "天気 (tenki) — cuaca" },
  { k: "国", on: "コク", kun: "くに", id: "negara", ex: "外国 (gaikoku) — luar negeri" },
  { k: "友", on: "ユウ", kun: "とも", id: "teman", ex: "友だち (tomodachi) — teman" },
  { k: "高", on: "コウ", kun: "たか(い)", id: "tinggi / mahal", ex: "高い (takai) — mahal" },
  { k: "安", on: "アン", kun: "やす(い)", id: "murah / aman", ex: "安い (yasui) — murah" },
  { k: "新", on: "シン", kun: "あたら(しい)", id: "baru", ex: "新しい (atarashii) — baru" },
  { k: "古", on: "コ", kun: "ふる(い)", id: "lama / tua", ex: "古い (furui) — tua/lama" },
  { k: "長", on: "チョウ", kun: "なが(い)", id: "panjang", ex: "長い (nagai) — panjang" },
  { k: "白", on: "ハク", kun: "しろ(い)", id: "putih", ex: "白い (shiroi) — putih" },
  { k: "東", on: "トウ", kun: "ひがし", id: "timur", ex: "東京 (toukyou) — Tokyo" },
  { k: "西", on: "セイ", kun: "にし", id: "barat", ex: "西 (nishi) — barat" },
  { k: "南", on: "ナン", kun: "みなみ", id: "selatan", ex: "南 (minami) — selatan" },
  { k: "北", on: "ホク", kun: "きた", id: "utara", ex: "北 (kita) — utara" },
  { k: "外", on: "ガイ", kun: "そと", id: "luar", ex: "外 (soto) — di luar" },
  { k: "前", on: "ゼン", kun: "まえ", id: "depan / sebelum", ex: "午前 (gozen) — pagi (AM)" },
  { k: "後", on: "ゴ / コウ", kun: "うし(ろ) / あと", id: "belakang / setelah", ex: "午後 (gogo) — sore (PM)" },
  { k: "午", on: "ゴ", kun: "—", id: "tengah hari", ex: "午後 (gogo) — sore (PM)" },
  { k: "毎", on: "マイ", kun: "—", id: "setiap", ex: "毎日 (mainichi) — setiap hari" },
  { k: "週", on: "シュウ", kun: "—", id: "minggu", ex: "毎週 (maishuu) — setiap minggu" },
  { k: "語", on: "ゴ", kun: "かた(る)", id: "bahasa", ex: "日本語 (nihongo) — bahasa Jepang" },
  { k: "名", on: "メイ", kun: "な", id: "nama", ex: "名前 (namae) — nama" },
  { k: "立", on: "リツ", kun: "た(つ)", id: "berdiri", ex: "立ちます (tachimasu) — berdiri" },
  { k: "休", on: "キュウ", kun: "やす(む)", id: "istirahat", ex: "休みます (yasumimasu) — libur" },
];

/* =========================== DATA: TATA BAHASA N5 =========================== */
const GRAMMAR = [
  { pat: "A は B です", mean: "A adalah B", desc: "Pola dasar kalimat Jepang. は (dibaca \"wa\") menandai topik kalimat, です menutupnya dengan sopan. B umumnya kata benda atau kata sifat. です membuat nada formal; dalam percakapan santai です bisa dihilangkan.", ex: [ { jp: "わたしは がくせいです。", ro: "watashi wa gakusei desu.", id: "Saya pelajar." }, { jp: "あのひとは せんせいです。", ro: "ano hito wa sensei desu.", id: "Orang itu guru." }, { jp: "これは にほんの くるまです。", ro: "kore wa nihon no kuruma desu.", id: "Ini mobil Jepang." } ], quiz: { q: "わたし（　）かいしゃいんです。", opt: ["は", "を", "に", "で"], ans: "は", why: "は menandai topik kalimat." } },
  { pat: "～じゃ / では ありません", mean: "bukan (negasi です)", desc: "Bentuk negatif dari です. じゃ ありません untuk percakapan; では ありません lebih formal/tulisan. Keduanya berarti \"bukan\". Bentuk lampau negatifnya: じゃ ありませんでした.", ex: [ { jp: "わたしは いしゃじゃ ありません。", ro: "watashi wa isha ja arimasen.", id: "Saya bukan dokter." }, { jp: "きょうは やすみじゃ ありません。", ro: "kyou wa yasumi ja arimasen.", id: "Hari ini bukan hari libur." } ], quiz: { q: "これは ほん（　）ありません。", opt: ["じゃ", "を", "が", "に"], ans: "じゃ", why: "じゃ ありません = bentuk negatif です." } },
  { pat: "～か", mean: "penanda pertanyaan", desc: "Menambahkan か di akhir kalimat menjadikannya pertanyaan tanpa mengubah urutan kata. Nada suara biasanya naik. Bila ada kata tanya (なに, どこ, いつ), か tetap dipakai di akhir.", ex: [ { jp: "あなたは がくせいですか。", ro: "anata wa gakusei desu ka.", id: "Apakah kamu pelajar?" }, { jp: "これは いくらですか。", ro: "kore wa ikura desu ka.", id: "Ini berapa harganya?" }, { jp: "トイレは どこですか。", ro: "toire wa doko desu ka.", id: "Toilet di mana?" } ], quiz: { q: "これは なんです（　）。", opt: ["か", "ね", "よ", "は"], ans: "か", why: "か di akhir kalimat menjadikannya pertanyaan." } },
  { pat: "N の N", mean: "partikel milik / hubungan", desc: "の menghubungkan dua kata benda. Fungsinya: kepemilikan (buku saya), asal/kelompok (guru bahasa Jepang), atau penjelas. Kata benda pemilik/penjelas selalu diletakkan sebelum の.", ex: [ { jp: "わたしの かばん", ro: "watashi no kaban", id: "tas saya" }, { jp: "にほんごの せんせい", ro: "nihongo no sensei", id: "guru bahasa Jepang" }, { jp: "かいしゃの ひと", ro: "kaisha no hito", id: "orang perusahaan" } ], quiz: { q: "これは わたし（　）かばんです。", opt: ["の", "は", "を", "に"], ans: "の", why: "の menghubungkan dua kata benda (kepemilikan)." } },
  { pat: "これ・それ・あれ / この・その・あの", mean: "ini / itu (jauh)", desc: "これ/それ/あれ berdiri sendiri sebagai kata benda. この/その/あの harus diikuti kata benda (この ほん = buku ini). こ = dekat pembicara, そ = dekat lawan bicara, あ = jauh dari keduanya.", ex: [ { jp: "これは わたしの くるまです。", ro: "kore wa watashi no kuruma desu.", id: "Ini mobil saya." }, { jp: "その ほんは いくらですか。", ro: "sono hon wa ikura desu ka.", id: "Berapa harga buku itu?" }, { jp: "あの ひとは だれですか。", ro: "ano hito wa dare desu ka.", id: "Siapa orang (di sana) itu?" } ], quiz: { q: "（　）は わたしの くるまです。(dekat pembicara)", opt: ["これ", "どれ", "だれ", "なに"], ans: "これ", why: "これ = benda dekat pembicara." } },
  { pat: "N も", mean: "juga", desc: "も menggantikan は atau が dan berarti \"juga\" — menandakan hal yang sama juga berlaku. Bila dua-duanya negatif, も berarti \"pun tidak\".", ex: [ { jp: "わたしも がくせいです。", ro: "watashi mo gakusei desu.", id: "Saya juga pelajar." }, { jp: "これも ください。", ro: "kore mo kudasai.", id: "Ini juga, tolong." }, { jp: "なにも たべませんでした。", ro: "nani mo tabemasen deshita.", id: "Tidak makan apa pun." } ], quiz: { q: "かれ（　）にほんじんです。(\"dia juga\")", opt: ["も", "は", "が", "を"], ans: "も", why: "も = \"juga\"." } },
  { pat: "N を V", mean: "menandai objek", desc: "を (dibaca \"o\") menandai objek langsung kata kerja transitif — hal yang dikenai perbuatan. を juga menandai titik lintasan pada kata kerja gerak (みちを あるく).", ex: [ { jp: "ごはんを たべます。", ro: "gohan o tabemasu.", id: "Makan nasi." }, { jp: "ほんを よみます。", ro: "hon o yomimasu.", id: "Membaca buku." }, { jp: "おんがくを ききます。", ro: "ongaku o kikimasu.", id: "Mendengarkan musik." } ], quiz: { q: "コーヒー（　）のみます。", opt: ["を", "が", "に", "で"], ans: "を", why: "を menandai objek kata kerja transitif." } },
  { pat: "N へ / に いきます", mean: "ke (arah/tujuan)", desc: "へ (dibaca \"e\") dan に menandai arah/tujuan pada kata kerja gerak (いきます, きます, かえります). Untuk arah keduanya bisa dipakai; に menekankan titik tujuan.", ex: [ { jp: "がっこうへ いきます。", ro: "gakkou e ikimasu.", id: "Pergi ke sekolah." }, { jp: "うちに かえります。", ro: "uchi ni kaerimasu.", id: "Pulang ke rumah." }, { jp: "きょねん にほんへ きました。", ro: "kyonen nihon e kimashita.", id: "Tahun lalu datang ke Jepang." } ], quiz: { q: "とうきょう（　）いきます。", opt: ["へ", "を", "で", "が"], ans: "へ", why: "へ (dibaca \"e\") menandai arah tujuan." } },
  { pat: "N で", mean: "tempat aksi / alat", desc: "で punya dua fungsi utama: (1) tempat berlangsungnya aktivitas — \"di\"; (2) alat, cara, atau bahan — \"dengan / naik / memakai\". Bedakan dengan に (keberadaan/tujuan).", ex: [ { jp: "としょかんで べんきょうします。", ro: "toshokan de benkyou shimasu.", id: "Belajar di perpustakaan." }, { jp: "バスで いきます。", ro: "basu de ikimasu.", id: "Pergi naik bus." }, { jp: "はしで たべます。", ro: "hashi de tabemasu.", id: "Makan dengan sumpit." } ], quiz: { q: "えき（　）ともだちに あいます。", opt: ["で", "へ", "を", "の"], ans: "で", why: "で menandai tempat berlangsungnya aktivitas." } },
  { pat: "～ませんか", mean: "ajakan sopan", desc: "Bentuk negatif sopan + か dipakai untuk mengajak dengan halus: \"maukah…?\". Lebih sopan dari ～ましょう karena memberi ruang untuk menolak.", ex: [ { jp: "いっしょに いきませんか。", ro: "issho ni ikimasen ka.", id: "Maukah pergi bersama?" }, { jp: "こうえんで あそびませんか。", ro: "kouen de asobimasen ka.", id: "Maukah bermain di taman?" } ], quiz: { q: "コーヒーを のみ（　）か。(ajakan)", opt: ["ません", "ます", "たい", "ましょう"], ans: "ません", why: "～ませんか = mengajak dengan sopan." } },
  { pat: "～ましょう / ～ましょうか", mean: "mari / menawarkan", desc: "～ましょう = \"mari (kita)\", mengajak setelah ada kesepahaman. ～ましょうか menawarkan bantuan atau menanyakan usul: \"mari saya…? / bagaimana kalau…?\".", ex: [ { jp: "ちょっと やすみましょう。", ro: "chotto yasumimashou.", id: "Mari istirahat sebentar." }, { jp: "いっしょに たべましょう。", ro: "issho ni tabemashou.", id: "Mari makan bersama." }, { jp: "てつだいましょうか。", ro: "tetsudaimashou ka.", id: "Mari saya bantu?" } ], quiz: { q: "いっしょに たべ（　）。(\"mari makan\")", opt: ["ましょう", "ません", "ました", "たい"], ans: "ましょう", why: "～ましょう = \"mari (kita)\"." } },
  { pat: "い-adjective & な-adjective", mean: "dua jenis kata sifat", desc: "い-adjective berakhiran い (たかい, おおきい) dan langsung menerangkan benda (たかい ビル). な-adjective butuh な saat menerangkan benda (きれいな へや). Bentuk lampau/negatif berbeda: い → かった / くない; な → でした / じゃない.", ex: [ { jp: "この ビルは たかいです。", ro: "kono biru wa takai desu.", id: "Gedung ini tinggi." }, { jp: "きれいな はなですね。", ro: "kirei na hana desu ne.", id: "Bunga yang indah, ya." }, { jp: "へやは ひろくないです。", ro: "heya wa hirokunai desu.", id: "Kamarnya tidak luas." } ], quiz: { q: "「たかい」termasuk jenis apa?", opt: ["い-adjective", "な-adjective", "kata kerja", "kata benda"], ans: "い-adjective", why: "Berakhiran い → い-adjective." } },
  { pat: "N が すき / じょうず です", mean: "suka / pandai", desc: "Untuk menyatakan suka, benci, pandai, tidak pandai, objeknya ditandai が (bukan を). Orang yang merasakannya ditandai は: [orang]は [objek]が すきです.", ex: [ { jp: "わたしは おんがくが すきです。", ro: "watashi wa ongaku ga suki desu.", id: "Saya suka musik." }, { jp: "かれは りょうりが じょうずです。", ro: "kare wa ryouri ga jouzu desu.", id: "Dia pandai memasak." }, { jp: "わたしは なっとうが きらいです。", ro: "watashi wa nattou ga kirai desu.", id: "Saya tidak suka natto." } ], quiz: { q: "にほんご（　）すきです。", opt: ["が", "を", "に", "へ"], ans: "が", why: "Objek dari すき/きらい/じょうず ditandai が." } },
  { pat: "N が あります / います", mean: "ada", desc: "Menyatakan keberadaan. あります untuk benda mati & tumbuhan; います untuk makhluk hidup (orang, hewan). Lokasi ditandai に: [tempat]に [benda]が あります.", ex: [ { jp: "つくえの うえに ほんが あります。", ro: "tsukue no ue ni hon ga arimasu.", id: "Ada buku di atas meja." }, { jp: "へやに ねこが います。", ro: "heya ni neko ga imasu.", id: "Ada kucing di kamar." }, { jp: "いま おかねが ありません。", ro: "ima okane ga arimasen.", id: "Sekarang tidak punya uang." } ], quiz: { q: "こうえんに いぬが（　）。", opt: ["います", "あります", "です", "ます"], ans: "います", why: "Makhluk hidup → います, benda → あります." } },
  { pat: "V-たいです", mean: "ingin (melakukan)", desc: "Ambil akar bentuk ます (たべます → たべ) lalu tambah たい untuk menyatakan keinginan pembicara: \"ingin …\". たい berperilaku seperti い-adjective (たくない, たかった). Objek boleh pakai が atau を.", ex: [ { jp: "にほんへ いきたいです。", ro: "nihon e ikitai desu.", id: "Ingin pergi ke Jepang." }, { jp: "みずが のみたいです。", ro: "mizu ga nomitai desu.", id: "Ingin minum air." }, { jp: "なにも たべたくないです。", ro: "nani mo tabetakunai desu.", id: "Tidak ingin makan apa pun." } ], quiz: { q: "みずが のみ（　）です。(\"ingin minum\")", opt: ["たい", "ます", "ました", "ましょう"], ans: "たい", why: "V(akar -masu) + たい = keinginan." } },
  { pat: "V-て ください", mean: "tolong lakukan", desc: "Bentuk て + ください = permintaan atau instruksi sopan: \"tolong lakukan …\". Sering dipakai guru, petunjuk, atau saat meminta bantuan.", ex: [ { jp: "ここに なまえを かいてください。", ro: "koko ni namae o kaite kudasai.", id: "Tolong tulis nama di sini." }, { jp: "ちょっと まってください。", ro: "chotto matte kudasai.", id: "Tolong tunggu sebentar." }, { jp: "もう いちど いってください。", ro: "mou ichido itte kudasai.", id: "Tolong ucapkan sekali lagi." } ], quiz: { q: "ちょっと まって（　）。", opt: ["ください", "います", "ましょう", "たい"], ans: "ください", why: "V-て + ください = permintaan sopan." } },
  { pat: "V-て います", mean: "sedang / kebiasaan", desc: "Menyatakan aksi yang sedang berlangsung (\"sedang …\") atau keadaan/kebiasaan yang berlanjut (pekerjaan, tempat tinggal). Konteks menentukan maknanya.", ex: [ { jp: "いま ごはんを たべています。", ro: "ima gohan o tabete imasu.", id: "Sedang makan sekarang." }, { jp: "ぎんこうで はたらいています。", ro: "ginkou de hataraite imasu.", id: "Bekerja di bank." }, { jp: "とうきょうに すんでいます。", ro: "toukyou ni sunde imasu.", id: "Tinggal di Tokyo." } ], quiz: { q: "かれは いま ほんを よんで（　）。", opt: ["います", "あります", "ください", "たい"], ans: "います", why: "V-て + います = aksi sedang berlangsung." } },
  { pat: "V-ても いいです", mean: "boleh (izin)", desc: "Bentuk て + もいいです memberi atau meminta izin: \"boleh …\". Untuk bertanya izin: ～てもいいですか. Jawaban melarang: いいえ、～てはいけません.", ex: [ { jp: "ここで しゃしんを とってもいいです。", ro: "koko de shashin o totte mo ii desu.", id: "Boleh memotret di sini." }, { jp: "かえってもいいですか。", ro: "kaette mo ii desu ka.", id: "Boleh saya pulang?" } ], quiz: { q: "トイレに いっても（　）ですか。", opt: ["いい", "だめ", "ない", "たい"], ans: "いい", why: "～てもいいです = memberi/minta izin." } },
  { pat: "V-ては いけません", mean: "tidak boleh (larangan)", desc: "Bentuk て + はいけません menyatakan larangan tegas: \"tidak boleh …\". Umum pada aturan dan rambu. Lebih halus: ～ないでください.", ex: [ { jp: "ここで たばこを すってはいけません。", ro: "koko de tabako o sutte wa ikemasen.", id: "Dilarang merokok di sini." }, { jp: "しばふに はいってはいけません。", ro: "shibafu ni haitte wa ikemasen.", id: "Dilarang masuk ke rumput." } ], quiz: { q: "ここに はいっては（　）。", opt: ["いけません", "いいです", "ください", "たい"], ans: "いけません", why: "～てはいけません = larangan." } },
  { pat: "V-なければ なりません", mean: "harus melakukan", desc: "Menyatakan kewajiban/keharusan: \"harus …\". Dibentuk dari bentuk ない: のむ → のまない → のまなければ なりません. Versi santai: ～なきゃ.", ex: [ { jp: "くすりを のまなければなりません。", ro: "kusuri o nomanakereba narimasen.", id: "Harus minum obat." }, { jp: "あした はやく おきなければなりません。", ro: "ashita hayaku okinakereba narimasen.", id: "Besok harus bangun pagi." } ], quiz: { q: "あした はやく おき（　）なりません。", opt: ["なければ", "ても", "たら", "ながら"], ans: "なければ", why: "～なければなりません = kewajiban." } },
  { pat: "A は B より ～", mean: "perbandingan", desc: "\"A は B より [sifat]\" = A lebih [sifat] daripada B. Untuk menegaskan pilihan: \"A のほうが …\". Pertanyaan perbandingan pakai どちらのほうが.", ex: [ { jp: "でんしゃは バスより はやいです。", ro: "densha wa basu yori hayai desu.", id: "Kereta lebih cepat daripada bus." }, { jp: "なつのほうが ふゆより すきです。", ro: "natsu no hou ga fuyu yori suki desu.", id: "Lebih suka musim panas daripada musim dingin." } ], quiz: { q: "とうきょうは おおさか（　）おおきいです。", opt: ["より", "から", "まで", "ほど"], ans: "より", why: "A は B より ～ = A lebih ~ daripada B." } },
  { pat: "V(kamus) ことが できます", mean: "bisa / mampu", desc: "Menyatakan kemampuan atau kemungkinan: \"bisa …\". Gunakan kata kerja bentuk kamus + ことが できます. Bisa juga N + が できます (にほんごが できます).", ex: [ { jp: "にほんごを はなすことができます。", ro: "nihongo o hanasu koto ga dekimasu.", id: "Bisa berbicara bahasa Jepang." }, { jp: "くるまを うんてんすることができます。", ro: "kuruma o unten suru koto ga dekimasu.", id: "Bisa menyetir mobil." }, { jp: "ここで カードが つかえます。", ro: "koko de kaado ga tsukaemasu.", id: "Kartu bisa dipakai di sini." } ], quiz: { q: "かんじを よむこと（　）できます。", opt: ["が", "を", "は", "に"], ans: "が", why: "～ことが できます = menyatakan kemampuan." } },
  { pat: "V-ました / ～ませんでした", mean: "bentuk lampau sopan", desc: "Bentuk lampau sopan: ます → ました (\"sudah/telah\"), ません → ませんでした (\"tidak/belum\", lampau). Menyatakan aksi yang telah terjadi.", ex: [ { jp: "きのう えいがを みました。", ro: "kinou eiga o mimashita.", id: "Kemarin menonton film." }, { jp: "あさごはんを たべませんでした。", ro: "asagohan o tabemasen deshita.", id: "Tidak sarapan." } ], quiz: { q: "きのう としょかんへ いき（　）。(lampau positif)", opt: ["ました", "ます", "ません", "たい"], ans: "ました", why: "～ました = bentuk lampau positif sopan." } },
  { pat: "Kata sifat bentuk lampau", mean: "～かったです / ～でした", desc: "い-adjective lampau: い → かったです (たかい → たかかったです). な-adjective & kata benda: でした (きれい → きれいでした). Negatif lampau: くなかったです / じゃ ありませんでした. Perhatikan いい → よかったです (tidak beraturan).", ex: [ { jp: "りょこうは たのしかったです。", ro: "ryokou wa tanoshikatta desu.", id: "Perjalanannya menyenangkan." }, { jp: "きのうは ひまでした。", ro: "kinou wa hima deshita.", id: "Kemarin senggang." }, { jp: "てんきは よくなかったです。", ro: "tenki wa yokunakatta desu.", id: "Cuacanya tidak bagus." } ], quiz: { q: "えいがは おもしろ（　）です。(lampau: \"menarik\")", opt: ["かった", "くない", "い", "でした"], ans: "かった", why: "い-adjective lampau: い → かったです." } },
  { pat: "～から (sebab)", mean: "karena", desc: "から di akhir klausa menyatakan alasan: \"karena …\". Klausa alasan diletakkan sebelum akibat: [alasan]から、[akibat]. Bisa mengikuti bentuk sopan maupun biasa.", ex: [ { jp: "さむいですから、まどを しめます。", ro: "samui desu kara, mado o shimemasu.", id: "Karena dingin, saya tutup jendela." }, { jp: "じかんが ありませんから、いそぎましょう。", ro: "jikan ga arimasen kara, isogimashou.", id: "Karena tak ada waktu, mari bergegas." } ], quiz: { q: "あたまが いたいです（　）、かえります。(\"karena\")", opt: ["から", "でも", "より", "まで"], ans: "から", why: "～から menyatakan sebab/alasan." } },
  { pat: "～が (tetapi)", mean: "tetapi / namun", desc: "が di tengah kalimat berarti \"tetapi/namun\", menghubungkan dua hal yang berlawanan. Berbeda fungsi dengan partikel subjek が. Sering dipakai untuk melembutkan pembuka pembicaraan.", ex: [ { jp: "この みせは やすいですが、あまり よくないです。", ro: "kono mise wa yasui desu ga, amari yokunai desu.", id: "Toko ini murah, tapi kurang bagus." }, { jp: "にほんごは むずかしいですが、おもしろいです。", ro: "nihongo wa muzukashii desu ga, omoshiroi desu.", id: "Bahasa Jepang sulit, tapi menarik." } ], quiz: { q: "たかいです（　）、おいしいです。(\"tetapi\")", opt: ["が", "から", "と", "の"], ans: "が", why: "～が di tengah kalimat = \"tetapi\"." } },
  { pat: "もう ～ました / まだ ～ていません", mean: "sudah / belum", desc: "もう + ～ました = \"sudah\" (selesai). Menjawab \"belum\": まだです atau まだ ～ていません. Hati-hati: jangan menjawab \"belum\" dengan ～ませんでした (itu berarti \"tidak melakukannya\").", ex: [ { jp: "もう ひるごはんを たべましたか。", ro: "mou hirugohan o tabemashita ka.", id: "Sudah makan siang?" }, { jp: "いいえ、まだです。", ro: "iie, mada desu.", id: "Belum." } ], quiz: { q: "「もう しゅくだいを しましたか。」——「いいえ、（　）です。」", opt: ["まだ", "もう", "よく", "すぐ"], ans: "まだ", why: "Jawaban \"belum\" untuk もう〜ました adalah まだです." } },
  { pat: "N や N (など)", mean: "…, …, dan lain-lain", desc: "や menghubungkan kata benda sebagai contoh (bukan daftar lengkap): \"A や B (など)\" = \"A, B, dan lain-lain\". Berbeda dari と yang menyatakan daftar yang lengkap.", ex: [ { jp: "かばんの なかに ほんや ノートが あります。", ro: "kaban no naka ni hon ya nooto ga arimasu.", id: "Di dalam tas ada buku, catatan, dll." }, { jp: "にちようびは そうじや せんたくを します。", ro: "nichiyoubi wa souji ya sentaku o shimasu.", id: "Hari Minggu bersih-bersih, mencuci, dsb." } ], quiz: { q: "つくえの うえに ペン（　）ほんが あります。(\"dan lain-lain\")", opt: ["や", "を", "へ", "に"], ans: "や", why: "や menyebut contoh benda (daftar tak lengkap)." } },
  { pat: "～とき", mean: "ketika / saat", desc: "とき = \"ketika/saat\". Klausa sebelum とき memakai bentuk biasa (kamus/lampau/adjektiva + な untuk な-adj). Bentuk kamus + とき = sebelum aksi; bentuk た + とき = sesudah aksi.", ex: [ { jp: "ひまなとき、ほんを よみます。", ro: "hima na toki, hon o yomimasu.", id: "Saat senggang, membaca buku." }, { jp: "にほんへ いくとき、かばんを かいました。", ro: "nihon e iku toki, kaban o kaimashita.", id: "Saat (akan) ke Jepang, membeli tas." } ], quiz: { q: "わかい（　）、よく およぎました。(\"ketika muda\")", opt: ["とき", "から", "まで", "より"], ans: "とき", why: "～とき = \"ketika/saat\"." } },
  { pat: "疑問詞 (kata tanya)", mean: "なに・だれ・どこ・いつ・いくら", desc: "Kata tanya menggantikan bagian yang ditanyakan pada posisi yang sama, lalu tambahkan か. なに/なん = apa, だれ = siapa, どこ = di mana, いつ = kapan, いくら = berapa (harga), どうやって = bagaimana caranya.", ex: [ { jp: "これは なんですか。", ro: "kore wa nan desu ka.", id: "Ini apa?" }, { jp: "たんじょうびは いつですか。", ro: "tanjoubi wa itsu desu ka.", id: "Kapan ulang tahunmu?" }, { jp: "えきまで どうやって いきますか。", ro: "eki made dou yatte ikimasu ka.", id: "Bagaimana cara ke stasiun?" } ], quiz: { q: "「（　）が きましたか。」——「たなかさんです。」", opt: ["だれ", "どこ", "いつ", "なに"], ans: "だれ", why: "Jawabannya orang → kata tanya \"siapa\" = だれ." } },
];

/* =========================== PERSISTENSI =========================== */
const PKEY = "minna-n5-progress";
const emptyProgress = { vocab: {}, kanji: {}, best: 0, srs: {} };

function loadProgress() {
  try {
    const raw = localStorage.getItem(PKEY);
    if (raw) return { ...emptyProgress, ...JSON.parse(raw) };
  } catch (e) { /* belum ada / storage tak tersedia */ }
  return { ...emptyProgress };
}
function saveProgress(p) {
  try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) { /* diamkan */ }
}

/* SRS Leitner: interval per kotak (ms) */
const DAY = 86400000;
const SRS_INTERVAL = { 1: 10 * 60000, 2: DAY, 3: 3 * DAY, 4: 7 * DAY, 5: 21 * DAY };
function scheduleNext(entry, correct) {
  const cur = entry?.box || 1;
  const box = correct ? Math.min(5, cur + 1) : 1;
  return { box, due: Date.now() + SRS_INTERVAL[box] };
}

/* =========================== UI KECIL =========================== */
function Hanko({ size = 40, label = "N5" }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", border: `2px solid ${C.shu}`, color: C.shu,
      display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY,
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0 }}>{label}</span>
  );
}

function SpeakBtn({ text, size = 34 }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); speak(text); }} aria-label="Dengarkan pelafalan" className="ui-btn"
      style={{ width: size, height: size, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.paper,
        cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 9 3 15 8 15 13 20 13 4 8 9 3 9" fill={C.indigo} stroke={C.indigo} />
        <path d="M16 8.5a4 4 0 0 1 0 7" /><path d="M18.5 6a7 7 0 0 1 0 12" />
      </svg>
    </button>
  );
}

function GenkoCell({ children, size = 70, active = false, onClick, known = false }) {
  return (
    <button onClick={onClick} className={onClick ? "genko-btn" : ""}
      style={{ width: size, height: size, background: active ? "#fff" : C.paper,
        border: `1.5px solid ${active ? C.indigo : C.line}`, position: "relative",
        cursor: onClick ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "border-color .15s, transform .1s", borderRadius: 2 }}>
      <span style={{ position: "absolute", left: "50%", top: 6, bottom: 6, width: 1, background: C.lineSoft, transform: "translateX(-50%)" }} />
      <span style={{ position: "absolute", top: "50%", left: 6, right: 6, height: 1, background: C.lineSoft, transform: "translateY(-50%)" }} />
      {known && <span style={{ position: "absolute", top: 4, right: 6, color: C.shu, fontSize: 13, lineHeight: 1 }}>◦</span>}
      <span style={{ position: "relative", fontFamily: FONT_DISPLAY, color: C.ink }}>{children}</span>
    </button>
  );
}

function SectionHead({ jp, title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.shu }}>{jp}</span>
        <span style={{ width: 1, height: 26, background: C.line }} />
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.ink, margin: 0 }}>{title}</h2>
      </div>
      {sub && <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2, margin: "8px 0 0" }}>{sub}</p>}
    </div>
  );
}

function Btn({ children, onClick, variant = "outline", big, disabled }) {
  const base = { fontFamily: FONT_BODY, fontSize: big ? 15 : 13.5, padding: big ? "13px 30px" : "10px 18px",
    borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer", transition: "all .13s", letterSpacing: 0.3, opacity: disabled ? 0.5 : 1 };
  const styles = {
    solid: { ...base, background: C.indigo, color: C.paper, border: `1px solid ${C.indigo}` },
    outline: { ...base, background: "transparent", color: C.indigo, border: `1px solid ${C.line}` },
    muted: { ...base, background: C.paper2, color: C.indigo2, border: `1px solid ${C.line}` },
    ghost: { ...base, background: "transparent", color: C.indigo2, border: "1px solid transparent" },
  };
  return <button onClick={onClick} disabled={disabled} className="ui-btn" style={styles[variant]}>{children}</button>;
}

function Row({ label, val }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "6px 0", borderBottom: `1px solid ${C.lineSoft}` }}>
      <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.indigo2, width: 78, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.ink }}>{val}</span>
    </div>
  );
}

/* =========================== BERANDA =========================== */
function Beranda({ progress, totals, dueCount, go }) {
  const vL = Object.keys(progress.vocab).length;
  const kL = Object.keys(progress.kanji).length;
  const learned = vL + kL;
  const grand = totals.vocab + totals.kanji;
  const cells = 40;
  const filled = Math.round((learned / grand) * cells);
  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: FONT_BODY, color: C.indigo2, letterSpacing: 3, fontSize: 12, textTransform: "uppercase", marginBottom: 6 }}>みんなの日本語 · N5</div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 42, lineHeight: 1.05, color: C.ink, margin: 0 }}>Belajar & Latihan<br />Bahasa Jepang</h1>
      </div>
      <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 4, padding: "22px 24px", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo, letterSpacing: 1 }}>PROGRES BELAJAR</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.ink }}>{learned} / {grand} <span style={{ color: C.indigo2, fontSize: 12 }}>dikuasai</span></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cells}, 1fr)`, gap: 3 }}>
          {Array.from({ length: cells }).map((_, i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: 1, background: i < filled ? C.shu : "transparent", border: `1px solid ${i < filled ? C.shu : C.line}` }} />
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
        <StatCard num={vL} den={totals.vocab} label="Kosakata" onClick={() => go("kosakata")} cta="Pelajari →" />
        <StatCard num={kL} den={totals.kanji} label="Kanji" onClick={() => go("kanji")} cta="Pelajari →" />
        <StatCard num={dueCount} den={grand} label="Kartu perlu diulang" onClick={() => go("srs")} cta="Ulangi →" accent />
        <StatCard num={progress.best} den={100} label="Skor terbaik" onClick={() => go("latihan")} cta="Latihan →" />
      </div>
    </div>
  );
}
function StatCard({ num, den, label, onClick, cta, accent }) {
  return (
    <button onClick={onClick} className="card-btn" style={{ textAlign: "left", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 4, padding: "16px 18px", cursor: "pointer", transition: "border-color .15s, transform .1s" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: accent ? C.shu : C.indigo, lineHeight: 1 }}>{num}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2 }}>/ {den}</span>
      </div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.ink, marginTop: 8, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: accent ? C.shu : C.indigo }}>{cta}</div>
    </button>
  );
}

/* =========================== KOSAKATA =========================== */
function Kosakata({ progress, mark }) {
  const [lesson, setLesson] = useState(LESSONS[0]);
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const words = lesson.words;
  const w = words[idx];
  const wid = `${lesson.id}-${idx}`;
  const known = !!progress.vocab[wid];
  const goTo = (n) => { setIdx(n); setFlip(false); };
  return (
    <div>
      <SectionHead jp="言葉" title="Kosakata" sub="Bab 1–25. Klik kartu untuk arti, ikon 🔊 untuk pelafalan." />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {LESSONS.map((l) => (
          <button key={l.id} onClick={() => { setLesson(l); goTo(0); }}
            style={{ fontFamily: FONT_BODY, fontSize: 12.5, padding: "6px 11px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${lesson.id === l.id ? C.indigo : C.line}`, background: lesson.id === l.id ? C.indigo : "transparent",
              color: lesson.id === l.id ? C.paper : C.indigo, transition: "all .15s" }}>{l.id}</button>
        ))}
      </div>
      <div style={{ fontFamily: FONT_BODY, color: C.indigo2, fontSize: 13, marginBottom: 16 }}>Bab {lesson.id} · {lesson.title} · {idx + 1}/{words.length}</div>
      <div onClick={() => setFlip(!flip)} className="card-btn"
        style={{ background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 6, minHeight: 210, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 28, position: "relative", marginBottom: 16 }}>
        {known && <span style={{ position: "absolute", top: 12, right: 14 }}><Hanko size={30} label="済" /></span>}
        <span style={{ position: "absolute", top: 12, left: 14 }}><SpeakBtn text={w.jp} /></span>
        {!flip ? (
          <>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 50, color: C.ink }}>{w.jp}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2, marginTop: 12, letterSpacing: 1 }}>ketuk untuk arti</div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: C.shu, letterSpacing: 1, marginBottom: 6 }}>{w.romaji}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 32, color: C.indigo }}>{w.id}</div>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => goTo((idx - 1 + words.length) % words.length)}>‹ Sebelumnya</Btn>
        <Btn onClick={() => goTo((idx + 1) % words.length)}>Berikutnya ›</Btn>
        <div style={{ flex: 1 }} />
        <Btn onClick={() => mark("vocab", wid, !known)} variant={known ? "muted" : "solid"}>{known ? "Batal tandai" : "✓ Sudah hafal"}</Btn>
      </div>
    </div>
  );
}

/* =========================== KANJI =========================== */
function KanjiTab({ progress, mark }) {
  const [sel, setSel] = useState(null);
  return (
    <div>
      <SectionHead jp="漢字" title="Kanji N5" sub={`${KANJI.length} kanji inti. Klik sel untuk cara baca, contoh, & audio.`} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {KANJI.map((k) => (
          <GenkoCell key={k.k} size={66} active={sel?.k === k.k} known={!!progress.kanji[k.k]} onClick={() => setSel(k)}>
            <span style={{ fontSize: 32 }}>{k.k}</span>
          </GenkoCell>
        ))}
      </div>
      {sel && (
        <div style={{ marginTop: 22, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 6, padding: 22, display: "flex", gap: 22, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <GenkoCell size={124}><span style={{ fontSize: 64 }}>{sel.k}</span></GenkoCell>
            <SpeakBtn text={sel.k} size={38} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.ink, marginBottom: 12 }}>{sel.id}</div>
            <Row label="On'yomi" val={sel.on} />
            <Row label="Kun'yomi" val={sel.kun} />
            <Row label="Contoh" val={sel.ex} />
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <Btn onClick={() => mark("kanji", sel.k, !progress.kanji[sel.k])} variant={progress.kanji[sel.k] ? "muted" : "solid"}>{progress.kanji[sel.k] ? "Batal tandai" : "✓ Sudah hafal"}</Btn>
              <Btn onClick={() => setSel(null)} variant="ghost">Tutup</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================== MENULIS (tracing canvas) =========================== */
function CanvasBoard({ resetKey }) {
  const ref = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const size = c.clientWidth;
    c.width = size * dpr; c.height = size * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 11; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = C.ink;
    ctxRef.current = ctx;
  }, [resetKey]);
  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const down = (e) => { e.preventDefault(); drawing.current = true; const { x, y } = pos(e); const ctx = ctxRef.current; ctx.beginPath(); ctx.moveTo(x, y); };
  const move = (e) => { if (!drawing.current) return; e.preventDefault(); const { x, y } = pos(e); const ctx = ctxRef.current; ctx.lineTo(x, y); ctx.stroke(); };
  const up = () => { drawing.current = false; };
  return (
    <canvas ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }} />
  );
}

function TulisTab({ progress, mark }) {
  const [idx, setIdx] = useState(0);
  const [guide, setGuide] = useState(true);
  const [reset, setReset] = useState(0);
  const k = KANJI[idx];
  const go = (n) => { setIdx((n + KANJI.length) % KANJI.length); setReset((r) => r + 1); };
  return (
    <div>
      <SectionHead jp="書き" title="Latihan Menulis" sub="Telusuri (jiplak) bentuk kanji di dalam kotak kertas naskah dengan mouse atau jari." />
      <div style={{ display: "flex", gap: 26, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          {/* kotak genkouyoushi: guide (kanji samar) + canvas di atas */}
          <div style={{ position: "relative", width: 260, height: 260, background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 3 }}>
            <span style={{ position: "absolute", left: "50%", top: 10, bottom: 10, width: 1, borderLeft: `1px dashed ${C.line}`, transform: "translateX(-50%)" }} />
            <span style={{ position: "absolute", top: "50%", left: 10, right: 10, height: 1, borderTop: `1px dashed ${C.line}`, transform: "translateY(-50%)" }} />
            {guide && (
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: 190, color: "rgba(28,26,36,0.12)", userSelect: "none", pointerEvents: "none" }}>{k.k}</span>
            )}
            <CanvasBoard resetKey={`${k.k}-${reset}`} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Btn onClick={() => setReset((r) => r + 1)}>Hapus</Btn>
            <Btn onClick={() => setGuide(!guide)} variant={guide ? "muted" : "outline"}>{guide ? "Panduan: nyala" : "Panduan: mati"}</Btn>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 30, color: C.ink }}>{k.k}</div>
            <SpeakBtn text={k.k} />
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.indigo, margin: "6px 0 14px" }}>{k.id}</div>
          <Row label="On'yomi" val={k.on} />
          <Row label="Kun'yomi" val={k.kun} />
          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.indigo2, marginTop: 14, lineHeight: 1.6 }}>
            {idx + 1} dari {KANJI.length} kanji · nyalakan panduan untuk menjiplak, matikan untuk menulis dari ingatan.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Btn onClick={() => go(idx - 1)}>‹ Kanji sebelumnya</Btn>
            <Btn onClick={() => go(idx + 1)} variant="solid">Kanji berikutnya ›</Btn>
          </div>
          <div style={{ marginTop: 10 }}>
            <Btn onClick={() => mark("kanji", k.k, !progress.kanji[k.k])} variant={progress.kanji[k.k] ? "muted" : "outline"}>{progress.kanji[k.k] ? "✓ Sudah dikuasai" : "Tandai sudah bisa"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================== TATA BAHASA =========================== */
function GrammarTab() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <SectionHead jp="文法" title="Tata Bahasa N5" sub={`${GRAMMAR.length} pola inti — penjelasan lengkap + contoh kalimat. Klik untuk membuka, latih di tab Latihan.`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {GRAMMAR.map((g, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 5, background: isOpen ? "#fff" : C.paper, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? -1 : i)} className="ui-btn"
                style={{ width: "100%", textAlign: "left", padding: "13px 16px", background: "transparent", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.ink }}>{g.pat}</span>
                <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.indigo2, textAlign: "right", flexShrink: 0 }}>{g.mean}</span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 16px 18px" }}>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 13.5, color: C.ink, lineHeight: 1.75, margin: "0 0 16px" }}>{g.desc}</p>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.indigo2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Contoh kalimat</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {g.ex.map((e, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper2, borderRadius: 4, padding: "10px 12px" }}>
                        <SpeakBtn text={e.jp} />
                        <div>
                          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: C.ink }}>{e.jp}</div>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.shu, margin: "2px 0" }}>{e.ro}</div>
                          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo }}>{e.id}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================== LATIHAN (kuis) =========================== */
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

function buildQuiz(cat, count) {
  const vPool = LESSONS.flatMap((l) => l.words.map((w) => ({ prompt: w.jp, sub: "Apa artinya?", answer: w.id, speak: w.jp })));
  const kPool = KANJI.map((k) => ({ prompt: k.k, sub: "Apa artinya?", answer: k.id, speak: k.k }));
  const gPool = GRAMMAR.map((g) => ({ prompt: g.quiz.q, sub: "Lengkapi bagian yang kosong", answer: g.quiz.ans, options: shuffle([g.quiz.ans, ...g.quiz.opt.filter((o) => o !== g.quiz.ans)]).slice(0, 4), why: g.quiz.why }));
  let pool;
  if (cat === "kosakata") pool = vPool;
  else if (cat === "kanji") pool = kPool;
  else if (cat === "grammar") pool = gPool;
  else pool = [...vPool, ...kPool, ...gPool];

  const meaningPool = [...vPool, ...kPool].map((x) => x.answer);
  const n = Math.min(count || 10, pool.length);
  const picks = shuffle(pool).slice(0, n);
  return picks.map((item) => {
    if (item.options) return item;
    const distract = shuffle(meaningPool.filter((m) => m !== item.answer)).slice(0, 3);
    return { ...item, options: shuffle([item.answer, ...distract]) };
  });
}
function Latihan({ progress, setBest }) {
  const [cat, setCat] = useState(null);
  const [count, setCount] = useState(10);
  const [customCount, setCustomCount] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const start = (c, n) => { setCat(c); setQuiz(buildQuiz(c, n)); setI(0); setPicked(null); setScore(0); setDone(false); };
  const choose = (opt) => { if (picked) return; setPicked(opt); if (opt === quiz[i].answer) setScore((s) => s + 1); };
  const next = () => {
    if (i + 1 >= quiz.length) { const pct = Math.round((score / quiz.length) * 100); setDone(true); if (pct > progress.best) setBest(pct); }
    else { setI(i + 1); setPicked(null); }
  };

  if (!quiz) {
    const cats = [["campur", "Campur semua"], ["kosakata", "Kosakata"], ["kanji", "Kanji"], ["grammar", "Tata Bahasa"]];
    const counts = [5, 10, 15, 20];
    return (
      <div>
        <SectionHead jp="練習" title="Latihan" sub="Pilih jumlah soal & kategori. Soal selalu diacak setiap sesi." />
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.indigo2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Jumlah soal</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {counts.map((n) => (
              <button key={n} onClick={() => { setCount(n); setCustomCount(""); }}
                style={{ fontFamily: FONT_BODY, fontSize: 14, minWidth: 52, padding: "9px 16px", borderRadius: 999, cursor: "pointer",
                  border: `1px solid ${count === n && customCount === "" ? C.indigo : C.line}`, background: count === n && customCount === "" ? C.indigo : "transparent",
                  color: count === n && customCount === "" ? C.paper : C.indigo, transition: "all .15s" }}>{n}</button>
            ))}
            <input
              type="number"
              min={1}
              inputMode="numeric"
              placeholder="Custom"
              value={customCount}
              onChange={(e) => {
                const v = e.target.value;
                setCustomCount(v);
                const num = parseInt(v, 10);
                if (num > 0) setCount(num);
              }}
              style={{ fontFamily: FONT_BODY, fontSize: 14, width: 70, padding: "9px 12px", borderRadius: 999, textAlign: "center",
                border: `1px solid ${customCount !== "" ? C.indigo : C.line}`, background: "transparent", color: C.indigo, outline: "none" }}
            />
          </div>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.indigo2, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Kategori</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12 }}>
          {cats.map(([c, label]) => (
            <button key={c} onClick={() => start(c, count)} className="card-btn"
              style={{ padding: "22px 18px", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 5, cursor: "pointer", textAlign: "left", transition: "all .15s" }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.ink }}>{label}</div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.shu, marginTop: 8 }}>{count} soal →</div>
            </button>
          ))}
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2, marginTop: 20 }}>Skor terbaik: {progress.best}%</div>
      </div>
    );
  }
  if (done) {
    const pct = Math.round((score / quiz.length) * 100);
    const msg = pct >= 80 ? "すごい！ Bagus sekali." : pct >= 50 ? "いいね！ Terus berlatih." : "がんばって！ Ulangi lagi ya.";
    return (
      <div>
        <SectionHead jp="結果" title="Hasil" sub="" />
        <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 6, padding: 40, textAlign: "center" }}>
          <Hanko size={62} label="済" />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 46, color: C.indigo, marginTop: 16 }}>{score} / {quiz.length}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 15, color: C.ink, margin: "8px 0 24px" }}>{msg}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => start(cat, quiz.length)} variant="solid">Coba lagi</Btn>
            <Btn onClick={() => setQuiz(null)} variant="outline">Ganti kategori</Btn>
          </div>
        </div>
      </div>
    );
  }
  const cur = quiz[i];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2 }}>Soal {i + 1} / {quiz.length}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.shu }}>Skor {score}</span>
      </div>
      <div style={{ background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 6, padding: "30px 20px", textAlign: "center", position: "relative" }}>
        {cur.speak && <span style={{ position: "absolute", top: 12, right: 14 }}><SpeakBtn text={cur.speak} /></span>}
        <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.indigo2, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{cur.sub}</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: cur.prompt.length > 8 ? 26 : 50, color: C.ink, lineHeight: 1.4 }}>{cur.prompt}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        {cur.options.map((opt) => {
          let bg = C.paper, bd = C.line, col = C.ink;
          if (picked) {
            if (opt === cur.answer) { bg = "rgba(46,125,83,0.12)"; bd = C.good; col = C.good; }
            else if (opt === picked) { bg = "rgba(193,53,42,0.10)"; bd = C.shu; col = C.shu; }
          }
          return (
            <button key={opt} onClick={() => choose(opt)} disabled={!!picked} className="opt-btn"
              style={{ fontFamily: FONT_DISPLAY, fontSize: 17, textAlign: "left", padding: "15px 18px", background: bg, border: `1.5px solid ${bd}`, color: col, borderRadius: 4, cursor: picked ? "default" : "pointer", transition: "all .12s" }}>{opt}</button>
          );
        })}
      </div>
      {picked && cur.why && (
        <div style={{ marginTop: 12, fontFamily: FONT_BODY, fontSize: 13, color: C.indigo, background: C.paper2, borderRadius: 4, padding: "10px 14px" }}>{cur.why}</div>
      )}
      {picked && <div style={{ marginTop: 16, textAlign: "right" }}><Btn onClick={next} variant="solid">{i + 1 >= quiz.length ? "Lihat hasil" : "Lanjut ›"}</Btn></div>}
    </div>
  );
}

/* =========================== SRS (Ulangi) =========================== */
function SRSTab({ items, progress, reviewItem }) {
  const [queue, setQueue] = useState(null);
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const dueList = useMemo(() => {
    const now = Date.now();
    return items.filter((it) => { const e = progress.srs[it.id]; return !e || e.due <= now; });
  }, [items, progress.srs]);

  const start = () => { setQueue(shuffle(dueList).slice(0, 20)); setI(0); setFlip(false); setReviewed(0); };
  const answer = (correct) => {
    const it = queue[i];
    reviewItem(it.id, correct);
    setReviewed((r) => r + 1);
    if (i + 1 >= queue.length) setQueue("done");
    else { setI(i + 1); setFlip(false); }
  };

  if (queue === null) {
    return (
      <div>
        <SectionHead jp="復習" title="Ulangi (SRS)" sub="Sistem pengulangan berjarak: kartu yang sering salah muncul lebih sering." />
        <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 6, padding: 34, textAlign: "center" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, color: C.shu }}>{dueList.length}</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2, margin: "6px 0 20px" }}>kartu siap diulang hari ini (kosakata + kanji)</div>
          {dueList.length > 0
            ? <Btn onClick={start} variant="solid" big>Mulai sesi ulang</Btn>
            : <div style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.indigo }}>Semua sudah diulang. Kembali lagi nanti 🌱</div>}
        </div>
      </div>
    );
  }
  if (queue === "done") {
    return (
      <div>
        <SectionHead jp="復習" title="Sesi selesai" sub="" />
        <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 6, padding: 40, textAlign: "center" }}>
          <Hanko size={60} label="済" />
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.ink, margin: "16px 0 6px" }}>{reviewed} kartu diulang</div>
          <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2, marginBottom: 22 }}>Kartu yang kamu tandai "belum" akan muncul lagi lebih cepat.</div>
          <Btn onClick={() => setQueue(null)} variant="solid">Selesai</Btn>
        </div>
      </div>
    );
  }
  const it = queue[i];
  const box = progress.srs[it.id]?.box || 1;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2 }}>{i + 1} / {queue.length}</span>
        <span style={{ fontFamily: FONT_BODY, fontSize: 12, color: C.shu }}>Kotak {box}/5 · {it.kind}</span>
      </div>
      <div onClick={() => setFlip(true)} className="card-btn"
        style={{ background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 6, minHeight: 210, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 28, position: "relative" }}>
        <span style={{ position: "absolute", top: 12, left: 14 }}><SpeakBtn text={it.jp} /></span>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, color: C.ink }}>{it.jp}</div>
        {flip
          ? <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: C.indigo, marginTop: 14 }}>{it.answer}</div>
          : <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2, marginTop: 12 }}>ketuk untuk lihat arti</div>}
      </div>
      {flip
        ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            <Btn onClick={() => answer(false)} variant="outline"><span style={{ color: C.shu }}>✕ Belum tahu</span></Btn>
            <Btn onClick={() => answer(true)} variant="solid">✓ Sudah tahu</Btn>
          </div>
        : <div style={{ marginTop: 16, textAlign: "center", fontFamily: FONT_BODY, fontSize: 13, color: C.indigo2 }}>Coba ingat artinya, lalu buka kartu.</div>}
    </div>
  );
}

/* =========================== APP =========================== */
const TABS = [
  { id: "beranda", label: "Beranda", jp: "家" },
  { id: "kosakata", label: "Kosakata", jp: "言葉" },
  { id: "kanji", label: "Kanji", jp: "漢字" },
  { id: "tulis", label: "Menulis", jp: "書" },
  { id: "grammar", label: "Tata Bahasa", jp: "文" },
  { id: "latihan", label: "Latihan", jp: "練" },
  { id: "srs", label: "Ulangi", jp: "復" },
];

export default function App() {
  const [tab, setTab] = useState("beranda");
  const [progress, setProgress] = useState(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.getVoices(); // warm up voices
    setProgress(loadProgress());
    setReady(true);
  }, []);

  const persist = useCallback((updater) => {
    setProgress((prev) => { const n = typeof updater === "function" ? updater(prev) : updater; saveProgress(n); return n; });
  }, []);
  const mark = useCallback((type, id, on) => {
    persist((p) => { const g = { ...p[type] }; if (on) g[id] = 1; else delete g[id]; return { ...p, [type]: g }; });
  }, [persist]);
  const setBest = useCallback((s) => persist((p) => ({ ...p, best: s })), [persist]);
  const reviewItem = useCallback((id, correct) => {
    persist((p) => ({ ...p, srs: { ...p.srs, [id]: scheduleNext(p.srs[id], correct) } }));
  }, [persist]);

  const items = useMemo(() => {
    const v = LESSONS.flatMap((l) => l.words.map((w, idx) => ({ id: `v:${l.id}-${idx}`, jp: w.jp, answer: w.id, kind: "kata" })));
    const k = KANJI.map((kj) => ({ id: `k:${kj.k}`, jp: kj.k, answer: kj.id, kind: "kanji" }));
    return [...v, ...k];
  }, []);
  const totals = useMemo(() => ({ vocab: LESSONS.reduce((n, l) => n + l.words.length, 0), kanji: KANJI.length }), []);
  const dueCount = useMemo(() => { const now = Date.now(); return items.filter((it) => { const e = progress.srs[it.id]; return !e || e.due <= now; }).length; }, [items, progress.srs]);

  return (
    <div style={{ background: C.paper, minHeight: "100vh", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        .genko-btn:hover { transform: translateY(-2px); border-color: ${C.indigo} !important; }
        .card-btn:hover { border-color: ${C.indigo} !important; transform: translateY(-1px); }
        .ui-btn:hover { filter: brightness(0.96); }
        .opt-btn:not(:disabled):hover { border-color: ${C.indigo} !important; }
        button:focus-visible { outline: 2px solid ${C.shu}; outline-offset: 2px; }
        .navscroll::-webkit-scrollbar { height: 0; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <header style={{ borderBottom: `1px solid ${C.line}`, background: C.paper, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "15px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <Hanko />
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, lineHeight: 1.1, color: C.ink }}>みんなの日本語</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.indigo2, letterSpacing: 1.5 }}>BELAJAR N5 · KOSAKATA · KANJI · TATA BAHASA</div>
          </div>
        </div>
        <nav className="navscroll" style={{ maxWidth: 880, margin: "0 auto", padding: "0 20px", display: "flex", gap: 2, overflowX: "auto" }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ fontFamily: FONT_BODY, fontSize: 13.5, padding: "11px 13px", background: "transparent", cursor: "pointer", border: "none",
                borderBottom: `2px solid ${tab === t.id ? C.shu : "transparent"}`, color: tab === t.id ? C.ink : C.indigo2,
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", flexShrink: 0, transition: "color .15s" }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: tab === t.id ? C.shu : C.indigo2 }}>{t.jp}</span>{t.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px 70px" }}>
        {!ready ? (
          <div style={{ fontFamily: FONT_BODY, color: C.indigo2, padding: 40, textAlign: "center" }}>読み込み中… memuat progres…</div>
        ) : (
          <>
            {tab === "beranda" && <Beranda progress={progress} totals={totals} dueCount={dueCount} go={setTab} />}
            {tab === "kosakata" && <Kosakata progress={progress} mark={mark} />}
            {tab === "kanji" && <KanjiTab progress={progress} mark={mark} />}
            {tab === "tulis" && <TulisTab progress={progress} mark={mark} />}
            {tab === "grammar" && <GrammarTab />}
            {tab === "latihan" && <Latihan progress={progress} setBest={setBest} />}
            {tab === "srs" && <SRSTab items={items} progress={progress} reviewItem={reviewItem} />}
          </>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, maxWidth: 880, margin: "0 auto", padding: "18px 20px" }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: C.indigo2 }}>MVP · berbasis Minna no Nihongo · progres & jadwal ulang tersimpan otomatis di perangkat ini</div>
      </footer>
    </div>
  );
}
