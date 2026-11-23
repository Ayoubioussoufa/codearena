# AI engineering: the learning path

From "what is a model?" to agents and fine-tuning, in the order that builds on itself, with the free courses worth your time and what each one really gives you at the end. The dojo's AI track (lessons 43 to 51) is the hands-on core; this page is the map around it.

> **How to read the certificate column.** Checked on 23 Nov 2026 against each provider's own page where possible. **Confirmed** means the provider's page says it. **Reported** means only third-party write-ups say it: check it when you enrol, since these programmes change often.

## Stage 0 · What a model is

The intuition first, maths only as needed.

| Resource | Why | Cost · certificate |
| --- | --- | --- |
| [3Blue1Brown: neural networks and "But what is a GPT?"](https://www.3blue1brown.com/lessons/gpt) | The clearest visual explanation of tokens, embeddings, attention and next-token prediction | Free · none |
| [Elements of AI](https://www.elementsofai.com/) | A gentle, non-technical course on what AI is and isn't | Free · certificate reported |
| Dojo [lesson 43](/courses/lessons/0043-what-a-model-does) | Logits, softmax, temperature, top-k and top-p, written by you | Free · your own lab |

## Stage 1 · Using models well

Before you build on a model, learn to work with one: what it's good at, where it fails, how to ask.

| Resource | Why | Cost · certificate |
| --- | --- | --- |
| [Anthropic Academy](https://academy.claude.com/): *AI Fluency: Framework and foundations* (14 lessons) and *AI capabilities and limitations* (13 lessons) | How to work with AI effectively and honestly; the vocabulary interviewers use | Free (confirmed) · certificate reported |
| [Anthropic's interactive prompt engineering tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) | Exercises on clear instructions, roles, examples, XML tags | Free · none |
| Dojo [lesson 45](/courses/lessons/0045-prompts-and-injection) | Prompts that hold, and prompt injection | Free · your own lab |

## Stage 2 · Building with a model

Calling a model from code, getting structured output, running your own.

| Resource | Why | Cost · certificate |
| --- | --- | --- |
| Dojo [lesson 44](/courses/lessons/0044-your-own-model) | Memory arithmetic, Ollama's API, validated JSON | Free · your own lab |
| [Anthropic Academy: *Claude Platform 101*, then *Building with the Claude API*](https://academy.claude.com/collections/build-with-claude) (67 lessons, 8 quizzes) | The full API: tool use, structured output, caching. The ideas carry over to any model, including the one you host | Free (confirmed) · certificate reported |
| [Hugging Face LLM course](https://huggingface.co/learn/llm-course/chapter1/1) | Transformers, tokenizers, datasets and fine-tuning, with code | Free (confirmed) · **no certificate yet** (confirmed: "Currently we do not have any certification for this course") |

## Stage 3 · Evals and retrieval

What separates a demo from a product, and the most-asked topic in AI engineering interviews.

| Resource | Why | Cost · certificate |
| --- | --- | --- |
| Dojo [lessons 46](/courses/lessons/0046-evals) and [47](/courses/lessons/0047-judges-and-choices) | Code graders, rates, a judge you can trust | Free · your own labs |
| [Anthropic Academy: *Introduction to evals*](https://academy.claude.com/collections/build-with-claude) (4 lessons) | Short; fits inside the AI week | Free (confirmed) · certificate reported |
| [Hamel Husain: Your AI product needs evals](https://hamel.dev/blog/posts/evals/) and [LLM-as-a-judge](https://hamel.dev/blog/posts/llm-judge/) | The practitioner's method, from shipped products | Free · none |
| Dojo [lessons 48](/courses/lessons/0048-embeddings), [49](/courses/lessons/0049-rag) and [50](/courses/lessons/0050-better-retrieval) | Embeddings, RAG, hybrid search | Free · your own labs |
| [Vicki Boykis: What are embeddings](https://vickiboykis.com/what_are_embeddings/) | A free book on where embeddings come from | Free · none |
| [Anthropic: contextual retrieval](https://www.anthropic.com/news/contextual-retrieval) | Measured steps beyond basic RAG | Free · none |

## Stage 4 · Tools and agents

| Resource | Why | Cost · certificate |
| --- | --- | --- |
| Dojo [lesson 51](/courses/lessons/0051-agents-and-beyond) | The tool loop with its limits; workflows vs agents | Free · your own lab |
| [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | The patterns, and when not to build an agent | Free · none |
| [Anthropic Academy: *Introduction to Model Context Protocol*, *MCP: Advanced topics*, *Tool use with the Messages API*](https://academy.claude.com/collections/build-with-claude) | MCP servers and clients, tool design | Free (confirmed) · certificate reported |
| [Hugging Face Agents course](https://huggingface.co/learn/agents-course/en/unit0/introduction) | Agents from scratch and with frameworks | Free · **two free certificates** (confirmed): *Fundamentals* for Unit 1; *Completion* for Unit 1, one use-case assignment and the final challenge |

## Stage 5 · Under the hood (after the sprint)

Training, fine-tuning and the systems that serve models. Worth it once you've shipped something.

| Resource | Why | Cost · certificate |
| --- | --- | --- |
| [fast.ai: Practical deep learning](https://course.fast.ai/) | Train models yourself, top-down | Free · none |
| Hugging Face LLM course, fine-tuning chapters | Fine-tuning with code you run | Free · none yet |
| [LoRA (Hu et al., 2021)](https://arxiv.org/abs/2106.09685) | The paper behind cheap fine-tuning | Free · none |
| Dojo Rust week 10 | A BPE tokenizer in Rust, imported from Python: how AI infrastructure is really built | Free · your own lab |

## Which certificates, for the CV

Certificates open a conversation; the project closes it. Pick a few that line up with CodeArena's story, and list them under the project, not above it:

1. **Hugging Face Agents course: Fundamentals** (confirmed free certificate, Unit 1 only). Quick, and recognised in the AI community.
2. **Anthropic Academy: *Introduction to evals*** and ***Introduction to Model Context Protocol***. Short and directly on topic. Download the certificate if one is offered at the end; if not, list the course.
3. **Anthropic Academy: *Building with the Claude API*** (9 hours), after the sprint.

## Where to get wisdom

Courses give knowledge and labs give skills. Judgement comes from people who build these systems. Post your eval table, or your hybrid-search result, and ask what they'd measure next:

- the [Hugging Face forums](https://discuss.huggingface.co/), which have a category for each course and for building with models;
- and the people you'll meet through CodeArena: classmates at 1337 who use the hint are your first real eval set.
