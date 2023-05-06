import lume from "lume/mod.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";

import feed from "lume/plugins/feed.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import nav from "lume/plugins/nav.ts";
import terser from "lume/plugins/terser.ts";
import postcss from "lume/plugins/postcss.ts";
import nano from "npm:cssnano";

import mdSidenote from "./_plugins/mdSidenote.js";
import markdownItKatex from "npm:@iktakahiro/markdown-it-katex@4.0.1";

const site = lume({
  location: new URL("https://fserb.com"),
}, {
  nunjucks: {
    options: {
      autoescape: false,
    }
  },
  markdown: {
    options: { typographer: true },
    plugins: [markdownItKatex, mdSidenote],
  },
});

site.ignore("old", "orig", "_images", ".gitignore", ".git", "NOTES");
site.copy("assets");

site.use(relativeUrls());

site.use(nav());

site.use(postcss({
  plugins: [nano()],
}));

site.use(terser({
  options: {
    module: false,
  },
}));

site.use(codeHighlight({}));

// appends .njk on layout
site.preprocess([".njk", ".md", ".html"], page => {
  if (page.data.layout && page.data.layout.indexOf('.') == -1) {
    page.data.layout += '.njk';
  }
});

site.use(feed({
  output: ["/site.rss"],
  query: "",
  limit: 20,
  info: {
    title: "=site.title",
    description: "=site.description",
    date: new Date(),
    lang: "en",
    generator: true,
  },
}));

export default site;
