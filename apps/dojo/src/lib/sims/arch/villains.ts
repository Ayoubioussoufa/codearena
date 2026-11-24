import type { Situation } from "../quiz";

export const VILLAINS_PASS = 7;
export const VILLAINS: readonly Situation[] = [
  {
    id: "god", title: "The 1,900 lines", story: "1,900 lines, and every pull request touches it.",
    exhibit: "class OrderService {\n  constructor(a, b, c, d, e, f, g, h, i, j, k) {}\n  placeOrder() {} cancel() {} refund() {} exportCsv() {}\n  emailReceipt() {} retryPayment() {} /* … */\n}",
    moves: [
      { text: "The God Service. One class per use case.", outcome: "PlaceOrder, CancelOrder, RefundOrder: one reason to change each." },
      { text: "The Anaemic Domain. Move the rules to entities.", outcome: "There may be some of that too, but size isn't cured by moving rules." },
      { text: "The Leaky Port. Return your own types.", outcome: "There's no port in sight." },
      { text: "The Circular Import. Add forwardRef.", outcome: "It imports everyone, but nobody imports it back here." },
    ],
    best: 0, lesson: "More than five or so dependencies usually means several jobs.",
  },
  {
    id: "leaky", title: "The port", story: "It's called a port, and it lives in ports/.",
    exhibit: "export interface ProblemsRepository {\n  find(where: Prisma.ProblemWhereInput):\n    Promise<Prisma.ProblemGetPayload<{ include: { tags: true } }>>;\n}",
    moves: [
      { text: "The Repository Per Table. Merge them.", outcome: "How many tables it reads isn't the trouble." },
      { text: "Ceremony Without Cause. Delete it.", outcome: "The boundary is a good idea. This isn't one yet." },
      { text: "The Leaky Port. Speak your own types in it.", outcome: "findBySlug(slug): Promise<Problem>. Now a fake takes five lines." },
      { text: "The Silent Catch. Rethrow.", outcome: "Nothing is caught." },
    ],
    best: 2, lesson: "If the vendor's types are in the interface, it's the vendor with extra steps.",
  },
  {
    id: "silent", title: "The calm logs", story: "Users say that saving \"sometimes does nothing\". The logs are calm.",
    exhibit: "try {\n  await this.repo.save(problem);\n} catch (e) {\n  console.log(e);\n}",
    moves: [
      { text: "The God Service. Split it.", outcome: "Four lines are hardly a god." },
      { text: "The Silent Catch. Catch what you can handle, rethrow the rest.", outcome: "Now a failed save fails, and someone hears about it." },
      { text: "The Utils Junk Drawer. Rename it.", outcome: "It isn't a utility." },
      { text: "The Leaky Port. Hide Prisma.", outcome: "save(problem) speaks your language already." },
    ],
    best: 1, lesson: "Catch only when you have something better to do than fail.",
  },
  {
    id: "ceremony", title: "The country list", story: "A lookup table with three columns that nobody edits.",
    exhibit: "domain/country.entity.ts\nports/countries.repository.ts\nports/country-mapper.ts\napplication/list-countries.use-case.ts\nadapters/prisma-countries.repository.ts\nadapters/cached-countries.repository.ts\nhttp/countries.controller.ts",
    moves: [
      { text: "The Anaemic Domain. Add rules to Country.", outcome: "Which rules? Countries don't do much." },
      { text: "The Repository Per Table. Add another table.", outcome: "That would be going the wrong way, enthusiastically." },
      { text: "The Circular Import. Extract a module.", outcome: "Everything points one way. There's just too much of it." },
      { text: "Ceremony Without Cause. Controller, query, done.", outcome: "If you can't say what a layer protects you from, delete it." },
    ],
    best: 3, lesson: "The costliest mistake is structure you can't justify.",
  },
  {
    id: "junk", title: "The helpers", story: "New code lands here whenever nobody knows where it goes.",
    exhibit: "utils/helpers.ts\n  formatDate()  parseCsv()  sendEmail()\n  calculateTax()  sleep()  isAdmin()",
    moves: [
      { text: "The Utils Junk Drawer. Give each one a home with a name.", outcome: "Tax is domain, email is an adapter, isAdmin is a guard's question." },
      { text: "The God Service. Make it a class.", outcome: "A drawer with a constructor." },
      { text: "Ceremony Without Cause. Inline it all.", outcome: "Then you'd have six copies of calculateTax." },
      { text: "The Silent Catch. Add logging.", outcome: "The trouble is where things are, not what they say." },
    ],
    best: 0, lesson: "\"Helpers\" is the name of a decision nobody made.",
  },
  {
    id: "circular", title: "The handshake", story: "It only boots with forwardRef on both sides.",
    exhibit: "auth.module.ts   imports: [forwardRef(() => UsersModule)]\nusers.module.ts  imports: [forwardRef(() => AuthModule)]",
    moves: [
      { text: "The Leaky Port. Change the types.", outcome: "The types are fine. The arrows aren't." },
      { text: "The God Service. Merge both modules.", outcome: "You'd hide the cycle inside a bigger box." },
      { text: "The Circular Import. Move what they share to a third place.", outcome: "Often a small piece, such as a password hasher, that belongs to neither." },
      { text: "The Anaemic Domain. Add methods to User.", outcome: "The entities aren't what's tied in a knot." },
    ],
    best: 2, lesson: "An arrow that points both ways means one of them does too much.",
  },
  {
    id: "anaemic", title: "Four copies", story: "The rule \"a closed contest accepts no entries\" is written in four services, and three agree.",
    exhibit: "class Contest { id; startsAt; endsAt; entries }\n\n// in join.service.ts, in admin.service.ts, in import.job.ts, in bot.ts:\nif (contest.startsAt < now) throw new Error('closed');",
    moves: [
      { text: "The Repository Per Table. Model needs.", outcome: "Nothing here is about storage." },
      { text: "The Anaemic Domain. Put the rule on Contest, once.", outcome: "contest.join(user, now) says no, whoever is asking." },
      { text: "The Utils Junk Drawer. Make isClosed() a helper.", outcome: "Closer, but someone must still remember to call it." },
      { text: "The Circular Import. Reorder the imports.", outcome: "There's no cycle here: all four point at Contest." },
    ],
    best: 1, lesson: "A rule enforced in one path is forgotten in the next. Give it one door.",
  },
  {
    id: "pertable", title: "The jigsaw", story: "To show one problem page, the service calls four repositories and stitches the results.",
    exhibit: "ProblemRepository  ProblemTagRepository\nTagRepository      ProblemExampleRepository",
    moves: [
      { text: "The God Service. Split the page in four.", outcome: "Then the browser does the stitching." },
      { text: "The Silent Catch. Log each call.", outcome: "Well-documented stitching." },
      { text: "Ceremony Without Cause. Call Prisma in the controller.", outcome: "From too many boundaries to none." },
      { text: "The Repository Per Table. One port that answers the need.", outcome: "findBySlug returns the problem with its tags and examples. Three tables, one question." },
    ],
    best: 3, lesson: "Ports model what you need, not how it's stored.",
  },
];
