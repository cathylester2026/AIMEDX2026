import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BUDGET, CARDS, CARD_ORDER, GROUPS, PATHS, PATH_ORDER, MOMENTS, STATE_LABEL, START_LINE, MAX_LINE, ZONES,
  cost, withinBudget, legalMoves, runTable,
} from './engine.js';
import {
  Glyph, StateGlyph, MomentImage, Pic, PlanStrip, PHASES, PHASE_IDS, phaseMeta, momentOfPhase,
  MOMENT_ASK, PATH_IMG, DEMO_TABLES, WHY_DESIGN, TAKE_HOME, TAGLINE,
} from './content.jsx';
import * as api from './supa.js';

// ============================================================
// Small helpers
// ============================================================
const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
const go = (hash) => { if (typeof window !== 'undefined') window.location.hash = hash; };
const store = {
  get: (k) => { try { return window.localStorage.getItem(k) || ''; } catch (e) { return ''; } },
  set: (k, v) => { try { window.localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
};
const resultFor = (t) => runTable({ path: t.path || null, round1: t.round1 || [], final: t.final ?? null });
const tableName = (t) => t.name || `Table ${t.table_no}`;
const groupTitle = (id) => (CARDS[id].group === 'ai' ? 'AI capability' : CARDS[id].group === 'people' ? 'People' : 'Place');

function useRoute() {
  const read = () => (typeof window === 'undefined' ? '#/' : window.location.hash || '#/');
  const [h, setH] = useState(read);
  useEffect(() => {
    const f = () => setH(read());
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return h.replace(/^#/, '').split('/').filter(Boolean);
}

function useLive(code) {
  const [session, setSession] = useState(null);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const refresh = useCallback(async () => {
    if (!code) return;
    const s = await api.getSession(code);
    if (s.error) { setError(s.error); setLoaded(true); return; }
    setSession(s.data);
    if (s.data) {
      const t = await api.listTables(code);
      if (t.error) setError(t.error); else { setTables(t.data); setError(null); }
    } else setError(null);
    setLoaded(true);
  }, [code]);
  useEffect(() => {
    if (!code) return undefined;
    refresh();
    return api.watch(code, refresh);
  }, [code, refresh]);
  const patchLocal = useCallback((no, patch) => setTables((ts) => ts.map((t) => (t.table_no === no ? { ...t, ...patch } : t))), []);
  return { session, tables, error, loaded, refresh, patchLocal };
}

// ============================================================
// Visual building blocks
// ============================================================
function StateBadge({ state, big }) {
  return (
    <span className={`badge ${state} ${big ? 'big' : ''}`}>
      <StateGlyph state={state} size={big ? 26 : 18} />
      {STATE_LABEL[state]}
    </span>
  );
}

function Meter({ label, used, max, tone }) {
  return (
    <div className={`meter ${tone}`}>
      <span className="meter-l">{label}</span>
      <span className="pips" aria-hidden="true">
        {Array.from({ length: max }).map((_, i) => <i key={i} className={i < used ? 'on' : ''} />)}
      </span>
      <span className="meter-n">{Math.max(0, max - used)} left</span>
    </div>
  );
}

function Budget({ ids }) {
  const c = cost(ids);
  return (
    <div className="meters">
      <Meter label="Capital" used={c.capital} max={BUDGET.capital} tone="cap" />
      <Meter label="Change" used={c.change} max={BUDGET.change} tone="chg" />
    </div>
  );
}

function LineChart({ trail, upto = 4, states = [], compact }) {
  const W = 320; const H = compact ? 84 : 120; const px = 22; const py = 14;
  const x = (i) => px + i * ((W - 2 * px) / 4);
  const y = (v) => H - py - 8 - (v / MAX_LINE) * (H - 2 * py - 8);
  const shown = trail.slice(0, upto + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="linechart" role="img" aria-label="Arthur’s recovery line">
      <line x1={px} x2={W - px} y1={y(START_LINE)} y2={y(START_LINE)} className="base" />
      <polyline points={shown.map((v, i) => `${x(i)},${y(v)}`).join(' ')} className="trail" fill="none" />
      {shown.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === upto ? 6.5 : 4.2} className={`dot ${i === 0 ? 'start' : (states[i - 1] || '')}`} />
      ))}
      {['Start', '1', '2', '3', '4'].map((l, i) => (
        <text key={l} x={x(i)} y={H - 1} textAnchor="middle" className="lbl">{l}</text>
      ))}
    </svg>
  );
}

function GlyphRow({ ids, size = 26 }) {
  if (!ids || !ids.length) return <span className="muted">No investments</span>;
  return <span className="grow">{ids.filter((id) => CARDS[id]).map((id) => <span key={id} className={`g ${CARDS[id].group}`} title={CARDS[id].name}><Glyph id={id} size={size} /></span>)}</span>;
}

// ============================================================
// Investment tiles + picker (used in Invest and Learn)
// ============================================================
function CardTile({ id, selected, disabled, locked, onTap, tag }) {
  const c = CARDS[id];
  const [open, setOpen] = useState(false);
  return (
    <div className={`tile ${c.group} ${selected ? 'sel' : ''} ${disabled ? 'dis' : ''} ${locked ? 'lock' : ''}`}>
      <button type="button" className="tile-main" onClick={onTap} disabled={disabled || locked} aria-pressed={selected}>
        <span className="tile-glyph"><Glyph id={id} size={34} /></span>
        <span className="tile-body">
          <span className="tile-kind">{groupTitle(id)}</span>
          <strong>{c.name}</strong>
          <span className="tile-benefit">{locked ? 'Unlocks in the learning round.' : c.benefit}</span>
        </span>
        <span className="tile-cost">
          <b>{c.capital}</b><small>Capital</small>
          <b>{c.change}</b><small>Change</small>
        </span>
      </button>
      {!locked && (
        <button type="button" className="tile-more" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? 'Hide' : 'Needs and watch-outs'}
        </button>
      )}
      {open && (
        <div className="tile-detail">
          <p>{c.detail}</p>
          <p><b>Needs:</b> {c.needs}</p>
          <p><b>Watch:</b> {c.watch}</p>
        </div>
      )}
      {tag && <span className="tile-tag">{tag}</span>}
    </div>
  );
}

function Picker({ selected, onToggle, max, mode, base = [], readOnly }) {
  return (
    <div className="picker">
      <div className="sticky"><Budget ids={selected} /><div className="count">{selected.length} of {max} chosen</div></div>
      {GROUPS.map((g) => (
        <section key={g.id} className={`pgroup ${g.id}`}>
          <h2 className="ghead"><span>{g.title}</span><small>{g.sub}</small></h2>
          {CARD_ORDER.filter((id) => CARDS[id].group === g.id).map((id) => {
            const locked = mode === 'invest' && CARDS[id].unlock === 'learning';
            const isSel = selected.includes(id);
            const disabled = readOnly || (!isSel && (selected.length >= max || !withinBudget([...selected, id])));
            let tag = null;
            if (mode === 'learn') {
              if (!base.includes(id) && isSel) tag = 'New';
              else if (base.includes(id) && !isSel) tag = 'Tokens returned';
              else if (CARDS[id].unlock === 'learning' && !isSel) tag = 'Just unlocked';
            }
            return <CardTile key={id} id={id} selected={isSel} disabled={disabled && !isSel} locked={locked} tag={tag} onTap={() => !locked && !readOnly && onToggle(id)} />;
          })}
        </section>
      ))}
    </div>
  );
}

// ============================================================
// Phase screens (shared by phones and solo)
// ============================================================
function Lobby({ tableNo, solo }) {
  return (
    <div className="screen center">
      <Pic file="intro.jpg" className="hero" />
      <h1>{solo ? 'Welcome' : `You’re at Table ${tableNo}`}</h1>
      <p className="lead">{solo ? 'You will make four decisions for Arthur.' : 'Waiting for the facilitator to begin.'}</p>
    </div>
  );
}

function Intro() {
  return (
    <div className="screen">
      <Pic file="intro.jpg" className="hero" />
      <p className="eyebrow">Meet Arthur</p>
      <h1>Arthur is recovering at home.</h1>
      <p className="lead">He had cardiac surgery. His wife is beside him. This week the hospital asks him to come back.</p>
      <p className="lead">Four moments will strain the system around him. Every table sees the same information. You decide what to build.</p>
      <p className="tagline">{TAGLINE}</p>
    </div>
  );
}

function PathView({ table, patch }) {
  const [pick, setPick] = useState(table.path || null);
  const locked = !!table.path_locked;
  useEffect(() => { if (table.path) setPick(table.path); }, [table.path]);
  return (
    <div className="screen">
      <p className="eyebrow">Make a promise to Arthur</p>
      <h1>{locked ? 'Your promise' : 'Choose one'}</h1>
      <div className="paths">
        {PATH_ORDER.map((id) => {
          const p = PATHS[id];
          const on = (locked ? table.path : pick) === id;
          return (
            <button key={id} type="button" className={`pathcard ${on ? 'on' : ''}`} disabled={locked}
              onClick={() => { setPick(id); patch({ path: id }); }} aria-pressed={on}>
              <Pic file={PATH_IMG[id]} className="thumb" />
              <span className="pathbody">
                <b>{p.name}</b>
                <em>“{p.promise}”</em>
                <small>Tested at moments {p.critical.join(' and ')}.</small>
                <span className="needsline"><Glyph id={p.signature} size={18} /> Needs: {p.requires}</span>
              </span>
            </button>
          );
        })}
      </div>
      {!locked ? (
        <button type="button" className="btn primary" disabled={!pick} onClick={() => patch({ path: pick, path_locked: true })}>
          Make this promise
        </button>
      ) : (
        <p className="note">Promise made. You cannot change it. Waiting for the room.</p>
      )}
    </div>
  );
}

function InvestView({ table, patch }) {
  const sel = (table.round1 || []).filter((id) => CARDS[id]);
  const locked = !!table.r1_locked;
  const toggle = (id) => patch({ round1: sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id] });
  return (
    <div className="screen">
      <p className="eyebrow">Invest</p>
      <h1>Choose up to three</h1>
      <p className="tagline small">{TAGLINE}</p>
      {table.path && (
        <p className="chip-path">Your promise: {PATHS[table.path].name}. It needs <b>{CARDS[PATHS[table.path].signature].name}</b>{PATHS[table.path].also ? ` and ${CARDS[PATHS[table.path].also].name}` : ''}.</p>
      )}
      <Picker selected={sel} onToggle={toggle} max={BUDGET.round1Max} mode="invest" readOnly={locked} />
      <div className="dock">
        {!locked ? (
          <button type="button" className="btn primary" onClick={() => patch({ r1_locked: true })}>
            Lock {sel.length ? `these ${sel.length}` : 'with no investments'}
          </button>
        ) : (
          <>
            <p className="note">Locked. Waiting for the reveal.</p>
            <button type="button" className="btn ghost" onClick={() => patch({ r1_locked: false })}>Change my mind</button>
          </>
        )}
      </div>
    </div>
  );
}

function WhyCard({ n, m }) {
  return (
    <div className="card why">
      <h3>Why</h3>
      <p>{m.why}</p>
      {m.state === 'hurt' && n < 4 && <p className="tag hurt">Named contradiction: Unattended AI. AI that faces Arthur had no person behind it.</p>}
      {m.state === 'hurt' && n === 4 && <p className="tag hurt">Named contradiction: Unattended AI. Staff were stretched and this tool lost its person.</p>}
      {m.state === 'fragile' && m.weakness && n < 4 && <p className="tag fragile">Weak point: {m.weakness}</p>}
      {m.bonus > 0 && m.ai && <p className="tag ai">AI paid off: {CARDS[m.ai.id].name} had a person behind it and a place to work in. Arthur’s line rises by {m.bonus} extra.</p>}
      {m.ai && !m.ai.works && m.state !== 'hurt' && n < 4 && <p className="tag fragile">{CARDS[m.ai.id].name} could not fully work. It needs: {CARDS[m.ai.id].needs}</p>}
      {n < 4 && m.needs.length > 0 && (
        <ul className="needs">
          {m.needs.map((x) => (
            <li key={x.label} className={x.met ? 'met' : 'open'}>
              <StateGlyph state={x.met ? 'helped' : 'none'} size={18} />
              {x.label}
            </li>
          ))}
        </ul>
      )}
      {n === 4 && (
        <ul className="chips">
          {m.chips.length === 0 && <li className="none">Nothing in your portfolio was tested.</li>}
          {m.chips.map((c) => (
            <li key={c.id} className={c.state}>
              <StateGlyph state={c.state} size={20} />
              <span><b>{c.label}.</b> {c.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RevealView({ n, table, startBeat = 1 }) {
  const res = resultFor(table);
  const m = res.moments[n - 1];
  const [beat, setBeat] = useState(startBeat);
  const S = n === 4 ? res.final : res.round1;
  const c = cost(S);
  const path = table.path ? PATHS[table.path] : null;
  const critical = path && path.critical.includes(n);
  const states = res.moments.map((x) => x.state);
  return (
    <div className="screen reveal">
      <MomentImage key={`${n}-${m.state}`} n={n} state={m.state} className={`hero st-${m.state}`} />
      <p className="eyebrow">Moment {n} · {MOMENTS[n].title}</p>
      <p className="quote">{MOMENTS[n].quote}</p>
      <div className="stage">
        <StateBadge state={m.state} big />
        {critical && <span className="crit">Critical to your promise</span>}
        <PlanStrip S={S} n={n} path={table.path} />
        <LineChart trail={res.trail} upto={n} states={states} />
        <p className="linecap">Arthur’s recovery experience: <b>{res.trail[n]}</b> of {MAX_LINE}</p>
      </div>
      {beat >= 2 && <WhyCard n={n} m={m} />}
      {beat >= 3 && (
        <div className="card price">
          <h3>Price</h3>
          <GlyphRow ids={S} />
          <Budget ids={S} />
          <p className="small muted">Spent {c.capital} Capital and {c.change} Change.</p>
        </div>
      )}
      {beat >= 3 && n === 4 && res.promise && (
        <div className={`card promise ${res.promise.result}`}>
          <h3>{res.promise.label}</h3>
          <p>“{PATHS[table.path].promise}”</p>
          {res.promise.missing && <p className="small">{res.promise.missing}</p>}
          <p className="small muted">{res.band.label}.</p>
        </div>
      )}
      {beat < 3 && (
        <div className="dock">
          <button type="button" className="btn primary" onClick={() => setBeat(beat + 1)}>
            {beat === 1 ? 'Why did that happen?' : 'What did it cost?'}
          </button>
        </div>
      )}
      <p className="discuss"><b>Discuss at your table:</b> {MOMENT_ASK[n]}</p>
    </div>
  );
}

function TableBoard({ tables, meNo, title }) {
  return (
    <div className="board">
      {title && <h3>{title}</h3>}
      {tables.map((t) => {
        const r = runTable({ path: t.path || null, round1: t.round1 || [], final: null });
        const me = t.table_no === meNo;
        return (
          <div key={t.table_no} className={`brow ${me ? 'me' : ''}`}>
            <div className="bhead"><b>{me ? 'Your table' : tableName(t)}</b><span>{t.path ? PATHS[t.path].name : 'No promise'}</span></div>
            <GlyphRow ids={t.round1 || []} size={24} />
            <div className="bstates">
              {r.moments.slice(0, 3).map((m, i) => <span key={i} className={`dotst ${m.state}`} title={`Moment ${i + 1}: ${STATE_LABEL[m.state]}`}><StateGlyph state={m.state} size={18} /></span>)}
              <span className="bline">{r.trail[3]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LearnView({ table, others, meNo, patch }) {
  const r1 = (table.round1 || []).filter((id) => CARDS[id]);
  const cur = (table.final ?? r1).filter((id) => CARDS[id]);
  const locked = !!table.final_locked;
  const move = legalMoves(r1).find((mv) => sameSet(mv.final, cur));
  const toggle = (id) => patch({ final: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] });
  const label = !move ? 'That is more than one move.' : move.type === 'hold' ? 'You hold.' : move.type === 'add' ? `You add ${CARDS[move.id].name}.` : `You swap ${CARDS[move.out].name} for ${CARDS[move.id].name}.`;
  return (
    <div className="screen">
      <p className="eyebrow">Learn and adjust</p>
      <h1>One move</h1>
      <p className="lead small">Add a card, swap one, or hold. Home monitoring and swing space are now available. Moments 1 to 3 are already decided and do not change.</p>
      <TableBoard tables={[{ ...table, table_no: meNo }, ...others]} meNo={meNo} title="What each table did" />
      <Picker selected={cur} onToggle={toggle} max={BUDGET.finalMax} mode="learn" base={r1} readOnly={locked} />
      <div className="dock">
        <p className={`note ${move ? '' : 'warn'}`}>{label}</p>
        {!locked ? (
          <button type="button" className="btn primary" disabled={!move} onClick={() => patch({ final: cur, final_locked: true })}>Lock my move</button>
        ) : (
          <button type="button" className="btn ghost" onClick={() => patch({ final_locked: false })}>Change my mind</button>
        )}
      </div>
    </div>
  );
}

function CloseView({ table }) {
  const res = resultFor(table);
  const states = res.moments.map((x) => x.state);
  const path = table.path ? PATHS[table.path] : null;
  return (
    <div className="screen">
      <p className="eyebrow">Arthur’s recovery</p>
      <h1>{res.band.label}</h1>
      <div className="stage">
        <PlanStrip S={res.final} n={4} path={table.path} />
        <LineChart trail={res.trail} upto={4} states={states} />
        <div className="strip">{states.map((s, i) => <span key={i} className={`dotst ${s}`}><StateGlyph state={s} size={20} /><small>{i + 1}</small></span>)}</div>
      </div>
      {res.promise && (
        <div className={`card promise ${res.promise.result}`}>
          <h3>{res.promise.label}</h3>
          <p>“{path.promise}”</p>
          {res.promise.missing && <p className="small">{res.promise.missing}</p>}
          <p className="small muted">{path.question}</p>
        </div>
      )}
      <div className="card">
        <h3>What holds</h3>
        {res.holds.length === 0 && <p className="muted">You made no investments.</p>}
        <ul className="holds">
          {res.holds.map((h) => (
            <li key={h.id} className={h.ok ? 'ok' : 'gap'}>
              <span className={`g ${CARDS[h.id].group}`}><Glyph id={h.id} size={26} /></span>
              <span><b>{CARDS[h.id].name}</b><br /><small>{h.label}. {h.ok ? '' : h.why}</small></span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card design">
        <h3>Why a design firm is in the room</h3>
        <ul>{WHY_DESIGN.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="card takehome">
        <h3>Take-home</h3>
        <ol>{TAKE_HOME.map((t) => <li key={t}>{t}</li>)}</ol>
        <button type="button" className="btn ghost noprint" onClick={() => window.print()}>Print this card</button>
      </div>
    </div>
  );
}

function PhaseView({ phase, table, others, meNo, patch, solo }) {
  const m = momentOfPhase(phase);
  if (phase === 'lobby') return <Lobby tableNo={meNo} solo={solo} />;
  if (phase === 'intro') return <Intro />;
  if (phase === 'path') return <PathView table={table} patch={patch} />;
  if (phase === 'invest') return <InvestView table={table} patch={patch} />;
  if (m) return <RevealView key={phase} n={m} table={table} />;
  if (phase === 'learn') return <LearnView table={table} others={others} meNo={meNo} patch={patch} />;
  return <CloseView table={table} />;
}

// ============================================================
// Landing, check, join, solo
// ============================================================
function Landing() {
  const saved = store.get('bd_fac_code');
  return (
    <div className="landing">
      <Pic file="intro.jpg" className="landing-img" />
      <div className="landing-veil" />
      <div className="landing-body">
        <p className="eyebrow light">AIMedX 2026</p>
        <h1 className="big">By Design</h1>
        <p className="sub">Arthur’s return. Four moments. One promise to keep.</p>
        <div className="adventures">
          <button type="button" className="adv" onClick={() => go('#/facilitate')}>
            <b>Facilitate a room</b><span>Project the story. Tables play on their phones.</span>
          </button>
          <button type="button" className="adv" onClick={() => go('#/join')}>
            <b>Join a table</b><span>Enter the room code from the screen.</span>
          </button>
          <button type="button" className="adv" onClick={() => go('#/solo')}>
            <b>Play on your own</b><span>Walk Arthur’s journey at your own pace.</span>
          </button>
        </div>
        {saved && <button type="button" className="link light" onClick={() => go(`#/facilitate/${saved}`)}>Resume room {saved}</button>}
        <button type="button" className="link light" onClick={() => go('#/check')}>Check connection</button>
      </div>
    </div>
  );
}

function Check() {
  const [steps, setSteps] = useState(null);
  const run = async () => { setSteps(null); setSteps(await api.diagnose()); };
  useEffect(() => { run(); }, []);
  return (
    <div className="screen">
      <p className="eyebrow">Connection check</p>
      <h1>Is Supabase ready?</h1>
      {!steps && <p className="lead">Running checks…</p>}
      {steps && (
        <ul className="checks">
          {steps.map((s) => (
            <li key={s.name} className={s.ok ? 'ok' : 'bad'}>
              <StateGlyph state={s.ok ? 'helped' : 'hurt'} size={22} />
              <span><b>{s.name}</b><br /><small>{s.detail}</small></span>
            </li>
          ))}
        </ul>
      )}
      <div className="dock"><button type="button" className="btn primary" onClick={run}>Run again</button><button type="button" className="btn ghost" onClick={() => go('#/')}>Home</button></div>
    </div>
  );
}

function Join({ code0 }) {
  const [code, setCode] = useState(api.cleanCode(code0 || store.get('bd_code')));
  const [no, setNo] = useState(Number(store.get('bd_table')) || 0);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(null);
  const enter = async () => {
    setErr(''); setBusy(true);
    const s = await api.getSession(code);
    if (s.error) { setErr(s.error); setBusy(false); return; }
    if (!s.data) { setErr(`No room with code ${code}. Check the code on the screen.`); setBusy(false); return; }
    const j = await api.joinTable(code, no);
    setBusy(false);
    if (j.error) { setErr(j.error); return; }
    store.set('bd_code', code); store.set('bd_table', String(no));
    setJoined({ code, no });
  };
  useEffect(() => {
    if (code0 && store.get('bd_code') === api.cleanCode(code0) && Number(store.get('bd_table'))) {
      setJoined({ code: api.cleanCode(code0), no: Number(store.get('bd_table')) });
    }
  }, [code0]);
  if (joined) return <PlayerRoom code={joined.code} tableNo={joined.no} onLeave={() => setJoined(null)} />;
  return (
    <div className="screen">
      <Pic file="intro.jpg" className="hero short" />
      <p className="eyebrow">Join a table</p>
      <h1>Room code</h1>
      <input className="codein" value={code} maxLength={8} inputMode="text" autoCapitalize="characters" autoComplete="off"
        onChange={(e) => setCode(api.cleanCode(e.target.value))} placeholder="ABCD" aria-label="Room code" />
      <p className="lead small">Your table</p>
      <div className="tablepick">
        {Array.from({ length: 10 }).map((_, i) => (
          <button key={i} type="button" className={`tbtn ${no === i + 1 ? 'on' : ''}`} onClick={() => setNo(i + 1)}>{i + 1}</button>
        ))}
      </div>
      {err && <p className="error">{err}</p>}
      <div className="dock"><button type="button" className="btn primary" disabled={!code || !no || busy} onClick={enter}>{busy ? 'Joining…' : 'Join table'}</button></div>
      <button type="button" className="link" onClick={() => go('#/')}>Back</button>
    </div>
  );
}

function PlayerRoom({ code, tableNo, onLeave }) {
  const { session, tables, error, loaded, patchLocal, refresh } = useLive(code);
  const table = tables.find((t) => t.table_no === tableNo);
  const others = tables.filter((t) => t.table_no !== tableNo);
  const patch = useCallback(async (p) => {
    patchLocal(tableNo, p);
    const r = await api.patchTable(code, tableNo, p);
    if (r.error) alert(r.error);
    refresh();
  }, [code, tableNo, patchLocal, refresh]);
  const phase = session ? session.phase : 'lobby';
  const pm = phaseMeta(phase);
  if (!loaded) return <div className="screen center"><p className="lead">Connecting…</p></div>;
  if (error || !session || !table) {
    return (
      <div className="screen">
        <h1>We can’t reach your table</h1>
        <p className="error">{error || (!session ? `Room ${code} was not found.` : `Table ${tableNo} was not found in room ${code}.`)}</p>
        <div className="dock">
          <button type="button" className="btn primary" onClick={refresh}>Try again</button>
          <button type="button" className="btn ghost" onClick={() => { store.set('bd_code', ''); onLeave ? onLeave() : go('#/join'); }}>Leave</button>
          <button type="button" className="btn ghost" onClick={() => go('#/check')}>Check connection</button>
        </div>
      </div>
    );
  }
  const live = { ...table, round1: table.round1 || [], final: phase === 'learn' || phase === 'm4' || phase === 'close' ? (table.final ?? null) : null };
  return (
    <div className="phone">
      <header className="bar"><span>Table {tableNo}</span><span>{pm.title}</span><span className="steps">{PHASE_IDS.indexOf(phase) + 1}/{PHASE_IDS.length}</span></header>
      <PhaseView phase={phase} table={live} others={others} meNo={tableNo} patch={patch} />
    </div>
  );
}

const FRESH = { table_no: 1, path: null, round1: [], final: null, path_locked: false, r1_locked: false, final_locked: false };

function Solo() {
  const [idx, setIdx] = useState(0);
  const [table, setTable] = useState(FRESH);
  const patch = useCallback((p) => setTable((t) => ({ ...t, ...p })), []);
  const phase = PHASE_IDS[idx];
  const pm = phaseMeta(phase);
  const canNext = (phase === 'path' ? table.path_locked : phase === 'invest' ? table.r1_locked : phase === 'learn' ? table.final_locked : true) && idx < PHASE_IDS.length - 1;
  const live = { ...table, final: ['learn', 'm4', 'close'].includes(phase) ? (table.final ?? null) : null };
  return (
    <div className="phone">
      <header className="bar"><button type="button" className="link" onClick={() => go('#/')}>Home</button><span>{pm.title}</span><span className="steps">{idx + 1}/{PHASE_IDS.length}</span></header>
      <PhaseView phase={phase} table={live} others={DEMO_TABLES} meNo={1} patch={patch} solo />
      <div className="solonav">
        <button type="button" className="btn ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Back</button>
        <button type="button" className="btn primary" disabled={!canNext} onClick={() => setIdx(idx + 1)}>{phase === 'lobby' ? 'Begin' : 'Next'}</button>
      </div>
      {idx === PHASE_IDS.length - 1 && (
        <div className="solonav"><button type="button" className="btn ghost" onClick={() => { setIdx(0); setTable(FRESH); }}>Play again</button></div>
      )}
    </div>
  );
}

// ============================================================
// Facilitator: control bar + projector views
// ============================================================
function lockedCount(phase, tables) {
  const key = phase === 'path' ? 'path_locked' : phase === 'invest' ? 'r1_locked' : phase === 'learn' ? 'final_locked' : null;
  if (!key) return null;
  return tables.filter((t) => t[key]).length;
}

function RoomStats({ results }) {
  const rows = ZONES.map((z) => {
    const built = results.filter(({ r }) => r.final.includes(z)).length;
    const lost = results.filter(({ r }) => r.final.includes(z) && r.moments[3].lost.includes(z)).length;
    return { z, built, held: built - lost };
  });
  return (
    <div className="roomstats">
      <h3>What the room built, and what held in the surge</h3>
      {rows.map(({ z, built, held }) => (
        <div key={z} className="rs-row">
          <span className="g place"><Glyph id={z} size={24} /></span>
          <b>{CARDS[z].name}</b>
          <span className="rs-bar"><i className="b" style={{ width: `${results.length ? (100 * built) / results.length : 0}%` }} /><i className="h" style={{ width: `${results.length ? (100 * held) / results.length : 0}%` }} /></span>
          <span className="rs-n">{built} built · {held} held</span>
        </div>
      ))}
    </div>
  );
}

function Projector({ phase, tables, code }) {
  const m = momentOfPhase(phase);
  const joinUrl = typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}#/join/${code}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=${encodeURIComponent(joinUrl)}`;
  const results = useMemo(() => tables.map((t) => ({ t, r: resultFor(t) })), [tables]);

  if (phase === 'lobby') {
    return (
      <div className="pj lobby">
        <div className="pj-left">
          <p className="eyebrow">Join at your table</p>
          <div className="bigcode">{code}</div>
          <p className="lead">Scan, or open the page and enter the code.</p>
          <p className="muted small">{joinUrl}</p>
        </div>
        <div className="pj-right">
          <img className="qr" src={qr} alt={`QR code to join room ${code}`} />
          <div className="joined">
            {Array.from({ length: 10 }).map((_, i) => {
              const on = tables.some((t) => t.table_no === i + 1);
              return <span key={i} className={`jt ${on ? 'on' : ''}`}>{i + 1}</span>;
            })}
          </div>
        </div>
      </div>
    );
  }
  if (phase === 'intro') {
    return (
      <div className="pj split">
        <Pic file="intro.jpg" className="pj-img" />
        <div className="pj-text"><p className="eyebrow">Meet Arthur</p><h1>Arthur is recovering at home.</h1>
          <p className="lead">He had cardiac surgery. This week the hospital asks him to come back.</p>
          <p className="lead">Four moments will strain the system around him.</p>
          <p className="tagline">{TAGLINE}</p></div>
      </div>
    );
  }
  if (phase === 'path') {
    return (
      <div className="pj">
        <p className="eyebrow">Make a promise to Arthur</p>
        <div className="pj-paths">
          {PATH_ORDER.map((id) => {
            const n = tables.filter((t) => t.path === id).length;
            return (
              <div key={id} className="pj-path">
                <Pic file={PATH_IMG[id]} className="pj-pimg" />
                <h2>{PATHS[id].name}</h2>
                <p className="promise-q">“{PATHS[id].promise}”</p>
                <p className="muted">Tested at moments {PATHS[id].critical.join(' and ')}</p>
                <p className="needsline"><Glyph id={PATHS[id].signature} size={22} /> Needs: {PATHS[id].requires}</p>
                <span className="count">{n} table{n === 1 ? '' : 's'}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (phase === 'invest') {
    return (
      <div className="pj">
        <p className="eyebrow">The shared menu · 8 Capital · 9 Change · up to three now</p>
        <p className="tagline big">{TAGLINE}</p>
        <div className="pj-cols">
          {GROUPS.map((g) => (
            <div key={g.id} className={`pj-col ${g.id}`}>
              <h2>{g.title}</h2><p className="muted">{g.sub}</p>
              {CARD_ORDER.filter((id) => CARDS[id].group === g.id).map((id) => (
                <div key={id} className={`pj-card ${g.id} ${CARDS[id].unlock ? 'dim' : ''}`}>
                  <Glyph id={id} size={36} />
                  <span><b>{CARDS[id].name}</b><br /><small>{CARDS[id].unlock ? 'Unlocks in the learning round' : CARDS[id].benefit}</small></span>
                  <em>{CARDS[id].capital}C · {CARDS[id].change}Ch</em>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (m) {
    const counts = { helped: 0, fragile: 0, none: 0, hurt: 0 };
    results.forEach(({ r }) => { counts[r.moments[m - 1].state] += 1; });
    return (
      <div className="pj split">
        <div className="pj-left">
          <MomentImage n={m} state={m === 4 ? 'fragile' : 'helped'} className="pj-img" />
          <p className="eyebrow">Moment {m} · {MOMENTS[m].title}</p>
          <p className="quote big">{MOMENTS[m].quote}</p>
        </div>
        <div className="pj-right">
          <div className="countrow">{['helped', 'fragile', 'none', 'hurt'].map((s) => <span key={s} className={`badge ${s}`}><StateGlyph state={s} />{counts[s]} {STATE_LABEL[s]}</span>)}</div>
          <div className="ptiles">
            {results.map(({ t, r }) => (
              <div key={t.table_no} className={`ptile ${r.moments[m - 1].state}`}>
                <b>Table {t.table_no}</b>
                <StateGlyph state={r.moments[m - 1].state} size={26} />
                <span>{STATE_LABEL[r.moments[m - 1].state]}</span>
                <LineChart trail={r.trail} upto={m} states={r.moments.map((x) => x.state)} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (phase === 'learn') {
    return (
      <div className="pj">
        <p className="eyebrow">Learn and adjust · home monitoring and swing space are now unlocked · one move per table</p>
        <TableBoard tables={tables} meNo={-1} />
      </div>
    );
  }
  // close
  const hurtTables = results.filter(({ r }) => r.moments.some((x) => x.state === 'hurt')).length;
  const notOp = results.filter(({ r }) => r.holds.some((h) => !h.ok)).length;
  const kept = results.filter(({ r }) => r.promise && r.promise.result === 'kept').length;
  return (
    <div className="pj">
      <p className="eyebrow">Arthur’s recovery, table by table</p>
      <div className="stats">
        <div className="stat"><b>{kept}</b><span>of {tables.length} tables kept their promise</span></div>
        <div className="stat"><b>{hurtTables}</b><span>had AI facing Arthur with no one behind it at least once</span></div>
        <div className="stat"><b>{notOp}</b><span>hold something “designed, not yet operational”</span></div>
      </div>
      <div className="ptiles">
        {results.map(({ t, r }) => (
          <div key={t.table_no} className={`ptile ${r.band.id}`}>
            <b>Table {t.table_no}{t.path ? ` · ${PATHS[t.path].name}` : ''}</b>
            <span>{r.band.label}</span>
            <LineChart trail={r.trail} upto={4} states={r.moments.map((x) => x.state)} compact />
            {r.promise && <em>{r.promise.label}</em>}
          </div>
        ))}
      </div>
      {results.length > 0 && <RoomStats results={results} />}
      <div className="pj-why">{WHY_DESIGN.map((t) => <p key={t}>{t}</p>)}</div>
    </div>
  );
}

function FacilitatorRoom({ code }) {
  const { session, tables, error, loaded, refresh } = useLive(code);
  const [notes, setNotes] = useState(true);
  const phase = session ? session.phase : 'lobby';
  const idx = PHASE_IDS.indexOf(phase);
  const pm = phaseMeta(phase);
  const setPhase = async (p) => { const r = await api.setPhase(code, p); if (r.error) alert(r.error); refresh(); };
  const lc = lockedCount(phase, tables);
  if (!loaded) return <div className="screen center"><p className="lead">Opening room…</p></div>;
  if (error || !session) {
    return (
      <div className="screen">
        <h1>Room {code} is not available</h1>
        <p className="error">{error || 'No room with that code. It may have been cleared.'}</p>
        <div className="dock"><button type="button" className="btn primary" onClick={refresh}>Try again</button><button type="button" className="btn ghost" onClick={() => { store.set('bd_fac_code', ''); go('#/facilitate'); }}>New room</button><button type="button" className="btn ghost" onClick={() => go('#/check')}>Check connection</button></div>
      </div>
    );
  }
  return (
    <div className="fac">
      <header className="facbar">
        <span className="faccode">Room <b>{code}</b></span>
        <span className="facphase">{pm.title} · about {pm.mins} min</span>
        <span className="facstat">{tables.length} table{tables.length === 1 ? '' : 's'} joined{lc !== null ? ` · ${lc} locked` : ''}</span>
        <span className="facbtns">
          <button type="button" className="btn ghost" disabled={idx <= 0} onClick={() => setPhase(PHASE_IDS[idx - 1])}>Back</button>
          <button type="button" className="btn primary" disabled={idx >= PHASE_IDS.length - 1} onClick={() => setPhase(PHASE_IDS[idx + 1])}>Next</button>
        </span>
      </header>
      <main className="facmain"><Projector phase={phase} tables={tables} code={code} /></main>
      <footer className="facnotes">
        <button type="button" className="link" onClick={() => setNotes(!notes)}>{notes ? 'Hide facilitator notes' : 'Show facilitator notes'}</button>
        {notes && (
          <div className="notes">
            <p><b>Say:</b> {pm.say}</p>
            {pm.ask && <p><b>Ask:</b> {pm.ask}</p>}
          </div>
        )}
        <div className="phasedots">{PHASES.map((p, i) => <button key={p.id} type="button" className={`pd ${i === idx ? 'on' : i < idx ? 'done' : ''}`} onClick={() => setPhase(p.id)} title={p.title} aria-label={p.title} />)}</div>
      </footer>
    </div>
  );
}

function FacilitatorStart() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const open = async () => {
    setBusy(true); setErr('');
    const r = await api.createSession();
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    store.set('bd_fac_code', r.data.code);
    go(`#/facilitate/${r.data.code}`);
  };
  return (
    <div className="screen">
      <Pic file="intro.jpg" className="hero short" />
      <p className="eyebrow">Facilitate</p>
      <h1>Open a room</h1>
      <p className="lead">You project the story. Each table plays on a phone. About 30 minutes of play and a 10-minute debrief.</p>
      {err && <p className="error">{err}</p>}
      <div className="dock"><button type="button" className="btn primary" disabled={busy} onClick={open}>{busy ? 'Opening…' : 'Open a room'}</button><button type="button" className="btn ghost" onClick={() => go('#/')}>Back</button></div>
    </div>
  );
}

// ============================================================
// Root
// ============================================================
export default function App() {
  const route = useRoute();
  const [a, b] = route;
  if (a === 'solo') return <Solo />;
  if (a === 'check') return <div className="phone"><Check /></div>;
  if (a === 'join') return <div className="phone"><Join code0={b} /></div>;
  if (a === 'facilitate') return b ? <FacilitatorRoom code={api.cleanCode(b)} /> : <div className="phone"><FacilitatorStart /></div>;
  return <Landing />;
}

// Exposed for the render smoke test
export { PhaseView, Projector, RevealView, resultFor };
