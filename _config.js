// import {Image} from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import * as path from "https://deno.land/std@0.186.0/path/mod.ts";

import {ImageMagick, MagickFormat, initialize as imInitialize} from "https://deno.land/x/imagemagick_deno@0.0.22/mod.ts";
await imInitialize();

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

site.ignore("old", "orig", ".gitignore", ".git", "NOTES");
site.copy("assets");

site.copy("exp/life/images");
site.copy("games/cards/data");

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

site.use(relativeUrls());
site.use(nav());

// Image tag that resizes.
site.filter('image', async (src, maxwidth=1440) => {
  let srcPath = path.join("_images", src);
  let targetPath = "assets/images";
  if (src.startsWith("./")) {
    srcPath = src;
    targetPath = src.substring(2, src.lastIndexOf('/'))
  }

  const data = await Deno.readFile(srcPath);
  let filename, width, height;
  await ImageMagick.read(data, async image => {
    width = Math.min(maxwidth, image.width);
    height = Math.round(image.height * width / image.width);

    const dot = src.lastIndexOf('.');
    const basename = src.slice(src.lastIndexOf('/') + 1, dot);
    const ext = src.slice(dot + 1);
    filename = `${basename}.${width}.${ext}`;
    const pathname = path.join("_site", targetPath, filename);

    image.quality = 100;

    image.resize(width, height);

    const format = (ext == "jpeg" || ext == "jpg") ? MagickFormat.JPEG : MagickFormat.PNG;

    await Deno.mkdir(path.join("_site", targetPath), {recursive: true});

    image.write(format, data => Deno.writeFile(pathname, data));
  });

  width = Math.round(width / 2);
  height = Math.round(height / 2);

  return `<img class="placed" loading="lazy" decoding="async" alt="" src="/${targetPath}/${filename}" width="${width}" height="${height}">`;
}, true);


export default site;
