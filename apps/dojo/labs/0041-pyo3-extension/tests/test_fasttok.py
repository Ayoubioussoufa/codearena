"""The kit's tests. Don't edit them: make them pass. check.sh runs them in a
virtualenv after `maturin develop --release`."""
import pathlib
import threading
import time
import unittest

import fasttok
import reference

CORPUS = (pathlib.Path(__file__).parent / "corpus.txt").read_text()


class FastTok(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tok = fasttok.Tokenizer.train(CORPUS, 400)

    def test_train_matches_the_python_reference(self):
        self.assertEqual(self.tok.merges, reference.train(CORPUS, 400))

    def test_the_textbook_example(self):
        tok = fasttok.Tokenizer.train("aaabdaaabac", 1000)
        self.assertEqual(tok.merges, [(97, 97), (97, 98), (256, 257)])
        self.assertEqual(tok.encode("aaabdaaabac"), [258, 100, 258, 97, 99])

    def test_encode_matches_the_python_reference(self):
        for text in [CORPUS[:500], "café, naïve, 🦀", "the judge reads, compiles, runs"]:
            self.assertEqual(self.tok.encode(text), reference.encode(self.tok.merges, text), text)

    def test_decode_round_trips(self):
        for text in [CORPUS, "café, naïve, 🦀", ""]:
            self.assertEqual(self.tok.decode(self.tok.encode(text)), text)

    def test_decode_rejects_broken_utf8(self):
        with self.assertRaises(ValueError):
            self.tok.decode([0xE9])  # a lone Latin-1 'é' byte isn't valid UTF-8

    def test_len_is_the_vocabulary_size(self):
        self.assertEqual(len(self.tok), 256 + len(self.tok.merges))
        self.assertEqual(len(self.tok), 400)

    def test_rust_is_faster_than_python(self):
        text = CORPUS * 4
        t0 = time.perf_counter()
        ids = self.tok.encode(text)
        rust = time.perf_counter() - t0
        t0 = time.perf_counter()
        expected = reference.encode(self.tok.merges, text)
        python = time.perf_counter() - t0
        self.assertEqual(ids, expected)
        print(f"\n    encode, {len(text)} bytes: Rust {rust * 1000:.1f} ms, Python {python * 1000:.1f} ms, {python / rust:.0f}x", flush=True)
        self.assertGreater(python / rust, 3, "build with --release; check.sh does")

    def test_encode_releases_the_gil(self):
        # A Python thread records timestamps while Rust encodes a big text. If
        # encode holds the GIL, that thread can't run during the call, so no
        # timestamp can land inside it. The 10 ms margins cover the moments
        # around the call where Python itself may hand the GIL over (its switch
        # interval is 5 ms).
        big = CORPUS * 200
        stamps = []
        stop = threading.Event()

        def tick():
            while not stop.is_set():
                stamps.append(time.perf_counter())

        t = threading.Thread(target=tick)
        t.start()
        time.sleep(0.05)
        t0 = time.perf_counter()
        self.tok.encode(big)
        t1 = time.perf_counter()
        stop.set()
        t.join()
        self.assertGreater(t1 - t0, 0.05, "the text should take a moment to encode")
        inside = sum(1 for s in stamps if t0 + 0.01 < s < t1 - 0.01)
        self.assertGreater(inside, 100, f"the other thread ran {inside} times during {(t1 - t0) * 1000:.0f} ms of encode: is the GIL released?")

if __name__ == "__main__":
    unittest.main(verbosity=2)
