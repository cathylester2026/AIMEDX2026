// ============================================================
// BY DESIGN · ARTHUR'S RETURN  —  game engine v0.4 (pure, no UI)
// Three groups: AI (what talks to Arthur), People (who stands behind it),
// Place (where it happens). Each promise needs one signature place.
// Everything the app shows about outcomes is computed here, so the same
// rules run on phones, the projector and the tests.
// ============================================================

export const BUDGET = { capital: 8, change: 9, round1Max: 3, finalMax: 4 };
export const START_LINE = 3;
// AI is the upside: it pays off only when a person is behind it and a place holds it.
export const AI_BONUS = 2;
export const MAX_LINE = 12;

export const GROUPS = [
  { id: 'ai', title: 'AI', sub: 'What talks to Arthur' },
  { id: 'people', title: 'People', sub: 'Who stands behind it' },
  { id: 'place', title: 'Place', sub: 'Where it happens' },
];

// faces: AI that talks to Arthur directly. With no person behind it => "Unattended AI",
// the only way to be HURT.
export const CARDS = {
  nav: {
    id: 'nav', group: 'ai', faces: true, capital: 2, change: 1,
    name: 'AI care navigation',
    benefit: 'Arthur knows his next step.',
    detail: 'Personalised guidance connects his arrival, appointments and follow-up.',
    needs: 'A person behind it (Handoff ownership or Staffed review) and an Arrival point to guide him to.',
    watch: 'Guides Arthur with no person behind it, or to a door nobody designed.',
  },
  vcon: {
    id: 'vcon', group: 'ai', faces: false, capital: 2, change: 2,
    name: 'AI-supported virtual consultation',
    benefit: 'Arthur and his wife join the conversation.',
    detail: 'A remote specialist joins the bedside team, with a live summary.',
    needs: 'A Family consultation room with clear sound and privacy.',
    watch: 'Without a consultation room it still works, but the space is borrowed.',
  },
  asst: {
    id: 'asst', group: 'ai', faces: true, capital: 1, change: 2,
    name: 'Conversational recovery assistant',
    benefit: 'Arthur can revisit the plan.',
    detail: 'He asks practical questions about clinician-approved instructions.',
    needs: 'A person behind it: Handoff ownership or Staffed review.',
    watch: 'Answers Arthur with no person confirming.',
  },
  mon: {
    id: 'mon', group: 'ai', faces: true, capital: 3, change: 2, unlock: 'learning',
    name: 'AI-assisted home monitoring',
    benefit: 'A change at home can prompt review.',
    detail: 'Agreed monitoring flags changes that may need clinical attention.',
    needs: 'A staffed response pathway and a Home-readiness suite so Arthur can use it.',
    watch: 'Alerts Arthur’s team with no one to act, or is switched on at an unprepared home.',
  },
  hand: {
    id: 'hand', group: 'people', faces: false, capital: 1, change: 2,
    name: 'Arrival & handoff ownership',
    benefit: 'Someone accepts Arthur’s next step.',
    detail: 'Named responsibilities and a shared handoff connect arrival, overnight care and follow-up.',
    needs: 'A place to receive him: an Arrival point.',
    watch: 'Backs navigation and the assistant. Owns one place in a surge.',
  },
  staff: {
    id: 'staff', group: 'people', faces: false, capital: 1, change: 3,
    name: 'Staffed review & response',
    benefit: 'A person can confirm the answer and act.',
    detail: 'Designated staff review unresolved questions and respond to escalations.',
    needs: 'Protected time, and a place to work from.',
    watch: 'Backs up to 2 AI tools, 1 in a surge (monitoring first). Owns one place in a surge.',
  },
  arr: {
    id: 'arr', group: 'place', faces: false, capital: 2, change: 1,
    name: 'Arrival point',
    benefit: 'Arthur is met at a door built for him.',
    detail: 'A clear approach, a seat, and a spot where a named person receives him.',
    needs: 'Someone expecting him (Handoff ownership), and an owner when the hospital fills.',
    watch: 'Unowned, it is reclaimed for overflow in a surge.',
  },
  fam: {
    id: 'fam', group: 'place', faces: false, capital: 3, change: 1,
    name: 'Family consultation room',
    benefit: 'Arthur and his wife can hear, ask and be heard.',
    detail: 'Private, with good acoustics, seating for two, and sightlines to a clinician and a screen.',
    needs: 'Someone who can confirm the plan (Staffed review or a backed assistant), and an owner when the hospital fills.',
    watch: 'Unowned, it is reclaimed for overflow in a surge.',
  },
  room: {
    id: 'room', group: 'place', faces: false, capital: 3, change: 1,
    name: 'Quiet patient room',
    benefit: 'Arthur can rest and reach what he needs.',
    detail: 'Acoustics, controllable lighting and reachable controls in a short-stay room.',
    needs: 'Someone to answer when he calls, and an owner when the hospital fills. It adds no bed capacity.',
    watch: 'Unowned, it is reclaimed for overflow in a surge.',
  },
  home: {
    id: 'home', group: 'place', faces: false, capital: 2, change: 2,
    name: 'Home-readiness suite',
    benefit: 'Home is a prepared next step.',
    detail: 'A teach-back space that looks like home: the team checks understanding, equipment and the route back before discharge.',
    needs: 'Clinical clearance, and an owner when the hospital fills. It is readiness, not discharge authorisation.',
    watch: 'Unowned, it is reclaimed for overflow in a surge.',
  },
  flex: {
    id: 'flex', group: 'place', faces: false, capital: 3, change: 1, unlock: 'learning',
    name: 'Flexible swing space',
    benefit: 'Overflow has somewhere else to go.',
    detail: 'A room that changes use under surge so Arthur’s spaces stay his.',
    needs: 'Nothing, but it adds no staff.',
    watch: 'Protects up to two places in a surge.',
  },
};

export const CARD_ORDER = ['nav', 'vcon', 'asst', 'mon', 'hand', 'staff', 'arr', 'fam', 'room', 'home', 'flex'];
export const PLACE_IDS = ['arr', 'fam', 'room', 'home'];
export const ZONES = ['arr', 'fam', 'room', 'home', 'flex'];
export const AI_ZONE = { nav: 'arr', vcon: 'fam', asst: 'room', mon: 'home' };
export const placeName = (id) => CARDS[id].name.toLowerCase();

// ---------- Paths (the promise a table makes to Arthur, and the place it needs) ----------
export const PATHS = {
  confidence: {
    id: 'confidence', name: 'Confidence',
    promise: 'You’ll always understand what’s happening.',
    critical: [2, 4], signature: 'fam',
    requires: 'A family consultation room that someone owns.',
    question: 'Did Arthur still understand his plan when the hospital got busy?',
  },
  continuity: {
    id: 'continuity', name: 'Continuity',
    promise: 'No one will make you start over.',
    critical: [1, 3], signature: 'arr', also: 'hand',
    requires: 'An arrival point and a named person to receive him.',
    question: 'How many times did Arthur have to repeat himself?',
  },
  independence: {
    id: 'independence', name: 'Independence',
    promise: 'We’ll keep you out of the hospital where we safely can.',
    critical: [3, 4], signature: 'home',
    requires: 'A home-readiness suite that someone owns.',
    question: 'When Arthur went home, was he supported, or just sent away?',
  },
};
export const PATH_ORDER = ['confidence', 'continuity', 'independence'];

// When the surge reclaims space, owners protect the places your promise needs first.
const PRIORITY = {
  confidence: ['fam', 'room', 'arr', 'home'],
  continuity: ['arr', 'room', 'fam', 'home'],
  independence: ['home', 'room', 'arr', 'fam'],
};

export const MOMENTS = {
  1: { n: 1, key: 'arrival', title: 'Arrival', zone: 'arr', quote: '“They asked me to come back. Is anyone expecting me?”' },
  2: { n: 2, key: 'consult', title: 'The conversation', zone: 'fam', quote: '“We heard the explanation, but we still have questions.”' },
  3: { n: 3, key: 'night', title: 'The night', zone: 'room', quote: '“I need to stay tonight. Can I rest and get help?”' },
  4: { n: 4, key: 'surge', title: 'The surge', zone: null, quote: '“The hospital is suddenly much busier. Does our plan still work?”' },
};

export const STATE_VALUE = { helped: 2, fragile: 1, none: 0, hurt: -1 };
export const STATE_LABEL = { helped: 'Helped', fragile: 'Helped, but fragile', hurt: 'Hurt', none: 'No direct effect' };

// ---------- Budget helpers ----------
export const clean = (ids) => (ids || []).filter((id) => CARDS[id]);
export const cost = (ids) => clean(ids).reduce(
  (a, id) => ({ capital: a.capital + CARDS[id].capital, change: a.change + CARDS[id].change }),
  { capital: 0, change: 0 }
);
export const remaining = (ids) => {
  const c = cost(ids);
  return { capital: BUDGET.capital - c.capital, change: BUDGET.change - c.change };
};
export const withinBudget = (ids) => {
  const r = remaining(ids);
  return r.capital >= 0 && r.change >= 0;
};
export const canAdd = (ids, id, max) => !ids.includes(id) && ids.length < max && withinBudget([...ids, id]);

// ---------- Who stands behind each AI tool that faces Arthur ----------
export function backstops(S, { surge = false } = {}) {
  const has = (x) => S.includes(x);
  const tools = ['mon', 'asst', 'nav'].filter(has);
  const backed = {};
  const needStaff = [];
  tools.forEach((t) => {
    if ((t === 'nav' || t === 'asst') && has('hand')) backed[t] = 'hand';
    else needStaff.push(t);
  });
  const capacity = has('staff') ? (surge ? 1 : 2) : 0;
  needStaff.forEach((t, i) => { backed[t] = i < capacity ? 'staff' : null; });
  return backed;
}

// ---------- Who owns which place in a surge ----------
export function surgeOwnership(S, path) {
  const order = PRIORITY[path] || PRIORITY.confidence;
  const places = order.filter((p) => S.includes(p));
  const units = (S.includes('hand') ? 1 : 0) + (S.includes('staff') ? 1 : 0) + (S.includes('flex') ? 2 : 0);
  return { places, units, held: places.slice(0, units), lost: places.slice(units) };
}

const nm = (id) => CARDS[id].name;

function mk(n, state, needs, why, extra = {}) {
  const base = { helped: 2, fragile: 1, none: 0, hurt: -1 }[state];
  const bonus = state === 'hurt' ? 0 : (extra.bonus || 0);
  return {
    n, state, needs, why, bonus, delta: base + bonus,
    open: needs.filter((x) => !x.met).map((x) => x.label),
    weakness: extra.weakness || null,
    ai: extra.ai || null,
    chips: extra.chips || [], lost: extra.lost || [],
  };
}

// ---------- Moments 1-3 (evaluated on the round-1 portfolio) ----------
export function evalMoment(n, S0, path) {
  const S = clean(S0);
  const has = (x) => S.includes(x);
  const b = backstops(S);

  if (n === 1) {
    const expected = has('hand');
    const door = has('arr');
    const navBacked = has('nav') && !!b.nav;
    const needs = [
      { label: 'Someone expects Arthur', met: expected, by: 'hand' },
      { label: 'A door is built for him', met: door, by: 'arr' },
    ];
    if (has('nav') && !b.nav) {
      return mk(1, 'hurt', needs, `${nm('nav')} guided Arthur to a door with nobody behind it. AI that faces the patient with no person behind it makes the moment worse.`, { weakness: 'Unattended AI', ai: { id: 'nav', works: false } });
    }
    const ai = has('nav') ? { id: 'nav', works: navBacked && door } : null;
    const bonus = ai && ai.works ? AI_BONUS : 0;
    if (expected && door) return mk(1, 'helped', needs, bonus ? 'A named person was ready at a door built for him, and the guide walked them in.' : 'A named person was ready at a door built for him.', { bonus, ai });
    if (navBacked && !door) return mk(1, 'fragile', needs, 'The guide worked, but there was no designed door to send him to.', { weakness: 'No designed door', ai });
    if (door) return mk(1, 'fragile', needs, 'A door was built for him, but no one was named to receive him.', { weakness: 'No named owner', ai });
    if (expected) return mk(1, 'none', needs, 'A name was on a list, but no place had been designed to receive him. He arrived at the main desk and started from the beginning.', { weakness: 'No designed door', ai });
    return mk(1, 'none', needs, 'Nothing had been designed for his return. He arrived at the main desk and started from the beginning.', { ai });
  }

  if (n === 2) {
    const hear = has('fam');
    const spec = has('vcon');
    const confirm = has('staff') || (has('asst') && !!b.asst);
    const needs = [
      { label: 'He can hear and take part', met: hear, by: 'fam' },
      { label: 'The specialist is in the room', met: spec, by: 'vcon' },
      { label: 'Someone can confirm the plan', met: confirm, by: 'staff / asst' },
    ];
    if (has('asst') && !b.asst) {
      return mk(2, 'hurt', needs, `${nm('asst')} answered his questions and no person confirmed them. Arthur left with instructions nobody had checked.`, { weakness: 'Unattended AI', ai: { id: 'asst', works: false } });
    }
    const weak = spec && !hear;
    const ai = has('vcon') ? { id: 'vcon', works: hear } : null;
    const bonus = spec && hear ? AI_BONUS : 0;
    if (hear && (spec || confirm)) return mk(2, 'helped', needs, bonus ? 'He heard, the specialist joined in a room built for it, and the plan made sense.' : 'He heard, asked, and the plan made sense.', { bonus, ai });
    if (hear) return mk(2, 'fragile', needs, 'The room let him take part, but nobody could confirm the plan after the clinician left.', { weakness: 'Nobody to confirm', ai });
    if (spec) return mk(2, 'fragile', needs, 'The specialist joined, but sound and privacy were borrowed.', { weakness: 'Borrowed space', ai });
    if (confirm) return mk(2, 'none', needs, 'Someone could confirm the plan, but there was nowhere private to have the conversation. The questions went home with them.', { ai });
    return mk(2, 'none', needs, 'The conversation ended where it began. The questions went home with them.', { ai });
  }

  if (n === 3) {
    const rest = has('room');
    const answered = has('staff') || has('hand');
    const asstBacked = has('asst') && !!b.asst;
    const next = has('home') || asstBacked;
    const needs = [
      { label: 'He can rest', met: rest, by: 'room' },
      { label: 'Someone answers when he calls', met: answered, by: 'staff / hand' },
      { label: 'He knows what happens next', met: next, by: 'home / asst' },
    ];
    const ai = has('asst') ? { id: 'asst', works: asstBacked && rest } : null;
    const bonus = ai && ai.works ? AI_BONUS : 0;
    if (rest && (answered || next)) return mk(3, 'helped', needs, bonus ? 'He could rest, someone owned his call, and the assistant answered what he asked at night.' : 'He could rest, and someone owned his call.', { bonus, ai });
    if (rest) return mk(3, 'fragile', needs, 'The room was built for rest, but nobody owned his call.', { weakness: 'No one to answer', ai });
    if (answered && next) return mk(3, 'fragile', needs, 'Someone answered and he knew what came next, but the room was not built for rest.', { weakness: 'No room for rest', ai });
    if (answered || next) return mk(3, 'none', needs, answered ? 'Someone answered, but the room was not built for rest, so the night went the way a standard night goes.' : 'He knew the plan for home, but the night itself was not designed.', { ai });
    return mk(3, 'none', needs, 'The night went the way a standard night goes. Nothing had been designed for him.', { ai });
  }

  return evalSurge(S, path);
}

// ---------- Moment 4: the surge ----------
export function evalSurge(S0, path) {
  const S = clean(S0);
  const has = (x) => S.includes(x);
  const sb = backstops(S, { surge: true });
  const own = surgeOwnership(S, path);
  const chips = [];

  // 1) Space: places need owners
  if (own.places.length || has('vcon') || has('flex')) {
    if (own.lost.length) {
      chips.push({ id: 'space', label: 'Space', state: 'fragile', text: `The ${placeName(own.lost[0])} was reclaimed for overflow because nobody owned it.` });
    } else if (has('vcon') && !has('fam')) {
      chips.push({ id: 'space', label: 'Space', state: 'fragile', text: 'The consultation relied on borrowed space, and that space is now occupied.' });
    } else if (own.places.length) {
      chips.push({ id: 'space', label: 'Space', state: 'helped', text: has('flex') ? 'Overflow went to the swing space, so Arthur’s rooms stayed his.' : 'Everything built for Arthur was held, because someone owned it.' });
    } else {
      chips.push({ id: 'space', label: 'Space', state: 'helped', text: 'Overflow went to the swing space and the hospital kept moving.' });
    }
  }

  // 2) Staff: AI at home needs a person
  const homeTools = ['mon', 'asst'].filter(has);
  const unbacked = homeTools.filter((t) => !sb[t]);
  if (unbacked.length) {
    chips.push({ id: 'staff', label: 'Staff', state: 'hurt', text: `${nm(unbacked[0])} had nobody to act on it. Staff cover narrowed to one tool and this one lost its person.` });
  } else if (homeTools.length) {
    chips.push({ id: 'staff', label: 'Staff', state: 'helped', text: 'Every AI tool Arthur relies on at home still had a person behind it when staff were stretched.' });
  }

  // 3) Home: going home was prepared, or it was not
  if (has('home')) {
    if (own.lost.includes('home')) chips.push({ id: 'home', label: 'Home', state: 'fragile', text: 'The home-readiness suite became overflow, and Arthur’s teach-back was rushed.' });
    else chips.push({ id: 'home', label: 'Home', state: 'helped', text: 'Going home was a prepared next step, not just a bed that had to be freed.' });
  } else if (has('mon') || has('asst')) {
    chips.push({ id: 'home', label: 'Home', state: 'fragile', text: 'The push to discharge arrived and nobody had prepared Arthur’s home to carry the plan.' });
  }

  // 4) Reach: what a backed AI tool adds that rooms and people alone cannot
  if (has('mon') && sb.mon) {
    chips.push(has('home')
      ? { id: 'reach', label: 'Reach', state: 'helped', w: AI_BONUS, text: 'Monitoring watched over Arthur at home, and a person was ready to act.' }
      : { id: 'reach', label: 'Reach', state: 'fragile', text: 'Monitoring was switched on at home, but nobody had prepared Arthur and his wife to use it.' });
  } else if (has('asst') && sb.asst) {
    chips.push({ id: 'reach', label: 'Reach', state: 'helped', w: 1, text: 'The assistant kept answering Arthur while phones were busy, with a person behind it.' });
  }

  const val = { helped: 1, fragile: 0, hurt: -1 };
  const sum = chips.reduce((a, c) => a + val[c.state] * (c.state === 'helped' ? (c.w || 1) : 1), 0);
  const delta = Math.max(-2, Math.min(5, sum));
  let state = 'none';
  if (chips.length) {
    if (chips.some((c) => c.state === 'hurt')) state = 'hurt';
    else if (chips.every((c) => c.state === 'helped')) state = 'helped';
    else state = 'fragile';
  }
  const why = state === 'none'
    ? 'The surge arrived and nothing had been designed to meet it. Arthur simply waited it out.'
    : chips.map((c) => c.text).join(' ');
  return { n: 4, state, delta, bonus: 0, chips, needs: [], why, open: [], weakness: null, ai: null, lost: own.lost };
}

// ---------- A whole table's run ----------
export function runTable({ path, round1 = [], final = null }) {
  const r1 = clean(round1);
  const fin = clean(final ?? r1);
  const moments = [evalMoment(1, r1, path), evalMoment(2, r1, path), evalMoment(3, r1, path), evalSurge(fin, path)];
  let line = START_LINE;
  const trail = [line];
  moments.forEach((m) => { line = Math.max(0, Math.min(MAX_LINE, line + m.delta)); trail.push(line); });
  const promise = path ? evalPromise(path, moments, fin) : null;
  return { moments, trail, line, band: band(line), promise, holds: holds(fin, path), final: fin, round1: r1 };
}

export function band(line) {
  // Design and people alone top out at 8. Thriving (9+) needs AI that works, with a person behind it and a place to work in.
  if (line >= 9) return { id: 'thriving', label: 'Arthur is thriving at home' };
  if (line >= 6) return { id: 'well', label: 'Arthur is recovering well' };
  if (line >= 4) return { id: 'gaps', label: 'Arthur is recovering, with gaps' };
  return { id: 'setback', label: 'Arthur has a setback' };
}

export function evalPromise(pathId, moments, final = []) {
  const p = PATHS[pathId];
  const vals = p.critical.map((n) => ({ n, state: moments[n - 1].state, v: STATE_VALUE[moments[n - 1].state] }));
  const sum = vals.reduce((a, x) => a + x.v, 0);
  let result = 'not';
  if (vals.some((x) => x.state === 'hurt')) result = 'broken';
  else if (sum >= 3) result = 'kept';
  else if (sum >= 1) result = 'partly';

  // A promise is a design brief: it needs its signature place, owned.
  let missing = null;
  if (!final.includes(p.signature)) {
    missing = `This promise needs a ${placeName(p.signature)}.`;
  } else if (p.also && !final.includes(p.also)) {
    missing = `This promise needs a named person: ${CARDS[p.also].name}.`;
  } else if (p.critical.includes(4) && moments[3].lost && moments[3].lost.includes(p.signature)) {
    missing = `The ${placeName(p.signature)} was reclaimed in the surge because nobody owned it.`;
  }
  if (missing && result === 'kept') result = 'partly';
  const label = { kept: 'Promise kept', partly: 'Promise partly kept', not: 'Promise not kept', broken: 'Promise broken' }[result];
  return { result, label, critical: vals, missing };
}

// "Holds" is a hard gate: an investment holds only when what it depends on is funded.
export function holds(S0, path) {
  const S = clean(S0);
  const sb = backstops(S, { surge: true });
  const own = surgeOwnership(S, path);
  return S.map((id) => {
    let ok = true;
    let why = 'Holds.';
    const c = CARDS[id];
    if (c.faces && !sb[id]) { ok = false; why = 'No funded person behind it when staff are stretched.'; }
    else if (id === 'vcon' && !S.includes('fam')) { ok = false; why = 'No consultation room to hold it in.'; }
    else if (id === 'nav' && !S.includes('arr')) { ok = false; why = 'No arrival point to guide him to.'; }
    else if (id === 'mon' && !S.includes('home')) { ok = false; why = 'Arthur was never prepared to use it at home.'; }
    else if (id === 'hand' && !S.includes('arr')) { ok = false; why = 'A named person with no place to receive him.'; }
    else if (id === 'staff' && !S.some((x) => CARDS[x].group === 'place')) { ok = false; why = 'Staff with no place to work from.'; }
    else if (own.lost.includes(id)) { ok = false; why = 'No funded owner to protect it when the hospital fills.'; }
    return { id, ok, label: ok ? 'Holds' : 'Designed, not yet operational', why };
  });
}

// ---------- The plan strip: what the building looks like at each moment ----------
export function planState(S0, n, path) {
  const S = clean(S0);
  const own = surgeOwnership(S, path);
  const b = backstops(S, { surge: n === 4 });
  const zones = ZONES.map((z) => {
    const built = S.includes(z);
    const lost = n === 4 && own.lost.includes(z);
    const ai = Object.keys(AI_ZONE).find((a) => AI_ZONE[a] === z && S.includes(a)) || null;
    const aiWorks = !ai ? false
      : ai === 'vcon' ? S.includes('fam')
      : ai === 'nav' ? (!!b.nav && S.includes('arr'))
      : ai === 'mon' ? (!!b.mon && S.includes('home'))
      : !!b[ai];
    return { id: z, built, lost, ai, aiWorks, active: MOMENTS[n] && MOMENTS[n].zone === z };
  });
  return { zones, people: { hand: S.includes('hand'), staff: S.includes('staff') }, owned: own.held };
}

// ---------- The learning move ----------
export function legalMoves(round1) {
  const moves = [{ type: 'hold', final: [...round1] }];
  CARD_ORDER.forEach((id) => {
    if (!round1.includes(id)) {
      const added = [...round1, id];
      if (added.length <= BUDGET.finalMax && withinBudget(added)) moves.push({ type: 'add', id, final: added });
    }
  });
  round1.forEach((out) => {
    CARD_ORDER.forEach((inn) => {
      if (inn !== out && !round1.includes(inn)) {
        const sw = round1.filter((x) => x !== out).concat(inn);
        if (withinBudget(sw)) moves.push({ type: 'swap', out, id: inn, final: sw });
      }
    });
  });
  return moves;
}

export function legalRound1() {
  const ids = CARD_ORDER.filter((id) => !CARDS[id].unlock);
  const out = [[]];
  const rec = (start, cur) => {
    for (let i = start; i < ids.length; i++) {
      const next = [...cur, ids[i]];
      if (next.length > BUDGET.round1Max || !withinBudget(next)) continue;
      out.push(next);
      rec(i + 1, next);
    }
  };
  rec(0, []);
  return out;
}
