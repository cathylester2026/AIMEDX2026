import React, { useState } from 'react';

// ---------- Environment / assets ----------
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};
export const BASE = ENV.BASE_URL || './';
export const img = (f) => `${BASE}img/${f}`;

// The base image for each moment already shows one state. Any other state looks for
// m{n}_{state}.jpg in /public/img and falls back to the base image with a colour treatment.
const BASE_STATE = { 1: 'helped', 2: 'helped', 3: 'helped', 4: 'fragile' };

export function MomentImage({ n, state, className = '' }) {
  const [failed, setFailed] = useState(false);
  const wantsVariant = state && state !== BASE_STATE[n] && state !== 'none';
  const file = wantsVariant && !failed ? `m${n}_${state}.jpg` : `m${n}.jpg`;
  const fx = state && state !== BASE_STATE[n] && (failed || !wantsVariant) ? `fx-${state}` : '';
  return (
    <div className={`pic ${className}`}>
      <img
        src={img(file)}
        alt=""
        className={fx}
        onError={() => { if (!failed) setFailed(true); }}
      />
    </div>
  );
}

export function Pic({ file, className = '' }) {
  return (
    <div className={`pic ${className}`}>
      <img src={img(file)} alt="" />
    </div>
  );
}

// ---------- Glyphs (one per investment, plus states) ----------
export function Glyph({ id, size = 30 }) {
  const p = {
    width: size, height: size, viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  };
  switch (id) {
    case 'nav':
      return (<svg {...p}><circle cx="8" cy="24" r="2.6" /><circle cx="24" cy="8" r="2.6" /><path d="M10.5 22.5c9 0 1-13 11-13.5" /><path d="M21 5.5l3 2.5-3 2.5" /></svg>);
    case 'vcon':
      return (<svg {...p}><rect x="3.5" y="5.5" width="25" height="17" rx="2.5" /><circle cx="16" cy="12" r="2.8" /><path d="M10.5 19c.8-3 3-4 5.5-4s4.7 1 5.5 4" /><path d="M11 27h10M16 22.5V27" /></svg>);
    case 'asst':
      return (<svg {...p}><path d="M5 6.5h22v15H15.5L9 27v-5.5H5z" /><circle cx="11" cy="14" r=".9" fill="currentColor" /><circle cx="16" cy="14" r=".9" fill="currentColor" /><circle cx="21" cy="14" r=".9" fill="currentColor" /></svg>);
    case 'hand':
      return (<svg {...p}><circle cx="12" cy="16" r="7" /><circle cx="20" cy="16" r="7" /><path d="M16 11.5v9" strokeDasharray="1.5 2.5" /></svg>);
    case 'quiet':
      return (<svg {...p}><path d="M22 5.5A11 11 0 1 0 26.5 21 9 9 0 0 1 22 5.5z" /><path d="M20 13h4M22 11v4" /></svg>);
    case 'staff':
      return (<svg {...p}><circle cx="12.5" cy="10.5" r="4.2" /><path d="M4.5 27c0-5.5 3.6-8.5 8-8.5s8 3 8 8.5" /><path d="M25 5.5v8M21 9.5h8" /></svg>);
    case 'trans':
      return (<svg {...p}><path d="M4.5 15.5L16 5.5l11.5 10" /><path d="M7.5 13.5V27h17V13.5" /><path d="M13.5 27v-7h5v7" /></svg>);
    case 'mon':
      return (<svg {...p}><circle cx="16" cy="16" r="12" /><path d="M6 17h5.5l2.5-6 4 11 2.5-5H26" /></svg>);
    default:
      return (<svg {...p}><circle cx="16" cy="16" r="10" /></svg>);
  }
}

export function StateGlyph({ state, size = 20 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (state === 'helped') return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>);
  if (state === 'fragile') return (<svg {...p}><circle cx="12" cy="12" r="9" strokeDasharray="4 2.5" /><path d="M7.5 12.5l3 3 6-6.5" /></svg>);
  if (state === 'hurt') return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" /></svg>);
  return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12h8" /></svg>);
}

// ---------- Phases (facilitator guidance lives here, in plain words) ----------
export const PHASES = [
  { id: 'lobby', title: 'Join', mins: 3,
    say: 'Scan the code and choose your table number. Several phones can share one table. Everything you do at a table is shared.',
    ask: null },
  { id: 'intro', title: 'Meet Arthur', mins: 2,
    say: 'Arthur is recovering at home after cardiac surgery. This week the hospital asks him to come back. Four moments will strain the system around him. Every table sees the same information.',
    ask: 'What would make coming back feel safe for Arthur and his wife?' },
  { id: 'path', title: 'Make a promise', mins: 2,
    say: 'Each table makes one promise to Arthur. It cannot be changed later. Read the line under the promise: it tells you what that promise needs.',
    ask: 'Which promise would Arthur want most from you?' },
  { id: 'invest', title: 'Invest', mins: 4,
    say: 'You have 8 Capital and 9 Change. Choose up to three investments. Read each Needs line. If an AI tool talks to Arthur, someone has to be behind it.',
    ask: 'Who is behind each AI tool you chose?' },
  { id: 'm1', title: 'Moment 1 · Arrival', mins: 2,
    say: 'Reveal one beat at a time: Arthur, then why, then the price. Let the room react to the picture before the words.',
    ask: 'Who was waiting for Arthur?' },
  { id: 'm2', title: 'Moment 2 · The conversation', mins: 2,
    say: 'Same three beats. Point at the open needs: they are the design questions.',
    ask: 'What could Arthur hear and ask, and who confirmed the answer?' },
  { id: 'm3', title: 'Moment 3 · The night', mins: 2,
    say: 'Same three beats. This is the quietest moment, and the one most often left undesigned.',
    ask: 'Who answered when Arthur called?' },
  { id: 'learn', title: 'Learn and adjust', mins: 5,
    say: 'Walk to another table or read the board. Home monitoring is now available. Each table has one move: add a card, swap one, or hold. Tokens from a swapped card come back.',
    ask: 'What did another table do that you did not expect?' },
  { id: 'm4', title: 'Moment 4 · The surge', mins: 3,
    say: 'One shared surge. Staff are stretched, rooms are contested, and discharge pressure rises. Each table sees what its own choices did.',
    ask: 'What was designed, and what was hoped for?' },
  { id: 'close', title: 'Close', mins: 3,
    say: 'Show Arthur’s line, the promise, and what holds. “Designed, not yet operational” means a promise on a drawing with no funded person behind it.',
    ask: 'Which one decision would you change first, and who has to fund it?' },
];
export const PHASE_IDS = PHASES.map((p) => p.id);
export const phaseMeta = (id) => PHASES.find((p) => p.id === id) || PHASES[0];
export const momentOfPhase = (id) => ({ m1: 1, m2: 2, m3: 3, m4: 4 }[id] || null);

export const MOMENT_ASK = {
  1: 'Who was waiting for Arthur?',
  2: 'What could Arthur hear and ask, and who confirmed the answer?',
  3: 'Who answered when Arthur called?',
  4: 'What was designed, and what was hoped for?',
};

export const PATH_IMG = {
  confidence: 'path_confidence.jpg',
  continuity: 'path_continuity.jpg',
  independence: 'path_independence.jpg',
};

// Boards for solo play: three "other tables" so the learning round has something to compare.
export const DEMO_TABLES = [
  { table_no: 91, name: 'Table A', path: 'continuity', round1: ['nav', 'hand', 'quiet'], final: null },
  { table_no: 92, name: 'Table B', path: 'confidence', round1: ['vcon', 'quiet', 'staff'], final: null },
  { table_no: 93, name: 'Table C', path: 'independence', round1: ['trans', 'staff', 'asst'], final: null },
];

export const WHY_DESIGN = [
  'Every weakness you saw was a room, a handoff, a team or a space. It was decided before it was a technology.',
  '“Designed, not yet operational” is a promise on a drawing with no funded person behind it.',
  'AI feels invisible to Arthur only when the building, the people and the plan are designed around it.',
];

export const TAKE_HOME = [
  'Pick one care moment in your own hospital.',
  'Name the person behind each AI tool that faces a patient.',
  'Name the room that holds it, and who protects that room under pressure.',
  'Name what you would stop funding so it can operate.',
];
