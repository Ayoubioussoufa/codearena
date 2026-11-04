"""The kit's tests. Don't edit them: make them pass."""
import os
import pathlib
import time
import unittest

import fasttok
import reference

CORPUS = (pathlib.Path(__file__).parent / "corpus.txt").read_text()


class Batch(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tok = fasttok.Tokenizer.train(CORPUS, 400)
        paragraphs = [p for p in CORPUS.split("\n\n") if p.strip()]
        cls.texts = [paragraphs[i % len(paragraphs)] * (1 + i % 5) for i in range(64)]

    def test_lesson_41_still_works(self):
        self.assertEqual(self.tok.merges, reference.train(CORPUS, 400))
        self.assertEqual(self.tok.decode(self.tok.encode("café 🦀")), "café 🦀")

    def test_batch_matches_one_by_one(self):
        self.assertEqual(self.tok.encode_batch(self.texts), [self.tok.encode(t) for t in self.texts])

    def test_batch_keeps_the_order(self):
        texts = ["judge", "a", "the contest", ""]
        self.assertEqual(self.tok.encode_batch(texts), [self.tok.encode(t) for t in texts])

    def test_an_empty_batch(self):
        self.assertEqual(self.tok.encode_batch([]), [])

    def test_batch_uses_several_cores(self):
        cores = os.cpu_count() or 1
        if cores < 2:
            self.skipTest("one core: nothing to parallelize")
        texts = self.texts * 8
        t0 = time.perf_counter()
        one_by_one = [self.tok.encode(t) for t in texts]
        sequential = time.perf_counter() - t0
        t0 = time.perf_counter()
        batch = self.tok.encode_batch(texts)
        parallel = time.perf_counter() - t0
        self.assertEqual(batch, one_by_one)
        print(f"\n    batch of {len(texts)}: one by one {sequential * 1000:.0f} ms, encode_batch {parallel * 1000:.0f} ms, {sequential / parallel:.1f}x on {cores} cores", flush=True)
        self.assertGreater(sequential / parallel, 1.3, "is encode_batch really parallel (par_iter)?")


if __name__ == "__main__":
    unittest.main(verbosity=2)
