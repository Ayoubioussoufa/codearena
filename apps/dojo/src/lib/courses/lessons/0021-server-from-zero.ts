import type { Lesson } from "../types";

const SSHD = "https://man.openbsd.org/sshd_config";

export const lesson0021: Lesson = {
  slug: "0021-server-from-zero",
  number: 21,
  track: "ship",
  title: "A server from zero",
  summary:
    "The first five minutes on a new server: SSH keys, a deploy user, a hardened sshd and a firewall. You provision a fresh \"VM\" in a container, then attack it from another one.",
  minutes: 90,
  status: "ready",
  builds: "`setup.sh` and an sshd drop-in that survive real logins and port probes from \"the internet\"",
  lab: { dir: "0021-server-from-zero", writes: ["setup.sh", "50-hardening.conf"], check: "bash check.sh" },
  reference: "ship",
  warmup: [
    { lesson: "0007-root-capabilities-seccomp", question: 0 },
    { lesson: "0008-docker-hardened", question: 1 },
  ],
  words: ["public-key authentication", "authorized_keys", "sshd drop-in", "least privilege", "default-deny firewall", "rate limiting"],
  answers: [
    { id: "codearena", label: "Section 6: your provisioning runbook, in order" },
    { id: "challenge", label: "Challenge: cloud-init (optional)" },
  ],
  quiz: [
    {
      prompt: "You set nothing in sshd_config. Can root log in?",
      options: [
        "Root can never log in, since OpenSSH blocks it fully by default",
        "Root can still log in, with a key instead of a password",
        "Root can log in with a password, but only from the console",
        "Root may log in, but only from addresses on the local network",
      ],
      correct: 1,
      why: `OpenSSH's default for \`PermitRootLogin\` is \`prohibit-password\`: passwords are refused for root, keys are not ([sshd_config](${SSHD})). Many providers put your key in root's account, so a fresh VM accepts root logins until you say \`PermitRootLogin no\`. The lab's "defaults" run logged in as root.`,
    },
    {
      prompt: "Why turn password logins off entirely?",
      options: [
        "Passwords are sent in clear text, while keys are always encrypted",
        "Key logins are faster, which matters for every deploy that runs",
        "Bots try passwords all day, and a key cannot be guessed",
        "Ubuntu stops accepting any passwords at all after the first year",
      ],
      correct: 2,
      why: "Any server with port 22 open gets a steady stream of password guesses. SSH encrypts passwords in transit too, so that isn't the issue: guessability is. An Ed25519 private key is not something a bot can guess, and it never leaves your machine: the server only checks a signature made with it.",
    },
    {
      prompt: "Why log in as `deploy` and use sudo, rather than as root?",
      options: [
        "Root cannot run Docker, so a second account is always needed",
        "Cloud providers delete the root account right after the first boot",
        "Only non-root users are allowed to hold an SSH public key",
        "Least privilege, and a trail: root powers only come through sudo",
      ],
      correct: 3,
      why: "Day to day you don't need root, so you shouldn't have it by default. Every privileged action goes through sudo, which asks on purpose and logs what ran. Combined with `AllowUsers deploy`, there's exactly one way in, and you know which.",
    },
    {
      prompt: "What does `ufw limit 22/tcp` do?",
      options: [
        "It refuses an address after 6 new connections within 30 seconds",
        "It allows only one SSH connection at a time, from anywhere",
        "It slows every SSH packet down to one kilobyte per second",
        "It limits SSH to the addresses that are listed in AllowUsers",
      ],
      correct: 0,
      why: "A limit rule allows the connection, but denies an address that initiates 6 or more connections within 30 seconds ([ufw(8)](https://manpages.ubuntu.com/manpages/noble/man8/ufw.8.html)). It blunts brute-force scripts without getting in your way.",
    },
    {
      prompt: "ufw denies everything but 22, 80 and 443. You publish Postgres's port with Docker (`-p 5432:5432`). Is it reachable from the internet?",
      options: [
        "No: ufw denies all of the incoming traffic, whatever Docker publishes",
        "Yes: Docker's NAT rules divert the traffic before ufw sees it",
        "Only over IPv6, since Docker writes rules for IPv4 by itself",
        "Only from the server itself, since published ports always bind locally",
      ],
      correct: 1,
      why: "Docker routes published ports in the nat table, before the INPUT chain where ufw's rules live: Docker's own docs call the two incompatible ([Docker and ufw](https://docs.docker.com/engine/network/packet-filtering-firewalls/)). The fix is in lesson 22: don't publish internal services at all, or bind them to 127.0.0.1.",
    },
  ],
};
