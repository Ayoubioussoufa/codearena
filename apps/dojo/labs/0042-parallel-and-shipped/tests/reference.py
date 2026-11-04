"""Given: the same byte-level BPE in pure Python, to compare against.

Same rules as lesson 40: overlapping counts, the most frequent pair (ties to
the smallest pair), non-overlapping merges left to right, stop when no pair
repeats. Readable, and slow.
"""


def pair_counts(ids):
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts


def merge(ids, pair, new):
    out, i = [], 0
    while i < len(ids):
        if i + 1 < len(ids) and (ids[i], ids[i + 1]) == pair:
            out.append(new)
            i += 2
        else:
            out.append(ids[i])
            i += 1
    return out


def train(text, vocab_size):
    ids = list(text.encode("utf-8"))
    merges = []
    for new in range(256, max(vocab_size, 256)):
        counts = pair_counts(ids)
        if not counts:
            break
        pair, count = max(counts.items(), key=lambda kv: (kv[1], (-kv[0][0], -kv[0][1])))
        if count < 2:
            break
        ids = merge(ids, pair, new)
        merges.append(pair)
    return merges


def encode(merges, text):
    rank = {pair: i for i, pair in enumerate(merges)}
    ids = list(text.encode("utf-8"))
    while len(ids) >= 2:
        ranked = [(rank[p], p) for p in zip(ids, ids[1:]) if p in rank]
        if not ranked:
            break
        r, pair = min(ranked)
        ids = merge(ids, pair, 256 + r)
    return ids
