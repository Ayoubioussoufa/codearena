// Given: how a component tree is described in this lab (a tiny JSX without the syntax).
//   h("p", { class: "x" }, "text", child)   an HTML element
//   server("Name", async (props) => node)    a server component: may be async, may read secrets
//   client("Name", (props) => node)          a client component: rendered on the server too,
//                                            then hydrated in the browser with its props
//   use(Component, props)                    a component in the tree
export const h = (tag, props, ...children) => ({ type: "tag", tag, props: props ?? {}, children });
export const server = (name, render) => ({ kind: "server", name, render });
export const client = (name, render) => ({ kind: "client", name, render });
export const use = (component, props = {}) => ({ type: "component", component, props });
