// Process sidenotes
//
'use strict';

////////////////////////////////////////////////////////////////////////////////
// Renderer partials

function render_sidenote_open(tokens, idx, options, env, slf) {
  const {label, noBlock} = tokens[idx].meta;
  const block = noBlock ? " sidenote-noblock" : "";
  return `<small sidenote="${label}" class="sidenote${block}">`;
}

function render_sidenote_close() {
  return '</small>\n';
}

function render_sidenote_inline_begin(tokens, idx, options, env, slf) {
  const {label, noBlock} = tokens[idx].meta;
  const block = noBlock ? " sidenote-noblock" : "";
  return `<span class="sidenote-ref sidenote-ref-inline" id="sidenote-ref-inline${label}"></span>`
    + `<small sidenote="inline${label}" class='sidenote sidenote_inline${block}'>`;
}

function render_sidenote_inline_end(tokens, idx, options, env, slf) {
  return `</small>`;
}

function render_sidenote_ref(tokens, idx, options, env, slf) {
  const label = tokens[idx].meta.label;
  const symbol = label[0] == "_" ? "" : "●";
  const classn = label[0] == "_" ? " sidenote-ref-inline" : "";
  return `<span class="sidenote-ref${classn}" id="sidenote-ref-${label}">${symbol}</span>`;
}

export default function sidenote_plugin(md) {
  var parseLinkLabel = md.helpers.parseLinkLabel,
      isSpace = md.utils.isSpace;

  md.renderer.rules.sidenote_inline_begin = render_sidenote_inline_begin;
  md.renderer.rules.sidenote_inline_end = render_sidenote_inline_end;
  md.renderer.rules.sidenote_open = render_sidenote_open;
  md.renderer.rules.sidenote_close = render_sidenote_close;
  md.renderer.rules.sidenote_ref = render_sidenote_ref;

  // Process sidenote block definition
  function sidenote_def(state, startLine, endLine, silent) {
    let offset;
    let ch;

    const max = state.eMarks[startLine];
    const start = state.bMarks[startLine] + state.tShift[startLine];

    // line should be 4 chars - "[^]:"
    if (start + 4 > max) { return false; }

    if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
    if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

    let pos;
    for (pos = start + 2; pos < max; pos++) {
      if (state.src.charCodeAt(pos) === 0x20) { return false; }
      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
        break;
      }
    }

    if (pos === start + 2) { return false; } // no empty footnote labels
    if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */) {
      return false;
    }
    if (silent) { return true; }
    pos++;

    const label = state.src.slice(start + 2, pos - 2);

    const noBlock = (state.src[pos] == "^");
    if (noBlock) pos++;

    const token = new state.Token('sidenote_open', '', 1);
    token.meta = {label, noBlock};
    token.level = state.level++;
    state.tokens.push(token);

    const oldBMark = state.bMarks[startLine];
    const oldTShift = state.tShift[startLine];
    const oldSCount = state.sCount[startLine];
    const oldParentType = state.parentType;

    const posAfterColon = pos;
    const initial = offset = state.sCount[startLine] + pos -
      (state.bMarks[startLine] + state.tShift[startLine]);

    while (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (isSpace(ch)) {
        if (ch === 0x09) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
      } else {
        break;
      }

      pos++;
    }

    state.tShift[startLine] = pos - posAfterColon;
    state.sCount[startLine] = offset - initial;

    state.bMarks[startLine] = posAfterColon;
    state.blkIndent += 4;
    state.parentType = 'sidenote';

    if (state.sCount[startLine] < state.blkIndent) {
      state.sCount[startLine] += state.blkIndent;
    }

    state.md.block.tokenize(state, startLine, endLine, true);

    state.parentType = oldParentType;
    state.blkIndent -= 4;
    state.tShift[startLine] = oldTShift;
    state.sCount[startLine] = oldSCount;
    state.bMarks[startLine] = oldBMark;

    const tokenClose = new state.Token('sidenote_close', '', -1);
    tokenClose.level = --state.level;
    state.tokens.push(tokenClose);

    return true;
  }

  // Process footnote references ([^...])
  function sidenote_ref(state, silent) {
    const max = state.posMax;
    const start = state.pos;

    // should be at least 4 chars - "[^x]"
    if (start + 3 > max) { return false; }

    if (state.src.charCodeAt(start) !== 0x5B/* [ */) { return false; }
    if (state.src.charCodeAt(start + 1) !== 0x5E/* ^ */) { return false; }

    let pos;
    for (pos = start + 2; pos < max; pos++) {
      if (state.src.charCodeAt(pos) === 0x20) { return false; }
      if (state.src.charCodeAt(pos) === 0x0A) { return false; }
      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
        break;
      }
    }

    if (pos === start + 2) { return false; } // no empty footnote labels
    if (pos >= max) { return false; }
    pos++;

    const label = state.src.slice(start + 2, pos - 1);

    if (!silent) {
      const token = state.push('sidenote_ref', '', 0);
      token.meta = {label};
    }

    state.pos = pos;
    state.posMax = max;
    return true;
  }

  let sidenoteInlineCounter = 0;
  // Process inline sidenotes (^[...])
  function sidenote_inline(state, silent) {
    const max = state.posMax;
    const start = state.pos;

    if (start + 2 >= max) { return false; }
    if (state.src.charCodeAt(start) !== 0x5E/* ^ */) { return false; }
    if (state.src.charCodeAt(start + 1) !== 0x5B/* [ */) { return false; }

    let labelStart = start + 2;
    const labelEnd = parseLinkLabel(state, start + 1);

    const noBlock = (state.src[labelStart] == "^");

    if (noBlock) labelStart++;

    // parser failed to find ']', so it's not a valid note
    if (labelEnd < 0) { return false; }

    // We found the end of the link, and know for a fact it's a valid link;
    // so all that's left to do is to call tokenizer.
    //
    if (!silent) {
      const tokens = [];
      state.md.inline.parse(
        state.src.slice(labelStart, labelEnd),
        state.md,
        state.env,
        tokens);

      const token = state.push('sidenote_inline_begin', '', 0);
      token.meta = {label: sidenoteInlineCounter++, noBlock};

      for (const t of tokens) {
        state.tokens.push(t);
      }

      state.push('sidenote_inline_end', '', 0);
    }

    state.pos = labelEnd + 1;
    state.posMax = max;
    return true;
  }

  md.block.ruler.before('reference', 'sidenote_def', sidenote_def,
    { alt: ['paragraph', 'reference'] });
  md.inline.ruler.after('image', 'sidenote_inline', sidenote_inline);
  md.inline.ruler.after('sidenote_inline', 'sidenote_ref', sidenote_ref);
}
