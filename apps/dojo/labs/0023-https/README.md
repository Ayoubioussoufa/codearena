# Lab 0023: be a certificate authority for an afternoon

Write **`make-certs.sh`**. Run from this folder, it creates `out/` with:

| File | What it is |
|---|---|
| `out/ca.key` | your certificate authority's private key (mode 600) |
| `out/ca.crt` | the CA's self-signed certificate: a CA (`basicConstraints = CA:TRUE`), valid 10 years |
| `out/server.key` | the server's private key (mode 600): RSA 2048+ or an EC P-256 key |
| `out/server.csr` | the server's certificate signing request |
| `out/server.crt` | the server's certificate, **signed by your CA**: not a CA, valid at most 90 days, for `codearena.test` **and** `www.codearena.test` (as subject alternative names), usable for TLS servers (`extendedKeyUsage = serverAuth`) |

Then `bash check.sh`. The checker inspects the files with `openssl`, then serves
`server.crt` over real TLS and connects the way a browser would: trusting your
CA, not trusting it, with the wrong hostname, and with someone else's CA.

The script must be re-runnable: running it twice replaces `out/` cleanly.
