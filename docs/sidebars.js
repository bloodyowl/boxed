/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  docs: [
    {
      type: "category",
      label: "Learn",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "getting-started",
        },
        {
          type: "doc",
          id: "core-concepts",
        },
        {
          type: "doc",
          id: "installation",
        },
        {
          type: "doc",
          id: "design-choices",
        },
      ],
    },
    {
      type: "category",
      label: "API",
      collapsed: false,
      items: [
        "option",
        "result",
        {
          type: "category",
          label: "Async Data",
          collapsed: false,
          items: ["async-data", "async-data-result"],
        },
        {
          type: "category",
          label: "Future",
          collapsed: false,
          items: ["future", "future-result"],
        },
        "deferred",
        "array",
        "dict",
        "lazy",
        "serializer",
      ],
    },
    {
      type: "category",
      label: "Examples",
      collapsed: false,
      items: [
        "react-request",
        "form-validation",
        "nested-optional-values",
        "cancellable-request",
        "retry",
        "concurrency",
      ],
    },
    {
      type: "doc",
      id: "inspirations",
    },
  ],
}
