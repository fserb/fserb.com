// import { posix } from "https://deno.land/std@0.186.0/path/mod.ts";

export function url(page) {
  const orig = page.src.path;

  if (!orig.startsWith("/pages/")) return;

  let path = orig.replace(/^\/pages\//, '/');

  if (!path.endsWith("index")) {
    path += "/index";
  }

  console.log("OP", orig, path);
  return path + ".html";
}
