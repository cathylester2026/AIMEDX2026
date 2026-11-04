import React, { useState } from 'react';
import { planState, ZONES } from './engine.js';

// ---------- Environment / assets ----------
const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};
export const BASE = ENV.BASE_URL || './';
export const img = (f) => `${BASE}img/${f}`;

// Each moment has a picture for every state (m{n}_{state}.jpg). The base image m{n}.jpg is
// the fallback and is shown, with a colour treatment, if a state picture is missing.
const BASE_STATE = { 1: 'helped', 2: 'helped', 3: 'helped', 4: 'fragile' };

export function MomentImage({ n, state, className = '' }) {
  const [failed, setFailed] = useState(false);
  const wantsVariant = state && state !== BASE_STATE[n] && state !== 'none';
  const file = wantsVariant && !failed ? `m${n}_${state}.jpg` : `m${n}.jpg`;
  const fx = state && state !== BASE_STATE[n] && (failed || !wantsVariant) ? `fx-${state}` : '';
  return (
    <div className={`pic ${className}`}>
      <img src={img(file)} alt="" className={fx} onError={() => { if (!failed) setFailed(true); }} />
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
export function Glyph({ id, size = 30, x, y }) {
  const p = {
    width: size, height: size, viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
  };
  if (x !== undefined) p.x = x;
  if (y !== undefined) p.y = y;
  switch (id) {
    case 'nav':
      return (<svg {...p}><circle cx="8" cy="24" r="2.6" /><circle cx="24" cy="8" r="2.6" /><path d="M10.5 22.5c9 0 1-13 11-13.5" /><path d="M21 5.5l3 2.5-3 2.5" /></svg>);
    case 'vcon':
      return (<svg {...p}><rect x="3.5" y="5.5" width="25" height="17" rx="2.5" /><circle cx="16" cy="12" r="2.8" /><path d="M10.5 19c.8-3 3-4 5.5-4s4.7 1 5.5 4" /><path d="M11 27h10M16 22.5V27" /></svg>);
    case 'asst':
      return (<svg {...p}><path d="M5 6.5h22v15H15.5L9 27v-5.5H5z" /><circle cx="11" cy="14" r=".9" fill="currentColor" /><circle cx="16" cy="14" r=".9" fill="currentColor" /><circle cx="21" cy="14" r=".9" fill="currentColor" /></svg>);
    case 'mon':
      return (<svg {...p}><circle cx="16" cy="16" r="12" /><path d="M6 17h5.5l2.5-6 4 11 2.5-5H26" /></svg>);
    case 'hand':
      return (<svg {...p}><circle cx="12" cy="16" r="7" /><circle cx="20" cy="16" r="7" /><path d="M16 11.5v9" strokeDasharray="1.5 2.5" /></svg>);
    case 'staff':
      return (<svg {...p}><circle cx="12.5" cy="10.5" r="4.2" /><path d="M4.5 27c0-5.5 3.6-8.5 8-8.5s8 3 8 8.5" /><path d="M25 5.5v8M21 9.5h8" /></svg>);
    case 'arr':
      return (<svg {...p}><path d="M8 27V8.5A1.5 1.5 0 0 1 9.5 7h13A1.5 1.5 0 0 1 24 8.5V27" /><path d="M4.5 27h23" /><circle cx="20" cy="17.5" r="1" fill="currentColor" /><path d="M13 27v-3h6v3" /></svg>);
    case 'fam':
      return (<svg {...p}><rect x="4" y="5.5" width="24" height="21" rx="2.5" /><circle cx="12.5" cy="13" r="2.3" /><circle cx="19.5" cy="13" r="2.3" /><path d="M8.5 22c.6-2.5 2.2-3.5 4-3.5s3.4 1 4 3.5M15.5 22c.6-2.5 2.2-3.5 4-3.5s3.4 1 4 3.5" /></svg>);
    case 'room':
      return (<svg {...p}><path d="M22 5.5A11 11 0 1 0 26.5 21 9 9 0 0 1 22 5.5z" /><path d="M20 13h4M22 11v4" /></svg>);
    case 'home':
      return (<svg {...p}><path d="M4.5 15.5L16 5.5l11.5 10" /><path d="M7.5 13.5V27h17V13.5" /><path d="M13.5 27v-7h5v7" /></svg>);
    case 'flex':
      return (<svg {...p}><rect x="9.5" y="9.5" width="13" height="13" rx="2" strokeDasharray="2.5 2.5" /><path d="M16 3.5v3.5M16 25v3.5M3.5 16H7M25 16h3.5" /><path d="M13.5 5.5L16 3l2.5 2.5M13.5 26.5L16 29l2.5-2.5" /></svg>);
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

// ---------- The plan strip: the building Arthur moves through ----------
const ZONE_LABEL = { arr: 'Arrival', fam: 'Consult', room: 'Night', home: 'Home prep', flex: 'Swing' };

export function PlanStrip({ S, n, path }) {
  const ps = planState(S || [], n, path);
  const W = 340; const H = 150;
  const surge = n === 4;
  const nBuilt = ps.zones.filter((z) => z.built).length;
  const label = nBuilt === 0
    ? 'Nothing has been built for Arthur.'
    : `Built for Arthur: ${ps.zones.filter((z) => z.built).map((z) => ZONE_LABEL[z.id]).join(', ')}.`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="plan" role="img" aria-label={label}>
      <defs>
        <pattern id="plh" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="6" fill="#d98e1f" opacity=".3" />
        </pattern>
      </defs>
      {surge && <rect x="1" y="34" width={W - 2} height="84" rx="10" className="plan-surge" />}
      <line x1="6" x2={W - 6} y1="108" y2="108" className="plan-corridor" />
      {ps.zones.map((z, i) => {
        const x = 6 + i * 68;
        const cls = z.built ? (z.lost ? 'lost' : 'built') : 'empty';
        return (
          <g key={z.id}>
            {z.ai && (
              <g>
                <line x1={x + 28} y1={32} x2={x + 28} y2={44} className="plan-link" />
                <circle cx={x + 28} cy={20} r={13} className={`plan-ai ${z.aiWorks ? 'ok' : 'bad'}`} />
                <g className={`aig ${z.aiWorks ? 'ok' : 'bad'}`}><Glyph id={z.ai} size={16} x={x + 20} y={12} /></g>
              </g>
            )}
            <rect x={x} y={44} width={56} height={58} rx={8} className={`plan-z ${cls}${z.active ? ' active' : ''}`} />
            <g className={`zg ${cls}`}><Glyph id={z.id} size={28} x={x + 14} y={56} /></g>
            {surge && z.built && (
              <g className={z.lost ? 'zlost' : 'zheld'}>
                <circle cx={x + 52} cy={48} r={8} />
                {z.lost
                  ? <path d={`M${x + 49} 45l6 6M${x + 55} 45l-6 6`} />
                  : <path d={`M${x + 48.5} 48.5l2.5 2.5l4.5-5`} />}
              </g>
            )}
            <text x={x + 28} y={122} textAnchor="middle" className="plan-lbl">{ZONE_LABEL[z.id]}</text>
          </g>
        );
      })}
      <g className="plan-people">
        <g className={ps.people.hand ? 'on' : 'off'}><Glyph id="hand" size={16} x={6} y={H - 22} /><text x={26} y={H - 10}>Handoff owner</text></g>
        <g className={ps.people.staff ? 'on' : 'off'}><Glyph id="staff" size={16} x={120} y={H - 22} /><text x={140} y={H - 10}>Staffed review</text></g>
        {surge && <text x={W - 6} y={H - 10} textAnchor="end" className="plan-note">{ps.owned.length} place{ps.owned.length === 1 ? '' : 's'} protected</text>}
      </g>
    </svg>
  );
}
export { ZONES };

// ---------- Phases (facilitator guidance lives here, in plain words) ----------
export const PHASES = [
  { id: 'lobby', title: 'Join', mins: 3,
    say: 'Scan the code and choose your table number. Several phones can share one table. Everything you do at a table is shared.',
    ask: null },
  { id: 'intro', title: 'Meet Arthur', mins: 2,
    say: 'Arthur is recovering at home after cardiac surgery. This week the hospital asks him to come back. Four moments will strain the system around him. Every table sees the same information.',
    ask: 'What would make coming back feel safe for Arthur and his wife?' },
  { id: 'path', title: 'Make a promise', mins: 2,
    say: 'Each table makes one promise to Arthur and cannot change it. Every promise needs one place built for it. Read the line under the promise.',
    ask: 'Which promise would Arthur want most from you?' },
  { id: 'invest', title: 'Invest', mins: 4,
    say: 'You have 8 Capital and 9 Change. Choose up to three. AI needs people. People need places. Places need owners. The cards in each group tell you what they need.',
    ask: 'For each AI tool you chose, who is behind it, and where does it happen?' },
  { id: 'm1', title: 'Moment 1 · Arrival', mins: 2,
    say: 'Reveal one beat at a time: Arthur, then why, then the price. Let the room react to the picture and the plan before the words.',
    ask: 'Who was waiting for Arthur, and where?' },
  { id: 'm2', title: 'Moment 2 · The conversation', mins: 2,
    say: 'Same three beats. Point at the open needs on the plan: they are the design questions.',
    ask: 'Where could Arthur hear and ask, and who confirmed the answer?' },
  { id: 'm3', title: 'Moment 3 · The night', mins: 2,
    say: 'Same three beats. This is the quietest moment, and the one most often left undesigned.',
    ask: 'Where did Arthur rest, and who answered when he called?' },
  { id: 'learn', title: 'Learn and adjust', mins: 5,
    say: 'Walk to another table or read the board. Home monitoring and swing space are now available. Each table has one move: add a card, swap one, or hold. Tokens from a swapped card come back.',
    ask: 'What did another table do that you did not expect?' },
  { id: 'm4', title: 'Moment 4 · The surge', mins: 3,
    say: 'One shared surge. Staff are stretched, rooms are contested, and discharge pressure rises. Owners protect the places your promise needs first. Each table sees what its own choices did.',
    ask: 'What was designed, what was owned, and what was hoped for?' },
  { id: 'close', title: 'Close', mins: 3,
    say: 'Show Arthur’s line, the promise, and what holds. “Designed, not yet operational” means a promise on a drawing with no funded owner. Arthur only thrives when AI, people and place all work together.',
    ask: 'Which one decision would you change first, and who has to fund it?' },
];
export const PHASE_IDS = PHASES.map((p) => p.id);
export const phaseMeta = (id) => PHASES.find((p) => p.id === id) || PHASES[0];
export const momentOfPhase = (id) => ({ m1: 1, m2: 2, m3: 3, m4: 4 }[id] || null);

export const MOMENT_ASK = {
  1: 'Who was waiting for Arthur, and where?',
  2: 'Where could Arthur hear and ask, and who confirmed the answer?',
  3: 'Where did Arthur rest, and who answered when he called?',
  4: 'What was designed, what was owned, and what was hoped for?',
};

export const PATH_IMG = {
  confidence: 'path_confidence.jpg',
  continuity: 'path_continuity.jpg',
  independence: 'path_independence.jpg',
};

// Boards for solo play: three "other tables" so the learning round has something to compare.
export const DEMO_TABLES = [
  { table_no: 91, name: 'Table A', path: 'continuity', round1: ['arr', 'hand', 'room'], final: null },
  { table_no: 92, name: 'Table B', path: 'confidence', round1: ['fam', 'staff', 'vcon'], final: null },
  { table_no: 93, name: 'Table C', path: 'independence', round1: ['room', 'hand', 'asst'], final: null },
];

export const TAGLINE = 'AI needs people. People need places. Places need owners.';

export const WHY_DESIGN = [
  'Every weakness you saw was a room, a handoff or a team before it was a technology.',
  'AI worked only where a person stood behind it and a place held it.',
  'A room nobody owns is reclaimed in the first surge. Designing it is half the job. Operating it is the other half.',
];

export const TAKE_HOME = [
  'Pick one care moment in your own hospital.',
  'Name the person behind each AI tool that faces a patient.',
  'Name the room that holds it, and who protects that room under pressure.',
  'Name what you would stop funding so it can operate.',
];
