import type { Deck } from "../engines";

export const PROVIDERS: Deck = {
  ask: "How do you register it?",
  options: ["useClass", "useValue", "useFactory", "useExisting"],
  pass: 9,
  cards: [
    { text: "In a unit test: give JudgeService a fake runner object you've already created.", answer: "useValue", why: "The object exists. Hand it over." },
    { text: "The port PROBLEMS_REPOSITORY should be served by PrismaProblemsRepository.", answer: "useClass", why: "When someone asks for the token, construct that class." },
    { text: "A Redis connection whose URL comes from ConfigService.", answer: "useFactory", why: "It takes a dependency and some code: inject: [ConfigService]." },
    { text: "'LOGGER' and AppLogger must both give you the same object.", answer: "useExisting", why: "An alias: two tokens, one instance. useClass would build a second one." },
    { text: "A constant: the maximum size of submitted code, 64 KB.", answer: "useValue", why: "Nothing to construct." },
    { text: "providers: [UsersService], written out in full.", answer: "useClass", why: "The short form means { provide: UsersService, useClass: UsersService }." },
    { text: "S3Storage in production, DiskStorage on a laptop, decided at boot by reading ConfigService.", answer: "useFactory", why: "A choice made with a dependency is code." },
    { text: "Load a 2 MB word list from disk before the app accepts requests.", answer: "useFactory", why: "Factories may be async, and Nest waits for them." },
    { text: "MailService became NotificationService, and old modules still inject the old token. Same object, please.", answer: "useExisting", why: "The old token becomes another name for the new one." },
    { text: "Swap Argon2Hasher for BcryptHasher behind PASSWORD_HASHER.", answer: "useClass", why: "One line changes, and no consumer notices." },
  ],
};

export const PLACEMENT: Deck = {
  ask: "Where does this code belong?",
  options: ["Middleware", "Guard", "Interceptor", "Pipe", "Filter", "Service"],
  pass: 10,
  cards: [
    { text: "Parse the cookies of every request.", answer: "Middleware", why: "Everything later needs them, and it doesn't depend on the route." },
    { text: "Is there a valid access token?", answer: "Guard", why: "May this request go on? That's the guard's only question." },
    { text: "Does this user own submission 42?", answer: "Service", why: "You must load the record to know, and that's the service's work." },
    { text: "Turn \"42\" in the URL into the number 42, or answer 400.", answer: "Pipe", why: "Transform or validate one value: ParseIntPipe." },
    { text: "Log how many milliseconds each handler took.", answer: "Interceptor", why: "It wraps the handler: a clock before, a clock after." },
    { text: "Turn every error into the same JSON shape.", answer: "Filter", why: "The last stop, whatever threw." },
    { text: "Only admins may call this route.", answer: "Guard", why: "A fact about the route and the caller, read with the Reflector." },
    { text: "A contest can't be joined after it has started.", answer: "Service", why: "A business rule: it must hold for every caller, not only HTTP ones." },
    { text: "Wrap every successful answer as { data: … }.", answer: "Interceptor", why: "map() on what the handler returned." },
    { text: "The body must have an email and a password of 8 characters or more.", answer: "Pipe", why: "The ValidationPipe and a DTO, at the edge." },
    { text: "Log the stack of every unexpected error, and answer a clean 500.", answer: "Filter", why: "It sees everything that was thrown, and decides what the client may know." },
    { text: "Give every request an id before anything logs.", answer: "Middleware", why: "It must come first, and it's the same for all routes." },
  ],
};
