import { decode  as decodeJPG } from "https://deno.land/x/jpegts@1.1/mod.ts";
import png from "npm:fast-png@6.2.0";
import { posix as path } from "https://deno.land/std@0.210.0/path/mod.ts";

const MAXWIDTH = 720;

function generateAttributes(md, token) {
  const ignore = ["src", "alt"];
  const escape = ["title"];

  return token.attrs
    .filter(([key]) => !ignore.includes(key))
    .map(([key, value]) => {
      const escapeAttributeValue = escape.includes(key);
      const finalValue = escapeAttributeValue
        ? md.utils.escapeHtml(value)
        : value;

      return `${key}="${finalValue}"`;
    })
    .join(" ");
}

function getImageInfo(imageUrl, env) {
  let src = imageUrl;

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") ||
    imageUrl.startsWith("//")) {
    return;
  }

  if (imageUrl.startsWith("/")) {
    imageUrl = "." + imageUrl;
  } else {
    const abs = path.join(path.dirname(env.filename), imageUrl);
    const urlpath =
      env.data.url.endsWith("/") ? env.data.url : path.dirname(env.data.url);
    src =
      path.relative(urlpath, path.dirname(abs)) + "/" + path.basename(imageUrl);
    imageUrl = "." + abs;
  }

  const raw = Deno.readFileSync(imageUrl);

  if (imageUrl.endsWith(".png")) {
    const img = png.decode(raw);
    return { width: img.width, height: img.height, src };
  }
  if (imageUrl.endsWith(".jpg")) {
    const img = decodeJPG(raw);
    return { width: img.width, height: img.height, src };
  }

  throw("Unknown image format");
}

export default function markdownItImageSize(md) {
  md.renderer.rules.image = (tokens, index, options, env) => {
    const token = tokens[index];
    const imageUrl = token.attrs[token.attrIndex("src")][1];
    const titleIdx = token.attrIndex("title");
    const opts = titleIdx >= 0 ? token.attrs[titleIdx][1] : "";
    const caption = md.utils.escapeHtml(token.content);

    const attr = generateAttributes(md, token);
    const other = attr ? " " + attr : "";

    let info;
    try {
      info = getImageInfo(imageUrl, env);
    } catch (error) {
      console.error(
        `mdImageSize: Could not get dimensions of image '${imageUrl}'.\n\n`,
        error);
    }

    let dimattr = "";
    let dimsrc = imageUrl;

    if (info) {
      const maxw = opts == "side" ? 280 : MAXWIDTH;
      const nw = Math.min(info.width, maxw);
      const nh = info.height * nw / info.width;
      dimsrc = info.src;

      dimattr = ` width="${nw}" height="${nh}"`;
    }

    return `<img loading="lazy" decoding="async" src="${dimsrc}" alt="${caption}"${dimattr}${other}>`;
  };
}

