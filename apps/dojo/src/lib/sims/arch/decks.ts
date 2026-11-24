import type { Deck } from "../engines";

export const WHERETO: Deck = {
  ask: "Which layer?",
  options: ["domain/", "ports/", "application/", "adapters/", "http/"],
  pass: 14,
  cards: [
    { text: "A submission is accepted when all its tests pass.", answer: "domain/", why: "True on paper, with no computer." },
    { text: "SELECT … WHERE slug = $1", answer: "adapters/", why: "It names an outside technology: SQL." },
    { text: "Find the problem. If it's missing, say so. Otherwise store the submission and queue it.", answer: "application/", why: "Steps that fulfil one user action." },
    { text: "\"I need something that can find problems by slug.\"", answer: "ports/", why: "A need, with no how." },
    { text: "Show EASY as \"Easy\".", answer: "http/", why: "Presentation: only this consumer cares." },
    { text: "Try Stripe again, three times, when it answers 503.", answer: "adapters/", why: "A transport detail of one vendor." },
    { text: "Refuse a body with fields you didn't ask for.", answer: "http/", why: "It's about HTTP payloads, not about your business." },
    { text: "Charge the card, then email the receipt.", answer: "application/", why: "Orchestration across two ports." },
    { text: "Only the author may edit this problem.", answer: "application/", why: "It needs the record loaded, inside the use case." },
    { text: "Turn Prisma's P2002 into your own EmailTakenError.", answer: "adapters/", why: "P2002 is Prisma's word. Translate it where Prisma is spoken." },
    { text: "Keep the results of another repository in Redis.", answer: "adapters/", why: "A second adapter wrapped around the first." },
    { text: "interface Clock { now(): Date }", answer: "ports/", why: "Time is an outside system: state the need." },
    { text: "A contest can't be joined after it starts.", answer: "domain/", why: "A rule you could write on a poster." },
    { text: "Read the refresh token from a cookie.", answer: "http/", why: "Cookies are HTTP." },
    { text: "When a user registers, also send a welcome email.", answer: "application/", why: "The use case decides what else happens." },
    { text: "Elo: the winner gains K × (1 − expected score).", answer: "domain/", why: "Arithmetic that is your business." },
  ],
};

export const WORTHIT: Deck = {
  ask: "Put a port in front of it?",
  options: ["Yes, a port", "No, call it directly"],
  pass: 7,
  cards: [
    { text: "The payment provider's SDK, in a product that charges cards.", answer: "Yes, a port", why: "A vendor you don't control, and a fake you need in every test." },
    { text: "Array.prototype.sort in a service.", answer: "No, call it directly", why: "Pure, stable, and it isn't a boundary." },
    { text: "Date.now() in the code that expires contests.", answer: "Yes, a port", why: "A test must be able to say what time it is." },
    { text: "A three-column Tags table behind an admin page, in a small internal tool.", answer: "No, call it directly", why: "No rules, no second implementation, nothing to protect. That's ceremony without cause." },
    { text: "The code that runs strangers' programs in Docker.", answer: "Yes, a port", why: "Slow, dangerous and outside: you'll want a fake in unit tests and another sandbox one day." },
    { text: "A weekend script that renames photos.", answer: "No, call it directly", why: "One file. Genuinely." },
    { text: "Sending email.", answer: "Yes, a port", why: "A vendor, its shapes, and tests that must never email anyone." },
    { text: "A pure function slugify(title) that you wrote yourself.", answer: "No, call it directly", why: "It has no outside to be isolated from." },
  ],
};

export const WHICHTEST: Deck = {
  ask: "Which kind of test proves it best?",
  options: ["Domain unit test", "Use case with fakes", "Adapter, real database", "End to end"],
  pass: 8,
  cards: [
    { text: "All tests passing means ACCEPTED.", answer: "Domain unit test", why: "No setup at all: call the function." },
    { text: "Submitting to a problem that doesn't exist is refused.", answer: "Use case with fakes", why: "A fake repository that returns null, and no Nest." },
    { text: "A database row becomes the right entity, tags included.", answer: "Adapter, real database", why: "Mocking the driver would test your mock." },
    { text: "Two workers claim the same row: exactly one wins.", answer: "Adapter, real database", why: "The guarantee lives in Postgres, so Postgres must be there." },
    { text: "GET /problems?limit=99999 answers 400.", answer: "End to end", why: "The DTO, the pipe and the route must be wired together." },
    { text: "After a wrong password, login never asks the token service for a token.", answer: "Use case with fakes", why: "The steps of one action, seen through its ports." },
    { text: "Elo never creates points: what one gains, the other loses.", answer: "Domain unit test", why: "Arithmetic. Try a thousand pairs in a millisecond." },
    { text: "A duplicate email becomes your EmailTakenError.", answer: "Adapter, real database", why: "Only the real constraint raises the real error." },
    { text: "The refresh cookie is httpOnly, and a reused one logs the family out.", answer: "End to end", why: "Cookies, guard, service and database, as a browser sees them." },
  ],
};
