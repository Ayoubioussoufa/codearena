# Lab 0021: a server from zero, in a box

The checker starts a container that plays a **freshly created cloud VM**, the way
providers hand them to you: root has your public key in its `authorized_keys`, a
leftover `ops` account has it too, and nothing is hardened. Fake services listen
on 5432 (Postgres) and 6379 (Redis), the way a careless `docker compose` would
leave them. A second container plays **the internet**.

Your job is the first five minutes on any new server. You write two files:

| File | What it does |
|---|---|
| `setup.sh` | runs once, as root, on the fresh VM (this folder is mounted at `/lab`, read-only) |
| `50-hardening.conf` | your sshd drop-in; `setup.sh` installs it in `/etc/ssh/sshd_config.d/` |

`setup.sh` must:

1. create the user `deploy`, in the `wheel` group (Alpine's admin group; Ubuntu's is `sudo`);
2. install `keys/deploy.pub` as deploy's only authorized key, with the permissions sshd demands;
3. install your sshd drop-in;
4. set up the firewall with `ufw`: deny incoming by default, allow outgoing, rate-limit
   SSH, allow HTTP and HTTPS, nothing else; then enable it.

First, make your key pair (no passphrase, for the lab only):

    mkdir -p keys && ssh-keygen -t ed25519 -f keys/deploy -N "" -C "deploy@codearena-lab"

Then `bash check.sh`. The first run builds the VM image (a minute, once).

Alpine trap, and the fix: `adduser -D` creates a **locked** account (its password
field is `!`), and OpenSSH refuses every login to a locked account, keys included.
`usermod -p '*' deploy` sets a password field no password can ever match, without
locking the account.
