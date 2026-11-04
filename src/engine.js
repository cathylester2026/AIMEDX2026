// ============================================================
// BY DESIGN · ARTHUR'S RETURN  —  game engine (pure, no UI)
// Everything the app shows about outcomes is computed here, so
// the same rules run on the phone, the projector and the tests.
// ============================================================

export const BUDGET = { capital: 8, change: 9, round1Max: 3, finalMax: 4 };
export const START_LINE = 3;
export const MAX_LINE = 12;

// ---------- Investments ----------
// kind 'ai'      = an AI capability
// kind 'support' = a design / operating decision with its own benefit for Arthur
// faces: AI that talks to Arthur directly. If no person is behind it => "Unattended AI" (the only way to be HURT).
export const CARDS = {
  nav: {
    id: 'nav', kind: 'ai', faces: true, capital: 2, change: 2,
    name: 'AI care navigation',
    benefit: 'Arthur knows his next step.',
    detail: 'Personalised guidance connects his arrival, appointments and follow-up.',
    needs: 'A person who handles exceptions: Arrival & handoff ownership, or Staffed review.',
    watch: 'Guides Arthur with no person behind it.',
  },
  vcon: {
    id: 'vcon', kind: 'ai', faces: false, capital: 3, change: 1,
    name: 'AI-supported virtual consultation',
    benefit: 'Arthur and his wife join the conversation.',
    detail: 'A remote specialist joins the bedside team, with a live summary.',
    needs: 'Clear sound and privacy: a Quiet, accessible care space.',
    watch: 'Without a quiet space it still works, but the room is borrowed.',
  },
  asst: {
    id: 'asst', kind: 'ai', faces: true, capital: 1, change: 2,
    name: 'Conversational recovery assistant',
    benefit: 'Arthur can revisit the plan.',
    detail: 'He asks practical questions about clinician-approved instructions.',
    needs: 'A route to a person: Arrival & handoff ownership, or Staffed review.',
    watch: 'Answers Arthur with no person confirming.',
  },
  hand: {
    id: 'hand', kind: 'support', faces: false, capital: 2, change: 2,
    name: 'Arrival & handoff ownership',
    benefit: 'Someone accepts Arthur’s next step.',
    detail: 'Named responsibilities and a shared handoff connect arrival, overnight care and follow-up.',
    needs: 'Staff who accept responsibility.',
    watch: 'Backs navigation and the recovery assistant.',
  },
  quiet: {
    id: 'quiet', kind: 'support', faces: false, capital: 3, change: 1,
    name: 'Quiet, accessible care space',
    benefit: 'Arthur can hear, take part and rest.',
    detail: 'Acoustics, privacy, lighting and reachable controls.',
    needs: 'Someone to protect it when use changes. It adds no bed capacity.',
    watch: 'Under surge, an unowned quiet room is reclaimed.',
  },
  staff: {
    id: 'staff', kind: 'support', faces: false, capital: 1, change: 3,
    name: 'Staffed review & response',
    benefit: 'A person can confirm the answer and act.',
    detail: 'Designated staff review unresolved questions and respond to escalations.',
    needs: 'Protected time and coverage.',
    watch: 'Covers up to 2 AI tools. In a surge, only 1 (monitoring first, then the assistant).',
  },
  trans: {
    id: 'trans', kind: 'support', faces: false, capital: 2, change: 2,
    name: 'Supported transition home',
    benefit: 'Home is a prepared next step.',
    detail: 'The team checks understanding, practical support, access and the route back before discharge.',
    needs: 'Clinical clearance. This is readiness support, not discharge authorisation.',
    watch: 'Readiness for home: Monitoring and the assistant lean on it.',
  },
  mon: {
    id: 'mon', kind: 'ai', faces: true, capital: 3, change: 2, unlock: 'learning',
    name: 'AI-assisted home monitoring',
    benefit: 'A change at home can prompt review.',
    detail: 'Agreed monitoring flags changes that may need clinical attention.',
    needs: 'A staffed response pathway. Detection does not guarantee action.',
    watch: 'Alerts Arthur’s team with no one to act.',
  },
};

export const CARD_ORDER = ['nav', 'vcon', 'asst', 'hand', 'quiet', 'staff', 'trans', 'mon'];

// ---------- Paths (the promise a table makes to Arthur) ----------
export const PATHS = {
  confidence: {
    id: 'confidence', name: 'Confidence',
    promise: 'You’ll always understand what’s happening.',
    critical: [2, 4],
    question: 'Did Arthur still understand his plan when the hospital got busy?',
  },
  continuity: {
    id: 'continuity', name: 'Continuity',
    promise: 'No one will make you start over.',
    critical: [1, 3],
    requires: 'A named person receiving Arthur, not just a connected record.',
    question: 'How many times did Arthur have to repeat himself?',
  },
  independence: {
    id: 'independence', name: 'Independence',
    promise: 'We’ll keep you out of the hospital where we safely can.',
    critical: [3, 4],
    requires: 'A prepared transition home.',
    question: 'When Arthur went home, was he supported, or just sent away?',
  },
};
export const PATH_ORDER = ['confidence', 'continuity', 'independence'];

// ---------- Moments ----------
export const MOMENTS = {
  1: { n: 1, key: 'arrival', title: 'Arrival', quote: '“They asked me to come back. Is anyone expecting me?”' },
  2: { n: 2, key: 'consult', title: 'The conversation', quote: '“We heard the explanation, but we still have questions.”' },
  3: { n: 3, key: 'night', title: 'The night', quote: '“I need to stay tonight. Can I rest and get help?”' },
  4: { n: 4, key: 'surge', title: 'The surge', quote: '“The hospital is suddenly much busier. Does our plan still work?”' },
};

export const STATE_VALUE = { helped: 2, fragile: 1, none: 0, hurt: -1 };
export const STATE_LABEL = {
  helped: 'Helped',
  fragile: 'Helped, but fragile',
  hurt: 'Hurt',
  none: 'No direct effect',
};

// ---------- Budget helpers ----------
export const cost = (ids) => ids.reduce(
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
export const canAdd = (ids, id, max) =>
  !ids.includes(id) && ids.length < max && withinBudget([...ids, id]);

// ---------- Who stands behind each AI tool that faces Arthur ----------
// hand backs nav + asst. staff covers up to 2 of the remaining tools (1 in a surge),
// home tools first (mon, asst, nav).
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

const nm = (id) => CARDS[id].name;

// ---------- Moment evaluation ----------
// Returns { n, state, delta, needs:[{label, met}], why, open:[labels], weakness }
export function evalMoment(n, S) {
  const has = (x) => S.includes(x);
  const b = backstops(S, { surge: false });

  if (n === 1) {
    const expected = has('hand');
    const guided = has('nav') && !!b.nav;
    const needs = [
      { label: 'Someone expects Arthur', met: expected, by: 'hand' },
      { label: 'He is guided in', met: guided, by: 'nav' },
    ];
    if (has('nav') && !b.nav) {
      return mk(1, 'hurt', needs, `${nm('nav')} sent Arthur to a door with nobody behind it. AI that faces the patient with no person behind it makes the moment worse.`, 'Unattended AI');
    }
    const score = +expected + +guided;
    if (score === 2) return mk(1, 'helped', needs, 'A named person was ready for him, and the guide walked them in.');
    if (expected) return mk(1, 'fragile', needs, 'Someone was expecting him, but nothing guided him in. The way to the right door was left to Arthur and his wife.', 'No guidance');
    if (guided) return mk(1, 'fragile', needs, 'The guide worked and staff handled exceptions, but no one was named to receive him.', 'No named owner');
    return mk(1, 'none', needs, 'Nothing had been designed for his return. He arrived at the main desk and started from the beginning.');
  }

  if (n === 2) {
    const hear = has('quiet');
    const spec = has('vcon');
    const revisit = has('asst') && !!b.asst;
    const needs = [
      { label: 'He can hear and take part', met: hear, by: 'quiet' },
      { label: 'The specialist is in the room', met: spec, by: 'vcon' },
      { label: 'He can revisit the plan with a person behind it', met: revisit, by: 'asst' },
    ];
    if (has('asst') && !b.asst) {
      return mk(2, 'hurt', needs, `${nm('asst')} answered his questions and no person confirmed them. Arthur left with instructions nobody had checked.`, 'Unattended AI');
    }
    const weakness = spec && !hear ? 'The specialist joined, but sound and privacy were borrowed.' : null;
    const score = +hear + +spec + +revisit;
    if (score >= 2 && !weakness) return mk(2, 'helped', needs, 'He heard, asked, and the plan made sense to him and his wife.');
    if (score >= 1) {
      const why = weakness || (hear ? 'The room let him take part, but the specialist and the plan still ended when the clinician left.' : 'Part of what he needed was designed. The rest was left to chance.');
      return mk(2, 'fragile', needs, why, weakness);
    }
    return mk(2, 'none', needs, 'The conversation ended where it began. The questions went home with them.');
  }

  if (n === 3) {
    const rest = has('quiet');
    const answered = has('staff') || has('hand');
    const next = has('trans') || (has('asst') && !!b.asst);
    const needs = [
      { label: 'He can rest', met: rest, by: 'quiet' },
      { label: 'Someone answers when he calls', met: answered, by: 'staff / hand' },
      { label: 'He knows what happens next', met: next, by: 'trans / asst' },
    ];
    const score = +rest + +answered + +next;
    if (score >= 2) return mk(3, 'helped', needs, 'He could rest, and someone owned his call.');
    if (score === 1) {
      const why = rest ? 'The room was built for rest, but nobody owned his call.'
        : answered ? 'Someone answered, but the room was not built for rest.'
        : 'He knew the plan for home, but the night itself was not designed.';
      return mk(3, 'fragile', needs, why, 'One need met');
    }
    return mk(3, 'none', needs, 'The night went the way a standard night goes. Nothing was designed for him.');
  }

  return evalSurge(S);
}

export function evalSurge(S) {
  const has = (x) => S.includes(x);
  const sb = backstops(S, { surge: true });
  const chips = [];

  // 1) Space pressure
  if (has('quiet') || has('vcon')) {
    if (has('quiet') && (has('hand') || has('staff'))) {
      chips.push({ id: 'space', label: 'Space', state: 'helped', text: 'The quiet room was held for Arthur because someone owned it.' });
    } else if (has('quiet')) {
      chips.push({ id: 'space', label: 'Space', state: 'fragile', text: 'The quiet room had no owner, so it was reclaimed for overflow.' });
    } else {
      chips.push({ id: 'space', label: 'Space', state: 'fragile', text: 'The consultation relied on borrowed space, and that space is now occupied.' });
    }
  }

  // 2) Staff pressure: only the tools Arthur is using at home (monitoring, assistant) are tested
  const homeTools = ['mon', 'asst'].filter(has);
  const unbacked = homeTools.filter((t) => !sb[t]);
  if (unbacked.length) {
    chips.push({ id: 'staff', label: 'Staff', state: 'hurt', text: `${nm(unbacked[0])} had nobody to act on it. Staff cover narrowed to one tool and this one lost its person.` });
  } else if (homeTools.length) {
    chips.push({ id: 'staff', label: 'Staff', state: 'helped', text: 'Every AI tool Arthur relies on at home still had a person behind it when staff were stretched.' });
  }

  // 3) Discharge pressure
  if (has('trans') || has('mon') || has('asst')) {
    if (has('trans')) chips.push({ id: 'home', label: 'Home', state: 'helped', text: 'Going home was a prepared next step, not just a bed that had to be freed.' });
    else chips.push({ id: 'home', label: 'Home', state: 'fragile', text: 'The push to discharge arrived and nobody had checked that Arthur’s home could carry the plan.' });
  }

  // 4) Reach: what a backed AI tool adds that people and rooms alone cannot
  const reach = homeTools.filter((t) => sb[t]);
  if (reach.length) {
    chips.push({
      id: 'reach', label: 'Reach', state: 'helped',
      text: reach.includes('mon')
        ? 'Monitoring let the team watch over Arthur at home without a bed, and a person was ready to act.'
        : 'The assistant kept answering Arthur while phones were busy, with a person behind it.',
    });
  }

  const chipVal = { helped: 1, fragile: 0, hurt: -1 };
  const sum = chips.reduce((a, c) => a + chipVal[c.state], 0);
  const delta = Math.max(-2, Math.min(4, sum));
  let state = 'none';
  if (chips.length) {
    if (chips.some((c) => c.state === 'hurt')) state = 'hurt';
    else if (chips.every((c) => c.state === 'helped')) state = 'helped';
    else state = 'fragile';
  }
  const why = state === 'none'
    ? 'The surge arrived and nothing had been designed to meet it. Arthur simply waited it out.'
    : chips.map((c) => c.text).join(' ');
  return { n: 4, state, delta, chips, needs: [], why, open: [], weakness: null };
}

function mk(n, state, needs, why, weakness = null) {
  const delta = { helped: 2, fragile: 1, none: 0, hurt: -1 }[state];
  return { n, state, delta, needs, why, open: needs.filter((x) => !x.met).map((x) => x.label), weakness };
}

// ---------- A whole table's run ----------
// round1: portfolio chosen before moments 1-3. final: portfolio after the learning move (used for the surge).
export function runTable({ path, round1 = [], final = null }) {
  const fin = final ?? round1;
  const moments = [evalMoment(1, round1), evalMoment(2, round1), evalMoment(3, round1), evalSurge(fin)];
  let line = START_LINE;
  const trail = [line];
  moments.forEach((m) => { line = Math.max(0, Math.min(MAX_LINE, line + m.delta)); trail.push(line); });
  const promise = path ? evalPromise(path, moments, fin) : null;
  return { moments, trail, line, band: band(line), promise, holds: holds(fin) };
}

export function band(line) {
  if (line >= 10) return { id: 'thriving', label: 'Arthur is thriving at home' };
  if (line >= 8) return { id: 'well', label: 'Arthur is recovering well' };
  if (line >= 5) return { id: 'gaps', label: 'Arthur is recovering, with gaps' };
  return { id: 'setback', label: 'Arthur has a setback' };
}

export function evalPromise(pathId, moments, final = []) {
  const p = PATHS[pathId];
  const vals = p.critical.map((n) => ({ n, state: moments[n - 1].state, v: STATE_VALUE[moments[n - 1].state] }));
  const sum = vals.reduce((a, x) => a + x.v, 0);
  let result = 'not';
  let missing = null;
  if (vals.some((x) => x.state === 'hurt')) result = 'broken';
  else if (sum >= 3) result = 'kept';
  else if (sum >= 1) result = 'partly';
  // Continuity is only kept when the arrival itself was accountable (a named owner), not just a connected record.
  if (pathId === 'continuity' && result === 'kept' && moments[0].state !== 'helped' && !(moments[0].needs && moments[0].needs[0].met)) {
    result = 'partly';
    missing = 'A connected record without a named owner.';
  }
  // Independence is only kept when going home was actually prepared.
  if (pathId === 'independence' && result === 'kept') {
    if (!final.includes('trans')) {
      result = 'partly';
      missing = 'Going home was not prepared.';
    }
  }
  const label = { kept: 'Promise kept', partly: 'Promise partly kept', not: 'Promise not kept', broken: 'Promise broken' }[result];
  return { result, label, critical: vals, missing };
}

// "Holds" is a hard gate: an investment holds only when what it depends on is actually funded.
export function holds(S) {
  const sb = backstops(S, { surge: true });
  return S.map((id) => {
    let ok = true;
    let why = 'Holds.';
    if (CARDS[id].faces && !sb[id]) { ok = false; why = 'No funded person behind it when staff are stretched.'; }
    if (id === 'quiet' && !(S.includes('hand') || S.includes('staff'))) { ok = false; why = 'No owner to protect it when use changes.'; }
    if (id === 'vcon' && !S.includes('quiet')) { ok = false; why = 'No quiet space to hold it in.'; }
    return { id, ok, label: ok ? 'Holds' : 'Designed, not yet operational', why };
  });
}

// ---------- The learning move ----------
// One move: add a card, or swap one card for another (tokens returned). Or hold.
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
