import * as path from "https://deno.land/std@0.177.1/path/mod.ts";
import {format as dateFormat} from "https://deno.land/std@0.177.1/datetime/mod.ts";

import lume from "lume/mod.ts";

import sitemap from "lume/plugins/sitemap.ts";
import relativeUrls from "lume/plugins/relative_urls.ts";
import feed from "lume/plugins/feed.ts";
import codeHighlight from "lume/plugins/code_highlight.ts";
import nav from "lume/plugins/nav.ts";
import terser from "lume/plugins/terser.ts";
import svgo from "lume/plugins/svgo.ts";
import postcss from "lume/plugins/postcss.ts";
import nano from "npm:cssnano@6.0.1";
import minifyHTML from "lume/plugins/minify_html.ts";

import markdownItKatex from "npm:@iktakahiro/markdown-it-katex@4.0.1";
import mdSidenote from "./_plugins/mdSidenote.js";
import mdImageSize from "./_plugins/mdImageSize.js";

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
    plugins: [markdownItKatex, mdSidenote, mdImageSize],
  },
});

site.ignore("old", "orig", ".gitignore", ".git", "NOTES", "lume");
site.copy("assets");
site.copy([".jpg", ".gif", ".png", ".webp", ".pdf"]);

site.use(postcss({
  plugins: [
    nano(),
  ],
  keepDefaultPlugins: true,
}));

site.use(terser({
  options: {
    module: false,
  },
}));

site.use(svgo());
site.use(minifyHTML());

site.use(codeHighlight({}));

site.preprocess([".md"], page => {
  const path = page.src.path.split('/');

  if (path.length <= 2 || path[1] != "flux" || path[2] == "flux") return;

  page.data.flux = path.slice(2, -1);
});

// Remind to put dates on articles
site.preprocess([".md"], page => {
  if (page.data.date == page.src?.created) {
    const suggestion = `date: ${dateFormat(page.data.date, "yyyy-MM-dd HH:mm")}`;
    console.log(`Missing on '${page.src.entry.path}': ${suggestion}`);
  }
});

// Make sure that all Markdown files are also NJK templates.
site.preprocess([".md"], page => {
  page.data.templateEngine = ["njk", "md"];
});

// appends .njk on layout
site.preprocess([".njk", ".md", ".html"], page => {
  if (page.data.layout && page.data.layout.indexOf('.') == -1) {
    page.data.layout += '.njk';
  }
});

site.use(sitemap());
site.use(feed({
  output: ["/site.rss"],
  query: "skipfeed=undefined",
  limit: 20,
  info: {
    title: "fserb.com",
    description: "=site.description",
    date: new Date(),
    lang: "en",
    generator: true,
  },
}));

site.use(relativeUrls());
site.use(nav());

site.filter('image', () => {});

export default site;
