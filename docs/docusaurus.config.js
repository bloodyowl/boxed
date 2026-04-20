// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/oceanicNext");

const url = "https://boxed.cool";

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: "Boxed",
  tagline: "Essential building-blocks for functional & safe TypeScript code",
  url: "https://boxed.cool",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.png",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "bloodyowl", // Usually your GitHub org/user name.
  projectName: "boxed", // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/bloodyowl/boxed/edit/main/docs/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  scripts: [
    {
      src: "/try.js",
      async: true,
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        appId: "LI6T7CQ5U8",
        apiKey: "c78a649315c0b39c2d8752c61e24da6f",
        indexName: "boxed",
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: "search",
      },
      navbar: {
        title: "Boxed",
        logo: {
          alt: "Boxed",
          src: "img/logo.svg",
        },
        items: [
          {
            href: "/getting-started",
            label: "Getting started",
            position: "left",
          },
          {
            href: "/option",
            label: "API",
            position: "left",
          },
          {
            href: "/react-request",
            label: "Examples",
            position: "left",
          },
          {
            href: "https://codesandbox.io/p/devbox/boxed-playground-forked-2nzs58",
            label: "Playground",
            position: "left",
          },
          {
            href: "https://github.com/bloodyowl/boxed",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        copyright: `Copyright © ${new Date().getFullYear()} Matthias Le Brun`,
      },
      metadata: [
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:image", content: `${url}/img/social.png` },
        { property: "og:image:width", content: `1280` },
        { property: "og:image:height", content: `640` },
        { name: "twitter:image", content: `${url}/img/social.png` },
      ],
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};
