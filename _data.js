// We replace srcs that look like /a/b/X/X with /a/b/X/index.html
export function url(page) {
  const sp = page.src.path.split('/');

  if (sp.length < 3) return;

  const name = sp[sp.length - 1];
  const p = sp[sp.length - 2];

  if (name != p) return;

  return `${sp.slice(0, sp.length - 1).join('/')}/index.html`;
}
