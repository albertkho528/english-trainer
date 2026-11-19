# Albert's English Trainer

An installable web app (PWA) built with Astro. It has two separate systems:

- **Vocabulary**: 648 words and phrases from the Unipus textbook screenshots, each with a definition, British IPA, synonyms, antonyms and example sentences. There are 11 exercise types, and questions are generated fresh every time. Spaced repetition decides when each word comes back.
- **Phonetics (British RP)**: a 13-unit course that starts from zero. Each unit has three levels: Discover, Practise and Master. There's also a sound library for all 44 sounds, a minimal-pairs ear trainer, and IPA transcription practice on your textbook words, with symbol-by-symbol feedback.

Plus a statistics dashboard, sound effects, and offline support.

## Run on your PC

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Put it online (needed to install it on Android)

Android only lets you install a PWA from an HTTPS address.

1. Push this folder to a Git repo, then import it in Vercel (Framework: Astro). Or run `npx vercel` from this folder.
2. Open the URL in Chrome on Android, then menu → **Add to Home screen / Install app**.
3. On Windows, open it in Edge or Chrome, then click the **Install** icon in the address bar.

Progress is stored on each device separately. Use **Settings → Export / Import progress** to move it between your phone and PC.

## Typing IPA on a PC keyboard

Press a key, then press it again quickly to cycle through related symbols:

| Key | Cycles through |
|---|---|
| a | æ ʌ ɑː aɪ aʊ |
| e | e ə ɜː eɪ eə |
| i | ɪ iː i ɪə |
| o | ɒ ɔː əʊ ɔɪ |
| u | ʊ uː u ʊə ʌ |
| x | ə ɜː əʊ |
| t | t θ tʃ |
| d | d ð dʒ |
| s | s ʃ |
| z | z ʒ |
| n | n ŋ |
| c | tʃ ʃ |
| j | dʒ j |
| y | j |
| ' | ˈ (primary stress) |
| , | ˌ (secondary stress) |
| : | ː (length mark) |

Other letters type themselves. Backspace deletes and Enter checks. On a phone, an on-screen IPA keyboard appears instead.

## Audio

The app uses the device's built-in British voices (en-GB):

- **Windows:** Edge has the most natural ones (e.g. "Sonia Online (Natural)").
- **Android:** Settings → Text-to-speech → Google → install *English (United Kingdom)*.

## Adding new words

Word data lives in `src/data/vocab*.txt` and `src/data/phrases.txt`, one entry per line:

```
word|pos|British IPA|definition|syn1,syn2|ant1|Sentence with [form].|Second [sentence].
```

`pos` is one of: `n`, `v`, `adj`, `adv`, `prep`, `phr`.
