import type { Lesson } from "../types";

const LE = "https://letsencrypt.org/docs/challenge-types/";

export const lesson0023: Lesson = {
  slug: "0023-https",
  number: 23,
  track: "ship",
  title: "HTTPS from first principles",
  summary:
    "What a certificate proves, how a chain of trust works, and why the names live in the SAN: you become a certificate authority with openssl, then see how Let's Encrypt and Caddy automate exactly that.",
  minutes: 90,
  status: "ready",
  builds: "`make-certs.sh`: a CA, a server key, a CSR and a certificate that real TLS clients accept, and refuse when they should",
  lab: { dir: "0023-https", writes: ["make-certs.sh"], check: "bash check.sh" },
  reference: "ship",
  warmup: [
    { lesson: "0021-server-from-zero", question: 1 },
    { lesson: "0022-compose-in-production", question: 0 },
  ],
  words: ["certificate", "certificate authority (CA)", "chain of trust", "subject alternative name (SAN)", "certificate signing request (CSR)", "ACME challenge"],
  answers: [
    { id: "codearena", label: "Section 6: the steps from domain to padlock, and how you'll prove each" },
    { id: "challenge", label: "Challenge: an intermediate CA (optional)" },
  ],
  quiz: [
    {
      prompt: "What does a TLS certificate actually prove?",
      options: [
        "This server has passed a security audit by a trusted CA",
        "This key belongs to this name, says an issuer you trust",
        "Traffic to this name is encrypted with the CA's own key",
        "This website belongs to a company whose identity has been checked",
      ],
      correct: 1,
      why: "A certificate binds a public key to names, signed by an issuer. Nothing more: not that the site is safe or honest. Your browser trusts it because it chains up to a root in its trust store. The lab's \"someone else's CA\" case is that chain failing.",
    },
    {
      prompt: "During the handshake, what does the server do with its private key?",
      options: [
        "It encrypts every page with a key that changes constantly",
        "It shares the private key with the browser for decryption",
        "It unlocks the CA certificate stored inside the browser itself",
        "It signs the handshake, proving it holds the certified key",
      ],
      correct: 3,
      why: "Anyone can send your certificate: it's public. Only the holder of the private key can sign the handshake so that it verifies against the certificate's public key. The two sides then agree on fresh session keys, which encrypt the traffic. The private key never leaves the server.",
    },
    {
      prompt: "A browser gets a certificate signed by a CA that isn't in its trust store. What does it do?",
      options: [
        "It accepts, since the connection is still encrypted all the same",
        "It accepts once, then asks the CA to confirm next time",
        "It refuses: no issuer it trusts has vouched for that key",
        "It quietly downloads your CA from the server, then it accepts",
      ],
      correct: 2,
      why: "Encryption with an unauthenticated key protects you from nobody: an attacker in the middle could present their own certificate. That's why the lab's \"without your CA\" connection fails with UNABLE_TO_VERIFY_LEAF_SIGNATURE, and why a browser shows a full-page warning.",
    },
    {
      prompt: "Why must `codearena.test` be in the subject alternative name, not only the CN?",
      options: [
        "The CN fits only one name, unlike the longer SAN list",
        "OpenSSL refuses to sign any certificate whose CN is a hostname",
        "Browsers match the hostname against the SAN, and ignore the CN",
        "The SAN is encrypted, while the CN travels in plain text",
      ],
      correct: 2,
      why: "Browsers check the hostname only against the SAN's DNS entries; a certificate with the name only in its CN is rejected. Some libraries, Node's included, still fall back to the CN when there's no SAN, which is how a CN-only certificate can pass a test and fail in Chrome.",
    },
    {
      prompt: "Caddy is to get a Let's Encrypt certificate with the HTTP-01 challenge. What must be true?",
      options: [
        "Its DNS points at the server, and port 80 is reachable",
        "The server has a static IP registered with the CA itself",
        "Port 443 is reachable, and the private key was uploaded first",
        "An admin approves the request on the Let's Encrypt web dashboard",
      ],
      correct: 0,
      why: `Let's Encrypt gives a token; the server must publish it at \`http://<domain>/.well-known/acme-challenge/<token>\`, and Let's Encrypt fetches it over port 80 after resolving the domain ([challenge types](${LE})). That proves you control the domain. Your private key never leaves the server: the CA signs your CSR.`,
    },
  ],
};
