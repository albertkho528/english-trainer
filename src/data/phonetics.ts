// British English (Received Pronunciation / modern Standard Southern British) sound system.
// Example words: [word, IPA]. IPA follows Oxford/Cambridge dictionary conventions.

export type Sym = {
  sym: string;
  kind: 'short vowel' | 'long vowel' | 'diphthong' | 'consonant' | 'weak vowel' | 'mark';
  name: string;
  key: string; // short "as in" keyword
  how: string; // how to make the sound
  tip: string; // common mistakes (esp. for Indonesian speakers)
  spell: string; // common spellings
  ex: [string, string][];
};

export const SYMBOLS: Sym[] = [
  // ---------- easy consonants ----------
  { sym: 'p', kind: 'consonant', name: 'voiceless p', key: 'pen', how: 'Close both lips, build up air, then release with a small puff of air. No voice (no throat buzz).', tip: 'At the start of a word English /p/ has a puff of air (aspiration) — hold a tissue in front of your mouth for "pen" and it should move.', spell: 'p, pp', ex: [['pen', 'pen'], ['map', 'mæp'], ['happy', 'ˈhæpi'], ['paper', 'ˈpeɪpə'], ['top', 'tɒp']] },
  { sym: 'b', kind: 'consonant', name: 'voiced b', key: 'bed', how: 'Same lip position as /p/, but your voice is on: your throat vibrates.', tip: 'Keep /b/ voiced at the end of words: "cab" /kæb/ is not "cap" /kæp/. Indonesian tends to make final b sound like p.', spell: 'b, bb', ex: [['bed', 'bed'], ['cab', 'kæb'], ['rubber', 'ˈrʌbə'], ['big', 'bɪɡ'], ['job', 'dʒɒb']] },
  { sym: 't', kind: 'consonant', name: 'voiceless t', key: 'top', how: 'Tip of the tongue on the ridge just behind your top teeth, then release with a puff of air. No voice.', tip: 'English /t/ is made on the gum ridge, not on the teeth like Indonesian "t". Add the puff of air at the start of words.', spell: 't, tt, -ed (after voiceless sounds)', ex: [['top', 'tɒp'], ['sit', 'sɪt'], ['better', 'ˈbetə'], ['ten', 'ten'], ['walked', 'wɔːkt']] },
  { sym: 'd', kind: 'consonant', name: 'voiced d', key: 'dog', how: 'Same tongue position as /t/, but voice on.', tip: 'Don\'t turn a final /d/ into /t/: "bed" /bed/ vs "bet" /bet/. The vowel before /d/ is also slightly longer.', spell: 'd, dd, -ed (after voiced sounds)', ex: [['dog', 'dɒɡ'], ['bed', 'bed'], ['ladder', 'ˈlædə'], ['did', 'dɪd'], ['played', 'pleɪd']] },
  { sym: 'k', kind: 'consonant', name: 'voiceless k', key: 'cat', how: 'Back of the tongue touches the soft palate (back of the roof of the mouth), then release with a puff of air.', tip: 'Pronounce final /k/ fully — Indonesian often swallows final k into a glottal stop ("bapak").', spell: 'c, k, ck, ch, qu (/kw/)', ex: [['cat', 'kæt'], ['back', 'bæk'], ['school', 'skuːl'], ['kick', 'kɪk'], ['chemistry', 'ˈkemɪstri']] },
  { sym: 'ɡ', kind: 'consonant', name: 'voiced g', key: 'go', how: 'Same tongue position as /k/, but voice on. Always a "hard g" — never the j sound.', tip: 'The IPA symbol is a single-storey ɡ. Keep it voiced at the end: "bag" /bæɡ/ vs "back" /bæk/.', spell: 'g, gg, gu', ex: [['go', 'ɡəʊ'], ['bag', 'bæɡ'], ['bigger', 'ˈbɪɡə'], ['egg', 'eɡ'], ['guess', 'ɡes']] },
  { sym: 'f', kind: 'consonant', name: 'voiceless f', key: 'fish', how: 'Top teeth gently touch the lower lip; blow air through. No voice.', tip: 'Spelling "ph" and sometimes "gh" also make /f/: phone, laugh.', spell: 'f, ff, ph, gh', ex: [['fish', 'fɪʃ'], ['off', 'ɒf'], ['phone', 'fəʊn'], ['laugh', 'lɑːf'], ['coffee', 'ˈkɒfi']] },
  { sym: 'v', kind: 'consonant', name: 'voiced v', key: 'van', how: 'Same as /f/ (teeth on lower lip) but with voice — you should feel a buzz on your lip.', tip: 'Very common Indonesian mistake: saying /f/ for /v/. "very" is /ˈveri/, not "feri". Feel the buzz!', spell: 'v, (f in "of")', ex: [['van', 'væn'], ['very', 'ˈveri'], ['love', 'lʌv'], ['of', 'ɒv'], ['five', 'faɪv']] },
  { sym: 's', kind: 'consonant', name: 'voiceless s', key: 'sun', how: 'Tongue tip near the gum ridge; push air through a narrow groove — a hissing sound, no voice.', tip: 'Don\'t confuse with /ʃ/ ("sh"). "see" /siː/ vs "she" /ʃiː/.', spell: 's, ss, c (before e, i, y)', ex: [['sun', 'sʌn'], ['bus', 'bʌs'], ['city', 'ˈsɪti'], ['class', 'klɑːs'], ['science', 'ˈsaɪəns']] },
  { sym: 'z', kind: 'consonant', name: 'voiced z', key: 'zoo', how: 'Same as /s/ but with voice — a buzzing bee sound.', tip: 'Many English "s" letters are actually /z/: "is" /ɪz/, "dogs" /dɒɡz/, "easy" /ˈiːzi/. Indonesian speakers often devoice it to /s/.', spell: 'z, s (between vowels, plural after voiced sounds)', ex: [['zoo', 'zuː'], ['is', 'ɪz'], ['dogs', 'dɒɡz'], ['easy', 'ˈiːzi'], ['music', 'ˈmjuːzɪk']] },
  { sym: 'h', kind: 'consonant', name: 'h', key: 'hat', how: 'Just breathe out through an open mouth before the vowel.', tip: 'Some words have a silent h: hour /ˈaʊə/, honest /ˈɒnɪst/.', spell: 'h, wh (who)', ex: [['hat', 'hæt'], ['who', 'huː'], ['behind', 'bɪˈhaɪnd'], ['help', 'help'], ['hope', 'həʊp']] },
  { sym: 'm', kind: 'consonant', name: 'm', key: 'man', how: 'Close your lips and let the sound come through your nose.', tip: 'Usually easy for Indonesian speakers.', spell: 'm, mm, mb (climb)', ex: [['man', 'mæn'], ['summer', 'ˈsʌmə'], ['climb', 'klaɪm'], ['time', 'taɪm'], ['moment', 'ˈməʊmənt']] },
  { sym: 'n', kind: 'consonant', name: 'n', key: 'no', how: 'Tongue tip on the gum ridge; sound comes out of the nose.', tip: 'Sometimes spelled "kn": know /nəʊ/.', spell: 'n, nn, kn', ex: [['no', 'nəʊ'], ['sun', 'sʌn'], ['know', 'nəʊ'], ['dinner', 'ˈdɪnə'], ['ten', 'ten']] },
  { sym: 'l', kind: 'consonant', name: 'l', key: 'leg', how: 'Tongue tip on the gum ridge; air flows around the sides of the tongue.', tip: 'At the end of a word ("feel", "ball") British /l/ is "dark": the back of the tongue rises. Don\'t drop it.', spell: 'l, ll', ex: [['leg', 'leɡ'], ['ball', 'bɔːl'], ['hello', 'həˈləʊ'], ['little', 'ˈlɪtl'], ['feel', 'fiːl']] },
  { sym: 'w', kind: 'consonant', name: 'w', key: 'wet', how: 'Round your lips tightly like saying "oo", then quickly open to the next vowel.', tip: 'Don\'t use /v/ for /w/: "west" /west/ vs "vest" /vest/.', spell: 'w, wh, (o in one)', ex: [['wet', 'wet'], ['what', 'wɒt'], ['one', 'wʌn'], ['away', 'əˈweɪ'], ['quick', 'kwɪk']] },
  // ---------- short vowels ----------
  { sym: 'ɪ', kind: 'short vowel', name: 'short i', key: 'sit', how: 'A short, relaxed "i". Tongue high-front but lower and more relaxed than /iː/. Lips not spread.', tip: 'Indonesian has no short/long difference, so /ɪ/ and /iː/ often merge. "ship" /ʃɪp/ is short and relaxed; "sheep" /ʃiːp/ is long and tense with spread lips.', spell: 'i, y, e (in unstressed "be-", "-es")', ex: [['sit', 'sɪt'], ['big', 'bɪɡ'], ['gym', 'dʒɪm'], ['women', 'ˈwɪmɪn'], ['busy', 'ˈbɪzi'], ['ship', 'ʃɪp']] },
  { sym: 'e', kind: 'short vowel', name: 'short e', key: 'bed', how: 'Mouth half open, tongue front. Like Indonesian "e" in "enak" (not the ə in "emas").', tip: 'Keep it different from /æ/: "bed" /bed/ vs "bad" /bæd/. /æ/ has a much wider mouth.', spell: 'e, ea (head), ai (said)', ex: [['bed', 'bed'], ['head', 'hed'], ['said', 'sed'], ['friend', 'frend'], ['many', 'ˈmeni'], ['ten', 'ten']] },
  { sym: 'æ', kind: 'short vowel', name: 'ash', key: 'cat', how: 'Drop your jaw wide, tongue low and front, lips slightly spread. Between "e" and "a".', tip: 'This sound does not exist in Indonesian. Open your mouth wider than for /e/: "man" /mæn/ vs "men" /men/.', spell: 'a (in closed syllables)', ex: [['cat', 'kæt'], ['bad', 'bæd'], ['man', 'mæn'], ['happy', 'ˈhæpi'], ['black', 'blæk'], ['map', 'mæp']] },
  { sym: 'ʌ', kind: 'short vowel', name: 'wedge (strut)', key: 'cup', how: 'Short, open, central "a" with relaxed lips — like a short surprised "ah!".', tip: 'Spelled with "u" or "o" (cup, love, money) — not like Indonesian "u" or "o". "cup" /kʌp/ is close to "kap".', spell: 'u, o (love, son), ou (country)', ex: [['cup', 'kʌp'], ['love', 'lʌv'], ['money', 'ˈmʌni'], ['country', 'ˈkʌntri'], ['bus', 'bʌs'], ['blood', 'blʌd']] },
  { sym: 'ɒ', kind: 'short vowel', name: 'short o', key: 'hot', how: 'Short "o" with rounded lips and the jaw open, tongue back. A British-only sound.', tip: 'Americans say /ɑː/ here, but in British English "hot" is /hɒt/ — short and rounded.', spell: 'o, a (after w: want, what)', ex: [['hot', 'hɒt'], ['dog', 'dɒɡ'], ['want', 'wɒnt'], ['what', 'wɒt'], ['top', 'tɒp'], ['knowledge', 'ˈnɒlɪdʒ']] },
  { sym: 'ʊ', kind: 'short vowel', name: 'short u (foot)', key: 'book', how: 'Short, relaxed "u" with lips only slightly rounded. Shorter and looser than /uː/.', tip: '"full" /fʊl/ vs "fool" /fuːl/. Don\'t make it long and tense.', spell: 'oo (book), u (put), ou (could)', ex: [['book', 'bʊk'], ['put', 'pʊt'], ['good', 'ɡʊd'], ['could', 'kʊd'], ['woman', 'ˈwʊmən'], ['full', 'fʊl']] },
  { sym: 'ə', kind: 'short vowel', name: 'schwa', key: 'about', how: 'The most relaxed sound: mouth slightly open, tongue in the middle, no effort. Very short.', tip: 'Good news: Indonesian "e" in "emas/sebut" IS a schwa! It is the most common English vowel and appears only in unstressed syllables: a-BOUT, doc-TOR → /ˈdɒktə/.', spell: 'any vowel letter in an unstressed syllable', ex: [['about', 'əˈbaʊt'], ['teacher', 'ˈtiːtʃə'], ['banana', 'bəˈnɑːnə'], ['support', 'səˈpɔːt'], ['doctor', 'ˈdɒktə'], ['problem', 'ˈprɒbləm']] },
  // ---------- long vowels ----------
  { sym: 'iː', kind: 'long vowel', name: 'long ee', key: 'see', how: 'Tongue high and front, lips spread (like smiling), held longer. The ː mark means LONG.', tip: 'Make it clearly longer and tenser than /ɪ/: "leave" /liːv/ vs "live" /lɪv/.', spell: 'ee, ea, e, ie, ei', ex: [['see', 'siː'], ['eat', 'iːt'], ['sheep', 'ʃiːp'], ['people', 'ˈpiːpl'], ['piece', 'piːs'], ['leave', 'liːv']] },
  { sym: 'uː', kind: 'long vowel', name: 'long oo', key: 'food', how: 'Tongue high and back, lips strongly rounded and pushed forward, held long.', tip: 'Compare "pool" /puːl/ with "pull" /pʊl/.', spell: 'oo, u, ew, ue, o (do)', ex: [['food', 'fuːd'], ['blue', 'bluː'], ['new', 'njuː'], ['do', 'duː'], ['school', 'skuːl'], ['fruit', 'fruːt']] },
  { sym: 'ɑː', kind: 'long vowel', name: 'long ah', key: 'car', how: 'Jaw wide open, tongue low and back, held long — the sound a doctor asks for: "say aah".', tip: 'British English drops the "r" here: "car" /kɑː/, "start" /stɑːt/. Many British words like "bath", "class", "after" use /ɑː/ (Americans use /æ/).', spell: 'ar, a (bath, class), al (calm), ear (heart)', ex: [['car', 'kɑː'], ['father', 'ˈfɑːðə'], ['class', 'klɑːs'], ['heart', 'hɑːt'], ['after', 'ˈɑːftə'], ['calm', 'kɑːm']] },
  { sym: 'ɔː', kind: 'long vowel', name: 'long aw', key: 'door', how: 'Lips well rounded, tongue back and mid, held long. Rounder than Indonesian "o".', tip: 'British has no r: "door" /dɔː/, "four" /fɔː/. Compare short /ɒ/ "cot" with long /ɔː/ "caught".', spell: 'or, ore, oor, our, aw, au, al (walk)', ex: [['door', 'dɔː'], ['saw', 'sɔː'], ['walk', 'wɔːk'], ['four', 'fɔː'], ['caught', 'kɔːt'], ['water', 'ˈwɔːtə']] },
  { sym: 'ɜː', kind: 'long vowel', name: 'long er (nurse)', key: 'bird', how: 'Like a long schwa: tongue in the centre, lips neutral, held long. No r sound in British English.', tip: '"bird", "word", "learn", "turn" all have the same vowel /ɜː/. Don\'t pronounce the r, and don\'t say "e" or "o".', spell: 'ir, er, ur, or (after w), ear', ex: [['bird', 'bɜːd'], ['work', 'wɜːk'], ['learn', 'lɜːn'], ['turn', 'tɜːn'], ['her', 'hɜː'], ['first', 'fɜːst']] },
  // ---------- harder consonants ----------
  { sym: 'θ', kind: 'consonant', name: 'theta (voiceless th)', key: 'think', how: 'Put the tip of your tongue lightly between your teeth and blow air out. No voice.', tip: 'Not /t/ and not /s/! "think" /θɪŋk/ ≠ "tink" or "sink". Indonesian speakers often say t — let your tongue come out between the teeth.', spell: 'th', ex: [['think', 'θɪŋk'], ['three', 'θriː'], ['month', 'mʌnθ'], ['bath', 'bɑːθ'], ['thank', 'θæŋk'], ['method', 'ˈmeθəd']] },
  { sym: 'ð', kind: 'consonant', name: 'eth (voiced th)', key: 'this', how: 'Same as /θ/ (tongue between teeth) but with voice — feel the tongue buzz.', tip: 'Used in very common words: the, this, that, they, mother. Don\'t say /d/: "they" /ðeɪ/ ≠ "day" /deɪ/.', spell: 'th', ex: [['this', 'ðɪs'], ['the', 'ðə'], ['mother', 'ˈmʌðə'], ['they', 'ðeɪ'], ['with', 'wɪð'], ['weather', 'ˈweðə']] },
  { sym: 'ʃ', kind: 'consonant', name: 'esh (sh)', key: 'she', how: 'Lips rounded and pushed forward, tongue further back than for /s/. A "shh" sound, no voice.', tip: 'Indonesian "sy" (syarat) is /ʃ/. Spellings: sh, -tion, -ssion, -cial. "nation" /ˈneɪʃn/.', spell: 'sh, ti (nation), ci (special), ss (mission), s (sure)', ex: [['she', 'ʃiː'], ['fish', 'fɪʃ'], ['nation', 'ˈneɪʃn'], ['special', 'ˈspeʃl'], ['sure', 'ʃɔː'], ['machine', 'məˈʃiːn']] },
  { sym: 'ʒ', kind: 'consonant', name: 'ezh (zh)', key: 'vision', how: 'Same position as /ʃ/ but with voice. Like the "s" in "measure".', tip: 'Rare and never at the start of English words. Usually spelled -sion or -sure: "vision", "measure".', spell: 's (vision, measure), g (beige)', ex: [['vision', 'ˈvɪʒn'], ['measure', 'ˈmeʒə'], ['usual', 'ˈjuːʒuəl'], ['decision', 'dɪˈsɪʒn'], ['television', 'ˈtelɪvɪʒn'], ['casual', 'ˈkæʒuəl']] },
  { sym: 'tʃ', kind: 'consonant', name: 'ch', key: 'chair', how: 'Start with /t/ and release into /ʃ/ — one quick sound. No voice. Like Indonesian "c" in "cari".', tip: 'Two symbols, ONE sound. Spelled ch, tch, or t before -ure: "future" /ˈfjuːtʃə/.', spell: 'ch, tch, t (future, question)', ex: [['chair', 'tʃeə'], ['watch', 'wɒtʃ'], ['future', 'ˈfjuːtʃə'], ['teacher', 'ˈtiːtʃə'], ['question', 'ˈkwestʃən'], ['much', 'mʌtʃ']] },
  { sym: 'dʒ', kind: 'consonant', name: 'j', key: 'job', how: 'Start with /d/ and release into /ʒ/ — one sound with voice. Like Indonesian "j" in "jalan".', tip: 'Spelled j, g (before e/i/y), dge: "age" /eɪdʒ/, "bridge" /brɪdʒ/.', spell: 'j, g (gem), dge, d (soldier)', ex: [['job', 'dʒɒb'], ['age', 'eɪdʒ'], ['bridge', 'brɪdʒ'], ['general', 'ˈdʒenrəl'], ['large', 'lɑːdʒ'], ['jump', 'dʒʌmp']] },
  { sym: 'ŋ', kind: 'consonant', name: 'eng (ng)', key: 'sing', how: 'Back of the tongue against the soft palate (like /k/), sound through the nose. Like Indonesian "ng" in "bunga".', tip: 'In "sing" /sɪŋ/ there is NO /ɡ/ after ŋ. But "finger" /ˈfɪŋɡə/ has one. "think" = /θɪŋk/ (n before k becomes ŋ).', spell: 'ng, n (before k/g)', ex: [['sing', 'sɪŋ'], ['long', 'lɒŋ'], ['think', 'θɪŋk'], ['thing', 'θɪŋ'], ['English', 'ˈɪŋɡlɪʃ'], ['young', 'jʌŋ']] },
  { sym: 'r', kind: 'consonant', name: 'r', key: 'red', how: 'Curl the tongue tip up and back slightly WITHOUT touching anything; round the lips a little. Not rolled/trilled like Indonesian r.', tip: 'British English is NON-RHOTIC: r is only pronounced before a vowel. "red" /red/, "very" /ˈveri/ — but "car" /kɑː/, "work" /wɜːk/, "teacher" /ˈtiːtʃə/ have no r.', spell: 'r, rr, wr (write)', ex: [['red', 'red'], ['very', 'ˈveri'], ['write', 'raɪt'], ['sorry', 'ˈsɒri'], ['agree', 'əˈɡriː'], ['three', 'θriː']] },
  { sym: 'j', kind: 'consonant', name: 'yod (y)', key: 'yes', how: 'Like Indonesian "y" in "ya". Tongue high front, glide into the next vowel.', tip: 'IPA /j/ is NOT the English letter j! /j/ = "y" sound. Also hidden in "u" words: "use" /juːz/, "music" /ˈmjuːzɪk/, "new" /njuː/.', spell: 'y, (u in use, music, new)', ex: [['yes', 'jes'], ['you', 'juː'], ['use', 'juːz'], ['music', 'ˈmjuːzɪk'], ['new', 'njuː'], ['student', 'ˈstjuːdnt']] },
  // ---------- diphthongs ----------
  { sym: 'eɪ', kind: 'diphthong', name: 'ay', key: 'day', how: 'Start at /e/ and glide towards /ɪ/. Two vowel qualities in one syllable.', tip: 'Don\'t say a flat "e": "late" /leɪt/ vs "let" /let/. Let your jaw close a little at the end.', spell: 'a_e, ai, ay, ei, ey, ea (great)', ex: [['day', 'deɪ'], ['make', 'meɪk'], ['rain', 'reɪn'], ['eight', 'eɪt'], ['great', 'ɡreɪt'], ['they', 'ðeɪ']] },
  { sym: 'aɪ', kind: 'diphthong', name: 'eye', key: 'my', how: 'Start with an open "a" and glide to /ɪ/. Like Indonesian "ai" in "pantai".', tip: 'Usually easy. Spelled i_e, y, igh: "light" /laɪt/.', spell: 'i_e, y, igh, ie, uy', ex: [['my', 'maɪ'], ['time', 'taɪm'], ['light', 'laɪt'], ['buy', 'baɪ'], ['eye', 'aɪ'], ['five', 'faɪv']] },
  { sym: 'ɔɪ', kind: 'diphthong', name: 'oy', key: 'boy', how: 'Start at /ɔː/ (rounded) and glide to /ɪ/. Like Indonesian "oi" in "amboi".', tip: 'Spelled oi or oy: "voice" /vɔɪs/.', spell: 'oi, oy', ex: [['boy', 'bɔɪ'], ['coin', 'kɔɪn'], ['voice', 'vɔɪs'], ['enjoy', 'ɪnˈdʒɔɪ'], ['noise', 'nɔɪz'], ['choice', 'tʃɔɪs']] },
  { sym: 'əʊ', kind: 'diphthong', name: 'oh (British)', key: 'go', how: 'Start with schwa /ə/ (lips relaxed) and glide to /ʊ/ (lips round). This is the typical British "o".', tip: 'Not a pure Indonesian "o"! British "go" /ɡəʊ/ starts central and ends rounded. Americans write /oʊ/.', spell: 'o, o_e, oa, ow, ou (soul)', ex: [['go', 'ɡəʊ'], ['home', 'həʊm'], ['boat', 'bəʊt'], ['know', 'nəʊ'], ['phone', 'fəʊn'], ['open', 'ˈəʊpən']] },
  { sym: 'aʊ', kind: 'diphthong', name: 'ow', key: 'now', how: 'Start with an open "a" and glide to /ʊ/ with rounding lips. Like Indonesian "au" in "pulau".', tip: 'Spelled ou or ow: "house" /haʊs/, "how" /haʊ/. Careful: "know" is /nəʊ/, not /naʊ/.', spell: 'ou, ow', ex: [['now', 'naʊ'], ['house', 'haʊs'], ['town', 'taʊn'], ['out', 'aʊt'], ['loud', 'laʊd'], ['flower', 'ˈflaʊə']] },
  { sym: 'ɪə', kind: 'diphthong', name: 'ear', key: 'near', how: 'Start at /ɪ/ and glide to schwa /ə/. No r at the end in British English.', tip: '"near" /nɪə/, "here" /hɪə/ — the r is silent unless a vowel follows.', spell: 'ear, eer, ere, ier', ex: [['near', 'nɪə'], ['here', 'hɪə'], ['beer', 'bɪə'], ['idea', 'aɪˈdɪə'], ['clear', 'klɪə'], ['year', 'jɪə']] },
  { sym: 'eə', kind: 'diphthong', name: 'air', key: 'hair', how: 'Start at /e/ and glide to schwa /ə/ (many young speakers just hold a long /eː/). No r.', tip: '"hair" /heə/, "where" /weə/, "care" /keə/. Don\'t pronounce the r.', spell: 'air, are, ere (where), ear (bear)', ex: [['hair', 'heə'], ['care', 'keə'], ['where', 'weə'], ['bear', 'beə'], ['chair', 'tʃeə'], ['parent', 'ˈpeərənt']] },
  { sym: 'ʊə', kind: 'diphthong', name: 'ure', key: 'pure', how: 'Start at /ʊ/ and glide to /ə/. Many British speakers now use /ɔː/ instead ("sure" /ʃɔː/).', tip: 'Rare and disappearing. Common in "-ure" after /j/: "pure" /pjʊə/, "during" /ˈdjʊərɪŋ/.', spell: 'ure, our (tour), oor (poor)', ex: [['pure', 'pjʊə'], ['tour', 'tʊə'], ['during', 'ˈdjʊərɪŋ'], ['cure', 'kjʊə'], ['plural', 'ˈplʊərəl'], ['jury', 'ˈdʒʊəri']] },
  // ---------- weak vowels & marks ----------
  { sym: 'i', kind: 'weak vowel', name: 'happy-i', key: 'happy', how: 'A short, unstressed "ee" at the end of words or before another vowel — between /ɪ/ and /iː/.', tip: 'It has no length mark because it is never stressed: "happy" /ˈhæpi/, "city" /ˈsɪti/, "media" /ˈmiːdiə/.', spell: 'y, ie, ee, i (at word end or before a vowel)', ex: [['happy', 'ˈhæpi'], ['city', 'ˈsɪti'], ['money', 'ˈmʌni'], ['media', 'ˈmiːdiə'], ['coffee', 'ˈkɒfi'], ['ready', 'ˈredi']] },
  { sym: 'u', kind: 'weak vowel', name: 'weak u', key: 'actual', how: 'A short, unstressed "oo" before another vowel — between /ʊ/ and /uː/.', tip: 'Appears in words like "actual" /ˈæktʃuəl/, "situation" /ˌsɪtʃuˈeɪʃn/.', spell: 'u (before a vowel)', ex: [['actual', 'ˈæktʃuəl'], ['situation', 'ˌsɪtʃuˈeɪʃn'], ['usual', 'ˈjuːʒuəl'], ['annual', 'ˈænjuəl'], ['visual', 'ˈvɪʒuəl'], ['influence', 'ˈɪnfluəns']] },
  { sym: 'ˈ', kind: 'mark', name: 'primary stress', key: 'aBOUT', how: 'Placed BEFORE the stressed syllable. That syllable is louder, longer and higher in pitch.', tip: '"record" (noun) /ˈrekɔːd/ vs "record" (verb) /rɪˈkɔːd/ — stress changes meaning! Wrong stress is a big reason listeners misunderstand.', spell: '—', ex: [['about', 'əˈbaʊt'], ['teacher', 'ˈtiːtʃə'], ['important', 'ɪmˈpɔːtnt'], ['photograph', 'ˈfəʊtəɡrɑːf'], ['photography', 'fəˈtɒɡrəfi'], ['economy', 'ɪˈkɒnəmi']] },
  { sym: 'ˌ', kind: 'mark', name: 'secondary stress', key: 'UNiVERsity', how: 'A lower mark placed before a syllable with weaker (secondary) stress in long words.', tip: '"university" /ˌjuːnɪˈvɜːsəti/: strongest on VER, a weaker beat on U.', spell: '—', ex: [['university', 'ˌjuːnɪˈvɜːsəti'], ['information', 'ˌɪnfəˈmeɪʃn'], ['understand', 'ˌʌndəˈstænd'], ['economic', 'ˌiːkəˈnɒmɪk'], ['opportunity', 'ˌɒpəˈtjuːnəti'], ['introduction', 'ˌɪntrəˈdʌkʃn']] },
];

export const SYMBOL_MAP: Record<string, Sym> = Object.fromEntries(SYMBOLS.map((s) => [s.sym, s]));

// Units of the phonetics course (path). Each unit introduces symbols; lessons are generated.
export type Unit = { id: number; title: string; desc: string; syms: string[]; theory: string[] };

export const UNITS: Unit[] = [
  {
    id: 1, title: 'What is IPA?', desc: 'Slashes, sounds vs letters, and consonants that look like letters',
    syms: ['p', 'b', 't', 'd', 'k', 'ɡ', 'f', 'v', 's', 'z', 'h', 'm', 'n', 'l', 'w'],
    theory: [
      'IPA (International Phonetic Alphabet) writes SOUNDS, not spelling. One symbol = one sound, always.',
      'English spelling is messy: "ough" sounds different in though /ðəʊ/, through /θruː/, tough /tʌf/. IPA fixes this.',
      'Transcriptions go between slashes: "cat" = /kæt/. Silent letters disappear: "knee" = /niː/.',
      'This app uses BRITISH pronunciation (the kind in Oxford & Cambridge dictionaries, and in your textbook).',
      'Voiced vs voiceless: put your fingers on your throat. Say "sss" then "zzz". /z/ buzzes (voiced), /s/ does not (voiceless). Many consonants come in such pairs: p/b, t/d, k/ɡ, f/v, s/z.',
      'These 15 consonants look like normal letters, so you already almost know them. Watch out: /ɡ/ is always the "hard g" in "go".',
    ],
  },
  {
    id: 2, title: 'Short vowels: ɪ e æ', desc: 'The front short vowels — sit, bed, cat',
    syms: ['ɪ', 'e', 'æ'],
    theory: [
      'English has short vowels and long vowels. Length changes meaning, so we must hear it.',
      '/ɪ/ sit — relaxed short i.  /e/ bed — like Indonesian "e" in "enak".  /æ/ cat — mouth wide open, between e and a.',
      'Move your jaw: /ɪ/ → /e/ → /æ/ opens your mouth more and more. Try: bit, bet, bat.',
    ],
  },
  {
    id: 3, title: 'Short vowels: ʌ ɒ ʊ', desc: 'cup, hot, book',
    syms: ['ʌ', 'ɒ', 'ʊ'],
    theory: [
      '/ʌ/ cup — a short open "a" in the middle of the mouth. Spelled u or o: sun, son, love.',
      '/ɒ/ hot — short, rounded and open. This is very British (Americans don\'t use it).',
      '/ʊ/ book — short relaxed u, lips only a little rounded: put, good, could.',
      'Try the set: cut /kʌt/, cot /kɒt/, could /kʊd/.',
    ],
  },
  {
    id: 4, title: 'The schwa ə', desc: 'The most common sound in English',
    syms: ['ə'],
    theory: [
      'Schwa /ə/ is the lazy, relaxed vowel. It appears ONLY in unstressed syllables.',
      'Any vowel letter can become schwa: A-bout, tak-E-n, pen-C-I-l → /ˈpensl/, doct-OR /ˈdɒktə/, s-U-pport.',
      'Indonesian speakers have an advantage: the "e" in "emas", "sebut" is a schwa.',
      'Native speakers reduce small words to schwa in sentences: "a cup of tea" /ə ˈkʌp əv ˈtiː/.',
    ],
  },
  {
    id: 5, title: 'Long vowels', desc: 'iː uː ɑː ɔː ɜː — and the length mark ː',
    syms: ['iː', 'uː', 'ɑː', 'ɔː', 'ɜː'],
    theory: [
      'The mark ː means the vowel is LONG (and usually tenser). It is part of the symbol.',
      'Short vs long pairs: ship /ʃɪp/ – sheep /ʃiːp/, full /fʊl/ – fool /fuːl/, cot /kɒt/ – caught /kɔːt/.',
      'British English does not pronounce r after a vowel: car /kɑː/, door /dɔː/, bird /bɜːd/. The vowel just becomes long.',
      '/ɜː/ (bird, work, learn) has no partner: it is like a long, slightly tense schwa.',
    ],
  },
  {
    id: 6, title: 'TH sounds: θ ð', desc: 'think & this — tongue between the teeth',
    syms: ['θ', 'ð'],
    theory: [
      'Both TH sounds are made with the tongue tip lightly between the teeth.',
      '/θ/ is voiceless (think, three, month). /ð/ is voiced (this, the, mother).',
      'Common mistakes: think → "tink" or "sink"; this → "dis". Look in a mirror: you should see your tongue.',
    ],
  },
  {
    id: 7, title: 'ʃ ʒ tʃ dʒ', desc: 'she, vision, chair, job',
    syms: ['ʃ', 'ʒ', 'tʃ', 'dʒ'],
    theory: [
      '/ʃ/ she and /ʒ/ vision are a voiceless/voiced pair. Lips pushed forward.',
      '/tʃ/ chair and /dʒ/ job are written with TWO symbols but are ONE sound each (an affricate).',
      'Spelling clues: -tion /ʃn/ (nation), -sion /ʒn/ (decision) or /ʃn/ (mission), -ture /tʃə/ (future), -dge /dʒ/ (bridge).',
    ],
  },
  {
    id: 8, title: 'ŋ r j', desc: 'sing, red, yes — and silent British r',
    syms: ['ŋ', 'r', 'j'],
    theory: [
      '/ŋ/ = "ng" in Indonesian "bunga". sing /sɪŋ/ (no g sound at the end).',
      '/r/: tongue curled back, not touching, not rolled. In British English it is pronounced ONLY before a vowel: red, very — but car /kɑː/, teacher /ˈtiːtʃə/.',
      'Linking r: in "far away" the r comes back because a vowel follows: /fɑːr əˈweɪ/.',
      'IMPORTANT: IPA /j/ is the "y" sound (yes /jes/). The English letter j is /dʒ/ in IPA.',
    ],
  },
  {
    id: 9, title: 'Diphthongs: eɪ aɪ ɔɪ', desc: 'day, my, boy — gliding to ɪ',
    syms: ['eɪ', 'aɪ', 'ɔɪ'],
    theory: [
      'A diphthong is a vowel that MOVES: it starts at one position and glides to another, in one syllable.',
      'These three all glide towards /ɪ/: day /deɪ/, my /maɪ/, boy /bɔɪ/.',
      'Careful with /eɪ/: late /leɪt/ is not let /let/.',
    ],
  },
  {
    id: 10, title: 'Diphthongs: əʊ aʊ', desc: 'go, now — gliding to ʊ',
    syms: ['əʊ', 'aʊ'],
    theory: [
      'These glide towards /ʊ/ (lips rounding at the end).',
      '/əʊ/ go: the typical British "o", starting from a relaxed schwa. Not a flat Indonesian o.',
      '/aʊ/ now: like "au" in "pulau". Note know /nəʊ/ vs now /naʊ/.',
    ],
  },
  {
    id: 11, title: 'Diphthongs: ɪə eə ʊə', desc: 'near, hair, pure — gliding to ə',
    syms: ['ɪə', 'eə', 'ʊə'],
    theory: [
      'These glide towards schwa /ə/. In spelling there is usually an r, but British English does not pronounce it.',
      'near /nɪə/, hair /heə/, pure /pjʊə/.',
      '/ʊə/ is becoming rare; many speakers say sure as /ʃɔː/. Both are accepted.',
    ],
  },
  {
    id: 12, title: 'Stress & weak vowels', desc: 'ˈ ˌ and the happy-i',
    syms: ['ˈ', 'ˌ', 'i', 'u'],
    theory: [
      'ˈ goes BEFORE the stressed syllable: about /əˈbaʊt/ (stress on "bout").',
      'ˌ marks secondary stress in long words: university /ˌjuːnɪˈvɜːsəti/.',
      'Stress can change the word: PREsent /ˈpreznt/ (noun) vs preSENT /prɪˈzent/ (verb).',
      'Unstressed syllables often reduce to /ə/ or /ɪ/. Final y in happy is /i/ (no length mark).',
      'From now on, the stress mark counts in your answers.',
    ],
  },
  {
    id: 13, title: 'Your textbook words', desc: 'Transcribe the vocabulary from your book',
    syms: [],
    theory: [
      'Now you know every symbol of British English. In this unit you transcribe and read words from your vocabulary list.',
      'Use the IPA keyboard. Feedback shows every symbol you got wrong and explains it.',
    ],
  },
];

// Minimal pairs: [word1, ipa1, word2, ipa2]. Contrast is computed from the symbols.
export const MINIMAL_PAIRS: [string, string, string, string][] = [
  ['ship', 'ʃɪp', 'sheep', 'ʃiːp'], ['live', 'lɪv', 'leave', 'liːv'], ['bit', 'bɪt', 'beat', 'biːt'], ['fill', 'fɪl', 'feel', 'fiːl'], ['sit', 'sɪt', 'seat', 'siːt'], ['hit', 'hɪt', 'heat', 'hiːt'],
  ['bed', 'bed', 'bad', 'bæd'], ['men', 'men', 'man', 'mæn'], ['pen', 'pen', 'pan', 'pæn'], ['said', 'sed', 'sad', 'sæd'], ['set', 'set', 'sat', 'sæt'],
  ['cat', 'kæt', 'cut', 'kʌt'], ['bag', 'bæɡ', 'bug', 'bʌɡ'], ['ran', 'ræn', 'run', 'rʌn'], ['cap', 'kæp', 'cup', 'kʌp'], ['hat', 'hæt', 'hut', 'hʌt'],
  ['cut', 'kʌt', 'cart', 'kɑːt'], ['hut', 'hʌt', 'heart', 'hɑːt'], ['bun', 'bʌn', 'barn', 'bɑːn'], ['much', 'mʌtʃ', 'march', 'mɑːtʃ'],
  ['cot', 'kɒt', 'caught', 'kɔːt'], ['not', 'nɒt', 'nought', 'nɔːt'], ['pot', 'pɒt', 'port', 'pɔːt'], ['shot', 'ʃɒt', 'short', 'ʃɔːt'], ['spot', 'spɒt', 'sport', 'spɔːt'],
  ['full', 'fʊl', 'fool', 'fuːl'], ['pull', 'pʊl', 'pool', 'puːl'], ['look', 'lʊk', 'Luke', 'luːk'], ['should', 'ʃʊd', 'shoed', 'ʃuːd'],
  ['cot', 'kɒt', 'cut', 'kʌt'], ['lock', 'lɒk', 'luck', 'lʌk'], ['shot', 'ʃɒt', 'shut', 'ʃʌt'], ['dog', 'dɒɡ', 'dug', 'dʌɡ'],
  ['bird', 'bɜːd', 'bed', 'bed'], ['work', 'wɜːk', 'walk', 'wɔːk'], ['firm', 'fɜːm', 'farm', 'fɑːm'], ['hurt', 'hɜːt', 'heart', 'hɑːt'], ['word', 'wɜːd', 'ward', 'wɔːd'],
  ['think', 'θɪŋk', 'sink', 'sɪŋk'], ['thick', 'θɪk', 'tick', 'tɪk'], ['three', 'θriː', 'tree', 'triː'], ['thank', 'θæŋk', 'tank', 'tæŋk'], ['mouth', 'maʊθ', 'mouse', 'maʊs'], ['thin', 'θɪn', 'tin', 'tɪn'],
  ['they', 'ðeɪ', 'day', 'deɪ'], ['then', 'ðen', 'den', 'den'], ['breathe', 'briːð', 'breed', 'briːd'], ['those', 'ðəʊz', 'doze', 'dəʊz'],
  ['very', 'ˈveri', 'ferry', 'ˈferi'], ['van', 'væn', 'fan', 'fæn'], ['vine', 'vaɪn', 'fine', 'faɪn'], ['vest', 'vest', 'west', 'west'], ['vet', 'vet', 'wet', 'wet'],
  ['she', 'ʃiː', 'see', 'siː'], ['ship', 'ʃɪp', 'sip', 'sɪp'], ['shoe', 'ʃuː', 'sue', 'suː'], ['sheet', 'ʃiːt', 'seat', 'siːt'],
  ['chip', 'tʃɪp', 'ship', 'ʃɪp'], ['chair', 'tʃeə', 'share', 'ʃeə'], ['watch', 'wɒtʃ', 'wash', 'wɒʃ'], ['cheap', 'tʃiːp', 'jeep', 'dʒiːp'], ['choke', 'tʃəʊk', 'joke', 'dʒəʊk'],
  ['rice', 'raɪs', 'rise', 'raɪz'], ['bus', 'bʌs', 'buzz', 'bʌz'], ['place', 'pleɪs', 'plays', 'pleɪz'], ['peace', 'piːs', 'peas', 'piːz'],
  ['back', 'bæk', 'bag', 'bæɡ'], ['cap', 'kæp', 'cab', 'kæb'], ['bet', 'bet', 'bed', 'bed'], ['pick', 'pɪk', 'pig', 'pɪɡ'], ['rope', 'rəʊp', 'robe', 'rəʊb'],
  ['sin', 'sɪn', 'sing', 'sɪŋ'], ['ran', 'ræn', 'rang', 'ræŋ'], ['thin', 'θɪn', 'thing', 'θɪŋ'], ['win', 'wɪn', 'wing', 'wɪŋ'],
  ['light', 'laɪt', 'right', 'raɪt'], ['lead', 'liːd', 'read', 'riːd'], ['long', 'lɒŋ', 'wrong', 'rɒŋ'], ['fly', 'flaɪ', 'fry', 'fraɪ'],
  ['yet', 'jet', 'jet', 'dʒet'], ['yes', 'jes', 'chess', 'tʃes'], ['year', 'jɪə', 'ear', 'ɪə'], ['use', 'juːz', 'ooze', 'uːz'],
  ['late', 'leɪt', 'let', 'let'], ['pain', 'peɪn', 'pen', 'pen'], ['wait', 'weɪt', 'wet', 'wet'], ['sale', 'seɪl', 'sell', 'sel'],
  ['coat', 'kəʊt', 'caught', 'kɔːt'], ['boat', 'bəʊt', 'bought', 'bɔːt'], ['low', 'ləʊ', 'law', 'lɔː'], ['so', 'səʊ', 'saw', 'sɔː'],
  ['know', 'nəʊ', 'now', 'naʊ'], ['tone', 'təʊn', 'town', 'taʊn'], ['load', 'ləʊd', 'loud', 'laʊd'], ['phone', 'fəʊn', 'fun', 'fʌn'],
  ['bike', 'baɪk', 'bake', 'beɪk'], ['by', 'baɪ', 'boy', 'bɔɪ'], ['file', 'faɪl', 'foil', 'fɔɪl'], ['tie', 'taɪ', 'toy', 'tɔɪ'],
  ['here', 'hɪə', 'hair', 'heə'], ['beer', 'bɪə', 'bear', 'beə'], ['ear', 'ɪə', 'air', 'eə'], ['fear', 'fɪə', 'fair', 'feə'],
];

// Extra practice words per unit (used together with symbol examples).
export const UNIT_WORDS: Record<number, [string, string][]> = {
  1: [['pet', 'pet'], ['dad', 'dæd'], ['film', 'fɪlm'], ['next', 'nekst'], ['help', 'help'], ['bus', 'bʌs'], ['milk', 'mɪlk'], ['web', 'web']],
  2: [['pin', 'pɪn'], ['bit', 'bɪt'], ['bet', 'bet'], ['bat', 'bæt'], ['desk', 'desk'], ['lamp', 'læmp'], ['bank', 'bæŋk'], ['wind', 'wɪnd'], ['tenth', 'tenθ'], ['sand', 'sænd']],
  3: [['sun', 'sʌn'], ['clock', 'klɒk'], ['wood', 'wʊd'], ['mum', 'mʌm'], ['shop', 'ʃɒp'], ['cook', 'kʊk'], ['luck', 'lʌk'], ['box', 'bɒks'], ['foot', 'fʊt'], ['young', 'jʌŋ']],
  4: [['ago', 'əˈɡəʊ'], ['sofa', 'ˈsəʊfə'], ['China', 'ˈtʃaɪnə'], ['London', 'ˈlʌndən'], ['camera', 'ˈkæmərə'], ['lesson', 'ˈlesn'], ['data', 'ˈdeɪtə'], ['agenda', 'əˈdʒendə']],
  5: [['tree', 'triː'], ['moon', 'muːn'], ['park', 'pɑːk'], ['ball', 'bɔːl'], ['girl', 'ɡɜːl'], ['team', 'tiːm'], ['room', 'ruːm'], ['dark', 'dɑːk'], ['born', 'bɔːn'], ['nurse', 'nɜːs']],
  6: [['bath', 'bɑːθ'], ['thin', 'θɪn'], ['smooth', 'smuːð'], ['both', 'bəʊθ'], ['other', 'ˈʌðə'], ['birth', 'bɜːθ'], ['north', 'nɔːθ'], ['brother', 'ˈbrʌðə']],
  7: [['wash', 'wɒʃ'], ['short', 'ʃɔːt'], ['pleasure', 'ˈpleʒə'], ['cheese', 'tʃiːz'], ['jazz', 'dʒæz'], ['change', 'tʃeɪndʒ'], ['finish', 'ˈfɪnɪʃ'], ['garage', 'ˈɡærɑːʒ']],
  8: [['ring', 'rɪŋ'], ['strong', 'strɒŋ'], ['run', 'rʌn'], ['rich', 'rɪtʃ'], ['yellow', 'ˈjeləʊ'], ['few', 'fjuː'], ['bring', 'brɪŋ'], ['carry', 'ˈkæri']],
  9: [['play', 'pleɪ'], ['nine', 'naɪn'], ['join', 'dʒɔɪn'], ['train', 'treɪn'], ['white', 'waɪt'], ['point', 'pɔɪnt'], ['face', 'feɪs'], ['bike', 'baɪk']],
  10: [['cold', 'kəʊld'], ['road', 'rəʊd'], ['mouth', 'maʊθ'], ['brown', 'braʊn'], ['show', 'ʃəʊ'], ['cloud', 'klaʊd'], ['snow', 'snəʊ'], ['round', 'raʊnd']],
  11: [['cheer', 'tʃɪə'], ['fair', 'feə'], ['dear', 'dɪə'], ['square', 'skweə'], ['period', 'ˈpɪəriəd'], ['area', 'ˈeəriə'], ['rare', 'reə'], ['serious', 'ˈsɪəriəs']],
  12: [['computer', 'kəmˈpjuːtə'], ['banana', 'bəˈnɑːnə'], ['finance', 'ˈfaɪnæns'], ['student', 'ˈstjuːdnt'], ['history', 'ˈhɪstri'], ['company', 'ˈkʌmpəni'], ['develop', 'dɪˈveləp'], ['beautiful', 'ˈbjuːtɪfl']],
};

// Keyboard layout for the IPA keyboard
export const KEYBOARD: { label: string; keys: string[] }[] = [
  { label: 'Short vowels', keys: ['ɪ', 'e', 'æ', 'ʌ', 'ɒ', 'ʊ', 'ə', 'i', 'u'] },
  { label: 'Long vowels', keys: ['iː', 'uː', 'ɑː', 'ɔː', 'ɜː'] },
  { label: 'Diphthongs', keys: ['eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'aʊ', 'ɪə', 'eə', 'ʊə'] },
  { label: 'Consonants', keys: ['p', 'b', 't', 'd', 'k', 'ɡ', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'tʃ', 'dʒ', 'm', 'n', 'ŋ', 'l', 'r', 'w', 'j'] },
  { label: 'Marks', keys: ['ˈ', 'ˌ', 'ː'] },
];
