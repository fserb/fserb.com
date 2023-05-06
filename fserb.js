// fserb.js

const tinyScreen = window.matchMedia('(max-width: 1050px)');

const observeSidenotes = new ResizeObserver(() => {
  const article = document.getElementsByTagName("article")[0];

  if (tinyScreen.matches) {
    article.style.height = "";
    return;
  }

  let beach = 0;

  for (const e of document.getElementsByClassName("sidenote")) {
    const label = e.getAttribute("sidenote");
    const anchor = document.getElementById(`sidenote-ref-${label}`);
    if (!anchor) continue;
    const pos = anchor.offsetTop + anchor.offsetHeight / 2 - 0.5;
    const top = Math.max(pos, beach);
    beach = top + e.offsetHeight;
    e.style.top = `${top}px`;
  }

  // we update the article size to include the last footnote, if needed.
  article.style.height = `max(${article.offsetHeight}px, ${beach}px)`;
});

const observePinned = new IntersectionObserver(
  ([e]) => e.target.classList.toggle("pinned", e.intersectionRatio < 1),
  {threshold: [1]}
);

function load() {
  observeSidenotes.observe(document.body);
  observePinned.observe(document.querySelector("header"));
}

window.addEventListener("load", load);
