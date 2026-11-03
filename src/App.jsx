import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Layers3, QrCode, RotateCcw, Users, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { hasSupabase, supabase } from './supabase';

/* =====================================================================
   FUTURE-READY HOSPITAL CHALLENGE · BY DESIGN 0.9.5 · TEAM ARTHUR
   Setup -> table-chosen teaching round -> two portfolio cycles
   -> a challenge -> the operations layer -> side-by-side comparison
   ===================================================================== */

const BUILD_LABEL = 'BY DESIGN 0.9.5';
const SINGLE_PLAYER_URL =
  import.meta.env.VITE_SINGLE_PLAYER_URL ||
  'https://cathylester2026.github.io/AIMedX_Single_Player_Build_01/';
const BASE = import.meta.env.BASE_URL;
const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6];

/* ---------------------------------------------------------------------
   CONTENT · PERSONAS
   --------------------------------------------------------------------- */

const PERSONAS = [
  { id: 'clinical', name: 'Clinical Leader', line: 'Protect care quality, safety and workforce usability.' },
  { id: 'operations', name: 'Operations Leader', line: 'Protect flow, reliability and implementation capacity.' },
  { id: 'digital', name: 'Digital Leader', line: 'Build an enabling platform without creating technical debt.' },
  { id: 'finance', name: 'Executive Sponsor', line: 'Fund the right things and own the decisions.' },
  { id: 'workforce', name: 'Workforce Lead', line: 'Protect the people who absorb every change.' },
  { id: 'design', name: 'Facilities + Design Leader', line: 'Create adaptable infrastructure and environments.' },
];

const PERSONA_BRIEFS = {
  clinical: {
    name: 'Clinical Leader',
    responsibility: 'Protect the ability to deliver safe, effective care while the organization changes around it.',
    protect: ['Care quality', 'Workforce usability', 'Patient experience'],
    watch: ['Workflow burden', 'Clinical reliability', 'Adoption risk'],
    question: 'Will this actually make care better, or simply add another layer of complexity?',
  },
  operations: {
    name: 'Operations Leader',
    responsibility: 'Make transformation operationally achievable without destabilizing today’s care delivery.',
    protect: ['Continuity of care', 'Reliable operations', 'Implementation capacity'],
    watch: ['Workflow disruption', 'Staffing requirements', 'Change saturation'],
    question: 'Can we realistically implement this while continuing to operate?',
  },
  digital: {
    name: 'Digital Leader',
    responsibility: 'Create the enabling digital foundation while avoiding decisions that become tomorrow’s technical debt.',
    protect: ['Interoperability', 'Data availability', 'Platform scalability'],
    watch: ['Integration complexity', 'Network + data requirements', 'Technical debt'],
    question: 'Does this strengthen the platform for what comes next, or create another isolated solution?',
  },
  finance: {
    name: 'Executive Sponsor',
    responsibility: 'Make sure the organization funds the right things, governs them well and can stand behind the decision.',
    protect: ['Long-term value', 'Accountability', 'Investment capacity'],
    watch: ['Unclear ownership', 'Lifecycle cost', 'Governance gaps'],
    question: 'Would I approve this investment, and who owns it once it is live?',
  },
  workforce: {
    name: 'Workforce Lead',
    responsibility: 'Make sure the people who deliver care can absorb, learn and sustain each change.',
    protect: ['Staff wellbeing', 'Skills and roles', 'Retention'],
    watch: ['Change fatigue', 'Training load', 'Roles added, not redesigned'],
    question: 'Who absorbs this burden, and what do we take off their plate?',
  },
  design: {
    name: 'Facilities + Design Leader',
    responsibility: 'Create an environment that can support today’s decision without preventing tomorrow’s possibilities.',
    protect: ['Adaptability', 'Infrastructure capacity', 'Long-term flexibility'],
    watch: ['Space implications', 'MEP + network requirements', 'Premature physical commitments'],
    question: 'What does this decision require from the building, and what are we locking in if we act now?',
  },
};

const briefFor = (persona) => PERSONA_BRIEFS[persona] || PERSONA_BRIEFS.clinical;

/* ---------------------------------------------------------------------
   CONTENT · HOSPITALS
   --------------------------------------------------------------------- */

const HOSPITALS = {
  academic: {
    id: 'academic',
    image: `${BASE}hospitals/aging-academic.png`,
    name: 'Aging Academic Medical Center',
    tagline: 'Renew while remaining operational.',
    description: 'Modernize what must change while preserving flexibility for futures that cannot be completely predicted.',
    mission: ['Protect complex care', 'Remain a learning environment', 'Avoid locking the project into today’s care model'],
    strength: 'Specialized clinical expertise',
    constraint: 'Aging infrastructure',
    condition: 'Ongoing operations and difficult phasing',
    tension: 'Your clinical ambitions exceed what the organization can change all at once.',
    resources: { capital: 16, infrastructure: 10, operationalReadiness: 16, changeCapacity: 9 },
  },
  regional: {
    id: 'regional',
    image: `${BASE}hospitals/regional-referral.png`,
    name: 'Regional Referral Hospital',
    tagline: 'Expand access while protecting specialized capacity.',
    description: 'Serve a growing region without diluting the clinical capabilities patients depend on.',
    mission: ['Expand access to specialty care', 'Protect critical referral capacity', 'Create a scalable regional platform'],
    strength: 'Trusted regional destination',
    constraint: 'Capacity pressure and uneven access',
    condition: 'Growth must occur while care demand continues',
    tension: 'The region needs more access, but growth can outpace workforce and infrastructure readiness.',
    resources: { capital: 14, infrastructure: 12, operationalReadiness: 13, changeCapacity: 11 },
  },
  distributed: {
    id: 'distributed',
    image: `${BASE}hospitals/distributed-system.png`,
    name: 'Distributed Health System',
    tagline: 'Create consistent care across a distributed network.',
    description: 'Connect hospitals, ambulatory sites and home settings into one coherent care platform.',
    mission: ['Create a consistent care experience', 'Extend expertise across the network', 'Reduce fragmentation between settings'],
    strength: 'Broad community reach',
    constraint: 'Inconsistent systems and workflows',
    condition: 'Multiple sites with different levels of readiness',
    tension: 'Your scale creates opportunity, but inconsistency makes every system-wide change harder.',
    resources: { capital: 15, infrastructure: 11, operationalReadiness: 12, changeCapacity: 13 },
  },
  greenfield: {
    id: 'greenfield',
    image: `${BASE}hospitals/greenfield.png`,
    name: 'Greenfield Medical Center',
    tagline: 'Build for futures that are still emerging.',
    description: 'Use a rare clean-slate opportunity without overcommitting to assumptions that may not last.',
    mission: ['Create a future-ready care platform', 'Enable new models of care', 'Preserve long-term adaptability'],
    strength: 'Clean-slate design opportunity',
    constraint: 'Uncertain future demand and care models',
    condition: 'Major decisions must be made before operations exist',
    tension: 'You can build almost anything, but every early commitment can reduce future flexibility.',
    resources: { capital: 18, infrastructure: 16, operationalReadiness: 10, changeCapacity: 12 },
  },
};

const TABLE_MAP = { 1: 'academic', 2: 'regional', 3: 'distributed', 4: 'greenfield', 5: 'academic', 6: 'regional' };

const RESOURCE_LABELS = {
  capital: 'Capital',
  infrastructure: 'Infrastructure',
  operationalReadiness: 'Operational readiness',
  changeCapacity: 'Change capacity',
};

const RESOURCE_MEANING = {
  capital: 'What you can afford to invest.',
  infrastructure: 'What your physical + digital foundation can support.',
  operationalReadiness: 'What you can implement while delivering care.',
  changeCapacity: 'How much transformation people and workflows can absorb.',
};

/* ---------------------------------------------------------------------
   CONTENT · CAPABILITY PORTFOLIO (Round 2.0)
   Each table chooses its own teaching capability. Costs depend on the hospital.
   --------------------------------------------------------------------- */

const RES_KEYS = ['capital', 'infrastructure', 'operationalReadiness', 'changeCapacity'];
const RES_SHORT = ['Capital', 'Infra', 'Ops', 'Change'];

const CAPABILITIES = [
  {
    id: 'virtual-care',
    name: 'Virtual Care',
    promise: 'Bring expertise to the patient, wherever either one is.',
    image: `${BASE}capabilities/virtual-care.png`,
    scope: 'Remote specialist consults and virtual nursing on priority inpatient units, plus scheduled virtual follow-up visits for selected services.',
    excluded: 'Hospital-at-home programs and remote monitoring.',
    prepare: { pkg: 'Connectivity and audiovisual standards for priority rooms, a virtual consult workflow and a governance model.', ready: 'Rooms and workflows that can switch on virtual consults quickly.', notYet: 'No virtual nursing or virtual visits in operation.' },
    exposure: 'Specialist access keeps depending largely on where specialists are based, with today’s gaps remaining.',
    support: [['SPACE', 'Rooms where a remote clinician can see, hear and be heard clearly.'], ['INFRASTRUCTURE', 'Reliable coverage and capacity wherever virtual care is delivered.'], ['OPERATIONS', 'Workflows that include a remote participant without slowing care.'], ['FLEXIBILITY', 'Expansion to more rooms without rework.']],
    early: 'Which rooms and units must support virtual interaction, and the coverage they need.',
    open: 'Devices, carts and displays. They will change faster than the rooms.',
    scale: { unit: 'Bedside workflow changes when a remote clinician joins.', facility: 'Coverage, audiovisual standards and support make it reliable.', system: 'Shared scheduling, platforms and governance let expertise serve every site.' },
    continuum: 'Two movements: virtual visits move some encounters out of the hospital, while virtual consults bring expertise into the room without moving care at all.',
    revealLine: 'Not all virtual care moves care. Some of it moves expertise.',
    invest: { headline: 'Virtual care becomes part of how care is delivered.', unit: 'Teams work with remote colleagues as a routine part of care.', facility: 'Priority rooms carry the coverage and audiovisual standard.', system: 'Specialist time can be shared across sites through one schedule.', flow: 'Selected follow-up visits move out of the hospital.' },
    tradeoff: { academic: 'Aging infrastructure may require network, audiovisual and room upgrades before virtual care is reliable.', regional: 'Reach only improves if connectivity, staffing and referral workflows are reliable across the catchment.', distributed: 'Inconsistent infrastructure and workflows across sites add implementation effort.', greenfield: 'Specifying today’s virtual-care devices could lock a new campus into technology that will change quickly.' },
    context: { academic: 'Here, older rooms may need upgrades before virtual care is reliable.', regional: 'Here, the value comes from reach across a wide region.', distributed: 'Here, it connects expertise that is spread thin across sites.', greenfield: 'Here, rooms can be designed for it from day one, while the devices stay replaceable.' },
  },
  {
    id: 'ambient-intelligence',
    name: 'Ambient Intelligence',
    promise: 'Give clinicians time back from documentation.',
    image: `${BASE}capabilities/ambient-intelligence.png`,
    scope: 'Ambient clinical documentation on priority units: the conversation is captured and drafted into the record for clinician review. It is a clinician-facing tool, and the patient does not control it. The patient-facing room is Smart Rooms.',
    excluded: 'Environmental sensing, fall detection, location tracking, and anything the patient controls (that is Smart Rooms).',
    prepare: { pkg: 'Consent and privacy policies, data governance and record integration design.', ready: 'A governed approach that can be switched on quickly.', notYet: 'Most clinicians still document manually.' },
    exposure: 'Documentation keeps competing with time at the bedside, at today’s level.',
    support: [['SPACE', 'Conversations that can be captured accurately while staying private.'], ['INFRASTRUCTURE', 'Reliable coverage for the devices clinicians carry or rooms use.'], ['OPERATIONS', 'Review and sign-off built into the clinical day.'], ['FLEXIBILITY', 'A change of tools without a change to the room.']],
    early: 'Acoustic privacy and coverage in the spaces where clinical conversations happen.',
    open: 'The capture device and software. They are changing quickly.',
    scale: { unit: 'Clinicians document differently at the bedside.', facility: 'Coverage and privacy must hold up in every room where it is used.', system: 'Consent, privacy and data governance must be consistent across the enterprise.' },
    continuum: 'Care stays where it is. What changes is how clinicians spend their time.',
    revealLine: 'Some capabilities do not move care. They change who has time to give it.',
    invest: { headline: 'Documentation effort can decrease. Your team decides how released time is used.', unit: 'Clinicians review drafted notes instead of writing them from scratch.', facility: 'Clinical spaces support private, accurate capture.', system: 'Enterprise consent and data governance become a requirement.', flow: 'Care settings stay the same.' },
    tradeoff: { academic: 'Teaching rounds with many participants make consent and accurate capture harder.', regional: 'The value depends on adoption by a stretched workforce with little time to learn new tools.', distributed: 'Consent, privacy and data practices differ across sites and must align before results can be trusted.', greenfield: 'With no clinical teams yet, adoption cannot be tested until the hospital opens.' },
    context: { academic: 'Here, teaching rounds with many voices make capture harder.', regional: 'Here, time returned to a stretched workforce is the main benefit.', distributed: 'Here, the benefit depends on consistent governance across every site.', greenfield: 'Here, readiness can be designed in, but adoption cannot be tested yet.' },
  },
  {
    id: 'smart-rooms',
    name: 'Smart Rooms',
    promise: 'Give patients control and keep care teams informed.',
    image: `${BASE}capabilities/smart-rooms.png`,
    scope: 'Patient control of lighting, temperature, shades and entertainment, plus in-room information connected to nurse call. It is the patient-facing capability.',
    excluded: 'Automatic room-readiness status and bedside device data integration.',
    prepare: { pkg: 'A room standard, controls and integration specifications, and power and network capacity in new or renovated rooms.', ready: 'Rooms that can accept the technology without being reopened.', notYet: 'Patients and staff see no change yet.' },
    exposure: 'Patient control of the room, and the link between nurse call and in-room information, stay as they are today.',
    support: [['SPACE', 'Patient control and information within reach and sight from the bed.'], ['INFRASTRUCTURE', 'Power and network capacity in every room that will carry it.'], ['OPERATIONS', 'Around-the-clock support when a room system fails.'], ['FLEXIBILITY', 'Device replacement without reopening walls.']],
    early: 'The room standard: where power, data and access must be in every room.',
    open: 'The specific controls, displays and software.',
    scale: { unit: 'The patient and care-team experience changes in every room.', facility: 'The facility must support and maintain every connected room.', system: 'Room systems must connect to enterprise platforms instead of becoming isolated.' },
    continuum: 'Care stays in the hospital. Smart Rooms change the stay, not where care happens.',
    revealLine: 'Not every capability moves care. Some make the hospital stay better.',
    invest: { headline: 'The room becomes part of the care experience.', unit: 'Patients control their environment; staff see requests in context.', facility: 'Capital and support needs repeat across every room.', system: 'Room data must connect to enterprise systems.', flow: 'Care stays in the hospital; the stay changes.' },
    tradeoff: { academic: 'Occupied-room upgrades may require bed closures and careful phasing during an already difficult renewal.', regional: 'The cost repeats in every room, far beyond the price of a pilot.', distributed: 'Room types and readiness differ across sites, so one standard is hard to apply.', greenfield: 'The initial room standard shapes construction and must support later revisions.' },
    context: { academic: 'Here, occupied-room upgrades may require bed closures and careful phasing.', regional: 'Here, the cost repeats across many rooms on a growing campus.', distributed: 'Here, rooms differ widely between sites.', greenfield: 'Here, the initial room standard shapes construction and must allow later revision.' },
  },
  {
    id: 'autonomous-logistics',
    name: 'Autonomous Logistics',
    promise: 'Move materials without relying on people for every trip.',
    image: `${BASE}capabilities/autonomous-logistics.png`,
    scope: 'Automated movement of supplies, linen and waste within the facility on defined routes.',
    excluded: 'Distribution to other sites or to patients’ homes.',
    prepare: { pkg: 'Route analysis, elevator and door control readiness, and space reserved for staging and charging.', ready: 'Routes that can accept automation without rework.', notYet: 'Staff still carry every delivery.' },
    exposure: 'Staff keep spending time on routine material movement, as they do today.',
    support: [['SPACE', 'Routes with room to pass, turn and wait safely.'], ['INFRASTRUCTURE', 'Elevator and door access, and places to charge.'], ['OPERATIONS', 'Supply, linen and waste workflows that hand trips to automation.'], ['FLEXIBILITY', 'New routes and vehicles without rebuilding.']],
    early: 'Which routes, elevators and staging areas must accommodate automated movement.',
    open: 'The vehicles themselves and how many.',
    scale: { unit: 'Staff spend less time fetching and carrying.', facility: 'Circulation and elevator capacity are shared with automated traffic.', system: 'Supply practices can be standardized where sites share approaches.' },
    continuum: 'Care does not move. Materials do, and the building has to make room for them.',
    revealLine: 'Some capabilities move materials, not patients, and still reshape the building.',
    invest: { headline: 'Routine movement becomes automated.', unit: 'Staff hand defined transport trips to automation.', facility: 'Routes, elevators and staging space are shared with automated traffic.', system: 'Supply practices can be standardized across similar sites.', flow: 'Care settings are unchanged.' },
    tradeoff: { academic: 'Narrow legacy corridors and shared elevators limit where automation can travel.', regional: 'Automation must share circulation with a busy campus population.', distributed: 'Each site has a different layout, so one solution rarely fits all.', greenfield: 'Designing around today’s vehicles could fix routes that later technology does not need.' },
    context: { academic: 'Here, narrow legacy corridors and shared elevators limit the routes.', regional: 'Here, automation shares circulation with a busy campus population.', distributed: 'Here, each site has a different layout.', greenfield: 'Here, circulation can be planned with automation in mind from the start.' },
  },
  {
    id: 'predictive-operations',
    name: 'Command Center Operations',
    promise: 'See demand coming, and run the whole hospital from one picture.',
    image: `${BASE}capabilities/predictive-operations.png`,
    scope: 'A command center that brings bed flow, staffing, transport and escalation into one view, with forecasts of admissions, discharges and bed demand, used to plan capacity and move patients.',
    excluded: 'Clinical prediction, such as early warning of patient deterioration.',
    prepare: { pkg: 'Data quality work, the core data connections, and a defined space and roles for the command center.', ready: 'Trustworthy, connected operational data and a place for the team to work from.', notYet: 'Staffing, beds and transport are still managed unit by unit, the same day.' },
    exposure: 'Staffing, beds and transport keep being managed unit by unit, mostly on same-day information.',
    support: [['SPACE', 'A place where bed flow, staffing and transport leads can see one picture, together or across locations.'], ['INFRASTRUCTURE', 'Timely, connected operational data.'], ['OPERATIONS', 'Roles and escalation paths that act on what the command center shows.'], ['FLEXIBILITY', 'Capacity in the building that can flex when the command center says it should.']],
    early: 'Where the command center sits, and which spaces can flex, so what it sees has something to act on.',
    open: 'The dashboards and software. A shared room is one option, not a requirement.',
    scale: { unit: 'Managers staff, discharge and request transport earlier.', facility: 'Beds, staff and transport are directed from one picture across the facility.', system: 'Demand can be balanced across sites.' },
    continuum: 'Care settings do not change, but patients can be planned into the right one earlier, and moved sooner.',
    revealLine: 'A command center changes when and how decisions are made across the building, not where care happens.',
    invest: { headline: 'Operations are run from one picture, ahead of demand.', unit: 'Units staff, discharge and request transport against tomorrow’s forecast, not only today’s census.', facility: 'Flexible capacity, beds and transport are directed deliberately, from one place.', system: 'Demand can be balanced across sites.', flow: 'Patients are planned into the right setting earlier.' },
    tradeoff: { academic: 'The command center only helps if constrained units can act on what it shows.', regional: 'Forecasts must cover referral demand from across the region, not just the campus.', distributed: 'Inconsistent data across sites weakens every forecast.', greenfield: 'With no operating history yet, early forecasts will be unreliable.' },
    context: { academic: 'Here, capacity is constrained during renewal, so foresight matters.', regional: 'Here, demand arrives from across the whole region.', distributed: 'Here, inconsistent data across sites weakens every forecast.', greenfield: 'Here, there is no operating history to forecast from yet.' },
  },
  {
    id: 'care-platform',
    name: 'Shared Digital Foundation',
    promise: 'Build the common base that other capabilities can use.',
    image: `${BASE}capabilities/care-platform.png`,
    scope: 'An integration layer, enterprise identity and access, common data standards, network readiness and a cybersecurity baseline.',
    excluded: 'Clinical applications, including any record-system replacement.',
    prepare: { pkg: 'Architecture, data standards and governance, plus space and pathway capacity reserved for growth.', ready: 'A defined target that later capabilities can be designed against.', notYet: 'Each capability is still connected on its own.' },
    exposure: 'New capabilities keep being connected one at a time, as they are today.',
    support: [['SPACE', 'Technology rooms with room to grow.'], ['INFRASTRUCTURE', 'Network and pathway capacity beyond today’s need.'], ['OPERATIONS', 'Shared standards that sites and vendors follow.'], ['FLEXIBILITY', 'Applications that can change without rebuilding the base.']],
    early: 'Technology space and pathway capacity. They are hard to add later.',
    open: 'The specific vendors and applications that connect to it.',
    scale: { unit: 'Information becomes more consistent where systems adopt the standards.', facility: 'Technology space and network capacity must carry the foundation.', system: 'The foundation is governed at enterprise level and serves every site.' },
    continuum: 'Moves no care on its own. It can let information follow the patient when other capabilities use it.',
    revealLine: 'A foundation does not move care. It can make moving care safer.',
    invest: { headline: 'A common base is in place before more is added.', unit: 'Information becomes more consistent where systems adopt the standards.', facility: 'Technology space and network capacity are built for growth.', system: 'Later capabilities that use the foundation can cost less to add.', flow: 'Information can follow the patient where capabilities connect to it.' },
    tradeoff: { academic: 'A foundation project during renewal adds load to an organization already managing disruptive phasing.', regional: 'Foundational work competes with the visible access improvements the region is asking for.', distributed: 'Every site must converge on common standards, which is difficult and politically sensitive.', greenfield: 'Easy to build in from day one, but a foundation chosen now must still evolve.' },
    context: { academic: 'Here, the foundation competes with renewal for scarce change capacity.', regional: 'Here, it competes with visible access improvements.', distributed: 'Here, it reduces the inconsistency that makes every other change harder.', greenfield: 'Here, it can be built before individual solutions arrive.' },
  },
];

const capabilityById = (id) => CAPABILITIES.find((c) => c.id === id);

/* Hospital-specific mission fit: [level, why it matters to this hospital] */
const CAPABILITY_FIT = {
  'virtual-care': {
    academic: ['Moderate–High', 'Extends specialized expertise beyond the campus, but enabling infrastructure may have to come first.'],
    regional: ['High', 'Extends specialty access across a broad catchment and reduces unnecessary travel.'],
    distributed: ['High', 'Connects expertise across settings and directly reduces fragmentation.'],
    greenfield: ['Moderate', 'Can be embedded from day one, but today’s devices could lock in quickly.'],
  },
  'ambient-intelligence': {
    academic: ['Moderate', 'Reduces documentation burden without rebuilding every workflow.'],
    regional: ['High', 'Stretches a scarce workforce by reducing documentation.'],
    distributed: ['Moderate', 'Delivers value only with consistent data and governance across sites.'],
    greenfield: ['High', 'Coverage and privacy for ambient capture can be designed in from the start.'],
  },
  'smart-rooms': {
    academic: ['Moderate', 'Valuable, but retrofitting occupied units is disruptive and must be phased.'],
    regional: ['Moderate', 'Improves experience, but repeating the package across many rooms drives cost.'],
    distributed: ['Low–Moderate', 'Hard to standardize across sites with different levels of readiness.'],
    greenfield: ['High', 'The room standard and enabling infrastructure can be set before construction.'],
  },
  'autonomous-logistics': {
    academic: ['Low–Moderate', 'Legacy corridors, elevators and phasing constrain automated routes.'],
    regional: ['Moderate', 'Frees staff time across a busy campus if circulation can support it.'],
    distributed: ['Moderate', 'Can support supply movement at larger sites, but every site is different.'],
    greenfield: ['High', 'Circulation, elevators and storage can be planned with automation in mind.'],
  },
  'predictive-operations': {
    academic: ['High', 'Helps manage constrained capacity during renewal and phasing.'],
    regional: ['High', 'Anticipates referral demand and protects specialty capacity.'],
    distributed: ['High', 'Balances demand across sites, if the data is consistent.'],
    greenfield: ['Moderate', 'Valuable later, but there is no operating history to predict from yet.'],
  },
  'care-platform': {
    academic: ['High', 'Reduces integration effort before more capabilities are layered on.'],
    regional: ['Moderate–High', 'Creates a scalable base for regional growth.'],
    distributed: ['High', 'The common base needed to reduce fragmentation across the network.'],
    greenfield: ['High', 'Builds the integration base before individual solutions arrive.'],
  },
};

const fitFor = (capabilityId, hospitalId) => {
  const row = CAPABILITY_FIT[capabilityId]?.[hospitalId];
  return row ? { level: row[0], why: row[1] } : { level: '—', why: '' };
};

const fitClass = (level) => {
  const l = (level || '').toLowerCase();
  if (l.startsWith('essential')) return 'fit-essential';
  if (l.startsWith('high')) return 'fit-high';
  if (l.startsWith('moderate')) return 'fit-moderate';
  return 'fit-low';
};
const fitRank = (level) => ({ high: 4, 'moderate–high': 3, moderate: 2, 'low–moderate': 1 }[(level || '').toLowerCase()] || 0);

const CAPABILITY_LENSES = {
  'virtual-care': {
    clinical: 'Can virtual interaction improve access without compromising clinical reliability or adding workflow burden?',
    operations: 'Can this become part of routine care delivery without adding unsustainable coordination burden?',
    digital: 'Can the existing platform support scalable virtual care rather than another isolated solution?',
    finance: 'Does this extend access and capacity enough to justify the enabling investment?',
    design: 'Which spaces must support virtual interaction, and what should be embedded now versus kept adaptable?',
  },
  'ambient-intelligence': {
    clinical: 'Will ambient documentation give clinicians time back, and can they trust what it captures?',
    operations: 'Can review and sign-off fit the clinical day without slowing care?',
    digital: 'Do we have the consent, privacy and integration maturity to support ambient capture?',
    finance: 'Can documentation time savings be measured well enough to justify the investment?',
    design: 'Which spaces need acoustic privacy and coverage for conversations to be captured well?',
  },
  'smart-rooms': {
    clinical: 'Will connected rooms improve patient experience and care-team support, or add devices to manage?',
    operations: 'Who supports and maintains every connected room around the clock?',
    digital: 'Will room systems integrate with enterprise platforms or create room-level silos?',
    finance: 'Will the benefit justify repeating this technology package across every room?',
    design: 'How do we set a room standard that stays adaptable as room technology changes?',
  },
  'autonomous-logistics': {
    clinical: 'Will this return time to bedside care, or only move work somewhere else?',
    operations: 'Can supply, linen and waste workflows be redesigned around automated movement?',
    digital: 'Can automation reliably integrate with elevators, doors and inventory systems?',
    finance: 'Does labor and reliability value outweigh the capital and maintenance burden?',
    design: 'Can corridors, elevators and staging space support automated routes without compromising people flow?',
  },
  'predictive-operations': {
    clinical: 'Will the command center show what is coming early enough to change staffing and bed decisions?',
    operations: 'Are we prepared to run the hospital differently from what the command center tells us?',
    digital: 'Is our data clean, connected and timely enough for one operating picture?',
    finance: 'Can better foresight and flow measurably reduce cost, delay and lost capacity?',
    design: 'Where does the command center sit, and which spaces can flex when it says they should?',
  },
  'care-platform': {
    clinical: 'Will common standards make information easier to find and act on at the point of care?',
    operations: 'Can we absorb an enterprise foundation project while continuing to operate?',
    digital: 'Which later capabilities would actually use this foundation, and what happens if we defer it?',
    finance: 'Is a foundational investment worth more now than a visible capability today?',
    design: 'What network, technology space and pathway capacity must the building provide for the foundation to grow?',
  },
};

const lensFor = (capabilityId, persona) =>
  (persona === 'finance' ? SPONSOR_LENS[capabilityId] : persona === 'workforce' ? WORKFORCE_LENS[capabilityId] : CAPABILITY_LENSES[capabilityId]?.[persona]) || briefFor(persona).question;

/* ---------------------------------------------------------------------
   RESOURCE MODEL · verified by exhaustive simulation (Draft v2 + review)
   Values are [Capital, Infrastructure, Operational readiness, Change capacity]
   --------------------------------------------------------------------- */

const BASE_COST = {
  'virtual-care': [2, 2, 2, 3],
  'ambient-intelligence': [2, 3, 1, 3],
  'smart-rooms': [4, 3, 2, 2],
  'autonomous-logistics': [4, 3, 3, 1],
  'predictive-operations': [1, 2, 3, 3],
  'care-platform': [3, 3, 2, 4],
};
const HOSPITAL_COST_MOD = {
  academic: { 'smart-rooms': [0, 2, 1, 0], 'autonomous-logistics': [0, 3, 0, 0], 'ambient-intelligence': [0, 1, 0, 0], 'virtual-care': [0, 1, 0, 0], 'care-platform': [0, 1, 0, 1] },
  regional: { 'smart-rooms': [2, 0, 1, 0], 'virtual-care': [0, 0, 1, 0], 'autonomous-logistics': [0, 1, 1, 0], 'ambient-intelligence': [0, 0, 1, 1], 'predictive-operations': [0, 0, 1, 0], 'care-platform': [0, 0, 1, 1] },
  distributed: { 'smart-rooms': [0, 1, 0, 2], 'ambient-intelligence': [0, 1, 0, 2], 'predictive-operations': [0, 1, 0, 2], 'virtual-care': [0, 1, 0, 1], 'care-platform': [1, 0, 0, 0], 'autonomous-logistics': [1, 0, 1, 1] },
  greenfield: { 'smart-rooms': [0, -1, 0, 0], 'autonomous-logistics': [0, -1, 0, 0], 'ambient-intelligence': [0, -1, 0, 0], 'predictive-operations': [0, 0, 2, 0], 'virtual-care': [0, 0, 1, 0] },
};
const FOUNDATION_USERS = ['virtual-care', 'ambient-intelligence', 'smart-rooms', 'predictive-operations'];
const COST_REASON = {
  academic: 'Aging infrastructure raises the Infrastructure cost of anything that touches rooms or pathways.',
  regional: 'Growth while demand continues adds Operational readiness to most capabilities.',
  distributed: 'Inconsistent systems add Change capacity to anything that must work across sites.',
  greenfield: 'Building before walls close lowers Infrastructure costs; no operating history raises Operational readiness.',
};

const investCost = (hospitalId, capId, foundation = false) => {
  const mod = HOSPITAL_COST_MOD[hospitalId]?.[capId] || [0, 0, 0, 0];
  const v = BASE_COST[capId].map((b, i) => b + mod[i]);
  if (foundation && FOUNDATION_USERS.includes(capId)) {
    v[1] -= 1;
    if (hospitalId === 'distributed') v[3] -= 1;
  }
  return v.map((x) => Math.max(0, x));
};
/* Prepare: about 40% of Invest, rounded up, in every resource the capability uses. Never free. */
const prepareCost = (hospitalId, capId) => investCost(hospitalId, capId).map((x) => (x > 0 ? Math.max(1, Math.ceil(x * 0.4)) : 0));
/* Invest after Prepare: today's Invest price (including any foundation discount) minus what was already paid. */
const completeCost = (hospitalId, capId, foundation = false) =>
  investCost(hospitalId, capId, foundation).map((x, i) => Math.max(0, x - prepareCost(hospitalId, capId)[i]));

const CHOICES = ['invest', 'start', 'prepare', 'hold'];
const CHOICE_TEXT = {
  invest: 'Commit to the defined scope now.',
  start: 'Run a pilot. Learn before you scale.',
  prepare: 'Build the conditions. Switch on later.',
  hold: 'Not now. Keep capacity for what comes next.',
};
const DECISION_TEXT = {
  invest: 'Commit the full resource cost and deliver the defined scope.',
  start: 'Pilot at small scale. Scaling later costs the remainder, minus what you learned.',
  prepare: 'Pay for the enabling package. Investing later costs the remainder.',
  hold: 'Not now. Make no commitment; resources stay available.',
};

/* ---------------------------------------------------------------------
   ROUND 2.4 · INVEST / START / PREPARE · option content per capability
   [can, notYet, workforce, governance, exposes] ; start adds the pilot first
   --------------------------------------------------------------------- */
const OPTION_TEXT = {
  'virtual-care': {
    invest: ['Run remote consults and virtual nursing on priority units, plus selected virtual follow-up visits.', 'Avoid the audiovisual, coverage and support cost on every priority unit.', 'Virtual nursing roles designed, not added on top; bedside teams trained.', 'One owner for virtual care across departments; consent for remote participation.', 'Adoption across many units at once.'],
    start: ['Remote specialist consults on one unit, for one specialty.', 'Learn whether bedside teams and specialists can work this way here.', 'Reach other units, sites or follow-up visits.', 'One unit team trained, with a clinical champion.', 'A pilot sponsor and a review after 90 days.', 'A pilot that works on one unit may not scale.'],
    prepare: ['Workflow design only; no new roles yet.', 'A governance model for virtual care.', 'Benefit delayed; specialist gaps continue.'],
  },
  'ambient-intelligence': {
    invest: ['Clinicians on priority units review drafted notes instead of writing them.', 'Avoid licensing, integration and support cost on every priority unit.', 'Training on every unit; review and sign-off built into the clinical day.', 'Enterprise consent, privacy and AI accountability settled first.', 'Adoption risk across a stretched workforce.'],
    start: ['Ambient documentation with one willing team at one site.', 'Learn whether clinicians trust the drafts, and how much time comes back.', 'Scale until consent and privacy rules are set enterprise-wide.', 'One team trained, with a clinical champion.', 'A local consent process and a pilot review board.', 'A pilot that works for one team may not scale.'],
    prepare: ['Policy and integration work only.', 'Consent, privacy and data governance become the main thing you build.', 'Benefit delayed; documentation burden continues.'],
  },
  'smart-rooms': {
    invest: ['Patients control light, temperature and shades; nurse call linked to the room.', 'Avoid bed closures, phasing and cost repeated in every room.', 'Support staff trained to keep room systems running around the clock.', 'One owner for the room standard; device and data rules for room systems.', 'Cost repeated across every room.'],
    start: ['A group of rooms on one unit with patient controls and the nurse-call link.', 'Learn what patients actually use, and what support it takes.', 'Set the room standard for every room.', 'One unit team and a support technician trained.', 'A pilot owner and a decision point on the room standard.', 'A pilot unit can feel different from the rest of the hospital.'],
    prepare: ['No new roles yet.', 'A room standard and an accountable owner.', 'Benefit delayed; patients see no change.'],
  },
  'autonomous-logistics': {
    invest: ['Automated delivery of supplies, linen and waste on defined routes.', 'Avoid capital, maintenance and shared elevator capacity.', 'Support roles redesigned from routine trips to work that needs a person.', 'Safety rules for shared corridors; a fallback when systems fail.', 'Disruption when routes or elevators fail.'],
    start: ['One route, central supply to one floor, with a small fleet.', 'Learn whether corridors, elevators and staff adapt.', 'Run deliveries across the campus.', 'Supply staff on one route trained.', 'A safety review before the route opens.', 'One route proves little about the busiest corridors.'],
    prepare: ['Route analysis with support teams.', 'Elevator and door control standards.', 'Staff keep carrying every delivery.'],
  },
  'predictive-operations': {
    invest: ['Bed flow, staffing and transport managed from one command center, against a forecast.', 'Avoid data cleanup, the command center space, and the effort of acting differently every day.', 'Managers and charge nurses trained to act on what it shows; escalation roles defined.', 'Leaders commit to acting on the command center’s view, not overriding it.', 'A command center that is ignored becomes an expensive dashboard.'],
    start: ['A command center view for one service line, used in the daily bed meeting.', 'Learn whether teams act on it or override it.', 'Balance demand, staffing and transport across units or sites.', 'One bed-meeting team trained.', 'An owner for the view and an accuracy review.', 'One service line may not reflect the whole hospital.'],
    prepare: ['Data quality work and a defined command center space; no new roles.', 'Data ownership and quality standards.', 'Decisions stay same-day for now.'],
  },
  'care-platform': {
    invest: ['A common base for identity, integration, data standards and security.', 'Show a visible benefit on day one: the return arrives through what comes next.', 'Teams learn shared standards; vendors must follow them.', 'Enterprise data and security governance with one owner.', 'Major change load with no visible capability yet.'],
    start: ['A first reusable connection: two existing systems linked through the common layer.', 'Learn whether the standards hold up in real use.', 'Lower the cost of later capabilities.', 'One integration team trained on the standards.', 'A standards owner and an architecture review.', 'A first connection is not yet a foundation.'],
    prepare: ['Architecture work only.', 'Architecture, data standards and governance defined.', 'Each capability is still connected on its own.'],
  },
};
const OPTION_KEYS = ['invest', 'start', 'prepare'];
const OPTION_META = {
  invest: { label: 'INVEST', sub: 'Commit to the full scope now.' },
  start: { label: 'START', sub: 'Run a pilot. Learn before you scale.' },
  prepare: { label: 'PREPARE', sub: 'Build the conditions. Switch on later.' },
};
const optionDetail = (cap, k) => {
  const t = OPTION_TEXT[cap.id];
  if (k === 'invest') { const [can, notYet, wf, gov, exp] = t.invest; return { can, notYet, wf, gov, exp }; }
  if (k === 'start') { const [pilot, can, notYet, wf, gov, exp] = t.start; return { pilot, can, notYet, wf, gov, exp }; }
  const [wf, gov, exp] = t.prepare;
  return { can: cap.prepare.ready, notYet: cap.prepare.notYet, wf, gov, exp, pkg: cap.prepare.pkg };
};
/* Add a file name here once its image is in public/capabilities, e.g. 'virtual-care-pilot'. */
const OPTION_ART = new Set(['smart-rooms-prepared', 'virtual-care-prepared', 'ambient-intelligence-prepared', 'autonomous-logistics-prepared', 'predictive-operations-prepared', 'care-platform-prepared']);
const preparedImage = (cap) => (OPTION_ART.has(`${cap.id}-prepared`) ? `${BASE}capabilities/${cap.id}-prepared.png` : cap.image);
const hasOptionArt = (cap, k) => k !== 'invest' && OPTION_ART.has(`${cap.id}-${k === 'start' ? 'pilot' : 'prepared'}`);
const optionImage = (cap, k) => (k === 'invest' ? cap.image : `${BASE}capabilities/${cap.id}-${k === 'start' ? 'pilot' : 'prepared'}.png`);

/* Start (pilot): light on Capital and Infrastructure, heavy on Change capacity.
   Scaling a pilot costs the remainder, minus 1 for what the pilot taught you. */
const startCost = (hospitalId, capId) => {
  const v = investCost(hospitalId, capId);
  const part = (x, r) => (x > 0 ? Math.max(1, Math.ceil(x * r)) : 0);
  return [part(v[0], 0.25), part(v[1], 0.25), part(v[2], 0.4), part(v[3], 0.6)];
};
const scaleCost = (hospitalId, capId, foundation = false) => {
  const s = startCost(hospitalId, capId);
  const v = investCost(hospitalId, capId, foundation).map((x, i) => Math.max(0, x - s[i]));
  if (v[3] > 0) v[3] -= 1; else if (v[2] > 0) v[2] -= 1;
  return v;
};

/* ---------- Roles: Executive Sponsor (replaces Financial Steward) + Workforce Lead ---------- */
const SPONSOR_LENS = {
  'virtual-care': 'Who owns virtual care across departments, and does the funding model hold?',
  'ambient-intelligence': 'Are consent, privacy and accountability for AI settled before this scales?',
  'smart-rooms': 'Will the benefit justify repeating this in every room, and who owns the standard?',
  'autonomous-logistics': 'Does the reliability and staff-time value outweigh the capital and maintenance cost?',
  'predictive-operations': 'Will leaders act on the command center’s view, or override it?',
  'care-platform': 'Is a foundation worth more now than a visible capability today?',
};
const WORKFORCE_LENS = {
  'virtual-care': 'Are new roles like virtual nursing designed, or added on top of current work?',
  'ambient-intelligence': 'How will released documentation time be used, and who decides?',
  'smart-rooms': 'Who supports room systems around the clock, and are they trained?',
  'autonomous-logistics': 'Are support roles redesigned, or simply cut?',
  'predictive-operations': 'Will earlier staffing decisions mean fewer last-minute calls for frontline staff?',
  'care-platform': 'Will shared standards make tools easier to learn, or add another change?',
};
const CHANGE_OPTIONS = [
  ['device', 'The device or technology itself'],
  ['location', 'Where it sits in the building'],
  ['infrastructure', 'Access to the infrastructure behind it'],
];

const FUTURE_SIGNALS = [
  { id: 'workforce', kind: 'opportunity', title: 'The workforce tightens.', text: 'Nursing and support-staff vacancies rise sharply across the region. Every hour of staff time now matters more.', responds: ['ambient-intelligence', 'autonomous-logistics'] },
  { id: 'virtual-shift', kind: 'opportunity', title: 'Care moves out.', text: 'A major payer shifts follow-up care to virtual and home settings within the year.', responds: ['virtual-care'] },
  { id: 'demand-surge', kind: 'opportunity', title: 'Demand surges.', text: 'A neighboring hospital closes its inpatient units. Referral demand rises faster than anyone planned for.', responds: ['predictive-operations', 'virtual-care'] },
  { id: 'cyber', kind: 'shock', title: 'A cyber incident hits the region.', text: 'Ransomware takes a neighboring system offline for weeks. Every hospital must harden and recover, and the cost lands on whatever capacity it has least of.', responds: ['care-platform'], hit: 2, partial: 1 },
];
const signalById = (id) => FUTURE_SIGNALS.find((s) => s.id === id);
/* Challenge imagery: add public/challenges/<id>.png to replace the fallback. */
const CHALLENGE_FALLBACK = { workforce: 'scales/unit.png', 'virtual-shift': 'scales/ecosystem.png', 'demand-surge': 'scales/facility.png', cyber: 'scales/system.png' };
const challengeImage = (s) => `${BASE}challenges/${s.id}.jpg`;
const challengeFallback = (s) => `${BASE}${CHALLENGE_FALLBACK[s.id] || 'scales/system.png'}`;
const CHALLENGE_PROMPT = 'What does this mean for Arthur, and for the capacity we kept?';


/* ===== BYDESIGN CONTENT START (from content pack v3 and the audit; if you change it here, change the pack too) ===== */
const STATEMENTS = {
 "virtual-care": {
  "clinical": {
   "lean": "B",
   "text": "Arthur has to hear and answer a specialist, and the follow-up has to reach him in a way he can use. I would design the encounter first. The limit: fewer rooms get it, and a room does not reach him at home."
  },
  "operations": {
   "lean": "A",
   "text": "Carts can be on priority units next quarter and I can start the follow-up schedule now. The limit: set-up time lands on nurses, and the room decides the sound."
  },
  "digital": {
   "lean": "A",
   "text": "Carts reuse the network and devices we have, and devices change faster than rooms, so I would not commit rooms before we see demand. The limit: a cart does not fix a noisy room."
  },
  "finance": {
   "lean": "A",
   "text": "Referral waits are the region’s complaint and carts show access fastest. I would ask the team to say what a patient with hearing difficulty gets. The limit: speed over depth."
  },
  "workforce": {
   "lean": "B",
   "text": "Nurses are more likely to run a call in a room set up for it than to wheel a cart between tasks. The limit: nurses outside the priority rooms are left out."
  },
  "design": {
   "lean": "B",
   "text": "Sound, sightlines and a seat for his wife decide whether Arthur takes part. The room works only if someone is scheduled to run it and a fallback exists, so I will ask for both before we commit rooms. The limit: committed rooms are hard to change."
  }
 },
 "predictive-operations": {
  "clinical": {
   "lean": "B",
   "text": "Telling Arthur to come back means something only if a place is ready. A flex bay makes that real. The limit: one bay serves few, and in a network it serves one site."
  },
  "operations": {
   "lean": "A",
   "text": "The command center, with named roles and an escalation path, covers every unit and can start on Monday. The limit: it works only where constrained units can act on it and a bed exists to send him to."
  },
  "digital": {
   "lean": "A",
   "text": "The command center needs timely, connected data, and tying it to a staffing response runs on what we have. The limit: inconsistent data weakens every forecast."
  },
  "finance": {
   "lean": "B",
   "text": "I am accountable for protecting specialty capacity. A ring-fenced bay keeps returns from competing with referrals. The limit: space held for returns is space not used."
  },
  "workforce": {
   "lean": "A",
   "text": "Whoever acts on what the command center shows needs protected time and training, and the staffing response builds that in. The limit: it adds to already full shifts."
  },
  "design": {
   "lean": "B",
   "text": "A command center needs something to act on, and where it sits and which space can flex is my part. I will point out that a bay with no staffed response is empty. The limit: the location locks early."
  }
 },
 "ambient-intelligence": {
  "clinical": {
   "lean": "B",
   "text": "Arthur’s conversation has to be private and I have to be looking at him. Treated rooms give both. The limit: every other room stays as it is."
  },
  "operations": {
   "lean": "A",
   "text": "Consent-first capture can start on many units at once. The limit: privacy depends on whichever room it is in."
  },
  "digital": {
   "lean": "A",
   "text": "Capture software changes fast, so keeping it in existing rooms keeps it replaceable. The limit: acoustic privacy is not addressed."
  },
  "finance": {
   "lean": "A",
   "text": "Time returned to a stretched workforce is the benefit I can show soonest, and the software can be replaced if it disappoints. The limit: adoption depends on staff with little time to learn it."
  },
  "workforce": {
   "lean": "B",
   "text": "Staff adopt faster in a few well-run rooms than everywhere at once, and the review step has to fit the clinical day. The limit: narrower reach."
  },
  "design": {
   "lean": "B",
   "text": "Acoustic privacy and coverage make capture acceptable to Arthur and his wife. Consent and sign-off sit with clinicians, so I will ask who owns them before we treat rooms. The limit: coverage stops where the treatment stops."
  }
 },
 "smart-rooms": {
  "clinical": {
   "lean": "A",
   "text": "At 2 a.m. he can set the lights, but the blanket needs a person. A pilot wing with the nurse-call link lets me test that response. The limit: only that wing."
  },
  "operations": {
   "lean": "B",
   "text": "A room standard avoids a two-tier hospital. The limit: it arrives room by room, the nurse-call link lags, and upgrades in occupied units remove beds."
  },
  "digital": {
   "lean": "A",
   "text": "A pilot wing proves the integration before it repeats in every room. The limit: it reaches few patients."
  },
  "finance": {
   "lean": "B",
   "text": "Patients notice controls first, and a standard everywhere is the message. The limit: the capital repeats in every room."
  },
  "workforce": {
   "lean": "A",
   "text": "Someone has to answer calls at night and know what patients control and what needs a person. A wing lets us train that role. The limit: a small group."
  },
  "design": {
   "lean": "B",
   "text": "Reach, a manual backup and replaceable devices make the room his. A control with no night response is not help, so I will ask who answers before the walls open. The limit: the standard outlasts the devices."
  }
 },
 "autonomous-logistics": {
  "clinical": {
   "lean": "A",
   "text": "What Arthur needs at night has to arrive quietly. Dedicated routes keep carts out of his corridor. The limit: only on defined routes."
  },
  "operations": {
   "lean": "B",
   "text": "Shared routes with quiet hours automate more trips and free more staff time. The limit: shared circulation is noisier at busy times."
  },
  "digital": {
   "lean": "B",
   "text": "More trips on shared routes use the fleet more fully. The limit: elevators and doors are shared with people."
  },
  "finance": {
   "lean": "A",
   "text": "I would fund first what visibly does not disturb patients. The limit: smaller time savings."
  },
  "workforce": {
   "lean": "B",
   "text": "Staff time returned to the bedside is the point. The limit: staff must take over smoothly when it stops."
  },
  "design": {
   "lean": "A",
   "text": "Dedicated routes and low-glare night operation keep the system out of Arthur’s way. Corridors and elevators decide this before the technology does, so I will say so early. The limit: it needs corridors that may not exist."
  }
 },
 "care-platform": {
  "clinical": {
   "lean": "B",
   "text": "Arthur and his clinicians need to know who can see his information and why, so access rules come first. The limit: connections arrive later."
  },
  "operations": {
   "lean": "A",
   "text": "His follow-up and his return depend on information that follows him across sites. The limit: consent practices lag the connections."
  },
  "digital": {
   "lean": "A",
   "text": "A common base lowers later costs, and integration-led gets there fastest. The limit: governance needs other people at the table."
  },
  "finance": {
   "lean": "B",
   "text": "Consent and who sees what are my accountability, so governance comes first. The limit: it competes with visible access improvements."
  },
  "workforce": {
   "lean": "B",
   "text": "Staff need clear permissions and training, or they work around the system. The limit: a slower start."
  },
  "design": {
   "lean": "A",
   "text": "Technology space and pathway capacity are hard to add after the walls close. A foundation without standards that sites follow is only cabling, so I will make that visible. The limit: space is reserved now."
  }
 }
};
const ALT_COPY = {
 "virtual-care": {
  "A": {
   "name": "Shared carts on priority units",
   "what": "Carts move between priority units.",
   "reach": "Wide",
   "when": "The room it lands in already supports hearing, there is a seat for family, and the channel and access requirements are met.",
   "limit": "Hearing and privacy depend on the room. Set-up time falls on nurses.",
   "beauty": "None designed in; the room decides."
  },
  "B": {
   "name": "Dedicated consult rooms",
   "what": "Rooms designed for the encounter: sound, sightlines, amplified output, a seat for his wife.",
   "reach": "Selected rooms",
   "when": "The communication-access service is running and the clinician practises the encounter as designed.",
   "limit": "Fewer rooms get it. A room does not reach Arthur at home. Committed space is hard to change.",
   "beauty": "Acoustic comfort, light and a seat for family."
  }
 },
 "ambient-intelligence": {
  "A": {
   "name": "Consent-first capture in existing rooms",
   "what": "Capture with a consent step at each encounter, in the rooms already there.",
   "reach": "Wide",
   "when": "The consent step is never skipped and the room is acceptably private.",
   "limit": "Privacy depends on the room. Adoption depends on staff with little time.",
   "beauty": "None designed in."
  },
  "B": {
   "name": "Acoustically treated priority rooms",
   "what": "Capture in a smaller number of rooms treated for acoustic privacy.",
   "reach": "Selected rooms",
   "when": "Consent and sign-off are owned by clinicians.",
   "limit": "Coverage stops where the treatment stops.",
   "beauty": "Acoustic comfort; a conversation that is not overheard."
  }
 },
 "smart-rooms": {
  "A": {
   "name": "Pilot wing: controls and nurse-call link",
   "what": "One wing gets the controls and the nurse-call link first.",
   "reach": "Selected (one wing)",
   "when": "A named night response exists and staff know what patients control and what needs a person.",
   "limit": "Only that wing. The rest of the hospital is unchanged.",
   "beauty": "Control of light, temperature and shades, in one wing."
  },
  "B": {
   "name": "Room standard in new and renovated rooms",
   "what": "A standard for power, data and access in each room, with replaceable devices.",
   "reach": "Wide, over time",
   "when": "Around-the-clock support and a manual backup exist.",
   "limit": "Arrives room by room. The nurse-call link follows later. Occupied-room upgrades remove beds.",
   "beauty": "Light, temperature and shades in every renovated room."
  }
 },
 "autonomous-logistics": {
  "A": {
   "name": "Dedicated service routes",
   "what": "Automation runs on separate service routes and corridors.",
   "reach": "Selected routes",
   "when": "A documented manual route exists for when it stops.",
   "limit": "Only on the defined routes.",
   "beauty": "Quiet, low-glare corridors at night."
  },
  "B": {
   "name": "Shared routes with quiet hours",
   "what": "Automation shares the main corridors and elevators, with quiet hours at night.",
   "reach": "Wide",
   "when": "Elevator and door control work, and staff take over smoothly when it stops.",
   "limit": "Shared circulation is noisier at busy times.",
   "beauty": "Quiet hours only."
  }
 },
 "predictive-operations": {
  "A": {
   "name": "Command center with a staffing and escalation response",
   "what": "The command center drives named roles, protected time and an escalation path on every unit.",
   "reach": "Wide",
   "when": "Constrained units can act on what the forecast shows, and a bed or slot exists.",
   "limit": "Only where units can flex. Thin staffing weakens it.",
   "beauty": "None physical. A person who knows he is coming."
  },
  "B": {
   "name": "Command center with a ring-fenced flex bay",
   "what": "The command center holds a bay for returns, with a staffed response for that bay.",
   "reach": "Selected (one bay)",
   "when": "The bay is staffed and its location was decided early.",
   "limit": "One bay serves few. Space held for returns is space not used.",
   "beauty": "Arrival, orientation and a seat for family."
  }
 },
 "care-platform": {
  "A": {
   "name": "Integration-led: connect the sites first",
   "what": "Build the integration layer and data standards first, access rules after.",
   "reach": "Wide",
   "when": "Sites and vendors follow the standards.",
   "limit": "Consent practices lag the connections.",
   "beauty": "None designed in."
  },
  "B": {
   "name": "Governance-led: access and consent first",
   "what": "Identity, access and consent rules first, connections after.",
   "reach": "Selected sites",
   "when": "The rules are trained and enforced.",
   "limit": "Connections arrive later.",
   "beauty": "None physical."
  }
 }
};
const BYD_MOMENT = {
 "virtual-care": "A remote specialist joins while Arthur is in hospital, and after he goes home his follow-up is a scheduled virtual visit.",
 "ambient-intelligence": "His clinician talks with him and his wife, looking at them and not at a screen. The time that used to go to typing goes somewhere, and someone has to decide where.",
 "smart-rooms": "2 a.m.: Arthur wants the lights and a blanket. He controls the lights. The blanket request has to reach the right person.",
 "autonomous-logistics": "At 3 a.m. what he needs arrives, and the corridor outside stays quiet.",
 "predictive-operations": "Arthur is told to come back. Is a place and a person ready?",
 "care-platform": "His information follows him from hospital to home to the return visit, and the people who see it are the people he expects."
};
const SERVICE_REQUIREMENTS = {
 "virtual-care": "Two service requirements apply to both alternatives: the follow-up channel is set per patient (video where the connection is reliable, phone-first otherwise), and communication access (captioning, amplified output or an interpreter) is offered at every encounter. A phone call fixes connectivity and does not fix hearing, so the second person’s follow-up stays limited either way."
};
const PREPARE_LATER = {
 "virtual-care": {
  "default": "Prepare does not change Arthur's conditions today. It secures the provision, and nothing is different for Arthur yet.",
  "academic": "At Aging, Virtual Care can raise a condition only to Strained unless this package was built first (or the foundation is invested). Older infrastructure may need network, audiovisual and room upgrades before virtual care is reliable, and this package is exactly that work."
 },
 "ambient-intelligence": {
  "default": "Prepare does not change Arthur's conditions today. It secures the provision, and nothing is different for Arthur yet.",
  "distributed": "At Distributed, consent practices differ across sites and must align first. Ambient capture can raise Private only to Strained there, unless this package was built first or the foundation is built governance-first."
 },
 "smart-rooms": {
  "default": "Prepare does not change Arthur's conditions today. It secures the provision, and nothing is different for Arthur yet.",
  "academic": "At Aging, a direct upgrade of occupied rooms removes beds temporarily and lowers Return by one step. If the room standard was prepared first, rooms can accept the technology without being reopened, so the reduction does not apply. This is the one decision that can leave Arthur worse off than where he started."
 },
 "autonomous-logistics": {
  "default": "Prepare does not change Arthur's conditions today. It secures the provision, and nothing is different for Arthur yet.",
  "academic": "At Aging, narrow legacy corridors and shared elevators limit where automation can travel, so Quiet can reach only Strained unless the route and elevator readiness package was built first. At Regional, shared routes on a busy campus add no Quiet."
 },
 "predictive-operations": {
  "default": "Prepare does not change Arthur’s conditions here. It makes data trustworthy and defines where the command center will sit, and Return still depends on someone acting on it. At Aging and Regional, option A is limited to Strained (units cannot act, or referral beds are already full). At Distributed, option B is limited to Strained (one bay serves one site). At Greenfield both options are, because there is no operating history."
 },
 "care-platform": {
  "default": "Prepare does not change Arthur’s conditions here. It reserves technology space and pathway capacity that are hard to add after the walls close, and it appears on the “what the building locks in” screen. At Distributed, integration-led is what lifts the cross-site limit on Follow-up and Return."
 }
};
const ATTAINABLE = {
 "academic": {
  "P1": {
   "held": false,
   "min": 2
  },
  "P2": {
   "held": false,
   "min": 1
  },
  "P3": {
   "held": false,
   "min": 1
  }
 },
 "regional": {
  "P1": {
   "held": false,
   "min": 2
  },
  "P2": {
   "held": true,
   "min": 0
  },
  "P3": {
   "held": false,
   "min": 1
  }
 },
 "distributed": {
  "P1": {
   "held": false,
   "min": 3
  },
  "P2": {
   "held": false,
   "min": 1
  },
  "P3": {
   "held": true,
   "min": 0
  }
 },
 "greenfield": {
  "P1": {
   "held": false,
   "min": null
  },
  "P2": {
   "held": false,
   "min": 1
  },
  "P3": {
   "held": false,
   "min": 2
  }
 }
};
/* ===== BYDESIGN CONTENT END ===== */

/* ===== BYDESIGN CONSTANTS ===== */
const ARTHUR = {
  voice: 'I’m going home to recover with my wife. If something starts to go wrong, I want someone to notice at my follow-up and reach me, and if I need to come back, I want it to be quick.',
  source: 'Arthur’s story: cardiac surgery, home with his wife, a change is noticed, a clinician reaches out, he returns for evaluation.',
  second: 'I live on my own and my internet is not reliable. I can’t always hear on a screen, and I don’t want a relative answering for me. If something goes wrong, I need to know who will call me, and how.',
  test: 'Can Arthur understand what is happening, take part, and reach someone when he needs help?',
  limit: 'This game tests what Arthur’s care depends on: follow-up and return, understanding and taking part, rest and help. A change is noticed at scheduled contact. Continuous remote monitoring is not part of it.',
};
/* BY DESIGN 0.9.1 · framing. Edit these three constants freely; nothing else in the build depends on their wording. */
const OPENING_FRAME = 'Arthur’s care depends on decisions that clinical teams, technology, operations and the building each tend to make separately. Today you make them together, for one patient.';
const TAKEAWAY_WHY = 'Arthur experiences the connections between our decisions: whether he can hear the specialist, speak privately, rest comfortably and return to a place prepared for him. Those experiences depend on clinical practice, technology, operations, architecture and engineering working together. A design firm brings those decisions into the same conversation, while there is still time to shape the space, provide the infrastructure and preserve room for change.';
const TAKEAWAY_ASK = 'Bring us the patient promise you want to protect. Together, we can trace what it requires of your care model, technology and built environment, and identify the decisions your project needs next.';
/* Set a contact line (an email address, a web address) and it appears under the invitation. Left empty, nothing is shown. */
const TAKEAWAY_CONTACT = '';
const PROMISES = {
  P1: { name: 'Followed up, and brought back if I need to be', a: 'Follow-up: a planned contact can notice a change after he goes home', b: 'Return: if he must come back, a place and a person are ready' },
  P2: { name: 'I understand and take part', a: 'Hear: he can hear, understand and answer, including with a remote clinician', b: 'Private: the conversation is private and consented' },
  P3: { name: 'I can rest, and help comes when I ask', a: 'Help: someone answers when he asks, and he controls what he can himself', b: 'Quiet: nights are dark and quiet enough to rest' },
};
const BASELINE_WORD = { H: 'Holds', S: 'Strained', X: 'Unresolved' };
const BASELINE_TEXT = {
  academic: { C1: 'Specialists are overcommitted', C2: 'Renovation takes beds out of service', C3: '', C4: 'Older units, teaching rounds with many voices', C5: '', C6: 'Narrow legacy corridors and shared elevators' },
  regional: { C1: 'Follow-up means hours of travel', C2: 'Referral beds fill before the day is half over', C3: '', C4: '', C5: 'A stretched workforce', C6: '' },
  distributed: { C1: 'Sites do not connect', C2: 'His information does not follow him', C3: 'Varies by site', C4: 'Consent practices differ by site', C5: '', C6: '' },
  greenfield: { C1: 'No operating history', C2: 'No operating history', C3: 'No operating history', C4: 'No operating history', C5: 'No operating history', C6: 'No operating history' },
};
const COND_DESC = {
  C1: 'A planned contact can notice a change after he goes home.', C2: 'If he must come back, a place and a person are ready.',
  C3: 'He can hear, understand and answer.', C4: 'The conversation is private and consented.',
  C5: 'Someone answers when he asks.', C6: 'Nights are dark and quiet enough to rest.',
};
/* The seven cards. Image first, then what it tests. Files go in public/moments/<file>.png */
const MOMENT_FILE = { tuesday: 'tuesday', C1: 'follow-up', C2: 'return', C3: 'hear', C4: 'private', C5: 'help', C6: 'quiet' };
const MOMENT_FALLBACK = { tuesday: 'scales/unit.png', C1: 'scales/ecosystem.png', C2: 'scales/facility.png', C3: 'scales/room.png', C4: 'scales/room-behind.png', C5: 'scales/room.png', C6: 'scales/unit-behind.png' };
const momentImage = (id) => `${BASE}moments/${MOMENT_FILE[id]}.png`;
const momentFallback = (id) => `${BASE}${MOMENT_FALLBACK[id]}`;
const BYD_CARDS = {
  tuesday: { title: 'Who runs this on Tuesday?', stress: 'Function and Strength', tests: 'Owner named for each commitment', image: 'An ordinary Tuesday afternoon. New equipment stands in a corner while staff pass by, busy.', question: 'Who runs this on Tuesday, and what did they stop doing to make the time?' },
  C1: { title: 'The follow-up doesn’t come', stress: 'Strength', tests: 'Follow-up', image: 'Arthur at the kitchen table, a frozen screen, his wife’s hand on his arm, the phone face down.', question: 'If the link drops tonight, who calls Arthur, and how do they know?' },
  C2: { title: 'No bed when he comes back', stress: 'Function', tests: 'Return', image: 'Arthur and his wife at the entrance with a bag. Behind the desk a board shows no space.', question: 'If someone can see a drift but there is no door to send them through, did we design the care?' },
  C3: { title: '“I couldn’t hear that”', stress: 'Function', tests: 'Hear', image: 'A specialist mid-explanation. Arthur leans toward the screen while his wife starts to answer for him.', question: 'What would you need to know about Arthur before you chose a virtual visit?' },
  C4: { title: '“Who decided who is in the room?”', stress: 'Beauty', tests: 'Private', image: 'The conversation turns. Arthur would like to choose who stays, and nothing in the room lets him. The room is bright.', question: 'Who is in the room when the hardest conversation happens, and who decided?' },
  C5: { title: '2 a.m., nobody’s coming', stress: 'Strength', tests: 'Help', image: 'The room at 2 a.m., lights low and warm. A call light glows. The corridor is empty.', question: 'If Arthur calls at 2 a.m., who answers, and what do they do first?' },
  C6: { title: 'The 3 a.m. cart', stress: 'Beauty', tests: 'Quiet', image: 'The corridor at 3 a.m. A cart passes under a bright light. A strip of light shows under his door.', question: 'What would it take for what Arthur needs at 3 a.m. to arrive without waking him?' },
};
/* When the service behind a moment was funded and the moment still does not hold, the scene says so. */
const FRAME_STOP_FUNDED = {
  C1: 'Someone is named to call him, but what carries the call is not yet dependable.',
  C2: 'A route is set, but no place is ready when he arrives.',
  C3: 'The service is funded, but the room still does not give him the sound he needs.',
  C4: 'The service is funded, but the room is still not private.',
  C5: 'Someone is on call, but the room does not yet bring help to him.',
  C6: 'A cart under a bright light, and a strip of light under his door.',
};
const FRAME_STOP = {
  C1: 'The phone stays silent. Nobody noticed the change.', C2: 'A door that is unclear. No place is ready when he arrives.',
  C3: 'A screen with no sound. He cannot hear the specialist.', C4: 'The conversation turns, and the room is not private.',
  C5: 'A call light with no one coming.', C6: 'A cart under a bright light, and a strip of light under his door.',
};
/* A promise holds only when both its moments work AND what runs them is funded. Otherwise it is designed, not yet operational. */
const DESIGNED = 'Designed, not yet operational';
const FRAME_KEY = { Holds: 'holds', [DESIGNED]: 'designed', 'Proven in pilot': 'pilot', Partly: 'partly', Unresolved: 'unresolved' };
const prepareLater = (capId, hospitalId) => PREPARE_LATER[capId]?.[hospitalId] || PREPARE_LATER[capId]?.default || '';
const raisesText = (capId, alt) => Object.entries(ALT_SPEC[capId][alt].lift).map(([c, l]) => `${COND_LABEL[c]}: ${COND_LEVEL[l]}`).join('; ');

/* ===== BYDESIGN ENGINE START (pure functions; verified against the Python audit, see tests/parity.js) ===== */
const BYD_CAPS = ['virtual-care', 'ambient-intelligence', 'smart-rooms', 'autonomous-logistics', 'predictive-operations', 'care-platform'];
const COND_IDS = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
const COND_LABEL = { C1: 'Follow-up', C2: 'Return', C3: 'Hear', C4: 'Private', C5: 'Help', C6: 'Quiet' };
const COND_LEVEL = { 2: 'Holds', 1: 'Strained', 0: 'Unresolved' };
const STATE_WORD = { H: 'Holds', PP: 'Proven in pilot', S: 'Strained', X: 'Unresolved' };
const COND_RANK = { X: 0, S: 1, PP: 2, H: 3 };
const PROMISE_IDS = ['P1', 'P2', 'P3'];
const PROMISE_CONDS = { P1: ['C1', 'C2'], P2: ['C3', 'C4'], P3: ['C5', 'C6'] };
/* Status codes per capability: 0 none, 1 prepared, 2 piloted, 3 invested directly, 4 invested after Prepare, 5 scaled after a pilot. */
const ARTHUR_BASELINE = {
  academic: { C1: 1, C2: 1, C3: 2, C4: 1, C5: 2, C6: 1 },
  regional: { C1: 0, C2: 1, C3: 2, C4: 2, C5: 1, C6: 2 },
  distributed: { C1: 0, C2: 0, C3: 1, C4: 1, C5: 2, C6: 2 },
  greenfield: { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0, C6: 0 },
};
/* Two credible alternatives per capability. lift = the level an alternative raises a condition to (at least).
   sp = the second person (composite): where their lift differs. reach: W wide, S selected. */
const ALT_SPEC = {
  'virtual-care': { A: { reach: 'W', lift: { C1: 2, C3: 1 }, sp: { C1: 1, C3: 0 } }, B: { reach: 'S', lift: { C1: 1, C3: 2, C4: 2 }, sp: { C1: 1, C3: 2, C4: 2 } } },
  'ambient-intelligence': { A: { reach: 'W', lift: { C4: 1, C5: 1 }, sp: {} }, B: { reach: 'S', lift: { C4: 2 }, sp: {} } },
  'smart-rooms': { A: { reach: 'S', lift: { C5: 2, C6: 1 }, sp: {} }, B: { reach: 'W', lift: { C6: 2, C5: 1 }, sp: {} } },
  'autonomous-logistics': { A: { reach: 'S', lift: { C6: 2, C5: 1 }, sp: {} }, B: { reach: 'W', lift: { C5: 2, C6: 1 }, sp: {} } },
  'predictive-operations': { A: { reach: 'W', lift: { C2: 2 }, sp: {} }, B: { reach: 'S', lift: { C2: 2 }, sp: {} } },
  'care-platform': { A: { reach: 'W', lift: { C1: 1, C2: 1 }, sp: {} }, B: { reach: 'S', lift: { C4: 1 }, sp: {} } },
};
/* A named limit caps what a NEW service can add. It never lowers what already exists. Each cites the app's own trade-off text. */
const LIMITS = [
  { h: 'academic', cap: 'virtual-care', alt: null, conds: ['C1', 'C3', 'C4'], max: 1, unless: ['care-platform', null], prep: true,
    why: 'Older infrastructure may need network, audiovisual and room upgrades before virtual care is reliable.', fix: 'Prepare Virtual Care first, or invest in the Shared Digital Foundation.' },
  { h: 'academic', cap: 'predictive-operations', alt: 'A', conds: ['C2'], max: 1, unless: null, prep: false,
    why: 'The command center only helps if constrained units can act on what it shows.', fix: 'The ring-fenced flex bay (option B) gives the return somewhere to go.' },
  { h: 'academic', cap: 'autonomous-logistics', alt: null, conds: ['C6'], max: 1, unless: null, prep: true,
    why: 'Narrow legacy corridors and shared elevators limit where automation can travel.', fix: 'Prepare the route and elevator readiness first.' },
  { h: 'regional', cap: 'autonomous-logistics', alt: 'B', conds: ['C6'], max: 0, unless: null, prep: false,
    why: 'Automation shares circulation with a busy campus, so shared routes add no quiet.', fix: 'Dedicated service routes (option A).' },
  { h: 'distributed', cap: 'ambient-intelligence', alt: null, conds: ['C4'], max: 1, unless: ['care-platform', 'B'], prep: true,
    why: 'Consent, privacy and data practices differ across sites and must align first.', fix: 'Prepare Ambient Intelligence first, or build the foundation governance-first.' },
  { h: 'distributed', cap: '*', alt: null, conds: ['C1', 'C2'], max: 1, unless: ['care-platform', 'A'], prep: false,
    why: 'Every site must converge on common standards before anything crosses sites.', fix: 'Build the Shared Digital Foundation integration-first (option A).' },
  { h: 'regional', cap: 'predictive-operations', alt: 'A', conds: ['C2'], max: 1, unless: null, prep: false,
    why: 'Referral beds fill before the day is half over, so a staffing and escalation response has nowhere to send a returning patient.', fix: 'The ring-fenced flex bay (option B) gives the return somewhere to go.' },
  { h: 'distributed', cap: 'predictive-operations', alt: 'B', conds: ['C2'], max: 1, unless: null, prep: false,
    why: 'A ring-fenced bay sits at one site, and Arthur’s return could be at any site in the network.', fix: 'The command center with a staffing and escalation response on every unit (option A), with the foundation built integration-first.' },
  { h: 'greenfield', cap: 'predictive-operations', alt: null, conds: ['C2'], max: 1, unless: null, prep: false,
    why: 'With no operating history yet, early forecasts will be unreliable.', fix: 'Not fixable this planning period. Operating history has to exist first.' },
];
/* The only reduction below baseline the app's text supports. Its cause is named on screen. */
const REDUCTIONS = [
  { h: 'academic', cap: 'smart-rooms', alt: 'B', cond: 'C2', steps: 1, avoidedIfPrepared: true, cause: 'Renovation removes rooms temporarily',
    why: 'Occupied-room upgrades may require bed closures and careful phasing.', fix: 'Prepare the room standard first.' },
];
const bydEvaluate = (hospitalId, status, alts, secondPerson = false) => {
  const base = { ...ARTHUR_BASELINE[hospitalId] };
  if (secondPerson) { base.C1 = Math.max(0, base.C1 - 1); base.C3 = Math.max(0, base.C3 - 1); }
  const contrib = Object.fromEntries(COND_IDS.map((c) => [c, [[base[c], 'base']]]));
  const limited = Object.fromEntries(COND_IDS.map((c) => [c, []]));
  const invSet = {};
  BYD_CAPS.forEach((cap) => { if ((status[cap] || 0) >= 3) invSet[cap] = alts[cap]; });
  BYD_CAPS.forEach((cap) => {
    const x = status[cap] || 0;
    if (x < 2) return;
    const alt = alts[cap];
    const spec = ALT_SPEC[cap][alt];
    const lifts = { ...spec.lift };
    if (secondPerson) Object.assign(lifts, spec.sp);
    const kind = x === 2 ? 'pilot' : 'full';
    LIMITS.forEach((L) => {
      if (L.h !== hospitalId || (L.cap !== '*' && L.cap !== cap) || (L.alt && L.alt !== alt)) return;
      let lifted = false;
      if (L.prep && x === 4) lifted = true;
      if (L.unless) { const [uc, ua] = L.unless; if (uc in invSet && (ua === null || invSet[uc] === ua)) lifted = true; }
      if (lifted) return;
      L.conds.forEach((c) => {
        if (c in lifts && lifts[c] > L.max) { limited[c].push({ cap, alt, why: L.why, fix: L.fix }); }
        if (c in lifts) lifts[c] = Math.min(lifts[c], L.max);
      });
    });
    Object.entries(lifts).forEach(([c, l]) => contrib[c].push([l, kind, cap, alt]));
  });
  const out = {};
  COND_IDS.forEach((c) => {
    const best = Math.max(...contrib[c].map((x) => x[0]));
    const kinds = contrib[c].filter((x) => x[0] === best).map((x) => x[1]);
    const by = contrib[c].filter((x) => x[0] === best && x[1] !== 'base').map((x) => ({ cap: x[2], alt: x[3], kind: x[1] }));
    let st;
    if (best === 2) st = kinds.includes('base') || kinds.includes('full') ? 'H' : 'PP';
    else if (best === 1) st = 'S';
    else st = 'X';
    out[c] = { level: best, state: st, base: base[c], by };
  });
  const reduced = [];
  REDUCTIONS.forEach((R) => {
    const xs = status[R.cap] || 0;
    if (R.h === hospitalId && xs >= 3 && alts[R.cap] === R.alt && !(R.avoidedIfPrepared && xs === 4)) {
      const nl = Math.max(0, out[R.cond].level - R.steps);
      if (nl < out[R.cond].level) { out[R.cond].level = nl; out[R.cond].state = { 2: 'H', 1: 'S', 0: 'X' }[nl]; reduced.push({ cond: R.cond, cause: R.cause, why: R.why, fix: R.fix }); }
    }
  });
  return { cs: out, reduced, limited };
};
const bydPromise = (cs, pid) => {
  const states = new Set(PROMISE_CONDS[pid].map((c) => cs[c].state));
  const only = (allowed) => [...states].every((s) => allowed.includes(s));
  if (only(['H'])) return 'Holds';
  if (only(['H', 'PP'])) return 'Proven in pilot';
  if (only(['H', 'PP', 'S'])) return 'Partly';
  return 'Unresolved';
};
const PROMISE_RANK = { Holds: 3, [DESIGNED]: 2, 'Proven in pilot': 2, Partly: 1, Unresolved: 0 };
/* The condition a table meets as its selected card: the lowest inside its chosen promise.
   Ties go to a reduced condition, then to the lower-numbered one. */
const bydSelectedCondition = (cs, reduced, pid) => {
  const reducedSet = new Set((reduced || []).map((r) => r.cond));
  /* Inside P1 a tie goes to Return: it is the story’s key moment (he comes back), and it is the one a table can design for. */
  const tieOrder = (c) => (pid === 'P1' ? -Number(c.slice(1)) : Number(c.slice(1)));
  return [...PROMISE_CONDS[pid]].sort((a, b) =>
    COND_RANK[cs[a].state] - COND_RANK[cs[b].state] ||
    (reducedSet.has(b) ? 1 : 0) - (reducedSet.has(a) ? 1 : 0) ||
    tieOrder(a) - tieOrder(b))[0];
};

/* ===== BYDESIGN ENGINE END ===== */

const BYD_CSS = `
  .arthur-brief{background:#fff;border-left:6px solid #6f2c91;padding:16px 18px;margin:16px 0;max-width:900px}
  .arthur-brief blockquote{margin:8px 0;font-size:1.15rem;line-height:1.4;font-weight:700;color:#0a222c;border:0;background:none;padding:0}
  .app.compact .arthur-brief blockquote{font-size:1rem}
  .cond-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:12px 0}
  .cond-list.compact{grid-template-columns:repeat(3,minmax(0,1fr))}
  .cond{display:grid;gap:2px;padding:9px 10px;background:#f7f3ee;border-left:5px solid #c9c3bb;min-width:0}
  .cond span{font-size:.7rem;font-weight:900;letter-spacing:.1em;color:#49205d;text-transform:uppercase}.cond b{font-size:.92rem}.cond em{font-style:normal;font-size:.7rem;font-weight:800;letter-spacing:.08em;opacity:.75;text-transform:uppercase}.cond small{font-size:.76rem;line-height:1.3;opacity:.85}
  .cond-H{border-color:#00a6a6;background:#e3f4f1}.cond-PP{border-color:#6f2c91;background:#efe4f4}.cond-S{border-color:#f0b323;background:#fff3d6}.cond-X{border-color:#b54a5a;background:#f6e3e6}
  .team-card .tc-body{padding:6px 20px 22px}
  .promise-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
  .pchip{display:inline-flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:10px;background:#f7f3ee;font-size:.8rem;font-weight:700;border-top:4px solid #c9c3bb}.pchip b{font-size:.66rem;letter-spacing:.1em}.pchip.chosen{outline:2px solid #49205d}
  .pchip-holds{border-color:#00a6a6;background:#e3f4f1}.pchip-pilot{border-color:#6f2c91;background:#efe4f4}.pchip-partly{border-color:#f0b323;background:#fff3d6}.pchip-unresolved{border-color:#b54a5a;background:#f6e3e6}
  .tc-sec{margin:14px 0}.tc-sec>b,.tc-sfb b{display:block;font-size:.68rem;font-weight:900;letter-spacing:.14em;color:#6f2c91;margin-bottom:4px}.tc-sec p{margin:4px 0;font-size:.88rem;line-height:1.4}
  .tc-sec.q{background:#fff6dd;padding:10px 12px;border-radius:8px}
  .tc-sfb{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0}.tc-sfb>div{background:#f7f3ee;padding:10px 12px;border-top:4px solid #49205d}.tc-sfb small{display:block;font-size:.72rem;opacity:.75;margin-bottom:4px}.tc-sfb p{margin:4px 0;font-size:.8rem;line-height:1.35}
  @media(max-width:800px){.tc-sfb{grid-template-columns:1fr}}
  .design-panel{margin:10px 0}.design-head{font-size:.88rem;line-height:1.4}
  .alt-grid{display:grid;grid-template-columns:1fr;gap:10px;margin:10px 0}
  .alt-card{position:relative;display:block;background:#fff;border:2px solid rgba(10,34,44,.15);border-radius:12px;padding:12px 14px 12px 44px;cursor:pointer;text-align:left}
  .alt-card.selected{border-color:#6f2c91;background:#f7f1fa;box-shadow:0 8px 22px rgba(73,32,93,.16)}
  .alt-card b{display:block;font-size:1rem}.alt-card small{display:block;font-size:.84rem;margin:2px 0 6px}
  .alt-k{position:absolute;left:12px;top:12px;width:24px;height:24px;border-radius:50%;background:#49205d;color:#fff;font-weight:900;font-size:.8rem;display:flex;align-items:center;justify-content:center}
  .alt-card dl{margin:6px 0 0;display:grid;gap:2px}.alt-card dt{font-size:.64rem;font-weight:900;letter-spacing:.1em;color:#6f2c91;margin-top:4px}.alt-card dd{margin:0;font-size:.82rem;line-height:1.35}
  .owner-picker{margin:10px 0}
  .base-block{margin-top:12px}.base-block>b{display:block;font-size:.68rem;font-weight:900;letter-spacing:.12em;color:#6f2c91;margin-bottom:4px}
  .app.compact .confirm-sheet{max-height:90vh}
  .confirm-sheet .action-row{position:sticky;bottom:calc(-16px - env(safe-area-inset-bottom));background:#fff;padding:10px 0 6px;z-index:2}
  .promise-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin:20px 0}
  .promise-card{background:#fff;padding:16px;border-top:5px solid #00a6a6}.promise-card h3{margin:6px 0 10px}
  .promise-row{padding:8px 10px;margin:6px 0;background:#f7f3ee;border-left:4px solid #c9c3bb}.promise-row.chosen{border-color:#49205d;background:#efe4f4}.promise-row b{display:block;font-size:.9rem}.promise-row small{font-size:.8rem;opacity:.8}
  .promise-stack{display:grid;gap:10px;margin:12px 0}
  .promise-pick{text-align:left;background:#fff;border:2px solid rgba(10,34,44,.15);border-radius:12px;padding:12px 14px;font:inherit;color:#0a222c;cursor:pointer;display:grid;gap:4px}
  .promise-pick.selected{border-color:#6f2c91;background:#f7f1fa}.promise-pick.held{opacity:.6;cursor:default}.promise-pick b{font-size:1.02rem}.promise-pick span{font-size:.84rem;line-height:1.35}.promise-pick em{font-style:normal;font-weight:800;font-size:.78rem;color:#49205d}
  .moment-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(10,34,44,.1);display:grid;min-width:0}
  .moment-img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:#0a222c}
  .moment-body{padding:14px 18px 18px}.moment-body h3{margin:4px 0 6px;font-size:1.4rem}.moment-scene{font-style:italic;margin:0 0 8px;line-height:1.45}
  .moment-reads{background:#f7f3ee;border-left:5px solid #6f2c91;padding:10px 12px;margin-top:10px}.moment-reads b{display:block;font-size:.68rem;letter-spacing:.12em;color:#49205d;margin-bottom:6px}.moment-reads p{margin:6px 0 0;font-size:.92rem;line-height:1.4}
  .st-chip{display:inline-block;padding:3px 8px;border-radius:999px;font-size:.72rem;font-weight:900;letter-spacing:.08em;border-left:0}
  .moment-wide{display:grid;gap:16px;max-width:900px}.moment-tables{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
  .moment-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:18px;margin:16px 0}
  .pressure-line{margin:12px 0;padding:12px 14px;background:#fff6dd;border-left:5px solid #f0b323}.pressure-line b{display:block;font-size:1rem;line-height:1.35;color:#0a222c}
  .intro-quote{font-size:clamp(1.3rem,2.4vw,2rem)!important;font-weight:800;line-height:1.3;max-width:900px}
  .intro-beat{display:block;font-size:1.15rem;line-height:1.25;margin:2px 0 6px}
  .moment-card+.moment-card{margin-top:12px}
  .arthur-says{margin:2px 0 8px;font-weight:800;font-size:1.05rem;color:#49205d}
  .pm-trio{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin:18px 0}
  .pm-card{background:#fff;border-radius:16px;padding:14px;box-shadow:0 14px 40px rgba(10,34,44,.08)}.pm-card h3{margin:0 0 10px;font-size:1.1rem}
  .pm-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pm-pair figure{margin:0;min-width:0}.pm-pair img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:10px;display:block;background:#0a222c}
  .pm-pair figcaption{font-size:.74rem;line-height:1.25;margin-top:4px}.pm-pair figcaption b{display:block;font-size:.66rem;letter-spacing:.1em;color:#6f2c91;text-transform:uppercase}
  .pm-pair.mini{margin-bottom:6px}.pm-pair.mini img{aspect-ratio:16/9;border-radius:8px}
  .promise-pick .pm-names{font-weight:800;color:#49205d}
  .challenge-arthur{margin:14px 0 0;font-size:clamp(1.1rem,2vw,1.55rem);font-weight:800;line-height:1.3;max-width:760px}
  .lens-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.lens-line{margin:6px 0;font-weight:700;line-height:1.35}
  .lens-arthur{font-weight:800;color:#49205d;line-height:1.35}
  .tc-says{margin:14px 0 10px;font-size:1.15rem;font-weight:800;line-height:1.3;color:#0a222c}
  .cdots{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin:10px 0}
  .cdot{padding:8px 4px;text-align:center;border-top:5px solid #c9c3bb;background:#f7f3ee;min-width:0}.cdot b{display:block;font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;color:#49205d}.cdot em{font-style:normal;font-size:.78rem;font-weight:800}
  .tc-setup{margin:8px 0;padding:10px 12px;background:#efe4f4;border-left:5px solid #6f2c91;font-size:.9rem;line-height:1.4}
  .sfb-mini{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}.sfb-mini>div{background:#f7f3ee;padding:9px 10px;border-top:4px solid #49205d;font-size:.8rem;line-height:1.3}.sfb-mini b{display:block;font-size:.92rem;color:#49205d;margin-bottom:3px}
  @media(max-width:700px){.cdots{grid-template-columns:repeat(3,minmax(0,1fr))}.sfb-mini{grid-template-columns:1fr}.pm-trio{grid-template-columns:1fr}}
    .ops-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:14px 0}
    .ops-card{background:#fff;border-radius:14px;padding:12px 14px;border-top:5px solid #6f2c91;box-shadow:0 10px 30px rgba(10,34,44,.08);text-align:left;color:#0a222c;min-width:0}
    .ops-card b{display:block;font-size:1rem;margin-bottom:4px}.ops-card p{margin:4px 0;font-size:.86rem;line-height:1.35}
    .ops-card.selected{border-color:#00a6a6;background:#e9f6f4;outline:2px solid #00a6a6}.ops-card.off{opacity:.55}
    .ops-tap{display:block;width:100%;text-align:left;background:none;border:0;padding:0;font:inherit;color:#0a222c;cursor:pointer}.ops-tap:disabled{cursor:default}
    .ops-card details{font-size:.84rem;line-height:1.4;margin-top:4px}.ops-card summary{cursor:pointer;font-weight:900;font-size:.66rem;letter-spacing:.1em;color:#6f2c91;padding:4px 0}
    .ops-covers{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.ops-covers span{font-size:.66rem;font-weight:900;letter-spacing:.06em;padding:3px 8px;border-radius:999px;background:#efe4f4;color:#50226a}.ops-covers span.press{background:#f0b323;color:#0a222c}
    .ops-need{font-size:.78rem;color:#762b38;font-weight:700}
    .cdot.paper{outline:2px dashed #f0b323;outline-offset:-2px}.cdot small{display:block;font-size:.6rem;font-weight:900;letter-spacing:.06em;color:#654800;margin-top:2px}
    .film-picks{position:absolute;top:30px;left:18px;right:18px;display:flex;flex-wrap:wrap;gap:6px;z-index:4;pointer-events:none}
    .film-pick{display:flex;align-items:center;gap:6px;background:rgba(10,34,44,.8);color:#fff;border-radius:10px;padding:3px 9px 3px 3px;font-size:.66rem;font-weight:800;letter-spacing:.04em;border:1px solid rgba(255,255,255,.28)}
    .film-pick:not(:has(img)){padding-left:9px}.film-pick img{width:38px;height:26px;object-fit:cover;border-radius:6px;display:block}
    .film-pick.pilot,.film-pick.prepared{border-style:dashed}.film-pick.ops{background:rgba(111,44,145,.88)}
    .room-picks{background:#fff;border-radius:16px;padding:16px 18px;margin:14px 0 20px;box-shadow:0 14px 40px rgba(10,34,44,.08)}.room-picks>b{display:block;font-size:.68rem;letter-spacing:.12em;color:#6f2c91;margin-bottom:10px}
    .room-picks .mini-caps figure{width:124px}.room-picks .mini-caps img{width:124px;height:82px}.room-picks .mini-caps figcaption{font-size:.72rem}
`;

const ROLE_ORDER = ['clinical', 'operations', 'digital', 'finance', 'workforce', 'design'];
const roleLine = (capId, persona) => STATEMENTS[capId]?.[persona]?.text || '';
const roleLean = (capId, persona) => { const k = STATEMENTS[capId]?.[persona]?.lean; return k ? `${k}. ${ALT_COPY[capId][k].name}` : ''; };
const careMoment = (capId) => BYD_MOMENT[capId] || '';
/* BY DESIGN 0.9.2 · the one question every capability decision comes back to. */
const DECISION_PROMPT = 'What will this let Arthur do?';
const BUILDING_QUESTION = 'What does this choice require us to decide about the building now?';
const signalTagFor = (signal, capId, committed = false) => {
  if (!signal || !signal.responds.includes(capId)) return null;
  if (signal.kind === 'shock') return committed ? 'PROTECTED YOU' : 'WOULD HAVE PROTECTED';
  return committed ? 'ALREADY IN PLACE' : 'RESPONDS TO SIGNAL';
};
/* What each role's team carries if the table invests. Drawn from the reviewed capability content. */
const burdenFor = (cap, persona) => {
  const d = OPTION_TEXT[cap.id]?.invest || [];
  const support = Object.fromEntries(cap.support || []);
  return ({ clinical: support.OPERATIONS, operations: d[4], digital: support.INFRASTRUCTURE, finance: d[3], workforce: d[2], design: cap.early }[persona]) || '';
};
const FINAL_QUESTION = 'Which assumption must we resolve before it becomes a permanent design commitment?';

const NEED_LINE = {
  academic: 'Specialists are overcommitted, units are aging, and every renovation competes with beds in service.',
  regional: 'Patients travel hours for specialty care, and referral beds fill before the day is half over.',
  distributed: 'The same patient has a different experience at every site, and staff work across systems that do not connect.',
  greenfield: 'You must decide how this hospital will work years before the first patient arrives.',
};

const FALLBACK_HOSPITAL_IMAGE = `${BASE}hospitals/greenfield.png`;
const imageFallback = (e, fallback = FALLBACK_HOSPITAL_IMAGE) => {
  const img = e.currentTarget;
  if (img.dataset.fellback === '1') return;
  img.dataset.fellback = '1';
  img.src = fallback;
};

const SCALE_VISUALS = {
  room: `${BASE}scales/room.png`,
  roomBehind: `${BASE}scales/room-behind.png`,
  unit: `${BASE}scales/unit.png`,
  unitBehind: `${BASE}scales/unit-behind.png`,
  facility: `${BASE}scales/facility.png`,
  system: `${BASE}scales/system.png`,
  ecosystem: `${BASE}scales/ecosystem.png`,
};


/* ---------------------------------------------------------------------
   UTILITIES
   --------------------------------------------------------------------- */

const makeCode = () => `BYD-${Math.floor(100 + Math.random() * 900)}`;
const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const getJoinUrl = (c) => `${location.origin}${location.pathname}?join=${encodeURIComponent(c)}`;
const localKey = (c) => `aimedx-bydesign-${c}`;

const validTable = (n) => {
  const v = Number(n);
  return Number.isInteger(v) && v >= 1 && v <= 6 ? v : null;
};

const byTime = (a, b) => String(a.updated_at || '').localeCompare(String(b.updated_at || ''));

const activeTables = (participants) =>
  [...new Set(participants.map((p) => validTable(p.table_number)).filter(Boolean))].sort((a, b) => a - b);

const membersOf = (participants, table) => participants.filter((p) => validTable(p.table_number) === table);
const hospitalForTable = (table) => HOSPITALS[TABLE_MAP[table]];

const responsesOfType = (responses, type, capabilityId) =>
  responses.filter((r) => r.response_type === type && (!capabilityId || r.capability_id === capabilityId));

const myResponse = (responses, participantId, type, capabilityId) =>
  responses
    .filter((r) => r.participant_id === participantId && r.response_type === type && (!capabilityId || r.capability_id === capabilityId))
    .sort(byTime)
    .slice(-1)[0];

/* Latest table-level row of a type for a key (any member can record it; latest wins). */
const latestTableRow = (responses, table, type, key) =>
  responsesOfType(responses, type, key)
    .filter((r) => validTable(r.table_number) === table)
    .sort(byTime)
    .slice(-1)[0];

/* Facilitator rows encode the table in the key so one facilitator record can hold one row per table. */
const facKey = (key, table) => `${key}-T${table}`;
const facRow = (responses, type, key, table) => responsesOfType(responses, type, facKey(key, table)).sort(byTime).slice(-1)[0];

/* A table decision comes from a player (table_decision) or from the facilitator (fac_decision).
   Whichever is newest wins, and an empty choice means the decision was reopened. */
const activeProposal = (responses, table, key = 'teach') => {
  const player = latestTableRow(responses, table, 'table_decision', key);
  const fac = facRow(responses, 'fac_decision', key, table);
  const latest = [player, fac].filter(Boolean).sort(byTime).slice(-1)[0];
  return latest && latest.choice ? latest : null;
};
const NUDGE_MS = (typeof window !== 'undefined' && window.__AIMEDX_NUDGE_MS) || 90000;
const DECISION_SLOT = (key) => (key === 'teach' ? 0 : Number(String(key).replace('cycle-', '')) || 0);
const joinOrder = (participants, table) =>
  membersOf(participants, table).slice().sort((a, b) => String(a.created_at || '').localeCompare(String(b.created_at || '')) || String(a.id).localeCompare(String(b.id)));
const latestPass = (responses, table, key) =>
  responsesOfType(responses, 'recorder_pass', key).filter((r) => validTable(r.table_number) === table).sort(byTime).slice(-1)[0];
/* The recorder rotates with each decision in join order. A pass or a takeover overrides the rotation. */
const recorderFor = (participants, responses, table, key = 'teach') => {
  const order = joinOrder(participants, table);
  if (!order.length) return null;
  const pass = latestPass(responses, table, key);
  if (pass) { const m = order.find((p) => p.id === pass.choice); if (m) return m; }
  return order[DECISION_SLOT(key) % order.length];
};
const recordedByName = (proposal) => (proposal?.persona === 'facilitator' ? 'the facilitator' : briefFor(proposal?.persona).name);
const facilitatorRecorded = (responses, table) =>
  ['teach', 'cycle-1', 'cycle-2', 'cycle-3'].filter((k) => { const p = activeProposal(responses, table, k); return p && p.persona === 'facilitator'; });
function useAfter(ms) {
  const [on, setOn] = useState(false);
  useEffect(() => { const id = setTimeout(() => setOn(true), ms); return () => clearTimeout(id); }, [ms]);
  return on;
}

const acknowledgersOf = (responses, table, proposal, key = 'teach') => {
  if (!proposal) return [];
  const rows = responsesOfType(responses, 'decision_ack', key).filter(
    (r) => validTable(r.table_number) === table && r.choice === proposal.choice && byTime({ updated_at: proposal.updated_at }, r) <= 0
  );
  return rows.some((r) => r.participant_id === proposal.participant_id) ? rows : [...rows, { participant_id: proposal.participant_id, implicit: true }];
};

const decisionNotes = (responses, table, key = 'teach') => {
  const rows = (type) => responsesOfType(responses, type, key).filter((r) => validTable(r.table_number) === table && r.note).sort(byTime).map((r) => r.note);
  return { reasons: rows('decision_reason'), concerns: rows('decision_concern') };
};
/* A table blocks the teaching decision only after someone at that table submitted a first instinct. */
const teachTables = (participants, responses) => {
  const ids = new Set(participants.map((p) => p.id));
  return [...new Set(
    responsesOfType(responses, 'first_instinct', 'teach')
      .filter((r) => ids.has(r.participant_id))
      .map((r) => validTable(r.table_number))
      .filter(Boolean)
  )].sort((a, b) => a - b);
};

const decisionForTable = (responses, table, key = 'teach') => {
  const proposal = activeProposal(responses, table, key);
  if (proposal) return { status: 'decided', choice: proposal.choice, proposal };
  const excluded = facRow(responses, 'table_no_decision', key, table)?.choice === 'no-decision';
  return excluded ? { status: 'no-decision', choice: null, proposal: null } : { status: 'waiting', choice: null, proposal: null };
};

const nominationRanking = (participants, responses, table) => {
  const noms = responsesOfType(responses, 'capability_nomination', 'portfolio');
  const members = membersOf(participants, table);
  const pick = (p) => myResponse(noms, p.id, 'capability_nomination', 'portfolio')?.choice;
  return CAPABILITIES.map((c, i) => ({ c, i, n: members.filter((p) => pick(p) === c.id).length }))
    .sort((a, b) => b.n - a.n || a.i - b.i);
};

/* Teaching capability: facilitator-approved, else the table's leading nomination. */
const teachCapFor = (participants, responses, table) => {
  const assigned = facRow(responses, 'teach_assign', 'teach', table)?.choice;
  if (assigned && capabilityById(assigned)) return assigned;
  const top = nominationRanking(participants, responses, table)[0];
  return top && top.n > 0 ? top.c.id : 'virtual-care';
};

/* Teaching decision, including the one revision allowed when the board opens. */
const teachDecisionFor = (responses, table) => {
  const original = decisionForTable(responses, table, 'teach').choice;
  const rev = latestTableRow(responses, table, 'teach_revise', 'teach');
  if (rev && rev.choice && rev.choice !== original) return { choice: rev.choice, original, revised: true };
  return { choice: original, original, revised: false };
};



/* ===== BY DESIGN 0.9 · THE PROMISE ON EVERY DECISION, WHAT AN OPTION LIFTS, THE HELD SCENES ===== */
const promiseOf = (responses, table) => { const r = latestTableRow(responses, table, 'table_promise', 'promise'); return r && r.choice && PROMISES[r.choice] ? r.choice : null; };
const opsForPromise = (pid) => OPS_IDS.filter((id) => OPS_COMMITMENTS[id].covers.some((c) => PROMISE_CONDS[pid].includes(c)));
function StateLegend() {
  return (
    <p className="state-legend">
      <span><i className="st-chip cond-H">Holds</i> works for him</span>
      <span><i className="st-chip cond-S">Strained</i> only sometimes</span>
      <span><i className="st-chip cond-X">Unresolved</i> not yet</span>
    </p>
  );
}
function PromiseChip({ table, responses, ledger, showRun = false, legend = false, conds = true }) {
  const pid = promiseOf(responses, table);
  if (!pid) return null;
  let ev = null;
  try { ev = ledger ? bydNow(ledger) : null; } catch (e) { ev = null; }
  return (
    <div className="promise-bar">
      <span className="pb-k">YOUR PROMISE</span>
      <b>{PROMISES[pid].name}</b>
      {conds && ev && <div className="pb-conds">{PROMISE_CONDS[pid].map((c) => <span key={c} className={`st-chip cond-${ev.cs[c].state}`}>{COND_LABEL[c]} · {STATE_WORD[ev.cs[c].state]}</span>)}</div>}
      {legend && <StateLegend />}
      {showRun
        ? <small>It holds only when it is designed and run. Keep capacity for {listJoin(opsForPromise(pid).map((id) => lc1(OPS_COMMITMENTS[id].name)))}.</small>
        : <details className="pb-more"><summary>WHAT RUNS IT</summary><small>It holds only when it is designed and run. Keep capacity for {listJoin(opsForPromise(pid).map((id) => lc1(OPS_COMMITMENTS[id].name)))}.</small></details>}
    </div>
  );
}
/* What investing (or finishing a pilot or a prepared package) would do to the two moments of the table's promise, before the table commits. */
const liftFor = (l, capId, pid) => {
  if (!pid) return null;
  try {
    const hid = l.hospital.id;
    const st = bydStatus(l);
    const al = bydAlts(l);
    const cur = bydEvaluate(hid, st, al, false);
    const x = l.prepared.includes(capId) ? 4 : l.piloted.includes(capId) ? 5 : 3;
    const canPrep = !l.prepared.includes(capId) && !l.piloted.includes(capId);
    const alts = l.piloted.includes(capId) ? [al[capId] || 'A'] : ['A', 'B'];
    const rows = PROMISE_CONDS[pid].map((c) => ({ c, now: cur.cs[c].state, best: cur.cs[c].state, varies: false, prep: cur.cs[c].state, why: '' }));
    const seen = {};
    alts.forEach((alt) => {
      const ev = bydEvaluate(hid, { ...st, [capId]: x }, { ...al, [capId]: alt }, false);
      rows.forEach((r) => {
        const s2 = ev.cs[r.c].state;
        (seen[r.c] = seen[r.c] || []).push(s2);
        if (COND_RANK[s2] > COND_RANK[r.best]) r.best = s2;
        const lim = (ev.limited[r.c] || []).find((m) => m.cap === capId);
        if (lim && !r.why) r.why = lim.why;
      });
      if (canPrep) {
        const ev4 = bydEvaluate(hid, { ...st, [capId]: 4 }, { ...al, [capId]: alt }, false);
        rows.forEach((r) => { if (COND_RANK[ev4.cs[r.c].state] > COND_RANK[r.prep]) r.prep = ev4.cs[r.c].state; });
      }
    });
    rows.forEach((r) => { r.varies = new Set(seen[r.c]).size > 1; });
    return rows;
  } catch (e) { return null; }
};
/* Says which of the table's two moments an option can touch, and what holds it back. It never names the design letter or the resulting state. */
function LiftLine({ rows }) {
  if (!rows) return null;
  const up = rows.filter((r) => COND_RANK[r.best] > COND_RANK[r.now]);
  if (up.length) {
    return (
      <p className="lift-line"><b>CAN MOVE YOUR PROMISE</b>{up.map((r) => <span key={r.c} className="touch-chip">{COND_LABEL[r.c]}</span>)}
        {up.some((r) => r.varies) && <em>It depends on the design you choose.</em>}</p>
    );
  }
  const blocked = rows.filter((r) => COND_RANK[r.prep] > COND_RANK[r.now]);
  if (blocked.length) {
    const why = (blocked.find((r) => r.why) || {}).why;
    return <p className="lift-line held"><b>NOT YET · {listJoin(blocked.map((r) => COND_LABEL[r.c]))}</b><em>{why || 'It needs groundwork first.'}</em></p>;
  }
  return <p className="lift-line none">Does not touch your promise.</p>;
}
/* What still holds the table's promise back, in the engine's own words. */
const holdBackLines = (l, pid) => {
  if (!pid) return [];
  try {
    const ev = bydNow(l);
    return PROMISE_CONDS[pid].filter((c) => ev.cs[c].state !== 'H').map((c) => {
      const m = (ev.limited[c] || [])[0];
      return m ? `${COND_LABEL[c]}: ${m.why}` : `${COND_LABEL[c]}: nothing you chose has reached it yet.`;
    }).slice(0, 2);
  } catch (e) { return []; }
};
const shortLine = (t) => String(t || '').split(' The limit:')[0];
/* The six moments, resolved. Used when a condition holds, so a table that held never sees the failure scene. */
const BYD_HELD = {
  C1: { title: 'The call comes', scene: 'The follow-up call reaches Arthur, and the connection holds. His wife is beside him.' },
  C2: { title: 'A place is ready when he returns', scene: 'He arrives with his bag, and a person and a place are ready for him.' },
  C3: { title: '“I heard every word”', scene: 'Arthur hears the specialist, follows, and answers for himself.' },
  C4: { title: '“I chose who was in the room”', scene: 'Arthur chooses who stays for this conversation. This time, his wife waits outside.' },
  C5: { title: '2 a.m., and someone comes', scene: 'He presses the call light, and someone is already on the way.' },
  C6: { title: 'The 3 a.m. cart, and he sleeps', scene: 'The cart passes quietly, a strip of light under his door, and he does not wake.' },
};
const heldImage = (id) => `${BASE}moments/${MOMENT_FILE[id]}-held.jpg`;
const momentOutcome = (tc, id) => {
  if (!tc || id === 'tuesday') return 'stress';
  const x = tc.conditions[id];
  if (x.state === 'S' || x.state === 'X') return 'stress';
  if (x.state === 'PP') return 'pilot';
  return tc.ops.onPaperIds.includes(id) ? 'paper' : 'held';
};


/* ===== BY DESIGN 0.9.4 · ONE THING PER SCREEN ===== */
/* The line the whole game stands on. Edit the wording here: the four chips and the three lines around them. */
const KEY_STATEMENT = {
  lead: 'Arthur’s care depends on decisions that',
  parts: [['clinical', 'Clinical teams'], ['digital', 'Technology'], ['operations', 'Operations'], ['design', 'The building']],
  tail: 'each tend to make separately.',
  turn: 'Today you make them together, for one patient.',
};
function KeyStatement({ compact = false }) {
  return (
    <div className={`key-statement${compact ? ' compact' : ''}`} role="group" aria-label={OPENING_FRAME}>
      <p className="ks-lead">{KEY_STATEMENT.lead}</p>
      <div className="ks-chips">{KEY_STATEMENT.parts.map(([g, l]) => <span key={g}><Glyph name={g} size={compact ? 20 : 30} />{l}</span>)}</div>
      <p className="ks-tail">{KEY_STATEMENT.tail}</p>
      <p className="ks-turn">{KEY_STATEMENT.turn}</p>
    </div>
  );
}
/* The question the middle of the game turns on. One panel, one question. */
function PivotQuestion({ children = 'If care can move, what should remain fixed?' }) {
  return <div className="pivot-q"><span>THE QUESTION</span><h2>{children}</h2></div>;
}
/* A capability's thumbnail. To change one picture, add its file to public/ and name it here, for example:
   'predictive-operations': 'capabilities/predictive-operations-split.jpg'. Left empty, the base image is used. */
const CAP_THUMB = {};
const capThumb = (c) => (CAP_THUMB[c.id] ? `${BASE}${CAP_THUMB[c.id]}` : c.image);
function CapThumb({ cap }) {
  return <img className="cap-thumb" src={capThumb(cap)} alt="" onError={(e) => imageFallback(e, cap.image)} />;
}
const CHOICE_SHORT = { invest: 'Commit the full scope', start: 'Pilot, then learn', prepare: 'Build the conditions' };

/* ===== BY DESIGN 0.8 · VISUAL LANGUAGE · glyphs, role marks, orbit ===== */
const GLYPHS = {
  clinical: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v9M7.5 12h9" /></>,
  operations: <><path d="M20 11a8 8 0 0 0-14.3-4.2M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.3 4.2M20 20v-4h-4" /></>,
  digital: <><circle cx="5.5" cy="6" r="2" /><circle cx="18.5" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><path d="M7.4 6.6l3.3 9.2M16.6 6.6l-3.3 9.2M7.5 6h9" /></>,
  finance: <><path d="M12 3l7 3v5.5c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5V6z" /><path d="M8.8 12l2.2 2.2 4.2-4.4" /></>,
  workforce: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.4 2.6-6 6-6s6 2.6 6 6" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17.5 14c2.4 0 3.8 1.9 3.8 4.5" /></>,
  design: <><path d="M4 20V4l16 16z" /><path d="M8 15.5V11l4.5 4.5z" /></>,
  strength: <><path d="M12 3.5L19 8H5z" /><path d="M5 8h14M8 8v9M12 8v9M16 8v9M6.5 17h11M5 20h14" /></>,
  function: <><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  beauty: <path d="M12 3c.9 4.6 3.4 7.1 8 8-4.6.9-7.1 3.4-8 8-.9-4.6-3.4-7.1-8-8 4.6-.9 7.1-3.4 8-8z" />,
  care: <path d="M3.5 12h14M12.5 6l6 6-6 6" />,
  expertise: <path d="M4 5h16v10h-9l-4 4v-4H4z" />,
  time: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  stay: <><path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" /><circle cx="7" cy="11.5" r="1.6" /></>,
  materials: <><path d="M4 8l8-4 8 4v8l-8 4-8-4z" /><path d="M4 8l8 4 8-4M12 12v8" /></>,
  decisions: <><path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="2.8" /></>,
  information: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5M3 16l9 5 9-5" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  noowner: <><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></>,
  run: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  paper: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M9.5 12h6M9.5 16h6" /></>,
};
function Glyph({ name, size = 22, className = '' }) {
  return <svg className={`glyph ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{GLYPHS[name]}</svg>;
}
const ROLE_MARK = {
  clinical: { bg: '#6f2c91', fg: '#fff' }, operations: { bg: '#00a6a6', fg: '#fff' }, digital: { bg: '#35124a', fg: '#fff' },
  finance: { bg: '#f0b323', fg: '#35124a' }, workforce: { bg: '#006b6b', fg: '#fff' }, design: { bg: '#e6d9ee', fg: '#49205d' },
};
const ROLE_SHORT = { clinical: 'Clinical', operations: 'Operations', digital: 'Digital', finance: 'Sponsor', workforce: 'Workforce', design: 'Design' };
function RoleMark({ id, size = 34, label = false }) {
  const m = ROLE_MARK[id] || ROLE_MARK.clinical;
  return (
    <span className="role-mark" title={ROLE_SHORT[id]} style={{ '--rm-bg': m.bg, '--rm-fg': m.fg, '--rm-size': `${size}px` }}>
      <span className="rm-disc"><Glyph name={ROLE_MARK[id] ? id : 'clinical'} size={Math.round(size * 0.58)} /></span>
      {label && <b>{ROLE_SHORT[id] || id}</b>}
    </span>
  );
}
/* The six roles, evenly spaced around one system. Positions are computed here so they cannot drift. */
function RoleOrbit() {
  return (
    <div className="role-orbit" aria-hidden="true">
      <span className="ro-ring" /><span className="ro-mid" />
      <span className="ro-core">ONE<br />SYSTEM</span>
      {ROLE_ORDER.map((id, i) => {
        const a = (-90 + i * 60) * Math.PI / 180;
        return (
          <span className="ro-node" key={id} style={{ left: `${50 + 38 * Math.cos(a)}%`, top: `${50 + 38 * Math.sin(a)}%` }}>
            <RoleMark id={id} size={64} />
            <b>{ROLE_SHORT[id]}</b>
          </span>
        );
      })}
    </div>
  );
}
/* Strength, Function, Beauty: lit when the card stresses them. */
const STRESS_KEYS = (s) => ['strength', 'function', 'beauty'].filter((k) => String(s || '').toLowerCase().includes(k));
function Trio({ stress }) {
  const on = STRESS_KEYS(stress);
  return <div className="trio">{[['strength', 'Strength'], ['function', 'Function'], ['beauty', 'Beauty']].map(([k, l]) => <span key={k} className={on.includes(k) ? 'on' : ''}><Glyph name={k} size={18} />{l}</span>)}</div>;
}
/* Who runs each commitment, at a glance. */
function OwnerRows({ tc }) {
  if (!tc.commits.length) return <p className="owner-none">Nothing committed, so nothing to run.</p>;
  return (
    <div className="owner-rows">
      {tc.commits.map((c) => (
        <div key={c.cap} className={`owner-row ${c.owner ? 'owned' : 'paper'}`}>
          <span className="or-cap">{c.name}</span>
          {c.owner ? <RoleMark id={c.owner} size={30} label /> : <span className="or-none"><Glyph name="noowner" size={18} />No owner</span>}
          <span className="or-tag"><Glyph name={c.owner ? 'run' : 'noowner'} size={15} />{c.owner ? 'OWNED' : 'NO OWNER'}</span>
        </div>
      ))}
      {tc.ops && (tc.ops.chosen.length > 0 || tc.ops.onPaper.length > 0) && (
        <div className="owner-ops">
          {tc.ops.chosen.map((o) => <span key={o.name} className="ok"><Glyph name="run" size={14} />{o.name}</span>)}
          {tc.ops.onPaper.map((n) => <span key={n} className="gap"><Glyph name="paper" size={14} />{n} on paper</span>)}
        </div>
      )}
    </div>
  );
}
/* What each capability moves, and what the building has to hold still. Draft wording, drawn from the capability and moment content. */
const MOVES = {
  'virtual-care': [['care', 'Some visits'], ['expertise', 'Expertise']],
  'ambient-intelligence': [['time', 'Clinician time']],
  'smart-rooms': [['stay', 'The stay']],
  'autonomous-logistics': [['materials', 'Materials']],
  'predictive-operations': [['decisions', 'Decisions']],
  'care-platform': [['information', 'Information']],
};
const HOLDS_STILL = {
  'virtual-care': ['A room with sound, privacy and a seat for his wife', 'A bed ready if he has to come back'],
  'ambient-intelligence': ['Acoustic privacy where the conversation happens', 'Coverage in the rooms that matter'],
  'smart-rooms': ['Power and data in every room', 'Someone who answers at night'],
  'autonomous-logistics': ['Routes, elevators and staging space', 'A corridor that stays quiet at 3 a.m.'],
  'predictive-operations': ['A place for the command center, and space that can flex', 'A staffed bay when he has to come back'],
  'care-platform': ['Technology space and pathways', 'Standards every site follows'],
};
function MovesChips({ capId, big = false }) {
  return <div className={`moves-chips${big ? ' big' : ''}`}>{(MOVES[capId] || []).map(([g, l]) => <span key={g}><Glyph name={g} size={big ? 28 : 18} />{l}</span>)}</div>;
}
function MoveFixedCard({ t, cap }) {
  return (
      <article className="mf-card">
        <div className="mc-head"><CapThumb cap={cap} /><div>{t != null && <span className="tlabel">TABLE {t}</span>}<h3>{cap.name}</h3></div></div>
      <div className="mf-cols">
        <div className="mf-moves"><small>MOVES</small><MovesChips capId={cap.id} big /></div>
        <div className="mf-holds"><small>THE BUILDING HOLDS STILL</small>{(HOLDS_STILL[cap.id] || []).map((x) => <p key={x}><Glyph name="lock" size={18} />{x}</p>)}</div>
      </div>
    </article>
  );
}
/* What the teaching decision did for Arthur, in his conditions. */
const teachArthurLines = (before, after) => { try { return bydChanges(bydNow(before), bydNow(after)); } catch (e) { return []; } };

/* BY DESIGN 0.7 · THE BOARD OPENS: one question per table. Stand by the teaching decision, or change it once. */
const teachStand = (responses, table) => {
  const td = teachDecisionFor(responses, table);
  const rev = latestTableRow(responses, table, 'teach_revise', 'teach');
  if (rev && td.revised) return { kind: 'revised', done: true, locked: true, byFac: false };
  const tap = [latestTableRow(responses, table, 'teach_stand', 'teach'), facRow(responses, 'teach_stand', 'teach', table)].filter(Boolean).sort(byTime).slice(-1)[0];
  const last = [tap, rev].filter(Boolean).sort(byTime).slice(-1)[0];
  if (!last) return { kind: 'deciding', done: false, locked: false, byFac: false };
  if (last === rev) return { kind: 'held', done: true, locked: true, byFac: false };
  if (last.choice === 'change') return { kind: 'revising', done: false, locked: false, byFac: false };
  return { kind: 'held', done: true, locked: false, byFac: last.persona === 'facilitator' };
};
const STAND_LABEL = { deciding: 'DECIDING', revising: 'REVISING', held: 'HELD · MOVING FORWARD', revised: 'REVISED · MOVING FORWARD' };
const teachEffectLine = (before, after, cap, choice, revised) => {
  const who = revised ? 'Your revised decision' : 'Your first decision';
  if (!(choice === 'invest' || choice === 'start' || choice === 'prepare')) return 'You kept your capacity in the teaching round, so nothing else on the board has moved.';
  const d = diffBoards(before, after, cap);
  const parts = [];
  if (d.blocked.length) parts.push(`made ${listJoin(d.blocked.map((x) => x.c.name))} harder to reach`);
  if (d.cheaper.length) parts.push(`made ${listJoin(d.cheaper.map((x) => x.c.name))} cheaper`);
  if (d.opened.length) parts.push(`opened up ${listJoin(d.opened.map((x) => x.c.name))}`);
  return parts.length ? `${who} ${listJoin(parts)}.` : `${who} has not yet closed or opened any other option, but the capacity it used is gone for the cycles ahead.`;
};

const sub = (a, b) => a.map((x, i) => x - b[i]);
const fits = (have, cost) => cost.every((c, i) => have[i] >= c);
const limitingOf = (have, cost) => {
  const i = cost.findIndex((c, k) => have[k] < c);
  return i < 0 ? null : { key: RES_KEYS[i], label: RESOURCE_LABELS[RES_KEYS[i]], have: have[i], need: cost[i] };
};
const toObj = (arr) => Object.fromEntries(RES_KEYS.map((k, i) => [k, arr[i]]));
const startOf = (h) => RES_KEYS.map((k) => h.resources[k]);

const parseCycleChoice = (choice) => {
  if (!choice) return null;
  const [action, cap] = choice.split('|');
  return { action, cap: cap || null };
};

const sumOf = (a) => a.reduce((x, y) => x + y, 0);
const listJoin = (arr) => (arr.length <= 1 ? arr.join('') : arr.length === 2 ? `${arr[0]} and ${arr[1]}` : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`);
const capNames = (ids) => ids.map((id) => capabilityById(id)?.name).filter(Boolean);

/* Replays every decision for a table, in order, through the cycle given.
   A shock challenge (e.g. cyber) lands after cycle 2, before the final cycle. */
const ledgerFor = (participants, responses, table, uptoCycle = 0, opts = {}) => {
  const h = hospitalForTable(table);
  let have = startOf(h);
  let foundation = false;
  const invested = [];
  const prepared = [];
  const piloted = [];
  const history = [];
  const designs = {};
    const opsDone = [];
  /* BY DESIGN: the alternative (A or B) and the named owner the table chose for this decision. A row for another capability is ignored. */
  const designAt = (source, cap) => {
    const rows = responsesOfType(responses, 'table_design', source).filter((x) => validTable(x.table_number) === table).sort(byTime).reverse();
    const r = rows.find((x) => { const [c, a] = String(x.choice || '').split('|'); return c === cap && (a === 'A' || a === 'B'); });
    return r ? { alt: r.choice.split('|')[1], owner: r.note || '', set: true } : { alt: 'A', owner: '', set: false };
  };
  let closed = false;
  const shock = opts.preSignal ? null : shockSignal(responses);
  let shockLoss = null;
  const applyShock = () => {
    if (!shock || shockLoss) return;
    const id = shock.responds[0];
    const amount = invested.includes(id) ? 0 : prepared.includes(id) || piloted.includes(id) ? shock.partial : shock.hit;
    const start = startOf(h);
    let tight = -1;
    have.forEach((v, i) => { if (v > 0 && (tight < 0 || v / start[i] < have[tight] / start[tight])) tight = i; });
    shockLoss = RES_KEYS.map((_, i) => (i === tight ? Math.min(have[i], amount) : 0));
    have = have.map((x, i) => x - shockLoss[i]);
    history.push({ source: 'signal', action: 'shock', cost: shockLoss });
  };
  const apply = (action, cap, source) => {
    if (!cap || !capabilityById(cap)) return false;
    if (action === 'invest') {
      if (invested.includes(cap)) return false;
      const cost = prepared.includes(cap) ? completeCost(h.id, cap, foundation) : piloted.includes(cap) ? scaleCost(h.id, cap, foundation) : investCost(h.id, cap, foundation);
      if (!fits(have, cost)) { history.push({ source, action, cap, invalid: true }); return false; }
      have = sub(have, cost);
      history.push({ source, action, cap, completed: prepared.includes(cap), scaled: piloted.includes(cap), cost });
      const dz = designAt(source, cap);
      designs[cap] = piloted.includes(cap)
        ? { ...designs[cap], owner: dz.owner || designs[cap]?.owner || '', route: 'scaled', kind: 'full', source }
        : { alt: dz.alt, owner: dz.owner, set: dz.set, route: prepared.includes(cap) ? 'prepared' : 'direct', kind: 'full', source };
      invested.push(cap);
      if (prepared.includes(cap)) prepared.splice(prepared.indexOf(cap), 1);
      if (piloted.includes(cap)) piloted.splice(piloted.indexOf(cap), 1);
      if (cap === 'care-platform') foundation = true;
      return true;
    }
    if (action === 'start') {
      if (invested.includes(cap) || prepared.includes(cap) || piloted.includes(cap)) return false;
      const cost = startCost(h.id, cap);
      if (!fits(have, cost)) { history.push({ source, action, cap, invalid: true }); return false; }
      have = sub(have, cost);
      piloted.push(cap);
      designs[cap] = { ...designAt(source, cap), route: 'pilot', kind: 'pilot', source };
      history.push({ source, action, cap, cost });
      return true;
    }
    if (action === 'prepare') {
      if (invested.includes(cap) || prepared.includes(cap) || piloted.includes(cap)) return false;
      const cost = prepareCost(h.id, cap);
      if (!fits(have, cost)) { history.push({ source, action, cap, invalid: true }); return false; }
      have = sub(have, cost);
      prepared.push(cap);
      history.push({ source, action, cap, cost });
      return true;
    }
    return false;
  };
  const teachCap = teachCapFor(participants, responses, table);
  const td = teachDecisionFor(responses, table);
  if (opts.skipTeach) history.push({ source: 'teach', action: 'none', cap: teachCap });
  else if (td.choice === 'invest' || td.choice === 'prepare' || td.choice === 'start') apply(td.choice, teachCap, 'teach');
  else history.push({ source: 'teach', action: td.choice || 'none', cap: teachCap });
  for (let k = 1; k <= uptoCycle; k += 1) {
      if (k === 3) {
        /* The operations layer. Not another capability: what the table commits to so that what it built actually runs. */
        applyShock();
        const oids = parseOps(activeProposal(responses, table, 'cycle-3')?.choice);
        if (!oids) { history.push({ source: 'cycle-3', action: 'none' }); continue; }
        oids.forEach((id) => {
          const oc = OPS_COMMITMENTS[id].cost;
          const need = OPS_COMMITMENTS[id].needs;
          const met = !need || need.some((c) => invested.includes(c) || piloted.includes(c));
          if (!met || !fits(have, oc) || opsDone.includes(id)) { history.push({ source: 'cycle-3', action: 'ops', id, invalid: true }); return; }
          have = sub(have, oc);
          opsDone.push(id);
          history.push({ source: 'cycle-3', action: 'ops', id, cost: oc });
        });
        continue;
      }
      if (closed) { history.push({ source: `cycle-${k}`, action: 'closed' }); continue; }
      const row = activeProposal(responses, table, `cycle-${k}`);
      const parsed = parseCycleChoice(row?.choice);
      if (!parsed) { history.push({ source: `cycle-${k}`, action: 'none' }); continue; }
      if (parsed.action === 'close') { closed = true; history.push({ source: `cycle-${k}`, action: 'close' }); continue; }
      if (parsed.action === 'hold') { history.push({ source: `cycle-${k}`, action: 'hold' }); continue; }
      apply(parsed.action, parsed.cap, `cycle-${k}`);
    }
    if (uptoCycle >= 2) applyShock();
  return { hospital: h, have, remaining: toObj(have), foundation, invested, prepared, piloted, closed, history, teachCap, teach: td, shockLoss, designs, ops: opsDone };
};
const blankLedger = (h) => ({ hospital: h, have: startOf(h), foundation: false, invested: [], prepared: [], piloted: [], closed: false, shockLoss: null, history: [], designs: {}, ops: [] });
const ledgerOpts = (k) => (k >= 3 ? {} : { preSignal: true });

/* ===== BY DESIGN 0.6 · THE OPERATIONS LAYER =====
   The last decision is not another capability. It is what the table commits to so that what it built actually runs,
   paid for with the capacity it kept. It never changes whether a condition Holds: it changes whether it is run, or on paper. */
const OPS_COMMITMENTS = {
  responder: { name: 'A named responder', what: 'One person whose job is to notice a change in Arthur and call him, and who knows him.', arthur: 'Someone notices, calls him, and meets him at the door.', scene: 'A named person calls him, and meets him when he comes back.', staff: 'A role with protected time, trained, and covered when they are away.', facility: 'A way for that person to see him and to reach a bed.', cost: [1, 0, 2, 1], covers: ['C1', 'C2'], needs: null, needsText: '' },
  coverage: { name: 'Protected night and weekend coverage', what: 'Staffed cover for the hours he is most likely to need help, with a quiet-night protocol.', arthur: 'A call at 2 a.m. is answered, and the corridor stays quiet.', scene: 'A person answers at night, and the corridor stays quiet.', staff: 'Rostered cover and a night protocol, not goodwill.', facility: 'Night routes, lighting and noise rules that people actually follow.', cost: [2, 0, 3, 1], covers: ['C5', 'C6'], needs: null, needsText: '' },
  fallback: { name: 'A manual fallback', what: 'A phone tree and a paper route for when the system or the link fails, practised before it is needed.', arthur: 'If the link drops, a phone still rings and someone still answers.', scene: 'When the link drops, a phone still rings.', staff: 'A rehearsed downtime routine on every unit.', facility: 'Phones, printed lists and a place to run them from.', cost: [1, 1, 2, 0], covers: ['C1'], needs: null, needsText: '' },
  access: { name: 'Communication access, in a private space', what: 'Captioning, amplified sound or an interpreter, in a room where the conversation can be private and consented, whoever is on the other end of the link.', arthur: 'He can hear, understand and answer, and nobody else is listening.', scene: 'He hears every word, and the conversation stays between him and his clinician.', staff: 'A named route to book captioning, amplification or an interpreter, and a clinician who checks he followed.', facility: 'A consult space with sound control and a door that closes, at his end and theirs.', cost: [1, 1, 1, 1], covers: ['C3', 'C4'], needs: null, needsText: '' },
  escalation: { name: 'One escalation path across the facility', what: 'A single route from a noticed change to a bed and a person, across units and shifts.', arthur: 'A noticed change reaches a bed and a person, whatever the shift.', scene: 'A noticed change reaches a bed and a person, on any shift.', staff: 'A command center duty role, and unit leads who answer it.', facility: 'A bay or bed the command center can release, and a place to run it from.', cost: [0, 1, 2, 2], covers: ['C2'], needs: ['predictive-operations'], needsText: 'Needs Command Center Operations committed or piloted.' },
  redeploy: { name: 'Released time goes to Arthur', what: 'Time that documentation or deliveries hand back is protected for conversations with patients like him, not absorbed by the next task.', arthur: 'Staff have time to talk with him privately, and to answer when he asks.', scene: 'A clinician has time for a private conversation, and for his question.', staff: 'A named owner for released time, and a rule about where it goes.', facility: 'A private room where the conversation can happen.', cost: [0, 0, 1, 2], covers: ['C5'], needs: ['ambient-intelligence', 'autonomous-logistics'], needsText: 'Needs Ambient Intelligence or Autonomous Logistics committed or piloted.' },
};
const OPS_IDS = ['responder', 'coverage', 'fallback', 'access', 'escalation', 'redeploy'];
const lc1 = (t) => String(t || '').charAt(0).toLowerCase() + String(t || '').slice(1);
const opsCostOf = (ids) => ids.reduce((a, id) => a.map((v, i) => v + OPS_COMMITMENTS[id].cost[i]), [0, 0, 0, 0]);
const opsNeedsMet = (l, id) => { const n = OPS_COMMITMENTS[id].needs; return !n || n.some((c) => l.invested.includes(c) || l.piloted.includes(c)); };
const parseOps = (choice) => { const p = parseCycleChoice(choice); if (!p || p.action !== 'ops') return null; return (p.cap || '').split(',').filter((id) => OPS_COMMITMENTS[id]); };
const opsCanAct = (l) => OPS_IDS.some((id) => opsNeedsMet(l, id) && fits(l.have, OPS_COMMITMENTS[id].cost));
const opsCovered = (ids) => new Set(ids.flatMap((id) => OPS_COMMITMENTS[id].covers));
const opsPressed = (signal) => (signal && SIGNAL_LENS[signal.id] ? SIGNAL_LENS[signal.id].conds : []);
/* For each of Arthur's conditions: where it stands before the layer, and whether it would be run or on paper. */
const opsPreview = (l, ids) => {
  const ev = bydNow(l);
  const base = bydEvaluate(l.hospital.id, {}, {}, false);
  const covered = opsCovered(ids);
  return COND_IDS.map((c) => {
    const x = ev.cs[c];
    const baseState = { 2: 'H', 1: 'S', 0: 'X' }[base.cs[c].level];
    const needsRun = (x.state === 'H' || x.state === 'PP') && COND_RANK[x.state] > COND_RANK[baseState];
    return { id: c, label: COND_LABEL[c], state: x.state, needsRun, run: needsRun && covered.has(c) };
  });
};
const opsLine = (tc) => (tc.ops && tc.ops.chosen.length ? ` Kept running: ${listJoin(tc.ops.chosen.map((o) => lc1(o.name)))}.` : ' No operating commitments were made.') + (tc.ops && tc.ops.onPaper.length ? ` On paper, not run: ${listJoin(tc.ops.onPaper)}.` : '');

/* ===== BYDESIGN LOGIC (reads the ledger and the table's design rows) ===== */
const bydStatus = (l) => Object.fromEntries(BYD_CAPS.map((c) => {
  const d = l.designs?.[c];
  const x = l.invested.includes(c) ? (d?.route === 'prepared' ? 4 : d?.route === 'scaled' ? 5 : 3) : l.piloted.includes(c) ? 2 : l.prepared.includes(c) ? 1 : 0;
  return [c, x];
}));
const bydAlts = (l) => Object.fromEntries(BYD_CAPS.filter((c) => l.invested.includes(c) || l.piloted.includes(c)).map((c) => [c, l.designs?.[c]?.alt || 'A']));
const bydNow = (l) => bydEvaluate(l.hospital.id, bydStatus(l), bydAlts(l), false);
const chosenPromise = (responses, t) => {
  const r = latestTableRow(responses, t, 'table_promise', 'promise');
  return r?.choice && PROMISES[r.choice] ? { id: r.choice, defaulted: false } : { id: 'P1', defaulted: true };
};
/* What one decision did for Arthur, in patient language. */
const bydChanges = (before, after) => {
  const out = [];
  COND_IDS.forEach((c) => {
    const b = before.cs[c].state; const a = after.cs[c].state;
    if (b !== a) out.push(`${COND_LABEL[c]}: ${STATE_WORD[b]} → ${STATE_WORD[a]}.`);
  });
  after.reduced.forEach((r) => { if (!before.reduced.some((x) => x.cond === r.cond)) out.push(`${COND_LABEL[r.cond]} is harder: ${r.cause.toLowerCase()}. ${r.fix}`); });
  return out;
};
const opsNamesCovering = (conds) => OPS_IDS.filter((o) => OPS_COMMITMENTS[o].covers.some((c) => conds.includes(c))).map((o) => lc1(OPS_COMMITMENTS[o].name));
const cardReading = (tc, id) => {
  if (id === 'tuesday') {
    if (!tc.commits.length) return 'Nothing was committed, so there is nothing to run. Arthur’s care stays as it was.';
    return `${tc.commits.map((c) => (c.owner ? `${c.name}: ${c.ownerName} owns it.` : `${c.name}: no owner named.${c.byFacilitator ? ' (Recorded by the facilitator.)' : ''}`)).join(' ')}${opsLine(tc)}`;
  }
  const x = tc.conditions[id];
  const parts = [];
  if (x.cause) parts.push(`Weakened first: ${x.cause.toLowerCase()}. ${x.fix}`);
  if (x.state === 'H') {
    parts.push(x.baseState === 'H' ? 'This part of Arthur’s care already worked, and still does.' : `Designed in through ${listJoin(x.byText)}.`);
    if (x.baseState !== 'H') parts.push(tc.ops.onPaperIds.includes(id) ? `It works on paper only. Nothing is funded to run it: ${listJoin(opsNamesCovering([id]))}.` : `Kept running by ${listJoin(OPS_IDS.filter((o) => tc.ops.ids.includes(o) && OPS_COMMITMENTS[o].covers.includes(id)).map((o) => lc1(OPS_COMMITMENTS[o].name)))}.`);
  }
  else if (x.state === 'PP') parts.push(`Proven for pilot patients with ${listJoin(x.byText)}. It is not yet Arthur’s whole journey.`);
  else if (x.state === 'S') parts.push(x.limits.length ? x.limits.map((m) => `${m.why} ${m.fix}`).join(' ') : x.byText.length ? `Partly in place through ${listJoin(x.byText)}.` : 'Still works only some of the time.');
  else parts.push(x.limits.length ? x.limits.map((m) => `${m.why} ${m.fix}`).join(' ') : 'Not in place. Nothing the table chose reached this.');
  return parts.join(' ');
};
const bydTeamCard = (participants, responses, t, signal) => {
  const l = ledgerFor(participants, responses, t, 3);
  const hid = l.hospital.id;
  const status = bydStatus(l); const alts = bydAlts(l);
  const A = bydEvaluate(hid, status, alts, false);
  const S = bydEvaluate(hid, status, alts, true);
  const B0 = bydEvaluate(hid, {}, {}, false);
  const ch = chosenPromise(responses, t);
  const capName = (id) => capabilityById(id)?.name;
  const byText = (by) => by.map((b) => `${capName(b.cap)} (${ALT_COPY[b.cap][b.alt].name}${b.kind === 'pilot' ? ', pilot' : ''})`);
  const conditions = {};
  COND_IDS.forEach((c) => {
    const x = A.cs[c];
    const baseState = { 2: 'H', 1: 'S', 0: 'X' }[B0.cs[c].level];
    const red = A.reduced.find((r) => r.cond === c);
    const change = COND_RANK[x.state] > COND_RANK[baseState] ? 'Improved' : COND_RANK[x.state] < COND_RANK[baseState] ? 'Weakened' : x.state === 'H' ? 'Kept' : 'Unchanged';
    conditions[c] = { id: c, label: COND_LABEL[c], state: x.state, baseState, change, byText: byText(x.by), limits: A.limited[c] || [], cause: red?.cause || '', fix: red?.fix || '' };
  });
  /* The operating layer comes first: an improved condition nobody is funded to run is on paper. */
  const opsIds = l.ops || [];
  const coveredSet = opsCovered(opsIds);
  const onPaperIds = COND_IDS.filter((c) => (conditions[c].state === 'H' || conditions[c].state === 'PP') && conditions[c].change === 'Improved' && !coveredSet.has(c));
  const promiseGate = (p, raw) => (raw === 'Holds' && PROMISE_CONDS[p].some((c) => onPaperIds.includes(c)) ? DESIGNED : raw);
  const promises = PROMISE_IDS.map((p) => ({ id: p, name: PROMISES[p].name, base: bydPromise(B0.cs, p), raw: bydPromise(A.cs, p), status: promiseGate(p, bydPromise(A.cs, p)), sp: bydPromise(S.cs, p), chosen: p === ch.id }));
  const pr = promises.find((p) => p.chosen);
  const spText = pr.status === 'Holds'
    ? (pr.sp === 'Holds' ? 'Held for both Arthur and the second person.' : `Held for Arthur. For the person who lives alone, hears poorly and has unreliable internet: ${pr.sp.toLowerCase()}.`)
    : pr.status === DESIGNED
      ? `Designed for Arthur, and not yet run. For the person who lives alone, hears poorly and has unreliable internet: ${pr.sp.toLowerCase()}.`
      : `Not held for Arthur (${pr.status.toLowerCase()}). For the person who lives alone, hears poorly and has unreliable internet: ${pr.sp.toLowerCase()}.`;
  const improved = COND_IDS.filter((c) => conditions[c].change === 'Improved').map((c) => `${COND_LABEL[c]}: ${STATE_WORD[conditions[c].baseState]} → ${STATE_WORD[conditions[c].state]}${conditions[c].byText.length ? ` · ${listJoin(conditions[c].byText)}` : ''}`);
  const harder = A.reduced.map((r) => `${COND_LABEL[r.cond]} is harder: ${r.cause.toLowerCase()}. ${r.why} ${r.fix}`);
  const limited = [];
  COND_IDS.forEach((c) => {
    const x = conditions[c];
    if (x.state === 'H') return;
    const seen = new Set();
    x.limits.forEach((m) => { const k = m.why; if (seen.has(k)) return; seen.add(k); limited.push(`${x.label} (${STATE_WORD[x.state]}): ${m.why} ${m.fix}`); });
    if (!x.limits.length && x.state === 'X') limited.push(`${x.label} (Unresolved): nothing the table chose reached this.`);
    else if (!x.limits.length && x.state === 'S') limited.push(x.byText.length ? `${x.label} (Strained): only partly in place through ${listJoin(x.byText)}.` : `${x.label} (Strained): nothing the table chose has lifted this yet.`);
  });
  const commits = Object.entries(l.designs || {}).filter(([cap]) => l.invested.includes(cap) || l.piloted.includes(cap)).map(([cap, d]) => ({
    cap, name: capName(cap), kind: l.invested.includes(cap) ? 'committed' : 'pilot', alt: ALT_COPY[cap][d.alt].name, owner: d.owner || '', ownerName: d.owner ? briefFor(d.owner).name : '', byFacilitator: !d.set,
  }));
    const opsView = { ids: opsIds, chosen: opsIds.map((id) => OPS_COMMITMENTS[id]), onPaper: onPaperIds.map((c) => COND_LABEL[c]), onPaperIds, covered: [...coveredSet].map((c) => COND_LABEL[c]) };
    const owned = commits.filter((c) => c.owner).length;
  const tuesday = !commits.length ? null : owned === commits.length ? 'H' : owned > 0 ? 'S' : 'X';
  const selected = bydSelectedCondition(A.cs, A.reduced, ch.id);
  const runForPromise = opsIds.filter((o) => OPS_COMMITMENTS[o].covers.some((c) => PROMISE_CONDS[ch.id].includes(c)));
  const strength = [
    ...runForPromise.map((o) => `${OPS_COMMITMENTS[o].name}: ${OPS_COMMITMENTS[o].scene}`),
    ...l.prepared.map((id) => `Provision secured for ${capName(id)}: ${capabilityById(id).prepare.pkg}`),
    ...l.invested.concat(l.piloted).map((id) => `${capName(id)}: keep changeable — ${capabilityById(id).open}`),
  ];
  const pcs = PROMISE_CONDS[ch.id];
  const stateLow = (c) => STATE_WORD[conditions[c].state].toLowerCase();
  const FUNC_NOTE = {
    P1: ['The handoff from follow-up to return holds.', 'The handoff from follow-up to return is not yet dependable.'],
    P2: ['He can follow the conversation and speak for himself.', 'He cannot yet follow the conversation and speak for himself.'],
    P3: ['Help comes when he asks, and the night stays quiet.', 'Help, or a quiet night, is not yet dependable.'],
  };
  const func = [`${COND_LABEL[pcs[0]]} ${stateLow(pcs[0])}, ${COND_LABEL[pcs[1]]} ${stateLow(pcs[1])}. ${FUNC_NOTE[ch.id][pcs.every((c) => conditions[c].state === 'H') ? 0 : 1]}`];
  const beauty = l.invested.concat(l.piloted).map((id) => ({ id, b: ALT_COPY[id][l.designs[id]?.alt || 'A'].beauty })).filter((x) => !/^None/.test(x.b)).map((x) => `${capName(x.id)}: ${x.b}`);
  const stop = COND_IDS.filter((c) => conditions[c].state !== 'H').sort((a, b) => COND_RANK[conditions[a].state] - COND_RANK[conditions[b].state] || Number(a.slice(1)) - Number(b.slice(1)))[0];
  const lines = [];
  const altOf = (id) => l.designs?.[id]?.alt;
  if (pr.status === 'Holds') {
    if (ch.id === 'P1') { lines.push('Arthur is called for a scheduled follow-up, then walks in to where a person is waiting.'); lines.push(altOf('predictive-operations') === 'B' ? 'A staffed bay is held for him.' : l.invested.includes('predictive-operations') ? 'The existing front door, with a named responder.' : 'A person who knows he is coming.'); }
    if (ch.id === 'P2') { lines.push('Arthur answers the specialist and is not spoken for. His wife has a seat.'); if (l.invested.includes('virtual-care') && altOf('virtual-care') === 'B') lines.push('He is in a consult room designed for the encounter.'); else if (l.invested.includes('ambient-intelligence') && altOf('ambient-intelligence') === 'B') lines.push('The room is treated so the conversation is not overheard.'); }
    if (ch.id === 'P3') { lines.push('The lights are his, a person answers the call, the corridor is quiet.'); if (altOf('autonomous-logistics')) lines.push(altOf('autonomous-logistics') === 'A' ? 'Deliveries use quiet service routes.' : 'Deliveries keep to quiet hours.'); }
  } else if (pr.status === DESIGNED) {
    lines.push('The scene is set. The people to run it are not yet funded.');
  } else if (pr.status === 'Proven in pilot') {
    lines.push('The same scene, with a sign for one unit only and a plan to widen it.'); lines.push(`Piloted: ${listJoin(l.piloted.map(capName))}.`);
  } else {
    const sel = conditions[selected].state !== 'H' ? selected : (stop || selected);
    const heldMoments = PROMISE_CONDS[ch.id].filter((c) => conditions[c].state === 'H' && c !== sel);
    if (runForPromise.length) lines.push(`You funded ${listJoin(runForPromise.map((o) => lc1(OPS_COMMITMENTS[o].name)))}.`);
    if (heldMoments.length) lines.push(`${listJoin(heldMoments.map((c) => COND_LABEL[c]))} ${heldMoments.length > 1 ? 'hold' : 'holds'}.`);
    lines.push(coveredSet.has(sel) ? FRAME_STOP_FUNDED[sel] : FRAME_STOP[sel]);
    const cause = conditions[sel].limits[0];
    if (cause) lines.push(`${cause.why} ${cause.fix}`);
    }
    if (pr.status === 'Holds' || pr.status === DESIGNED) {
      const promiseOnPaper = PROMISE_CONDS[ch.id].filter((c) => onPaperIds.includes(c));
      const runBy = opsIds.find((id) => OPS_COMMITMENTS[id].covers.some((c) => PROMISE_CONDS[ch.id].includes(c)));
      if (promiseOnPaper.length) lines.push(`Designed, not yet operational. Nothing funded to run it: ${listJoin(OPS_IDS.filter((id) => OPS_COMMITMENTS[id].covers.some((c) => promiseOnPaper.includes(c))).map((id) => lc1(OPS_COMMITMENTS[id].name)))}.`);
      else if (runBy) lines.push(OPS_COMMITMENTS[runBy].scene);
    }
  return {
    l, hid, hospital: l.hospital, conditions, promises, promise: { ...pr, text: `${PROMISES[ch.id].name}: ${pr.status}`, defaulted: ch.defaulted },
    headline: `${PROMISES[ch.id].name}: ${pr.status}`, spText, improved, harder, limited, commits, tuesday, selected, ops: opsView,
    setup: [...l.prepared.map((id) => `${capName(id)} is prepared: ${capabilityById(id).prepare.ready} Arthur does not feel it yet.`), ...l.piloted.map((id) => `${capName(id)} is piloted on a small scale. Arthur feels it only where the pilot runs.`)],
    sfb: { strength, func, beauty }, frame: { key: FRAME_KEY[pr.status], img: frameImageFor(FRAME_KEY[pr.status], ch.id), title: `Back to Arthur. ${pr.status}.`, lines }, reduced: A.reduced,
    question: BYD_CARDS[selected].question, signal,
  };
};
/* The Holds scene follows the promise the table chose. If a variant is missing, the generic Holds image stands in. */
const HOLDS_BY_PROMISE = { P1: 'arthur-holds', P2: 'arthur-holds-p2', P3: 'arthur-holds-p3' };
const frameImageFor = (key, pid) => `${BASE}moments/${key === 'holds' || key === 'designed' ? (HOLDS_BY_PROMISE[pid] || 'arthur-holds') : `arthur-${key}`}.png`;
const frameFallbackFor = (key) => `${BASE}moments/${key === 'designed' ? 'arthur-holds' : `arthur-${key}`}.png`;
const arthurFilmFrame = (participants, responses, t) => {
  const tc = bydTeamCard(participants, responses, t, null);
  return { scale: 'ARTHUR', title: tc.frame.title, img: tc.frame.img, fallback: frameFallbackFor(tc.frame.key), lines: tc.frame.lines };
};
const filmFrames = (participants, responses, t) => [...filmFramesBase(participants, responses, t), arthurFilmFrame(participants, responses, t)];


/* Board states: committed · complete (prepared, can finish) · available · prepare-only · out.
   Each blocked option explains which earlier decisions used the resource it needs. */
const boardFor = (ledger) => {
  const h = ledger.hospital;
  const start = startOf(h);
  const why = (limit, costAtStart) => {
    if (!limit) return null;
    if (!fits(start, costAtStart)) return 'Beyond this hospital’s starting capacity in this planning period.';
    const idx = RES_KEYS.indexOf(limit.key);
    const by = capNames([...ledger.invested, ...ledger.prepared].filter((id) => investCost(h.id, id)[idx] > 0));
    if (ledger.shockLoss && ledger.shockLoss[idx] > 0) by.push('the cyber incident');
    return by.length ? `Within reach at the start. ${listJoin(by)} used the ${limit.label} it needs.` : null;
  };
  return CAPABILITIES.map((c) => {
    if (ledger.invested.includes(c.id)) return { c, state: 'committed', costs: {}, ok: {} };
    const costs = optionCosts(ledger, c.id);
    const ok = Object.fromEntries(Object.entries(costs).map(([k, v]) => [k, fits(ledger.have, v)]));
    const base = { c, costs, ok, investCost: costs.invest, prepareCost: costs.prepare, startCost: costs.start };
    if (ledger.prepared.includes(c.id) || ledger.piloted.includes(c.id)) {
      const follow = ledger.prepared.includes(c.id) ? 'complete' : 'scale';
      if (ok.invest) return { ...base, state: follow };
      const limit = limitingOf(ledger.have, costs.invest);
      return { ...base, state: 'out', limit, prepared: follow === 'complete', piloted: follow === 'scale', cause: why(limit, costs.invest) };
    }
    if (ok.invest) return { ...base, state: 'available' };
    if (ok.start || ok.prepare) {
      const limit = limitingOf(ledger.have, costs.invest);
      return { ...base, state: 'prepare-only', limit, cause: why(limit, investCost(h.id, c.id)) };
    }
    const cheapest = sumOf(costs.start) <= sumOf(costs.prepare) ? costs.start : costs.prepare;
    const limit = limitingOf(ledger.have, cheapest);
    return { ...base, state: 'out', limit, cause: why(limit, cheapest) };
  });
};
const STATE_LABEL = { committed: 'COMMITTED', complete: 'PREPARED · CAN INVEST', scale: 'PILOTED · CAN SCALE', available: 'AVAILABLE', 'prepare-only': 'START OR PREPARE ONLY', out: 'OUT OF REACH' };
const stateLabel = (b) => (b.state === 'prepare-only' ? (b.ok?.start && b.ok?.prepare ? 'START OR PREPARE' : b.ok?.start ? 'START ONLY' : 'PREPARE ONLY') : STATE_LABEL[b.state]);
const STATE_RANK = { committed: 4, complete: 3, scale: 3, available: 3, 'prepare-only': 1, out: 0 };
const canActOn = (row) => ['complete', 'scale', 'available', 'prepare-only'].includes(row.state);

/* What one decision changed on the board: options closed, opened or made cheaper. */
const diffBoards = (before, after, chosen) => {
  const b = Object.fromEntries(boardFor(before).map((x) => [x.c.id, x]));
  const blocked = [];
  const opened = [];
  const cheaper = [];
  boardFor(after).forEach((x) => {
    const y = b[x.c.id];
    if (!y || x.c.id === chosen || x.state === 'committed' || y.state === 'committed') return;
    const r0 = STATE_RANK[y.state];
    const r1 = STATE_RANK[x.state];
    if (r1 < r0) blocked.push({ c: x.c, to: x.state, limit: x.limit });
    else if (r1 > r0) opened.push({ c: x.c, to: x.state });
    else if (x.investCost && y.investCost && sumOf(x.investCost) < sumOf(y.investCost)) cheaper.push({ c: x.c, saved: sumOf(y.investCost) - sumOf(x.investCost) });
  });
  return { blocked, opened, cheaper };
};

const mainConstraint = (ledger) => {
  const start = startOf(ledger.hospital);
  const ratios = ledger.have.map((v, i) => v / start[i]);
  const low = Math.min(...ratios);
  return listJoin(RES_KEYS.filter((_, i) => ratios[i] === low).map((k) => RESOURCE_LABELS[k]));
};

const challengeRevealed = (responses) => { const r = responsesOfType(responses, 'signal_reveal', 'room').sort(byTime).slice(-1)[0]; return Boolean(r && r.choice === 'shown'); };
const signalRow = (responses) => responsesOfType(responses, 'signal', 'room').sort(byTime).slice(-1)[0];
const currentSignal = (responses) => {
  const row = signalRow(responses);
  return row?.choice ? signalById(row.choice) : null;
};
const shockSignal = (responses) => {
  const s = currentSignal(responses);
  return s?.kind === 'shock' ? s : null;
};

/* How a table stands against the challenge. */
const signalStanding = (participants, responses, table, signal) => {
  if (!signal) return null;
  if (signal.kind === 'shock') {
    const before = ledgerFor(participants, responses, table, 2, { preSignal: true });
    const after = ledgerFor(participants, responses, table, 2);
    const id = signal.responds[0];
    const loss = sub(before.have, after.have);
    if (before.invested.includes(id)) return { kind: 'protected', label: 'Protected by the foundation', loss };
      if (before.prepared.includes(id) || before.piloted.includes(id)) return { kind: 'partly', label: 'Partly protected', loss };
    return { kind: 'hit', label: 'Hit by the incident', loss };
  }
  const before = ledgerFor(participants, responses, table, 2);
    const inPlace = signal.responds.find((id) => before.invested.includes(id));
    if (inPlace) return { kind: 'in-place', label: 'Already in place', cap: inPlace };
    const started = signal.responds.find((id) => before.prepared.includes(id) || before.piloted.includes(id));
    if (started) return { kind: 'started', label: 'Started, not yet in place', cap: started, piloted: before.piloted.includes(started) };
    return { kind: 'exposed', label: 'Not in place', cap: signal.responds[0] };
};
const lossText = (loss) => RES_KEYS.map((k, i) => (loss?.[i] ? `${loss[i]} ${RESOURCE_LABELS[k]}` : null)).filter(Boolean).join(' and ') || 'nothing';
const standingText = (s, final = false) => {
  if (!s) return { head: 'No challenge yet', detail: '' };
  const n = (id) => capabilityById(id)?.name;
  switch (s.kind) {
    case 'in-place': return { head: `Already in place: ${n(s.cap)}`, detail: 'An earlier commitment covered it.' };
    case 'responded': return { head: `Responded with ${n(s.cap)}`, detail: 'You had the capacity to act in the final cycle.' };
    case 'could': return final
      ? { head: `Could have responded with ${n(s.cap)}`, detail: 'The capacity was there. The table chose another path.' }
        : { head: `Can respond with ${n(s.cap)}${s.prepared ? ' (already started)' : ''}`, detail: 'Decide in the final cycle.' };
    case 'closed': return { head: 'Portfolio closed before the challenge', detail: 'Your capacity is intact, and the table chose not to act.' };
    case 'cannot': return { head: final ? 'Could not respond' : 'Cannot respond this cycle', detail: s.limit ? `Short on ${s.limit.label}: has ${s.limit.have}, needs ${s.limit.need}.` : 'No responding capability fits the remaining resources.' };
    case 'protected': return { head: 'Protected by the foundation', detail: 'Common standards and a security baseline contained the incident.' };
    case 'partly': return { head: 'Partly protected', detail: `Early work on the foundation limited the damage. Recovery cost ${lossText(s.loss)}.` };
    case 'hit': return { head: 'Hit by the incident', detail: `Recovery cost ${lossText(s.loss)}.` };
    case 'started': return { head: `Started: ${n(s.cap)}`, detail: s.piloted ? 'A pilot is running. It covers only part of what the challenge presses.' : 'The option is prepared, not switched on. It does not help yet.' };
      case 'exposed': return { head: 'Not in place', detail: `${n(s.cap)} would have responded. The operations layer is how you cover what you can.` };
      default: return { head: s.label || '', detail: '' };
  }
};

/* ---------------------------------------------------------------------
   DEBRIEF ENGINE · outcomes, turning points, building commitments
   --------------------------------------------------------------------- */
const stepsFor = (participants, responses, t) => {
  const steps = [];
  let prev = blankLedger(hospitalForTable(t));
  for (let k = 0; k <= 3; k += 1) {
    const L = ledgerFor(participants, responses, t, k, { preSignal: true });
    const src = k === 0 ? 'teach' : `cycle-${k}`;
    const ev = L.history.filter((x) => x.source === src).slice(-1)[0];
    if (ev && (ev.action === 'invest' || ev.action === 'prepare' || ev.action === 'start') && !ev.invalid) steps.push({ k, action: ev.action, cap: ev.cap, diff: diffBoards(prev, L, ev.cap) });
    prev = L;
  }
  return steps;
};
const describeStep = (st) => `${st.action === 'invest' ? 'invested in' : st.action === 'start' ? 'piloted' : 'prepared'} ${capabilityById(st.cap)?.name} ${st.k === 0 ? 'in the teaching round' : `in cycle ${st.k}`}`;

const turningPoints = (participants, responses, t, signal) => {
  const steps = stepsFor(participants, responses, t);
  const out = [];
  const closer = [...steps].sort((a, b) => b.diff.blocked.length - a.diff.blocked.length)[0];
  if (closer && closer.diff.blocked.length) {
    const lim = [...new Set(closer.diff.blocked.map((x) => x.limit?.label).filter(Boolean))];
    out.push({ title: 'The decision that closed the most doors', text: `When you ${describeStep(closer)}, ${listJoin(closer.diff.blocked.map((x) => x.c.name))} became harder to reach${lim.length ? `, because ${listJoin(lim)} ran short` : ''}.` });
  } else {
    out.push({ title: 'No decision closed a door', text: 'Every option you left behind was still within reach. What you did not pursue was a choice, not a constraint.' });
  }
  const gain = (st) => st.diff.cheaper.length + st.diff.opened.length;
  const opener = [...steps].sort((a, b) => gain(b) - gain(a))[0];
  if (opener && gain(opener)) {
    out.push({ title: 'The decision that opened the most doors', text: `When you ${describeStep(opener)}, ${listJoin([...opener.diff.cheaper, ...opener.diff.opened].map((x) => x.c.name))} became cheaper or easier to reach.` });
  } else {
    out.push({ title: 'No decision opened a door', text: 'Every commitment used capacity. None made a later capability cheaper.' });
  }
  if (signal) {
    const st = standingText(signalStanding(participants, responses, t, signal), true);
    out.push({ title: `When the challenge arrived: ${signal.title}`, text: `${st.head}. ${st.detail}` });
  }
  const l = ledgerFor(participants, responses, t, 3);
  const zero = RES_KEYS.filter((_, i) => l.have[i] === 0).map((k) => RESOURCE_LABELS[k]);
  out.push({ title: 'What your remaining capacity means', text: zero.length
    ? `You spent ${listJoin(zero)} to zero. Anything new that needs ${zero.length > 1 ? 'them' : 'it'} must wait for the next planning period.`
    : `You kept at least ${Math.min(...l.have)} of every resource. That is your room to respond to what comes next.` });
  return out;
};

const lockReport = (l) => ({
  now: l.invested.map((id) => ({ name: capabilityById(id).name, text: capabilityById(id).early })),
  protect: [...l.prepared.map((id) => ({ name: capabilityById(id).name, text: capabilityById(id).prepare.pkg })), ...l.piloted.map((id) => ({ name: `${capabilityById(id).name} (pilot)`, text: optionDetail(capabilityById(id), 'start').pilot }))],
  open: l.invested.map((id) => ({ name: capabilityById(id).name, text: capabilityById(id).open })),
});

const crossPrompt = (participants, responses) => {
  const L = activeTables(participants).map((t) => ({ t, l: ledgerFor(participants, responses, t, 3) }));
  for (const c of CAPABILITIES) {
    const byHospital = [...new Map(L.filter((x) => x.l.invested.includes(c.id)).map((x) => [x.l.hospital.id, x])).values()];
    if (byHospital.length >= 2) {
      const paid = (l) => sumOf(l.history.filter((e) => e.cap === c.id && !e.invalid && (e.action === 'invest' || e.action === 'prepare' || e.action === 'start')).reduce((acc, e) => acc.map((v, i) => v + (e.cost?.[i] || 0)), [0, 0, 0, 0]));
      const costs = byHospital.map((x) => ({ x, cost: paid(x.l) })).sort((a, b) => a.cost - b.cost);
      const lo = costs[0]; const hi = costs[costs.length - 1];
      if (lo.cost !== hi.cost) return `Table ${lo.x.t} (${lo.x.l.hospital.name}) paid ${lo.cost} for ${c.name}. Table ${hi.x.t} (${hi.x.l.hospital.name}) paid ${hi.cost}. ${COST_REASON[hi.x.l.hospital.id]} What else made the same capability cost more?`;
    }
  }
  if (L.length >= 2) {
    const s = [...L].sort((a, b) => b.l.invested.length - a.l.invested.length);
    const a = s[0]; const z = s[s.length - 1];
    if (a.l.invested.length !== z.l.invested.length) return `Table ${a.t} committed to ${a.l.invested.length} capabilities. Table ${z.t} committed to ${z.l.invested.length}. Was that ambition, or starting point?`;
  }
  return 'Look at a table with a different hospital. What would your portfolio have looked like from their starting point?';
};

const rippleFor = (cap, choice) => {
  if (choice === 'invest') return cap.invest;
  if (choice === 'prepare') return { headline: 'The option is prepared, not yet committed.', unit: cap.prepare.notYet, facility: cap.prepare.pkg, system: cap.prepare.ready, flow: 'Care settings are unchanged for now.' };
  if (choice === 'start') { const d = optionDetail(cap, 'start'); return { headline: 'A pilot is running. You are learning before you scale.', unit: d.pilot, facility: d.notYet, system: d.gov, flow: d.can }; }
  if (choice === 'hold') return { headline: 'Capacity is kept for what comes next.', unit: 'Current workflows continue.', facility: 'No change to the environment yet.', system: 'Resources remain available for later decisions.', flow: cap.exposure };
  return { headline: 'No table decision was recorded.', unit: 'No change applied.', facility: 'No change applied.', system: 'No change applied.', flow: 'No change applied.' };
};
const CLOSING_LINE = {
  invest: 'You chose a capability. You changed a care model. That changed the hospital.',
  start: 'You chose to learn before you scale. The pilot tells you whether the hospital is ready.',
  prepare: 'You designed for a future you have not committed to yet.',
  hold: 'You kept your capacity. The need is still there, and so is capacity to respond, if it is the right kind.',
};


/* ---------------------------------------------------------------------
   DATA LAYER (Supabase with local fallback for single-browser review)
   --------------------------------------------------------------------- */

function loadLocal(c) {
  try {
    return JSON.parse(localStorage.getItem(localKey(c)) || 'null');
  } catch {
    return null;
  }
}

async function saveSession(s) {
  if (hasSupabase) {
    const { error } = await supabase.from('hybrid_sessions').upsert(s);
    if (error) throw error;
  } else {
    const current = loadLocal(s.code) || {};
    localStorage.setItem(localKey(s.code), JSON.stringify({ ...current, ...s }));
  }
}

async function fetchSession(c) {
  if (hasSupabase) {
    const { data } = await supabase.from('hybrid_sessions').select('*').eq('code', c).maybeSingle();
    return data;
  }
  return loadLocal(c);
}

async function fetchParticipants(sessionId, c) {
  if (hasSupabase) {
    const { data } = await supabase.from('hybrid_participants').select('*').eq('session_id', sessionId).order('created_at');
    return (data || []).filter((p) => p.persona !== 'facilitator');
  }
  return (loadLocal(c)?.participants || []).filter((p) => p.persona !== 'facilitator');
}

async function addParticipant(p, c) {
  if (hasSupabase) {
    const { error } = await supabase.from('hybrid_participants').upsert(p);
    if (error) throw error;
  } else {
    const current = loadLocal(c) || {};
    const all = [...(current.participants || []).filter((x) => x.id !== p.id), p];
    localStorage.setItem(localKey(c), JSON.stringify({ ...current, participants: all }));
  }
}

async function fetchResponses(sessionId, c) {
  if (hasSupabase) {
    const { data } = await supabase.from('hybrid_responses').select('*').eq('session_id', sessionId).order('updated_at');
    return data || [];
  }
  return loadLocal(c)?.responses || [];
}

async function saveResponse(r, c) {
  if (hasSupabase) {
    const { error } = await supabase
      .from('hybrid_responses')
      .upsert(r, { onConflict: 'session_id,participant_id,response_type,capability_id' });
    if (error) throw error;
  } else {
    const current = loadLocal(c) || {};
    const key = (x) => `${x.session_id}|${x.participant_id}|${x.response_type}|${x.capability_id}`;
    const all = [...(current.responses || []).filter((x) => key(x) !== key(r)), r];
    localStorage.setItem(localKey(c), JSON.stringify({ ...current, responses: all }));
  }
}

/* ---------------------------------------------------------------------
   JOURNEY NAVIGATION
   --------------------------------------------------------------------- */
const JOURNEY = [
  ['lobby', 'Join the room'], ['arthur_intro', 'Meet Arthur'], ['context', 'Your hospital · inherited reality'],
  ['resources', 'Starting capacity'], ['brief_reveal', 'Your role · Arthur’s brief'], ['promise', 'Choose the care promise'],
  ['cap_nominate', 'Capabilities · private nomination'], ['cap_results', 'Approve teaching capabilities'],
['t_reveal', 'Your capability'], ['t_instinct', 'First instinct'],
    ['t_change_vote', 'What is hard to change?'], ['t_design', 'Design consequence'], ['t_discuss', 'Reveal instincts'],
    ['t_cost', 'Invest, start or prepare'], ['t_decision', 'Table decision'], ['t_continuum_reveal', 'What moves, what holds still'],
  ['t_ripple', 'Your hospital changed'],
  ['p_open', 'Portfolio board opens'], ['p1_decide', 'Cycle 1'], ['p2_decide', 'Cycle 2'], ['p_signal', 'The challenge'],
  ['p3_decide', 'The operations layer'],
  ['f_cards', 'The moments'], ['f_future', 'Arthur · what changed'], ['f_locks', 'What the building locks in'],
  ['f_compare', 'Side-by-side'], ['f_debrief', 'The conversation'], ['f_film', 'Your hospital, in motion'], ['f_takeaway', 'Bring this to your project'],
];
const LEGACY_JOURNEY_PHASES = {
  cap_select: 'cap_results', cap_confirm: 'cap_results', cap_preview: 'cap_results', complete: 't_decision',
  tension: 'context', discussion: 'resources', brief_read: 'brief_reveal', ready: 'promise', assignments: 'context', brief_share: 'promise', alignment: 'promise', cap_portfolio: 'cap_nominate',
  t_mission: 't_cost', t_checkpoint: 't_decision', p1_board: 'p1_decide', p2_board: 'p2_decide', p3_board: 'p3_decide', f_turns: 'f_future',
  vc_reveal: 't_reveal', vc_instinct: 't_instinct', vc_cost: 't_cost', vc_mission: 't_cost', vc_design: 't_design',
  vc_discuss: 't_discuss', vc_table_decision: 't_decision', vc_portfolio: 't_decision', vc_scale_vote: 't_continuum_reveal',
  vc_scale_reveal: 't_continuum_reveal', vc_continuum_vote: 't_continuum_reveal', vc_continuum_reveal: 't_continuum_reveal', vc_ripple: 't_ripple',
  t_scale_vote: 't_continuum_reveal', t_scale_reveal: 't_continuum_reveal', t_continuum_vote: 't_continuum_reveal',
};
const phaseIndex = (phase) => JOURNEY.findIndex(([id]) => id === (LEGACY_JOURNEY_PHASES[phase] || phase));
const priorPhase = (phase) => { const i = phaseIndex(phase); return i > 0 ? JOURNEY[i - 1][0] : null; };
const nextPhase = (phase) => { const i = phaseIndex(phase); return i >= 0 && i < JOURNEY.length - 1 ? JOURNEY[i + 1][0] : null; };

const PULLBACK_LEVELS = [
  { id: 'unit', number: '01', title: 'UNIT', subtitle: 'Where care is delivered' },
  { id: 'facility', number: '02', title: 'FACILITY', subtitle: 'What this hospital must provide' },
  { id: 'system', number: '03', title: 'SYSTEM', subtitle: 'What can be shared across sites' },
];
const CONTINUUM = [['HOME', 'Monitoring, consultation and recovery'], ['COMMUNITY', 'Access points and local support'], ['AMBULATORY', 'Diagnosis, treatment and follow-up'], ['HOSPITAL', 'Acute and complex care'], ['POST-ACUTE', 'Transition, rehabilitation and continuity']];
const CONTINUUM_OPTIONS = [...CONTINUUM, ['STAYS', 'It does not move care']];

const EXTRA_CSS = `
.tcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:22px 0}
.tcard{background:#fff;border:1px solid rgba(10,34,44,.1);border-top:5px solid #00a6a6;padding:18px;min-width:0}
.tcard>img{width:calc(100% + 36px);margin:-18px -18px 14px;height:120px;object-fit:cover;display:block;max-width:none}
.tcard .tlabel{display:block;font-size:.7rem;font-weight:900;letter-spacing:.1em;color:#6f2c91;margin-bottom:4px}
.tcard h3{margin:2px 0 8px;font-size:1.15rem}.tcard p{margin:6px 0;font-size:.92rem;line-height:1.4}
.tcard dl{margin:8px 0 0;display:grid;gap:6px}.tcard dt{font-size:.68rem;font-weight:900;letter-spacing:.1em;opacity:.7}.tcard dd{margin:0 0 4px;font-size:.9rem;line-height:1.35}
.costline{display:inline-grid;grid-template-columns:repeat(4,auto);gap:4px 10px;font-weight:900}.costline i{font-style:normal;display:flex;flex-direction:column;align-items:flex-start}.costline small{font-size:.68rem;letter-spacing:.06em;opacity:.65;font-weight:700;text-transform:uppercase}
.cost-pair{display:grid;gap:8px;margin:10px 0}.cost-pair>div{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;background:#f7f3ee}.cost-pair b{font-size:.75rem;letter-spacing:.08em}
.st{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:.68rem;font-weight:900;letter-spacing:.08em;white-space:nowrap}
.st-committed{background:#0a222c;color:#fff}.st-complete{background:#efe4f4;color:#50226a}.st-available{background:#d9f2ef;color:#075b59}.st-prepare-only{background:#fff0c9;color:#654800}.st-out{background:#ece9e5;color:#5d5a56}
.board-list{display:grid;gap:6px;margin-top:10px}.board-list>div{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:.86rem;padding:6px 0;border-bottom:1px solid rgba(10,34,44,.07)}
.signal-tag{display:inline-flex;margin-left:6px;padding:3px 7px;border-radius:999px;background:#f0b323;color:#0a222c;font-size:.68rem;font-weight:900;letter-spacing:.06em}
.res-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:10px 0}.res-strip>div{background:#f7f3ee;padding:8px;text-align:center}.res-strip small{display:block;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;opacity:.7}.res-strip b{font-size:1.05rem}
.approve-chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.approve-chips button{border:1px solid rgba(10,34,44,.18);background:#fff;border-radius:999px;padding:7px 11px;font:inherit;font-size:.8rem;font-weight:700;cursor:pointer;color:#0a222c}.approve-chips button.active{background:#49205d;color:#fff;border-color:#49205d}
.dup-note{padding:12px 14px;background:#fff0c9;color:#654800;font-weight:700;margin:10px 0}
.compare-table{width:100%;border-collapse:collapse;background:#fff;margin:20px 0;font-size:.9rem}.compare-table th{background:#0a222c;color:#fff;text-align:left;padding:10px;font-size:.72rem;letter-spacing:.08em}.compare-table td{padding:10px;border-bottom:1px solid rgba(10,34,44,.08);vertical-align:top}.compare-table tr.sel td{background:#f2eaf5}.compare-table tr{cursor:pointer}
.revised-tag{display:inline-flex;margin-left:6px;padding:2px 6px;background:#00a6a6;color:#fff;font-size:.68rem;font-weight:900;letter-spacing:.08em;border-radius:4px}
.signal-hero{background:#0a222c;color:#fff;padding:clamp(24px,4vw,48px);margin:20px 0}.signal-hero h1{color:#fff}.signal-hero p{font-size:clamp(1.05rem,1.8vw,1.35rem);max-width:760px}
.signal-pick{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:20px 0}.signal-pick button{text-align:left;background:#fff;border:2px solid rgba(10,34,44,.12);padding:20px;font:inherit;cursor:pointer;color:#0a222c}.signal-pick button:hover{border-color:#6f2c91}.signal-pick b{display:block;font-size:1.15rem;margin-bottom:6px}
.pboard{display:grid;gap:10px;margin:14px 0}.pboard button{width:100%;text-align:left;background:#fff;border:2px solid rgba(10,34,44,.12);border-radius:10px;padding:12px 14px;font:inherit;color:#0a222c;cursor:pointer}.pboard button.selected{border-color:#6f2c91;background:#f7f1fa}.pboard button:disabled{cursor:default;opacity:.92}
.pboard .row1{display:flex;justify-content:space-between;align-items:center;gap:8px}.pboard b{font-size:1rem}.pboard p{margin:6px 0 0;font-size:.84rem;line-height:1.35}.pboard .limit{color:#762b38;font-weight:700}
.action-row{display:grid;gap:8px;margin-top:12px}
.status-card{padding:16px;background:#f7f3ee;border-left:5px solid #6f2c91;margin:12px 0}.status-card b{display:block;margin-bottom:4px}
.reflect textarea{width:100%;min-height:80px;margin-top:8px}
.challenge-picker{background:#fff;padding:16px 18px;margin:18px 0;border-left:5px solid #f0b323}.challenge-picker p{margin:6px 0}.small-note{font-size:.82rem;opacity:.75}
.dim-list{display:grid;gap:6px;margin-top:10px}.dim{display:grid;grid-template-columns:1fr auto;gap:2px 8px;padding:8px 10px;background:#f7f3ee;border-left:4px solid #c9c3bb}.dim span{font-weight:800;font-size:.88rem}.dim em{font-style:normal;margin-left:6px;font-size:.68rem;font-weight:900;letter-spacing:.08em;color:#6f2c91}.dim b{font-size:.68rem;letter-spacing:.08em;align-self:center}.dim small{grid-column:1/-1;font-size:.78rem;opacity:.8;line-height:1.35}.dim-moved{border-color:#00a6a6}.dim-partly{border-color:#f0b323}.dim-weakened{border-color:#b54a5a;background:#f6eaec}
.turn{padding:10px 12px;background:#f7f3ee;margin:8px 0;border-left:4px solid #6f2c91;font-size:.9rem;line-height:1.4}.turn b{display:block;font-size:.68rem;letter-spacing:.08em;margin-bottom:4px;color:#49205d}
.lock-block{margin:10px 0}.lock-block>b{display:block;font-size:.68rem;letter-spacing:.08em;color:#49205d;margin-bottom:4px}.lock-block p{margin:4px 0;font-size:.88rem;line-height:1.35}
.cause{font-size:.8rem;color:#762b38;line-height:1.35}
.pcard{background:#fff;border:2px solid rgba(10,34,44,.12);border-radius:10px;overflow:hidden}.pcard.selected{border-color:#6f2c91;background:#f7f1fa}.pboard .pcard>button{border:0;border-radius:0;background:transparent;margin:0}
.for-you{font-weight:700;color:#49205d;line-height:1.35}.pcost{opacity:.85}
.pcard details,.phone-details{padding:0 14px 10px;font-size:.84rem;line-height:1.4}.pcard summary,.phone-details summary{cursor:pointer;font-weight:900;font-size:.68rem;letter-spacing:.1em;color:#6f2c91;padding:6px 0}.phone-details{padding:10px 0 0}
.moment{font-size:1.02rem;line-height:1.45;font-style:italic;border-left:4px solid #f0b323;padding:6px 0 6px 12px;margin:10px 0}
.need-line{font-weight:700;color:#0a222c;background:#fff6dd;padding:8px 10px;border-radius:6px}
.role-lines p{margin:6px 0;font-size:.88rem;line-height:1.35}.role-lines b{display:block;font-size:.68rem;letter-spacing:.08em;color:#6f2c91}
.building-q{font-weight:800;font-size:1.05rem;color:#49205d;margin:8px 0 18px}
.room-actions.left{justify-content:flex-start}
.dim-lens{outline:2px solid #6f2c91}
.their-need{margin:8px 0 0;font-size:.82rem}.their-need b{display:block;font-size:.68rem;letter-spacing:.08em;color:#6f2c91}
@media(max-width:800px){.compare-table{display:block;overflow-x:auto}.res-strip{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;


/* ---------------------------------------------------------------------
   SHARED UI
   --------------------------------------------------------------------- */

function Button({ children, secondary = false, onClick, disabled = false, className = '' }) {
  return (
    <button type="button" className={`button ${secondary ? 'secondary' : ''} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">A<span>I</span></div>
      <div>
        <b>AIMedX</b>
        <small>FUTURE-READY HOSPITAL CHALLENGE</small>
      </div>
    </div>
  );
}

function Shell({ children, compact = false }) {
    return (
      <main className={compact ? 'app compact' : 'app'}>
        <style>{`
          ${EXTRA_CSS}
          ${VISUAL_CSS}
            ${OPTION_CSS}
              ${BYD_CSS}
            /* ---- 2.8 RECORDER, FACILITATOR CONTROLS, VISUAL REVEALS ---- */
            .recorder-banner{padding:10px 12px;background:#efe4f4;border-left:5px solid #6f2c91;font-weight:900;margin:10px 0;font-size:.9rem;letter-spacing:.04em}.recorder-banner small{display:block;font-weight:500;letter-spacing:0;opacity:.8;margin-top:2px}
            .pen{margin:10px 0}.pen summary{cursor:pointer;font-weight:900;font-size:.72rem;letter-spacing:.1em;color:#6f2c91;padding:6px 0}
            .fac-ctl{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.fac-ctl button{border:1px solid rgba(10,34,44,.2);background:#fff;border-radius:999px;padding:7px 11px;font:inherit;font-size:.76rem;font-weight:800;cursor:pointer;color:#0a222c}.fac-ctl button.primary{background:#49205d;color:#fff;border-color:#49205d}.fac-ctl button:disabled{opacity:.5}
            .fo-panel{flex-basis:100%;background:#f7f3ee;border-radius:10px;padding:10px 12px;display:grid;gap:8px}.fo-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.fo-row>b{min-width:150px;font-size:.84rem}
            .nudge{display:inline-block;margin-left:8px;background:#f0b323;color:#0a222c;padding:3px 9px;border-radius:99px;font-size:.7rem;font-weight:900;letter-spacing:.08em}
            .decision-status-grid article.late,.hb-status.late{border-color:#f0b323;background:#fff6dd}
            .revised-tag.fac{background:#6f2c91}
            .fut-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));gap:26px;margin:24px 0}
            .fut-card{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 20px 56px rgba(10,34,44,.12)}
            .fut-card>header{min-height:210px;padding:24px 28px;background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}
            .fut-card>header span{font-size:.78rem;font-weight:900;letter-spacing:.14em;opacity:.9}.fut-card>header h2{margin:6px 0 0;color:#fff;font-size:clamp(1.6rem,2.6vw,2.4rem);line-height:1.08}
            .meters{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;padding:20px 18px 6px}
            .mt{text-align:center;min-width:0}
            .mt .ic{display:flex;width:54px;height:54px;border-radius:50%;margin:0 auto 6px;align-items:center;justify-content:center;background:#ece7e1;color:#0a222c}
            .mt .ic svg,.lk-col .ico svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
            .mt b{display:block;font-size:.72rem;letter-spacing:.05em}
            .mt .seg{display:flex;gap:3px;margin:7px 4px 5px;font-style:normal}.mt .seg u{flex:1;height:9px;border-radius:5px;background:#e3ddd6;text-decoration:none}
            .mt small{display:block;font-size:.72rem;font-weight:900;letter-spacing:.08em}
            .mt-moved .ic{background:#d9f2ef}.mt-moved .seg u{background:#00a6a6}.mt-moved small{color:#075b59}
            .mt-partly .ic{background:#fff0c9}.mt-partly .seg u:nth-child(-n+2){background:#f0b323}.mt-partly small{color:#654800}
            .mt-weakened .ic{background:#f6e3e6}.mt-weakened .seg u:first-child{background:#b54a5a}.mt-weakened small{color:#8a2f3e}
            .mt-unchanged .seg u:first-child{background:#c9c3bb}.mt-unchanged small{color:#7a746c}
            .mt.lens .ic{outline:3px solid #6f2c91;outline-offset:2px}
            .chips3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:10px 18px 16px}
            .chips3 .chip{background:#f7f3ee;border-radius:14px;padding:12px 14px;border-top:5px solid #6f2c91}.chips3 .chip span{display:block;font-size:.7rem;font-weight:900;letter-spacing:.12em;color:#6f2c91}.chips3 .chip b{display:block;font-size:1.05rem;line-height:1.2;margin-top:5px}
            .fut-why{padding:0 18px 16px}.fut-why summary{cursor:pointer;font-weight:900;font-size:.74rem;letter-spacing:.12em;color:#6f2c91;padding:6px 0}
            .lk-card{background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 20px 56px rgba(10,34,44,.12);margin:18px 0}
            .lk-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:22px 26px}.lk-head small{font-size:.78rem;font-weight:900;letter-spacing:.16em;color:#6f2c91}.lk-head h2{margin:2px 0 0;font-size:clamp(1.4rem,2.2vw,2rem)}.lk-head>b{font-size:.78rem;letter-spacing:.12em;color:#6f2c91}
            .lk-band{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:18px;padding:0 26px 26px}
            .lk-col h3{display:flex;align-items:center;gap:10px;margin:0 0 12px;font-size:.78rem;letter-spacing:.14em}
            .lk-col .ico{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff}.lk-col .ico svg{width:18px;height:18px}
            .lk-tiles{display:grid;gap:10px}
            .lk-tile{position:relative;margin:0;border-radius:14px;overflow:hidden;height:150px;background:#0a222c}
            .lk-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
            .lk-tile:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(10,34,44,.9))}
            .lk-tile figcaption{position:absolute;left:14px;right:14px;bottom:11px;z-index:2;color:#fff;font-weight:800;font-size:1.05rem;line-height:1.15}
            .lk-tile em{position:absolute;top:10px;left:10px;z-index:2;font-style:normal;font-size:.7rem;font-weight:900;letter-spacing:.1em;background:#fff;color:#0a222c;padding:4px 9px;border-radius:99px}
            .lk-now .ico{background:#00a6a6}.lk-now .lk-tile{height:210px;outline:4px solid #00a6a6;outline-offset:-4px}
            .lk-prot .ico{background:#6f2c91}.lk-prot .lk-tile{outline:3px dashed #6f2c91;outline-offset:-3px}.lk-prot .lk-tile:before{content:'';position:absolute;inset:0;background:rgba(255,255,255,.3);z-index:1}
            .lk-keep .ico{background:#f0b323;color:#0a222c}.lk-keep .lk-tile{height:104px}.lk-keep figcaption{font-size:.95rem}
            .lk-empty{padding:18px;border:2px dashed #d8d2ca;border-radius:12px;font-size:.9rem;opacity:.7;text-align:center;margin:0}.lk-more{margin:0;font-size:.8rem;font-weight:800;color:#6f2c91}
            @media(max-width:800px){.meters{grid-template-columns:1fr;gap:10px}.mt{display:grid;grid-template-columns:44px 1fr auto;grid-template-areas:"ic lab st" "ic seg st";text-align:left;gap:2px 10px;align-items:center}.mt .ic{grid-area:ic;width:40px;height:40px;margin:0}.mt .ic svg{width:20px;height:20px}.mt b{grid-area:lab;font-size:.78rem}.mt .seg{grid-area:seg;margin:0}.mt small{grid-area:st}.chips3{grid-template-columns:1fr}.lk-band{grid-template-columns:1fr;padding:0 14px 18px}.lk-head{padding:16px 14px}.lk-now .lk-tile{height:150px}.lk-tile{height:120px}.lk-keep .lk-tile{height:96px}.fut-card>header{min-height:150px}}

/* ---- 2.6 PHONE READABILITY ---- */
          .app.compact blockquote,.app.compact blockquote *{color:#0a222c}
          .app.compact .resource-goal,.app.compact .discussion-note,.app.compact .continuum-band,.app.compact .signal-hero,.app.compact .hospital-changed,.app.compact .compare-detail,.app.compact .phone-mechanic{background:#35124a!important;color:#fff!important}
          .app.compact .resource-goal *,.app.compact .discussion-note span,.app.compact .continuum-band *,.app.compact .signal-hero *,.app.compact .hospital-changed *,.app.compact .compare-detail *,.app.compact .phone-mechanic *{color:#fff!important}
          .app.compact .discussion-note b,.app.compact .phone-mechanic b{color:#f0b323!important}
          .app.compact .phone-mechanic{padding:12px 14px;border-radius:8px;line-height:1.5}
          /* ---- 2.7 PHONE INPUTS (stops iPhone auto-zoom) + DECISION UI ---- */
            .app.compact input,.app.compact textarea,.app.compact select{font-size:16px!important}
            .confirm-sheet{position:fixed;left:0;right:0;bottom:0;z-index:80;background:#fff;padding:16px 16px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -18px 50px rgba(10,34,44,.28);border-top:5px solid #6f2c91;max-height:72vh;overflow:auto}
            .confirm-sheet b{display:block;font-size:1.05rem;margin-bottom:6px;color:#0a222c}.confirm-sheet p{margin:4px 0;font-size:.9rem;color:#0a222c}
            .opt-pick{display:grid;gap:10px;margin:10px 0 14px}
            .opt-row{background:#f7f3ee;border-left:5px solid #c9c3bb;padding:10px 12px;border-radius:0 10px 10px 0}
            .opt-row.opt-invest{border-color:#00a6a6}.opt-row.opt-start{border-color:#f0b323}.opt-row.opt-prepare{border-color:#49205d}
            .opt-row-head{display:flex;flex-direction:column;gap:2px}.opt-chip{font-size:.72rem;font-weight:900;letter-spacing:.12em}.opt-row-head small{font-size:.85rem;opacity:.8}
            .opt-row details{font-size:.84rem;line-height:1.4}.opt-row summary{cursor:pointer;font-weight:900;font-size:.68rem;letter-spacing:.1em;color:#6f2c91;padding:6px 0}
            .opt-row.opt-out{opacity:.7}.inline-options{margin:-4px 0 6px}
            .tie-flag{display:inline-block;margin-top:6px;padding:4px 8px;background:#f0b323;color:#0a222c;font-size:.7rem;letter-spacing:.1em;border-radius:6px}
            .thumb-row button.tied{outline:2px dashed #f0b323;outline-offset:-2px;opacity:1}
            /* ---- 2.6 FACILITATOR SETTINGS ---- */
          .fac-settings{margin:18px 0;max-width:620px}
          .fac-settings-toggle{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:#fff;border:1px dashed rgba(10,34,44,.25);border-radius:10px;padding:10px 14px;font:inherit;color:#0a222c;cursor:pointer}
          .fac-settings-toggle span{font-size:.68rem;font-weight:900;letter-spacing:.12em;color:#6f2c91}.fac-settings-toggle b{flex:1;font-size:.9rem}.fac-settings-toggle em{font-style:normal;font-size:.8rem;opacity:.6}
          .fac-settings-panel{background:#fff;border:1px solid rgba(10,34,44,.12);border-top:0;border-radius:0 0 10px 10px;padding:12px 14px}
          /* ---- 2.6 CHALLENGE ---- */
          .challenge-beat{position:relative;min-height:62vh;border-radius:20px;overflow:hidden;margin:20px 0;background-image:linear-gradient(90deg,rgba(10,34,44,.95) 0%,rgba(10,34,44,.7) 45%,rgba(10,34,44,.15) 100%),var(--ci);background-size:cover;background-position:center;display:flex;align-items:flex-end}
          .challenge-copy{padding:clamp(28px,5vw,64px);max-width:760px;color:#fff}.challenge-copy .eyebrow{color:#f0b323}.challenge-copy h1{color:#fff;font-size:clamp(2.2rem,5vw,4.2rem);margin:10px 0}.challenge-copy p{font-size:clamp(1.05rem,1.8vw,1.35rem)}
          .challenge-ask{margin-top:22px;font-size:clamp(1.3rem,2.4vw,2rem);font-weight:900;color:#f0b323}.challenge-ask small{display:block;margin-top:6px;font-size:.95rem;font-weight:600;color:#fff;opacity:.85}
          .signal-hero.has-img{background-image:linear-gradient(90deg,rgba(10,34,44,.95),rgba(10,34,44,.6)),var(--ci);background-size:cover;background-position:center;border-radius:20px}
          /* ---- 2.6 APPROVAL ---- */
          .approve-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:22px;margin:24px 0}
          .approve-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(10,34,44,.1)}
          .approve-hero{min-height:240px;padding:22px;background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}
          .approve-hero span{font-size:.7rem;font-weight:900;letter-spacing:.12em;opacity:.9}.approve-hero h2{color:#fff;margin:6px 0;font-size:clamp(1.6rem,2.6vw,2.2rem)}.approve-hero em{font-style:normal;font-size:.85rem;font-weight:800;color:#f0b323}
          .approve-body{padding:12px 16px 16px}
          .thumb-row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin-top:8px}
          .thumb-row button{border:2px solid transparent;border-radius:8px;padding:0;background:none;cursor:pointer;overflow:hidden;opacity:.6;text-align:left;font:inherit}
          .thumb-row button.active{border-color:#6f2c91;opacity:1}.thumb-row img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.thumb-row span{display:block;font-size:.68rem;line-height:1.15;padding:3px 2px;color:#0a222c}
          /* ---- 2.6 THREE WAYS ---- */
          .three-ways{background:#fff;border-radius:16px;padding:18px;margin:22px 0;box-shadow:0 14px 40px rgba(10,34,44,.08)}
          .three-ways header h3{margin:2px 0 12px;font-size:1.35rem}
          .tw-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
          .tw{margin:0;border-radius:12px;overflow:hidden;background:#f7f3ee}.tw figcaption{padding:10px 12px 12px}.tw figcaption b{display:block;font-size:1rem;margin-bottom:2px}
          .tw-line{margin:14px 0 0;font-size:1.05rem;font-weight:700;color:#49205d}
          /* ---- 2.6 DESIGN ---- */
          .vote-bars{display:grid;gap:10px;margin:18px 0 26px;max-width:760px}
          .vote-bars>div{display:grid;grid-template-columns:minmax(160px,280px) 1fr 40px;align-items:center;gap:12px}
          .vote-bars span{font-weight:800}.vote-bars i{height:16px;background:#ece7e1;border-radius:99px;overflow:hidden}.vote-bars em{display:block;height:100%;background:linear-gradient(90deg,#00a6a6,#49205d);border-radius:99px;transition:width .6s}.vote-bars b{font-size:1.2rem;text-align:right}
          .design-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:22px;margin:20px 0}
          .design-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(10,34,44,.1)}
          .design-img{position:relative;aspect-ratio:16/9;background:#f4f1ec}.design-img img{width:100%;height:100%;object-fit:cover;display:block}
          .design-img>span{position:absolute;left:0;right:0;bottom:0;padding:26px 16px 12px;background:linear-gradient(180deg,transparent,rgba(10,34,44,.85));color:#fff}.design-img .tlabel{color:#fff;opacity:.85}.design-img b{display:block;font-size:1.3rem}
          .design-pair{display:grid;grid-template-columns:1fr 1fr}.design-pair>div{padding:14px 16px;font-size:.95rem;line-height:1.4}.design-pair b{display:block;font-size:.7rem;letter-spacing:.12em;margin-bottom:6px}
          .design-pair .early{background:#efe4f4}.design-pair .early b{color:#49205d}.design-pair .open{background:#d9f2ef}.design-pair .open b{color:#075b59}
          /* ---- 2.6 IMAGE-FIRST PHONE CARDS ---- */
          .img-cards{display:grid;gap:12px;margin:14px 0}
          .img-card{background:#fff;border:2px solid rgba(10,34,44,.1);border-radius:14px;overflow:hidden}.img-card.selected{border-color:#6f2c91;box-shadow:0 8px 22px rgba(73,32,93,.18)}
          .img-card>button{display:block;width:100%;text-align:left;background:none;border:0;padding:0;font:inherit;color:#0a222c;cursor:pointer}
          .img-card-hero{position:relative;height:130px;background-size:cover;background-position:center;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;gap:6px;padding:12px 14px;color:#fff}
          .img-card-hero b{font-size:1.15rem;color:#fff}.img-card-hero .picked{display:inline-flex;align-items:center;gap:4px;font-size:.68rem;font-weight:900;letter-spacing:.1em;background:#6f2c91;padding:3px 8px;border-radius:99px}
          .img-card-hero .corner{position:absolute;top:10px;right:10px;margin:0}
          .img-card .for-you{margin:10px 14px 0;font-size:.92rem}
          .img-card .limit{margin:6px 14px 0;font-size:.84rem}
          .mini-dials{padding:0 10px}.mini-dials .dials{margin:8px 0 10px}.mini-dials .dial svg{max-width:46px}.mini-dials .dial b{font-size:.85rem;top:calc(min(23px, 50% - 12px))}.mini-dials .dial>span{font-size:.62rem}.mini-dials .dial small{font-size:.66rem}
          .img-card details{padding:0 14px 10px;font-size:.86rem;line-height:1.4;border-top:1px solid rgba(10,34,44,.07)}.img-card summary{cursor:pointer;font-weight:900;font-size:.68rem;letter-spacing:.1em;color:#6f2c91;padding:8px 0}
          .st-card-out .img-card-hero{filter:grayscale(1);opacity:.6}.st-card-prepare-only .img-card-hero{filter:grayscale(.6)}
          @media(max-width:900px){.tw-grid,.design-pair{grid-template-columns:1fr}.thumb-row{grid-template-columns:repeat(3,minmax(0,1fr))}.vote-bars>div{grid-template-columns:1fr 1fr 32px}}
          .burden{margin:6px 0 0;font-size:.84rem;line-height:1.35;color:#654800;background:#fff6dd;padding:7px 9px;border-radius:6px}.burden b{display:block;font-size:.68rem;letter-spacing:.1em;margin-bottom:2px}
          .hb-status{padding:10px 12px;border-radius:10px;background:#f7f3ee;margin:0 0 6px;border-left:4px solid #c9c3bb}.hb-status.done{border-color:#00a6a6}.hb-status b{display:block;font-size:.9rem;letter-spacing:.06em}.hb-status span{display:block;font-size:.85rem}
          .sync-pill{position:fixed;right:14px;bottom:14px;z-index:60;font-size:.68rem;font-weight:900;letter-spacing:.1em;padding:7px 11px;border-radius:999px;background:#b54a5a;color:#fff;box-shadow:0 6px 18px rgba(10,34,44,.2)}.sync-pill.live{background:#0a222c}
          .film-move{position:absolute;inset:0;animation:kenburns var(--fd,7.5s) ease-out forwards}.film-move img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:none}
          .film-frame.has-reveal{--fd:10.5s}
          .film-behind{position:absolute;inset:0;clip-path:inset(0 0 0 100%);animation:wipe 10s ease-in-out forwards;z-index:1}
          .film-cut{position:absolute;top:0;bottom:0;width:4px;margin-left:-2px;background:#f0b323;box-shadow:0 0 22px 6px rgba(240,179,35,.45);z-index:2;left:100%;opacity:0;animation:cutmove 10s ease-in-out forwards,cutfade 10s linear forwards}
          .film-frame.has-reveal .film-copy.first{animation:copyout 10s ease forwards}
          .film-copy.second{opacity:0;animation:copyin 10s ease forwards}
          .film-final{margin-top:14px;font-weight:800;color:#f0b323}
          .film-progress i.run:after{animation-duration:var(--d,7s)}
          @keyframes wipe{0%,35%{clip-path:inset(0 0 0 100%)}60%,100%{clip-path:inset(0 0 0 0)}}
          @keyframes cutmove{0%,35%{left:100%}60%,100%{left:0}}
          @keyframes cutfade{0%,34%{opacity:0}36%,59%{opacity:1}63%,100%{opacity:0}}
          @keyframes copyout{0%,30%{opacity:1}36%,100%{opacity:0}}
          @keyframes copyin{0%,60%{opacity:0}68%,100%{opacity:1}}
          @media (prefers-reduced-motion:reduce){.film-move,.film-behind,.film-cut,.film-copy{animation:none}.film-behind{clip-path:none;display:none}}
          .cap-moment{font-size:.9rem;line-height:1.4;font-style:italic;opacity:.85;margin:8px 0 0}
          /* ---- LAYOUT GUARDS (display only) ---- */
          html,body{max-width:100%;overflow-x:hidden}#root{max-width:100%;overflow-x:clip}*,*:before,*:after{box-sizing:border-box}.app{max-width:100%;overflow-x:clip}.app img{max-width:100%}.room-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:12px;max-width:100%}.room-actions .button{max-width:100%;white-space:normal;text-align:center}.journey-nav{padding-left:clamp(12px,3vw,48px)!important;padding-right:clamp(12px,3vw,48px)!important;max-width:100%}.app h1{overflow-wrap:break-word}
          /* ---- 1.6.3 PHONE FIT (display only) ---- */
          .app.compact{width:100%;max-width:560px;margin:0 auto;min-width:0;padding-left:16px;padding-right:16px;padding-bottom:calc(24px + env(safe-area-inset-bottom))}
          .app.compact>header{gap:8px;min-width:0}.app.compact .build{font-size:.68rem;white-space:nowrap}
          .app.compact .phone-card{width:100%;min-width:0;padding:20px 16px;overflow:hidden}
          .app.compact .phone-card *{min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:normal}
          .app.compact .eyebrow{font-size:.68rem;letter-spacing:.1em;line-height:1.4;white-space:normal}
          .app.compact h1{font-size:clamp(1.55rem,7vw,2.3rem)!important;line-height:1.08!important;margin:10px 0 12px!important;letter-spacing:-.01em}
          .app.compact h2{font-size:clamp(1.2rem,5.5vw,1.6rem)!important;line-height:1.15}
          .app.compact h3{font-size:.78rem;letter-spacing:.08em;margin:18px 0 6px}
          .app.compact p,.app.compact li,.app.compact blockquote{font-size:.95rem;line-height:1.45}
          .app.compact blockquote{margin:16px 0 0;padding:14px 16px;border-left:4px solid #f0b323;background:#f7f3ee}
          .app.compact .phone-hospital-image,.app.compact .vc-phone img{width:100%!important;height:auto!important;max-height:190px;aspect-ratio:16/9;object-fit:cover;display:block;margin:10px 0 14px}
          .app.compact .brief-question{padding:14px;margin-top:14px}
          .app.compact .phone-resources{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px;margin:14px 0}
          .app.compact .phone-resources>div{display:flex;flex-direction:column;gap:4px;padding:12px;background:#fff;border:1px solid rgba(10,34,44,.1)}
          .app.compact .phone-resources span{font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;opacity:.75}
          .app.compact .phone-resources b{font-size:1.1rem;white-space:nowrap}
          .app.compact .share-priorities{display:grid!important;grid-template-columns:1fr!important;gap:8px;margin:14px 0}
          .app.compact .share-priorities>span{display:block;padding:12px 14px;background:#fff;border:1px solid rgba(10,34,44,.1);font-size:.92rem;line-height:1.4}
          .app.compact .phone-choice-stack,.app.compact .phone-vote-grid{display:grid!important;grid-template-columns:1fr!important;gap:10px}
          .app.compact .phone-choice-stack button,.app.compact .phone-vote-grid button{width:100%;padding:14px 16px;text-align:left;white-space:normal}
          .app.compact .phone-choice-stack button b{display:block;font-size:1.05rem}.app.compact .phone-choice-stack button span{display:block;font-size:.88rem;margin-top:4px}
          .app.compact .phone-cap-grid button{width:100%;min-width:0}.app.compact .phone-cap-grid img{max-width:96px;height:auto;object-fit:cover}
          .app.compact .phone-scale-row{display:flex!important;align-items:center;gap:12px}.app.compact .phone-scale-thumb{width:64px!important;height:48px!important;flex:0 0 64px}
          .app.compact .submission-confirm,.app.compact .submitted-mark{display:flex;align-items:center;justify-content:center;gap:6px;text-align:center;font-size:.85rem;line-height:1.35;padding:12px;margin-top:14px}
          .app.compact .button{width:100%;justify-content:center;white-space:normal}
          .app.compact .alignment-badge,.app.compact .decision-tag{white-space:nowrap}
          .app.compact .toast{left:12px!important;right:12px!important;max-width:calc(100% - 24px)}
          @media(max-width:900px){.room-actions{justify-content:stretch}.room-actions .button{width:100%}}
          @media(max-width:560px){.journey-nav{gap:6px!important;padding-top:6px!important;padding-bottom:6px!important}.journey-nav button{padding:8px 10px!important;font-size:.82rem}.journey-nav .live-pill{font-size:.72rem}.player-review-note{font-size:.72rem;padding:8px 10px}.journey-panel{padding:16px}}
          .resource-actions{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px!important;align-items:stretch}.resource-actions>div{display:flex!important;flex-direction:column;gap:6px;padding:18px;min-width:0}.resource-actions b{display:block;white-space:normal;line-height:1}.resource-actions span{display:block;line-height:1.35;overflow-wrap:anywhere}
          .journey-nav{position:sticky;top:0;z-index:50;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;background:color-mix(in srgb,#f5f2ed 94%,transparent);backdrop-filter:blur(10px)}.journey-nav button{border:1px solid rgba(10,34,44,.18);background:#fff;color:#0a222c;border-radius:999px;padding:10px 14px;display:flex;align-items:center;gap:8px;font:inherit;font-weight:800;cursor:pointer}.journey-nav button:disabled{opacity:.35;cursor:not-allowed}.journey-nav .live-pill{color:#fff;background:#49205d;border-color:#49205d}
          .journey-scrim{position:fixed;inset:0;z-index:100;background:rgba(4,18,25,.56);display:flex;justify-content:flex-end}.journey-panel{width:min(440px,100%);height:100%;overflow:auto;background:#f7f4ef;padding:22px;box-shadow:-20px 0 60px rgba(0,0,0,.22)}.journey-panel header{display:flex;align-items:flex-start;justify-content:space-between}.journey-panel h2{margin:4px 0 6px}.journey-panel p{margin:0 0 20px}.journey-panel ol{list-style:none;margin:0;padding:0;display:grid;gap:8px}.journey-panel li button{width:100%;text-align:left;border:1px solid rgba(10,34,44,.13);background:#fff;padding:12px 14px;border-radius:12px;display:grid;grid-template-columns:34px 1fr;gap:10px;color:#0a222c;cursor:pointer}.journey-panel li button.current{color:#fff;background:#49205d}.journey-panel li button:disabled{opacity:.38;cursor:not-allowed}.journey-panel small{display:block;opacity:.7}.journey-close{border:0;background:transparent;cursor:pointer;padding:8px}
          .pullback-hero{padding:4vh 0}.pullback-hero h1{max-width:900px}.pullback-intro{font-size:clamp(1.05rem,1.7vw,1.4rem);max-width:900px}.scale-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:34px 0}.scale-card{padding:24px;background:#fff;border-top:7px solid #f0b323;box-shadow:0 12px 34px rgba(17,32,40,.09)}.scale-card:nth-child(2){border-color:#00a6a6}.scale-card:nth-child(3){border-color:#49205d}.scale-card>span{font-weight:900;opacity:.5}.scale-card h2{margin:20px 0 4px}.scale-card h3{margin:0 0 16px;font-size:1rem}.scale-card p{margin:0}.continuum-band{margin:30px 0;padding:28px;background:#49205d;color:#fff}.continuum-track{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;margin-top:20px}.continuum-step{padding:18px 14px;background:rgba(255,255,255,.1);position:relative}.continuum-step:not(:last-child):after{content:'→';position:absolute;right:-9px;top:50%;z-index:2;font-weight:900}.continuum-step b,.continuum-step span{display:block}.continuum-step span{font-size:.85rem;margin-top:7px;opacity:.82}.system-equation{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px;margin:24px 0}.system-equation>div{padding:24px;background:#fff}.system-equation strong{font-size:2rem;color:#f0b323}.ripple-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:28px 0}.ripple-card{padding:20px;background:#fff;border-left:5px solid #00a6a6}.ripple-card b{display:block;margin-bottom:10px}.ripple-table{margin:20px 0 36px;padding:22px;background:#eee8e1}.ripple-table h3{margin:0 0 4px}.player-review-note{padding:10px 14px;background:#f0b323;color:#0a222c;text-align:center;font-weight:800}

          .vote-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:32px 0}.vote-card{border:2px solid rgba(10,34,44,.14);background:#fff;padding:24px;text-align:left;color:#0a222c;cursor:pointer;min-height:150px}.vote-card:hover,.vote-card.selected{border-color:#6f2c91;box-shadow:0 12px 30px rgba(73,32,93,.14)}.vote-card b,.vote-card span{display:block}.vote-card b{font-size:1.35rem}.vote-card span{margin-top:10px}.live-votes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:24px 0}.live-votes>div{background:#fff;padding:18px;border-bottom:6px solid #6f2c91}.live-votes strong{display:block;font-size:2rem}.reveal-stack{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin:28px 0}.reveal-stack article{background:#fff;padding:0 0 24px;border-top:7px solid #f0b323;overflow:hidden}.reveal-stack article>span,.reveal-stack article>h2,.reveal-stack article>h3,.reveal-stack article>p{margin-left:24px;margin-right:24px}.scale-thumb{width:100%;height:150px;object-fit:cover;display:block;margin:0 0 18px!important}.phone-scale-thumb{width:72px;height:54px;object-fit:cover;border-radius:8px;flex:0 0 auto}.phone-scale-row{display:flex!important;align-items:center;gap:12px}.phone-scale-row>span{display:block}.reveal-stack article:nth-child(2){border-color:#00a6a6}.reveal-stack article:nth-child(3){border-color:#49205d}.reveal-stack h2{margin:10px 0 4px}.aha-line{font-size:clamp(1.35rem,2.3vw,2.2rem);font-weight:900;line-height:1.15;padding:24px;border-left:8px solid #f0b323;background:#fff;margin:28px 0}.continuum-vote{grid-template-columns:repeat(5,minmax(0,1fr))}.hospital-changed{background:#092d3a;color:#fff;padding:clamp(24px,4vw,52px);margin:24px 0}.hospital-changed h2{color:#fff}.consequence-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:22px}.consequence-grid article{background:rgba(255,255,255,.1);padding:18px}.consequence-grid b{display:block;color:#f0b323;margin-bottom:8px}.phone-vote-grid{display:grid;gap:10px;margin:20px 0}.phone-vote-grid button{width:100%;padding:16px;text-align:left;border:2px solid rgba(10,34,44,.15);background:#fff;color:#0a222c;border-radius:10px;font:inherit}.phone-vote-grid button.selected{border-color:#6f2c91;background:#f2eaf5}.phone-vote-grid b,.phone-vote-grid span{display:block}.phone-vote-grid span{font-size:.88rem;margin-top:4px}.submitted-mark{padding:12px;background:#dff3ea;color:#174d3c;font-weight:800;text-align:center}

          .alignment-badge{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;font-size:.72rem;font-weight:900;letter-spacing:.08em}.alignment-strong{background:#dff3ea;color:#174d3c}.alignment-mixed{background:#fff0c9;color:#654800}.alignment-split{background:#f3e6e8;color:#762b38}.visual-table-grid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))!important}.visual-table-card img{height:150px!important}.multi-table-compact{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin:24px 0}.multi-table-compact>article{background:#fff;border:1px solid rgba(10,34,44,.12);overflow:hidden;display:grid;grid-template-columns:112px 1fr;min-height:112px}.multi-table-compact img{width:112px;height:100%;object-fit:cover}.multi-table-compact .compact-body{padding:14px;min-width:0}.multi-table-compact h3{margin:4px 0 8px;font-size:1rem}.multi-table-compact p{margin:5px 0;font-size:.88rem}.decision-tag{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:.7rem;font-weight:900;letter-spacing:.08em}.decision-invest{background:#d9f2ef;color:#075b59}.decision-adapt{background:#efe4f4;color:#50226a}.decision-preserve{background:#fff0c9;color:#654800}.analysis-controls{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.analysis-controls button{border:1px solid rgba(10,34,44,.16);background:#fff;color:#0a222c;border-radius:999px;padding:9px 14px;font:inherit;font-weight:800;cursor:pointer}.analysis-controls button.active{background:#49205d;color:#fff}.analysis-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.analysis-group{background:#fff;padding:16px;border-top:5px solid #00a6a6}.analysis-group h3{margin:0 0 10px}.mini-bars{display:grid;gap:7px}.mini-bars div{display:grid;grid-template-columns:1fr auto;gap:8px;font-size:.86rem}.final-compare{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin:24px 0}.compare-card{background:#fff;border:2px solid transparent;padding:0;overflow:hidden;text-align:left;color:#0a222c;cursor:pointer;font:inherit}.compare-card.selected{border-color:#6f2c91;box-shadow:0 14px 34px rgba(73,32,93,.18)}.compare-card img{width:100%;height:130px;object-fit:cover}.compare-card-body{padding:16px}.compare-card h3{margin:5px 0}.compare-card p{font-size:.9rem}.compare-detail{background:#092d3a;color:#fff;padding:clamp(22px,4vw,46px);margin-top:20px}.compare-detail h2{color:#fff}.compare-detail .consequence-grid article{background:rgba(255,255,255,.1)}
          @media(max-width:800px){.resource-actions,.scale-grid,.ripple-grid,.vote-grid,.live-votes,.reveal-stack,.continuum-vote,.consequence-grid,.final-compare{grid-template-columns:1fr!important}.multi-table-compact>article{grid-template-columns:88px 1fr}.multi-table-compact img{width:88px}.continuum-track{grid-template-columns:1fr}.continuum-step:not(:last-child):after{content:'↓';right:18px;top:auto;bottom:-12px}.system-equation{grid-template-columns:1fr}.system-equation strong{text-align:center}.journey-nav{padding:8px 0}.journey-nav button{padding:9px 11px}.journey-nav .nav-label{display:none}}
        `}</style>
        <header>
          <Brand />
          <span className="build">{BUILD_LABEL}</span>
        </header>
        {children}
        <footer>Stantec Healthcare · Strategy before technology</footer>
      </main>
    );
  }
  function JourneyPanel({ phase, maxPhase, onGo, onClose, participant = false }) {
    const maxIndex = Math.max(0, phaseIndex(maxPhase));
    return (
      <div className="journey-scrim" role="presentation" onClick={onClose}>
        <aside className="journey-panel" role="dialog" aria-modal="true" aria-label="Journey navigation" onClick={(e) => e.stopPropagation()}>
          <header><div><div className="eyebrow">YOUR JOURNEY</div><h2>Return to any completed screen.</h2><p>{participant ? 'Reviewing does not move the room or change saved decisions.' : 'Returning does not erase decisions. Changing a response updates the live result.'}</p></div><button className="journey-close" type="button" onClick={onClose} aria-label="Close"><X /></button></header>
          <ol>{JOURNEY.map(([id,label],i)=><li key={id}><button type="button" className={id===phase?'current':''} disabled={i>maxIndex} onClick={()=>onGo(id)}><b>{String(i+1).padStart(2,'0')}</b><span>{label}<small>{id===phase?'CURRENT SCREEN':i<=maxIndex?'AVAILABLE':'NOT REACHED'}</small></span></button></li>)}</ol>
        </aside>
      </div>
    );
  }
  function JourneyNav({ phase, maxPhase = phase, onGo, participant = false, livePhase }) {
    const [open,setOpen]=useState(false); const back=priorPhase(phase);
    return <><nav className="journey-nav"><button type="button" disabled={!back} onClick={()=>back&&onGo(back)}><ArrowLeft size={17}/><span className="nav-label">Back</span></button><button type="button" onClick={()=>setOpen(true)}><Layers3 size={17}/><span>Journey</span><ChevronDown size={15}/></button>{participant&&phase!==livePhase?<button type="button" className="live-pill" onClick={()=>onGo(livePhase)}><RotateCcw size={16}/>Return live</button>:<span/>}</nav>{participant&&phase!==livePhase&&<div className="player-review-note">REVIEWING AN EARLIER SCREEN · VIEW ONLY · THE ROOM IS CURRENTLY ON {JOURNEY.find(x=>x[0]===livePhase)?.[1]?.toUpperCase()||'ANOTHER STEP'}</div>}{open&&<JourneyPanel phase={phase} maxPhase={maxPhase} onGo={(id)=>{onGo(id);setOpen(false)}} onClose={()=>setOpen(false)} participant={participant}/>}</>;
  }

function PhoneState({ kicker, title, text }) {
  return (
    <Shell compact>
      <section className="phone-card centered">
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="pulse"><span /></div>
      </section>
    </Shell>
  );
}

function FitChip({ level }) {
  return <span className={`fit-chip ${fitClass(level)}`}>{level} fit</span>;
}

function ProgressGrid({ participants, responses, type, capabilityId, doneLabel, partialLabel }) {
  const rows = responsesOfType(responses, type, capabilityId);
  return (
    <div className="progress-grid">
      {activeTables(participants).map((t) => {
        const members = membersOf(participants, t);
        const done = members.filter((p) => rows.some((r) => r.participant_id === p.id && r.choice)).length;
        return (
          <article key={t}>
            <span>TABLE {t}</span>
            <b>{done} of {members.length}</b>
            <small>{done === members.length ? doneLabel : partialLabel}</small>
            <div><i style={{ width: `${members.length ? (done / members.length) * 100 : 0}%` }} /></div>
          </article>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------
   STEP 1 · LANDING + FACILITATOR SETUP
   --------------------------------------------------------------------- */

function Landing({ onFacilitated }) {
  return (
    <Shell>
      <section className="design-landing">
        <div className="landing-copy">
          <div className="eyebrow">HEALTHCARE FUTURES · BY DESIGN · BY STANTEC</div>
          <h1>Design for<br /><em>what comes next.</em></h1>
          <p>One patient. One care team. Strength, Function and Beauty decide what the technology does for them.</p>
          <div className="landing-actions">
            <a className="choice-tile" href={SINGLE_PLAYER_URL}>
              <span>01 · EXPLORE</span>
              <b>On your own</b>
              <small>Stand-alone edition · a separate game</small>
              <ArrowRight />
            </a>
            <button className="choice-tile primary" type="button" onClick={onFacilitated}>
              <span>02 · COLLABORATE</span>
              <b>As a table</b>
              <small>Facilitated · Team Arthur</small>
              <ArrowRight />
            </button>
          </div>
        </div>
        <div className="landing-mosaic">
          {Object.values(HOSPITALS).map((h, i) => (
            <figure key={h.id}>
              <img src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
              <figcaption><span>{String(i + 1).padStart(2, '0')}</span>{h.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function FacilitatorStart({ onCreate, onBack }) {
  return (
    <Shell>
      <section className="fac-start">
        <div className="fac-visual">
          <img src={HOSPITALS.greenfield.image} alt="" />
          <div className="visual-tag">FACILITATED TABLE EXPERIENCE</div>
        </div>
        <div className="fac-copy">
          <button className="text-link" type="button" onClick={onBack}><ArrowLeft size={16} /> Back</button>
          <div className="eyebrow">COLLABORATE · BUILD A SHARED FUTURE</div>
          <h1>Create the room.</h1>
          <p>Generate a session code and QR. Each participant brings a perspective, joins a table and inherits a healthcare reality.</p>
          <Button onClick={onCreate}>CREATE SESSION <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function Lobby({ session, participants, onAdvance, responses = [], facSave }) {
  const groups = useMemo(
    () =>
      TABLE_NUMBERS.map((n) => ({ n, h: hospitalForTable(n), count: membersOf(participants, n).length })).filter((g) => g.count > 0),
    [participants]
  );
  return (
    <Shell>
      <section className="room-head">
        <div>
          <div className="eyebrow">JOIN THE EXPERIENCE</div>
          <h1>{session.code}</h1>
          <p>Scan · Initials · Perspective · Table</p>
        </div>
        <div className="qr"><QRCodeSVG value={getJoinUrl(session.code)} size={176} /></div>
      </section>
      <div className="participant-total">
        <Users /> <b>{participants.length}</b> participant{participants.length === 1 ? '' : 's'} joined
      </div>
      {groups.length === 0 ? (
        <section className="waiting-tables">
          <span>WAITING FOR TEAMS</span>
          <h2>Table cards appear as teams join.</h2>
          <p>Keep the QR and session code on screen while participants choose their table.</p>
        </section>
      ) : (
        <section className={`table-grid active-${groups.length}`}>
          {groups.map((g) => (
            <article className="visual-table-card" key={g.n}>
              <img src={g.h.image} alt={g.h.name} onError={(e)=>imageFallback(e)} />
              <div className="visual-card-copy">
                <span>TABLE {g.n}</span>
                <h3>{g.h.name}</h3>
                <b>{g.count} joined</b>
              </div>
            </article>
          ))}
        </section>
      )}
      <div className="room-actions">
        <Button onClick={() => onAdvance('arthur_intro')} disabled={!participants.length}>
          REVEAL YOUR HOSPITALS <ArrowRight size={18} />
        </Button>
      </div>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 2 · HOSPITAL REVEAL + RESOURCES (facilitator)
   --------------------------------------------------------------------- */

function AssignmentRoom({ participants, onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="stage-title">
        <div className="eyebrow">CONTEXT BEFORE TECHNOLOGY</div>
        <h1>Every table is Team Arthur,<br />in a different hospital.</h1>
        <p>The same patient. Different missions, assets and constraints.</p>
      </section>
      <section className={`assignment-grid active-${active.length}`}>
        {active.map((n) => {
          const h = hospitalForTable(n);
          return (
            <article className="reveal-card" key={n}>
              <img src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
              <div><span>TEAM ARTHUR · TABLE {n}</span><h2>{h.name}</h2><p>{NEED_LINE[h.id]}</p></div>
            </article>
          );
        })}
      </section>
      <div className="room-actions">
        <Button onClick={() => onAdvance('context')}>REVEAL THE CHALLENGE <ArrowRight size={18} /></Button>
      </div>
    </Shell>
  );
}

function ContextRoom({ participants, onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="stage-title slim">
        <div className="eyebrow">YOUR HOSPITALS</div>
        <h1>Mission meets inherited reality.</h1>
        <p>Every table begins from a different strategic position.</p>
      </section>
      <section className={`context-columns active-${active.length}`}>
        {active.map((n) => {
          const h = hospitalForTable(n);
          return (
            <article key={n}>
              <img src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
              <span>TABLE {n}</span>
              <h2>{h.name}</h2>
              <p>{h.tagline}</p>
              <div><b>STRENGTH</b>{h.strength}</div>
              <div><b>CONSTRAINT</b>{h.constraint}</div>
              <div><b>CONDITION</b>{h.condition}</div>
              <div className="base-block"><b>FOR ARTHUR HERE</b><BaselineList hid={h.id} compact /></div>
            </article>
          );
        })}
      </section>
        <div className="aha-line">Your ambition exceeds what you can change all at once. Every phone shows this table’s version of that tension.</div>
        <div className="room-actions">
          <Button onClick={() => onAdvance('resources')}>UNDERSTAND YOUR STARTING POSITION <ArrowRight size={18} /></Button>
        </div>
    </Shell>
  );
}

function TensionRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage tension-stage">
        <div className="eyebrow">WATCH THIS TENSION</div>
        <h1>Your ambition exceeds what<br />you can change all at once.</h1>
        <p>Every table has a distinct version of this tension on the phone.</p>
        <Button onClick={() => onAdvance('resources')}>UNDERSTAND YOUR STARTING POSITION <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function ResourcesRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="fac-resource-screen">
        <div className="resource-hero">
          <div>
            <div className="eyebrow">YOUR CAPACITY TO CHANGE</div>
            <h1>You cannot<br /><em>do everything.</em></h1>
          </div>
          <p>Every table begins with four finite resources. Every future capability will draw on them differently.</p>
        </div>
        <section className="resource-explainer room-resource-explainer">
          {Object.keys(RESOURCE_LABELS).map((k, i) => (
            <div key={k}>
              <span>0{i + 1}</span>
              <b>{RESOURCE_LABELS[k].toUpperCase()}</b>
              <p>{RESOURCE_MEANING[k]}</p>
            </div>
          ))}
        </section>
        <section className="resource-how">
          <div className="resource-how-title">
            <span>WHAT YOUR DECISIONS WILL DO</span>
            <h2>Look at your phone.</h2>
            <p>Your phone shows your table's starting capacity. Where is your system strong? Where are you constrained?</p>
          </div>
          <div className="resource-actions">
            <div><b>INVEST</b><span>Commit the full scope. Deliver now.</span></div>
            <div><b>START</b><span>Run a pilot. Learn before you scale.</span></div>
            <div><b>PREPARE</b><span>Build the conditions. Switch on later.</span></div>
          </div>
        </section>
          <blockquote className="resource-goal">
            The goal isn't to spend everything. The goal is to make the right investments without exhausting your ability to adapt.
          </blockquote>
          <div className="discussion-note"><b>60 SEC · AT YOUR TABLE</b><span>What is the one thing your team cannot afford to get wrong?</span></div>
        <div className="room-actions resource-screen-actions">
          <Button onClick={() => onAdvance('brief_reveal')}>REVEAL STRATEGIC BRIEFS <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function Countdown({ seconds }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setRemaining((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return <div className="timer">{remaining}</div>;
}

function DiscussionRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage discussion">
        <div className="eyebrow">BEFORE YOU INVEST</div>
        <h1>What is the one thing your team<br />cannot afford to get wrong?</h1>
        <Countdown seconds={60} />
        <p>DISCUSS AT YOUR TABLE · SECONDS</p>
        <Button onClick={() => onAdvance('brief_reveal')}>REVEAL STRATEGIC BRIEFS <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 3 · STRATEGIC BRIEF (facilitator)
   --------------------------------------------------------------------- */

function BriefRevealRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="brief-room">
        <div className="brief-room-copy">
          <div className="eyebrow">ONE SYSTEM · DIFFERENT RESPONSIBILITIES</div>
          <h1>You won't all see the challenge <em>the same way.</em></h1>
          <p className="one-line">Your phone shows the one question your role has to answer.</p>
          <Button onClick={() => onAdvance('promise')}>CHOOSE THE CARE PROMISE <ArrowRight size={18} /></Button>
        </div>
        <RoleOrbit />
      </section>
    </Shell>
  );
}

function BriefReadRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage brief-timer">
        <div className="eyebrow">READ YOUR BRIEF PRIVATELY</div>
        <h1>Where do you expect<br /><em>tension to emerge?</em></h1>
        <Countdown seconds={30} />
        <p>SECONDS · YOUR PHONE CONTAINS YOUR PRIVATE DECISION LENS</p>
        <Button onClick={() => onAdvance('promise')}>CHOOSE THE CARE PROMISE <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function PerspectiveCards({ participants, responses, large = false }) {
  const perspectives = responsesOfType(responses, 'perspective');
  return (
    <div className={`captured-perspectives ${large ? 'large' : ''}`}>
      {participants.map((p) => {
        const brief = briefFor(p.persona);
        const r = myResponse(perspectives, p.id, 'perspective');
        return (
          <article key={p.id}>
            <span className="rl-name"><RoleMark id={p.persona} size={24} />{brief.name} · T{validTable(p.table_number) || '—'}</span>
            <b>{r?.choice || (large ? brief.protect[0] : 'Waiting for perspective')}</b>
            {r?.note && <p>“{r.note}”</p>}
            {large && <small>{brief.question}</small>}
          </article>
        );
      })}
    </div>
  );
}

function BriefShareRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="brief-share-room">
        <div className="eyebrow">DIFFERENT PERSPECTIVES · ONE HOSPITAL</div>
        <h1>Introduce the responsibility you chose.</h1>
        <p>Each player selects one priority on the phone, then explains why it matters for this hospital.</p>
        <PerspectiveCards participants={participants} responses={responses} />
        <div className="room-actions">
          <Button onClick={() => onAdvance('promise')}>CONTINUE <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function AlignmentRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="alignment-room">
        <div className="eyebrow">ONE HOSPITAL · COMPETING RESPONSIBILITIES</div>
        <h1>These priorities are all legitimate.</h1>
        <p>The next decision will require each table to balance them. Use these perspectives when explaining your choices.</p>
        <PerspectiveCards participants={participants} responses={responses} large />
          <div className="room-actions">
            <Button onClick={() => onAdvance('promise')}>CHOOSE THE CARE PROMISE <ArrowRight size={18} /></Button>
        </div>
      </section>
    </Shell>
  );
}

function ReadyRoom({ onAdvance }) {
  return (
    <Shell>
      <section className="center-stage ready-room">
        <div className="eyebrow">STEP 3 COMPLETE</div>
        <h1>One hospital.<br /><em>Six legitimate lenses.</em></h1>
        <p>Next: six capabilities, limited capacity, and one capability your table explores in depth.</p>
        <Button onClick={() => onAdvance('cap_nominate')}>OPEN THE CAPABILITY PORTFOLIO <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   SHARED PIECES FOR ROUND 2.0
   --------------------------------------------------------------------- */

function CostLine({ cost }) {
  return <span className="costline">{RES_KEYS.map((k, i) => <i key={k}><small>{RES_SHORT[i]}</small>{cost[i]}</i>)}</span>;
}
function ResStrip({ have, before }) {
  return (
    <div className="res-strip">
      {RES_KEYS.map((k, i) => (
        <div key={k}><small>{RES_SHORT[i]}</small><b>{before ? `${before[i]} → ${have[i]}` : have[i]}</b></div>
      ))}
    </div>
  );
}
function NextButton({ onAdvance, to, children, disabled = false }) {
  return <div className="room-actions"><Button disabled={disabled} onClick={() => onAdvance(to)}>{children} <ArrowRight size={18} /></Button></div>;
}
function TableCards({ tables, render }) {
  return <div className="tcards">{tables.map((t) => <article className="tcard" key={t}>{render(t)}</article>)}</div>;
}
const tableHead = (t, extra) => <span className="tlabel">TEAM ARTHUR · TABLE {t} · {hospitalForTable(t).name}{extra ? ` · ${extra}` : ''}</span>;
const choiceLabel = (c) => (c === 'hold' ? 'NOT NOW' : c ? c.toUpperCase() : 'NO DECISION');

const latestVotes = (responses, type, key = 'teach') => {
  const byPlayer = new Map();
  responses.filter((r) => r.response_type === type && r.capability_id === key).sort(byTime).forEach((r) => byPlayer.set(r.participant_id, r));
  return [...byPlayer.values()];
};
const PREDICTION_OPTIONS = {
  scale_prediction: ['unit', 'facility', 'system'],
  continuum_prediction: CONTINUUM_OPTIONS.map(([a]) => a.toLowerCase()),
  change_prediction: CHANGE_OPTIONS.map(([a]) => a),
};
const groupedPrediction = (participants, responses, type, mode) => {
  const votes = latestVotes(responses, type);
  const options = PREDICTION_OPTIONS[type];
  const tally = (rows) => Object.fromEntries(options.map((o) => [o, rows.filter((v) => v.choice === o).length]));
  if (mode === 'table') return activeTables(participants).map((t) => ({ name: `Table ${t} · ${capabilityById(teachCapFor(participants, responses, t)).name}`, counts: tally(votes.filter((v) => validTable(v.table_number) === t)) }));
  if (mode === 'persona') return PERSONAS.map((x) => ({ name: x.name, counts: tally(votes.filter((v) => v.persona === x.id)) }));
  return [{ name: 'Whole room', counts: tally(votes) }];
};
function PredictionAnalysis({ participants, responses, type, initial = 'room' }) {
  const [mode, setMode] = useState(initial);
  const groups = groupedPrediction(participants, responses, type, mode);
  return (
    <>
      <div className="analysis-controls">{[['room', 'Whole room'], ['table', 'By table'], ['persona', 'By perspective']].map(([id, label]) => <button type="button" key={id} className={mode === id ? 'active' : ''} onClick={() => setMode(id)}>{label}</button>)}</div>
      <div className="pa-wrap">{groups.map((g) => { const vals = Object.values(g.counts); const total = vals.reduce((x, y) => x + y, 0); const max = Math.max(1, ...vals); return (<article className="pa-card" key={g.name}><h3>{g.name}<small>{total} vote{total === 1 ? '' : 's'}</small></h3>{Object.entries(g.counts).map(([k, v]) => <div className="pa-row" key={k}><span>{k}</span><i><em className={v === max && v > 0 ? 'top' : ''} style={{ width: `${(v / max) * 100}%` }} /></i><b>{v}</b></div>)}</article>); })}</div>
    </>
  );
}
const alignmentFor = (members, responses) => {
  const votes = members.map((p) => myResponse(responses, p.id, 'first_instinct', 'teach')?.choice).filter(Boolean);
  const cover = `${votes.length} OF ${members.length} VOTED`;
  if (votes.length < Math.min(members.length, Math.max(2, Math.ceil(members.length * 0.6)))) return { label: `TOO EARLY · ${cover}`, cls: 'mixed' };
  const ratio = Math.max(...CHOICES.map((c) => votes.filter((v) => v === c).length)) / votes.length;
  return ratio >= 0.8 ? { label: `STRONG ALIGNMENT · ${cover}`, cls: 'strong' } : ratio >= 0.6 ? { label: `MIXED · ${cover}`, cls: 'mixed' } : { label: `SPLIT · ${cover}`, cls: 'split' };
};
function VoteProgress({ participants, responses, type, keyName = 'teach' }) {
  const total = latestVotes(responses, type, keyName).filter((r) => participants.some((p) => p.id === r.participant_id)).length;
  return <div className="aha-line">{total} of {participants.length} participants have responded.</div>;
}

/* ---------------------------------------------------------------------
   STEP 5 · CHOOSE THE TEACHING CAPABILITY (facilitator)
   --------------------------------------------------------------------- */

function CapabilityPortfolioRoom({ participants, responses = [], onAdvance }) {
  const active = activeTables(participants);
  return (
    <Shell>
      <section className="cap-portfolio-room">
        <div className="cap-portfolio-head">
          <div>
            <div className="eyebrow">SIX POSSIBILITIES · LIMITED CAPACITY</div>
            <h1>Every table chooses where to go deep first.</h1>
          </div>
          <p>Each table explores one capability in full. Phones show what each one asks of your hospital. The choice is yours.</p>
        </div>
        <div className="cap-grid">
          {CAPABILITIES.map((c, i) => (
            <article key={c.id}>
              <div className="cap-image"><img src={c.image} alt="" onError={(e) => imageFallback(e)} /><span>0{i + 1}</span></div>
              <div className="cap-card-copy">
                <h2>{c.name}</h2>
                <p>{c.promise}</p>
                <p className="cap-moment">{careMoment(c.id)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="aha-line">Nominate privately on your phone. Your table’s choice becomes its first decision.</div>
        <ProgressGrid participants={participants} responses={responses} type="capability_nomination" capabilityId="portfolio" doneLabel="ALL NOMINATIONS IN" partialLabel="NOMINATIONS SUBMITTED" />
        <NextButton onAdvance={onAdvance} to="cap_results">REVEAL NOMINATIONS</NextButton>
      </section>
    </Shell>
  );
}

function CapabilityNominationRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="cap-nom-room">
        <div className="eyebrow">PRIVATE NOMINATION</div>
        <h1>Which capability should your table explore in depth?</h1>
        <p>Each phone shows your role’s view and the cost for that hospital. This choice also becomes your table’s first decision. The room shows completion only.</p>
        <ProgressGrid participants={participants} responses={responses} type="capability_nomination" capabilityId="portfolio" doneLabel="ALL NOMINATIONS IN" partialLabel="NOMINATIONS SUBMITTED" />
        <NextButton onAdvance={onAdvance} to="cap_results">REVEAL NOMINATIONS</NextButton>
      </section>
    </Shell>
  );
}

function CapabilityResultsRoom({ participants, responses, onAdvance, facSave }) {
  const tables = activeTables(participants);
  const initial = Object.fromEntries(tables.map((t) => [t, teachCapFor(participants, responses, t)]));
  const [picked, setPicked] = useState(initial);
  const [saving, setSaving] = useState(false);
  const choiceOf = (t) => picked[t] || initial[t];
  const counts = {};
  tables.forEach((t) => { counts[choiceOf(t)] = (counts[choiceOf(t)] || 0) + 1; });
  const dups = Object.entries(counts).filter(([, n]) => n > 1).map(([id]) => capabilityById(id).name);
  const movesCare = tables.some((t) => choiceOf(t) === 'virtual-care');
    const tieTables = tables.filter((t) => { const r = nominationRanking(participants, responses, t); return r[0]?.n > 0 && r.filter((x) => x.n === r[0].n).length > 1; });
  const approve = async () => {
    setSaving(true);
    try {
      for (const t of tables) await facSave('teach_assign', facKey('teach', t), t, choiceOf(t));
      onAdvance('t_reveal');
    } finally { setSaving(false); }
  };
  return (
    <Shell>
      <section className="cap-selection-room">
        <div className="eyebrow">APPROVE TEACHING CAPABILITIES</div>
        <h1>Different hospitals. Different first moves.</h1>
        <p>Each table’s leading nomination is selected. Tap a thumbnail to change one. The dials show what investing would leave.</p>
          <div className="approve-grid">
            {tables.map((t) => {
              const ranked = nominationRanking(participants, responses, t);
              const h = hospitalForTable(t);
              const cap = capabilityById(choiceOf(t));
              const n = ranked.find((x) => x.c.id === cap.id)?.n || 0;
const total = membersOf(participants, t).length;
                const topN = ranked[0]?.n || 0;
                const tied = topN > 0 ? ranked.filter((x) => x.n === topN) : [];
                return (
                <article className="approve-card" key={t}>
                  <div className="approve-hero" style={{ backgroundImage: `linear-gradient(180deg,rgba(10,34,44,.05) 30%,rgba(10,34,44,.9)),url(${cap.image})` }}>
                    <span>TABLE {t} · {h.name}</span>
                    <h2>{cap.name}</h2>
                    <em>{n} of {total} nominated</em>
                      {tied.length > 1 && <b className="tie-flag">TIED · {tied.map((x) => x.c.name).join(' / ')}</b>}
                  </div>
                  <div className="approve-body">
                    <Gauges have={startOf(h)} start={startOf(h)} pending={investCost(h.id, cap.id)} />
                    <div className="thumb-row">
                      {CAPABILITIES.map((c) => (
                        <button type="button" key={c.id} title={c.name} className={`${choiceOf(t) === c.id ? 'active' : ''}${tied.length > 1 && tied.some((x) => x.c.id === c.id) ? ' tied' : ''}`} onClick={() => setPicked((p) => ({ ...p, [t]: c.id }))}>
                          <img src={c.image} alt={c.name} onError={(e) => imageFallback(e)} /><span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
{tieTables.length > 0 && <div className="dup-note">Nominations are tied at {tieTables.map((t) => `Table ${t}`).join(', ')}. The first capability in the list is selected by default. Tap a thumbnail to choose, or ask the table.</div>}
  {dups.length > 0 && <div className="dup-note">More than one table chose {dups.join(', ')}. That works, and gives a same-capability comparison. Change one if you want more variety in the room.</div>}
        <div className="room-actions"><Button disabled={saving || !tables.length} onClick={approve}>{saving ? 'SAVING…' : 'APPROVE ALL AND BEGIN'} <ArrowRight size={18} /></Button></div>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 6 · TEACHING ROUND (facilitator) · one capability per table
   --------------------------------------------------------------------- */

const capOfTable = (participants, responses, t) => capabilityById(teachCapFor(participants, responses, t));

function RoleReveal({ children, label = 'REVEAL ALL PERSPECTIVES' }) {
  const [open, setOpen] = useState(false);
  return open ? children : <div className="room-actions left"><Button secondary onClick={() => setOpen(true)}>{label}</Button></div>;
}
function RoleLines({ capId }) {
  return <div className="role-lines">{ROLE_ORDER.map((p) => <p key={p}><b className="rl-name"><RoleMark id={p} size={24} />{briefFor(p).name}</b>{roleLine(capId, p)}</p>)}</div>;
}
function PerspectiveGrid({ capIds = CAPABILITIES.map((c) => c.id) }) {
  return <div className="tcards">{capIds.map((id) => <article className="tcard" key={id}><h3>{capabilityById(id).name}</h3><RoleLines capId={id} /></article>)}</div>;
}
const BuildingQ = () => <p className="building-q">{BUILDING_QUESTION}</p>;

function TRevealRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">TEACHING ROUND · START WITH THE CARE MOMENT</div>
        <h1>Every table goes deep on one decision.</h1>
        <p className="pullback-intro">Each phone shows what this moment means for that person’s role. Go around the table: each person explains their case before the room sees every perspective.</p>
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          const h = hospitalForTable(t);
          return (<><img src={c.image} alt="" onError={(e) => imageFallback(e)} />{tableHead(t)}<h3>{c.name}</h3><p className="moment">{careMoment(c.id)}</p><dl><dt>YOUR HOSPITAL’S NEED</dt><dd>{NEED_LINE[h.id]}</dd><dt>INVEST DELIVERS</dt><dd>{c.scope}</dd><dt>NOT INCLUDED</dt><dd>{c.excluded}</dd></dl></>);
        }} />
        <div className="aha-line">{DECISION_PROMPT}</div>
        <RoleReveal><TableCards tables={tables} render={(t) => { const c = capOfTable(participants, responses, t); return (<>{tableHead(t)}<h3>{c.name} · every perspective</h3><RoleLines capId={c.id} /></>); }} /></RoleReveal>
        <NextButton onAdvance={onAdvance} to="t_instinct">PRIVATE FIRST INSTINCT</NextButton>
      </section>
    </Shell>
  );
}

function TInstinctRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="center-stage vc-instinct-room">
        <div className="eyebrow">PRIVATE FIRST INSTINCT</div>
        <h1>What would <em>you</em> do?</h1>
        <p>Invest, start, prepare or not now. Vote privately on your phone. The room shows completion only.</p>
        <ProgressGrid participants={participants} responses={responses} type="first_instinct" capabilityId="teach" doneLabel="ALL RESPONSES IN" partialLabel="RESPONSES SUBMITTED" />
        <Button onClick={() => onAdvance('t_change_vote')}>TRANSLATE TO DESIGN <ArrowRight size={18} /></Button>
      </section>
    </Shell>
  );
}

function TCostRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const LINE = { invest: 'All of it, now.', start: 'One unit. Learn first.', prepare: 'Ready behind the walls. Switch on later.' };
    const decidedCount = tables.filter((t) => activeProposal(responses, t, 'teach')).length;
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">THREE WAYS IN · THE PRICE IS NOT JUST MONEY</div>
        <h1>Invest, start or prepare.</h1>
          <p className="one-line">Decide together. Each phone shows who records.</p>
          <div className="aha-line">{decidedCount} of {tables.length} tables have decided.</div>
        {tables.map((t) => {
          const c = capOfTable(participants, responses, t);
          const h = hospitalForTable(t);
          const cost = { invest: investCost(h.id, c.id), start: startCost(h.id, c.id), prepare: prepareCost(h.id, c.id) };
          return (
            <article className="three-ways" key={t}>
              <header>{tableHead(t)}<h3>{c.name}</h3></header>
              <div className="tw-grid">
                {OPTION_KEYS.map((k) => (
                  <figure key={k} className={`tw tw-${k}`}>
                    <div className={`opt-img opt-img-${k}${hasOptionArt(c, k) ? ' has-art' : ''}`}>
                      <img className="opt-base" src={c.image} alt="" onError={(e) => imageFallback(e)} />
                      {hasOptionArt(c, k) && <img className="opt-art" src={optionImage(c, k)} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                      <span className="opt-tag">{OPTION_META[k].label}</span>
                    </div>
                    <figcaption><b>{LINE[k]}</b><Gauges have={startOf(h)} start={startOf(h)} pending={cost[k]} /></figcaption>
                  </figure>
                ))}
              </div>
              <p className="tw-line">{c.tradeoff[h.id]}</p>
            </article>
          );
        })}
        <NextButton onAdvance={onAdvance} to="t_decision">MAKE THE TABLE DECISION</NextButton>
      </section>
    </Shell>
  );
}

function TMissionRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">WHAT IT ASKS OF YOU</div>
        <h1>Every capability asks something of your people and your governance.</h1>
        <p className="pullback-intro">No ratings. Your table decides whether this is right for your hospital.</p>
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          const h = hospitalForTable(t);
          const d = optionDetail(c, 'invest');
          return (<>{tableHead(t)}<h3>{c.name}</h3><dl><dt>YOUR HOSPITAL’S NEED</dt><dd>{NEED_LINE[h.id]}</dd><dt>THE TRADE-OFF HERE</dt><dd>{c.tradeoff[h.id]}</dd><dt>WORKFORCE</dt><dd>{d.wf}</dd><dt>GOVERNANCE</dt><dd>{d.gov}</dd></dl></>);
        }} />
        <NextButton onAdvance={onAdvance} to="t_decision">MAKE THE TABLE DECISION</NextButton>
      </section>
    </Shell>
  );
}

function TChangeVoteRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">PRIVATE PREDICTION · DESIGN</div>
        <h1>Imagine the hospital has opened. What would be hardest to change?</h1>
        <p className="pullback-intro">The device or technology itself, where it sits in the building, or access to the infrastructure behind it?</p>
        <VoteProgress participants={participants} responses={responses} type="change_prediction" />
        <NextButton onAdvance={onAdvance} to="t_design">REVEAL WHAT THE BUILDING LOCKS IN</NextButton>
      </section>
    </Shell>
  );
}

function VoteBars({ participants, responses, type }) {
  const votes = latestVotes(responses, type).filter((r) => participants.some((p) => p.id === r.participant_id));
  const opts = type === 'change_prediction' ? CHANGE_OPTIONS : PREDICTION_OPTIONS[type].map((x) => [x, x]);
  const max = Math.max(1, ...opts.map(([id]) => votes.filter((v) => v.choice === id).length));
  return (
    <div className="vote-bars">
      {opts.map(([id, label]) => {
        const n = votes.filter((v) => v.choice === id).length;
        return <div key={id}><span>{label}</span><i><em style={{ width: `${(n / max) * 100}%` }} /></i><b>{n}</b></div>;
      })}
    </div>
  );
}
function TDesignRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">DECIDE EARLY · KEEP CHANGEABLE</div>
        <h1>The device is the easiest thing to change.</h1>
        <VoteBars participants={participants} responses={responses} type="change_prediction" />
        <div className="design-grid">
          {tables.map((t) => {
            const c = capOfTable(participants, responses, t);
            return (
              <article className="design-card" key={t}>
                <div className="design-img"><img src={preparedImage(c)} alt="" onError={(e) => imageFallback(e, c.image)} /><span>{tableHead(t)}<b>{c.name}</b></span></div>
                <div className="design-pair">
                  <div className="early"><b>DECIDE EARLY</b>{c.early}</div>
                  <div className="open"><b>KEEP CHANGEABLE</b>{c.open}</div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="aha-line">Where a capability lives, and the infrastructure behind it, is what the building locks in.</div>
        <NextButton onAdvance={onAdvance} to="t_discuss">REVEAL FIRST INSTINCTS</NextButton>
      </section>
    </Shell>
  );
}

function TDiscussRoom({ participants, responses, onAdvance }) {
  const votes = responsesOfType(responses, 'first_instinct', 'teach');
  return (
    <Shell>
      <section className="vc-discuss-room">
        <div className="eyebrow">REVEAL FIRST INSTINCTS</div>
        <h1>Now you can see where the tension lives.</h1>
        <p>Names stay private. Perspectives are visible because the leadership lens is part of the learning.</p>
        <div className="tally-table-grid">
          {activeTables(participants).map((t) => {
            const rows = membersOf(participants, t).map((p) => ({ p, r: myResponse(votes, p.id, 'first_instinct') }));
            const a = alignmentFor(membersOf(participants, t), responses);
            return (
              <article key={t}>
                <span>TABLE {t} · {capOfTable(participants, responses, t).name}</span>
                <span className={`alignment-badge alignment-${a.cls}`}>{a.label}</span>
                <div className="persona-votes">{rows.map(({ p, r }) => <div key={p.id}><b>{briefFor(p.persona).name}</b><strong className={r?.choice || 'waiting'}>{r?.choice ? choiceLabel(r.choice) : 'WAITING'}</strong></div>)}</div>
                <div className="tally-bars">{CHOICES.map((c) => <div key={c}><span>{choiceLabel(c)}</span><b>{rows.filter((x) => x.r?.choice === c).length}</b></div>)}</div>
              </article>
            );
          })}
        </div>
        <div className="discussion-note"><b>60–90 SEC</b><span>What changed after seeing what the building locks in?</span></div>
        <NextButton onAdvance={onAdvance} to="t_cost">SEE THE THREE WAYS IN</NextButton>
      </section>
    </Shell>
  );
}

function FacControls({ t, keyName, responses, facSave, ledger = null, teach = false }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const proposal = activeProposal(responses, t, keyName);
  const go = async (choice, note = 'facilitator') => {
    setBusy(true);
    try { await facSave('fac_decision', facKey(keyName, t), t, choice, note); setOpen(false); } finally { setBusy(false); }
  };
  const skip = async () => {
    setBusy(true);
    try {
      if (teach) await facSave('table_no_decision', facKey('teach', t), t, 'no-decision');
      else await facSave('fac_decision', facKey(keyName, t), t, 'hold', 'skipped');
    } finally { setBusy(false); }
  };
  return (
    <div className="fac-ctl">
      {proposal ? (
        <button type="button" disabled={busy} onClick={() => go('', 'reopened')}>REOPEN</button>
      ) : (
        <>
          <button type="button" className="primary" disabled={busy} onClick={() => setOpen(!open)}>DECIDE FOR THIS TABLE</button>
          <button type="button" disabled={busy} onClick={skip}>SKIP THIS TABLE</button>
        </>
      )}
      {open && !proposal && (
        <div className="fo-panel">
          {teach ? (
            <div className="fo-row">{CHOICES.map((c) => <button type="button" key={c} disabled={busy} onClick={() => go(c)}>{choiceLabel(c)}</button>)}</div>
          ) : (
            <>
              {ledger && boardFor(ledger).filter(canActOn).map((b) => {
                const ks = Object.entries(b.ok || {}).filter(([, v]) => v).map(([k]) => k);
                return ks.length ? <div className="fo-row" key={b.c.id}><b>{b.c.name}</b>{ks.map((k) => <button type="button" key={k} disabled={busy} onClick={() => go(`${k}|${b.c.id}`)}>{k.toUpperCase()}</button>)}</div> : null;
              })}
              <div className="fo-row"><b>No investment</b><button type="button" disabled={busy} onClick={() => go('hold')}>NOT THIS CYCLE</button><button type="button" disabled={busy} onClick={() => go('close')}>CLOSE PORTFOLIO</button></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TDecisionRoom({ participants, responses, onAdvance, facSave }) {
  const late = useAfter(NUDGE_MS);
  const withInstincts = teachTables(participants, responses);
  const tables = withInstincts.length ? withInstincts : activeTables(participants);
  const states = tables.map((t) => ({ table: t, ...decisionForTable(responses, t, 'teach'), rec: recorderFor(participants, responses, t, 'teach') }));
  const unresolved = states.filter((x) => x.status === 'waiting');
  const completed = states.filter((x) => x.status === 'decided');
  const resolved = tables.length > 0 && unresolved.length === 0;
  const continueCompleted = async () => {
    for (const row of unresolved) await facSave('table_no_decision', facKey('teach', row.table), row.table, 'no-decision');
      onAdvance('t_continuum_reveal');
    };
  return (
    <Shell>
      <section className="vc-decision-room">
        <div className="eyebrow">ONE TEAM · ONE DECISION</div>
        <h1>Resolve the trade-off together.</h1>
        <p>Invest, start, prepare or not now. Agree out loud; the recorder (it rotates, and every phone says whose turn it is) records the choice, one reason and one concern. It does not establish consensus.</p>
        <div className="decision-status-grid">
          {states.map(({ table, status, choice, proposal, rec }) => {
            const notes = decisionNotes(responses, table, 'teach');
            const l = ledgerFor(participants, responses, table, 0);
            const stuck = status === 'waiting' && late;
            return (
              <article key={table} className={stuck ? 'late' : ''}>
                <span>TABLE {table} · {capOfTable(participants, responses, table).name}</span>
                <h2>{status === 'decided' ? choiceLabel(choice) : status === 'no-decision' ? 'NO DECISION' : stuck ? 'STILL WAITING' : 'DISCUSSING'}</h2>
                {status === 'decided' && <Gauges have={l.have} start={startOf(l.hospital)} />}
                {status === 'decided' && notes.reasons[0] && <p><b>Why:</b> “{notes.reasons[0]}”</p>}
                {status === 'decided' && notes.concerns[0] && <p className="cause"><b>Still concerned:</b> “{notes.concerns[0]}”</p>}
                {status === 'decided' && proposal && <p className="small-note">Recorded by {recordedByName(proposal)}</p>}
                {status === 'waiting' && <p>{rec ? `Waiting for ${briefFor(rec.persona).name} to record.` : 'Waiting for a table proposal.'}{stuck && <span className="nudge">90s+ · DECIDE FOR THEM?</span>}</p>}
                {status === 'no-decision' && <p>Skipped by the facilitator.</p>}
                <FacControls t={table} keyName="teach" responses={responses} facSave={facSave} teach />
              </article>
            );
          })}
        </div>
        <div className="aha-line">{completed.length} of {tables.length} participating tables have decided.</div>
        {unresolved.length > 0 && <p><b>Waiting for:</b> {unresolved.map((x) => `Table ${x.table}`).join(', ')}</p>}
        <div className="room-actions">
          <Button disabled={!resolved} onClick={() => onAdvance('t_continuum_reveal')}>{resolved ? 'APPLY DECISIONS' : 'WAITING FOR TABLE DECISIONS'} <ArrowRight size={18} /></Button>
          {unresolved.length > 0 && <Button secondary onClick={continueCompleted}>{completed.length > 0 ? 'CONTINUE WITH COMPLETED TABLES' : 'CONTINUE WITHOUT TABLE DECISIONS'}</Button>}
        </div>
      </section>
    </Shell>
  );
}

function TCheckpointRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">TEACHING ROUND CHECKPOINT</div>
        <h1>Your hospitals are beginning to take shape.</h1>
        <TableCards tables={tables} render={(t) => {
          const l = ledgerFor(participants, responses, t, 0);
          const h = l.hospital;
          const choice = decisionForTable(responses, t, 'teach').choice;
          return (<><img src={h.image} alt="" onError={(e) => imageFallback(e)} />{tableHead(t)}<h3>{capabilityById(l.teachCap).name} · {choiceLabel(choice)}</h3><ResStrip have={l.have} before={startOf(h)} /></>);
        }} />
        <NextButton onAdvance={onAdvance} to="t_scale_vote">PULL BACK · WHERE DOES IT LAND?</NextButton>
      </section>
    </Shell>
  );
}

function TScaleVoteRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">PULL BACK · PRIVATE PREDICTION</div>
        <h1>Where does the greatest consequence of your decision fall, for your hospital?</h1>
        <p className="pullback-intro">The unit where care is delivered, the facility that must support it, or the system that connects every site?</p>
        <VoteProgress participants={participants} responses={responses} type="scale_prediction" />
        <NextButton onAdvance={onAdvance} to="t_scale_reveal">REVEAL THE PREDICTIONS</NextButton>
      </section>
    </Shell>
  );
}

function TScaleRevealRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL · THE SCALES CONNECT</div>
        <h1>The biggest impact lands in one place. The consequences run through all three.</h1>
        <PredictionAnalysis participants={participants} responses={responses} type="scale_prediction" initial="table" />
        <TableCards tables={tables} render={(t) => {
          const c = capOfTable(participants, responses, t);
          return (<>{tableHead(t)}<h3>{c.name}</h3><dl><dt>UNIT</dt><dd>{c.scale.unit}</dd><dt>FACILITY</dt><dd>{c.scale.facility}</dd><dt>SYSTEM</dt><dd>{c.scale.system}</dd></dl></>);
        }} />
        <div className="aha-line">The architecture may be enterprise-wide even when the consequence is local.</div>
        <BuildingQ />
        <NextButton onAdvance={onAdvance} to="t_continuum_vote">SHIFT THE VIEW</NextButton>
      </section>
    </Shell>
  );
}

function TContinuumVoteRoom({ participants, responses, onAdvance }) {
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">SHIFT THE VIEW · PRIVATE PREDICTION</div>
        <h1>Where does care go because of your decision?</h1>
        <p className="pullback-intro">Choose the setting that changes most, or say that care does not move.</p>
        <VoteProgress participants={participants} responses={responses} type="continuum_prediction" />
        <NextButton onAdvance={onAdvance} to="t_continuum_reveal">REVEAL THE CONTINUUM</NextButton>
      </section>
    </Shell>
  );
}

function TContinuumRevealRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const chosen = new Set(tables.map((t) => teachCapFor(participants, responses, t)));
  const others = CAPABILITIES.filter((c) => !chosen.has(c.id));
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL · DIFFERENT CAPABILITIES MOVE DIFFERENT THINGS</div>
        <h1>Not every capability moves care.</h1>
        <div className="moves-grid">
            {tables.map((t) => { const c = capOfTable(participants, responses, t); return (
              <article className="moves-card" key={t}><div className="mc-head"><CapThumb cap={c} /><div>{tableHead(t)}<h3>{c.name}</h3></div></div><MovesChips capId={c.id} big /><p className="moves-line">{c.revealLine}</p></article>
            ); })}
        </div>
        {others.length > 0 && (
          <>
            <div className="eyebrow">NO TABLE CHOSE · TAP TO OPEN</div>
            <div className="contrast-row">{others.map((c) => <details key={c.id}><summary>{(MOVES[c.id] || []).map(([g]) => <Glyph key={g} name={g} size={18} />)}{c.name}</summary><p>{c.revealLine}</p></details>)}</div>
          </>
        )}
        <PivotQuestion />
        <div className="mf-grid">{tables.map((t) => <MoveFixedCard key={t} t={t} cap={capOfTable(participants, responses, t)} />)}</div>
        <NextButton onAdvance={onAdvance} to="t_ripple">COMPARE HOW THE HOSPITALS CHANGED</NextButton>
      </section>
    </Shell>
  );
}

function TRippleRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const [selected, setSelected] = useState(null);
  const t = selected || tables[0];
  const detail = t ? (() => {
    const c = capOfTable(participants, responses, t);
    const choice = decisionForTable(responses, t, 'teach').choice;
    return { c, choice, x: rippleFor(c, choice), h: hospitalForTable(t) };
  })() : null;
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">DIFFERENT DECISIONS · DIFFERENT CONSEQUENCES</div>
        <h1>Compare how each hospital changed.</h1>
        <div className="final-compare">
          {tables.map((n) => {
            const hospital = hospitalForTable(n);
            const c = capOfTable(participants, responses, n);
            const ch = decisionForTable(responses, n, 'teach').choice;
            return (
              <button type="button" className={`compare-card ${n === t ? 'selected' : ''}`} key={n} onClick={() => setSelected(n)}>
                <img src={hospital.image} alt={hospital.name} onError={(e) => imageFallback(e)} />
                <div className="compare-card-body"><span>TABLE {n} · {c.name}</span><h3>{hospital.name}</h3><span className={`decision-tag decision-${ch === 'invest' ? 'invest' : ch === 'prepare' || ch === 'start' ? 'adapt' : 'preserve'}`}>{choiceLabel(ch)}</span><p>{rippleFor(c, ch).headline}</p></div>
              </button>
            );
          })}
        </div>
        {detail && (
          <article className="compare-detail">
            <span>TABLE {t} · {detail.h.name} · {detail.c.name}</span>
            <h2>{choiceLabel(detail.choice)} · {detail.x.headline}</h2>
            <div className="consequence-grid"><article><b>CLINICAL WORK</b>{detail.x.unit}</article><article><b>FACILITY</b>{detail.x.facility}</article><article><b>SYSTEM</b>{detail.x.system}</article><article><b>CARE FLOW</b>{detail.x.flow}</article></div>
            <p>{detail.c.context[detail.h.id]}</p>
              {detail.choice === 'prepare' && <p><b>WHAT CHANGES LATER</b> · {prepareLater(detail.c.id, detail.h.id)}</p>}
            {detail.choice && <p><b>{CLOSING_LINE[detail.choice]}</b></p>}
          </article>
        )}
        <div className="aha-line">Technology strategy became operating strategy. Operating strategy changed capital strategy.</div>
        <BuildingQ />
        <NextButton onAdvance={onAdvance} to="p_open">OPEN THE PORTFOLIO BOARD</NextButton>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 7 · PORTFOLIO CYCLES (facilitator)
   --------------------------------------------------------------------- */

function BoardSummary({ ledger, signal }) {
  return (
    <div className="board-list">
      {boardFor(ledger).map((b) => {
        const tag = signalTagFor(signal, b.c.id, b.state === 'committed');
        return <div key={b.c.id}><span>{b.c.name}{tag && <span className="signal-tag">{tag}</span>}</span><span className={`st st-${b.state}`}>{stateLabel(b)}</span></div>;
      })}
    </div>
  );
}

const tableResequence = (responses, t) => responsesOfType(responses, 'resequence', 'final').filter((r) => validTable(r.table_number) === t && r.note).sort(byTime).map((r) => r.note);
const tableReflections = (responses, t) => responsesOfType(responses, 'reflection', 'final').filter((r) => validTable(r.table_number) === t && r.note).map((r) => r.note);

function TurnList({ items }) {
  return <div>{items.map((x, i) => <div className="turn" key={i}><b>{x.title.toUpperCase()}</b>{x.text}</div>)}</div>;
}
function LockList({ report }) {
  const block = (title, rows, empty) => (
    <div className="lock-block">
      <b>{title}</b>
      {rows.length ? rows.map((r) => <p key={r.name}><strong>{r.name}</strong> · {r.text}</p>) : <p className="small-note">{empty}</p>}
    </div>
  );
  return (
    <>
      {block('DECIDE NOW · COMMITTED', report.now, 'Nothing committed yet.')}
      {block('PROTECT WHILE DEFERRED · PREPARED', report.protect, 'No provisions protected.')}
      {block('KEEP CHANGEABLE', report.open, 'Nothing to keep open yet.')}
    </>
  );
}

function makeDecideRoom(k) {
  const next = k === 1 ? 'p2_decide' : k === 2 ? 'p_signal' : 'f_cards';
  const key = `cycle-${k}`;
  return function PDecideRoom({ participants, responses, onAdvance, facSave }) {
    const late = useAfter(NUDGE_MS);
    const tables = activeTables(participants);
    const opts = ledgerOpts(k);
    const rows = tables.map((t) => {
      const l = ledgerFor(participants, responses, t, k - 1, opts);
      const canAct = !l.closed && boardFor(l).some(canActOn);
      const row = activeProposal(responses, t, key);
      const parsed = parseCycleChoice(row?.choice);
      const diff = parsed && (parsed.action === 'invest' || parsed.action === 'prepare' || parsed.action === 'start') ? diffBoards(l, ledgerFor(participants, responses, t, k, opts), parsed.cap) : null;
      return { t, l, canAct, parsed, diff, rec: recorderFor(participants, responses, t, key), byFac: row?.persona === 'facilitator' };
    });
    const waiting = rows.filter((r) => r.canAct && !r.parsed);
    const describe = (r) => {
      if (r.l.closed) return ['CLOSED', 'Portfolio closed earlier.'];
      if (!r.canAct) return ['NO OPTION FITS', `Nothing fits what is left. Main constraint: ${mainConstraint(r.l)}.`];
      if (!r.parsed) return [late ? 'STILL WAITING' : 'DISCUSSING', r.rec ? `Waiting for ${briefFor(r.rec.persona).name} to record.` : 'Waiting for a table decision.'];
      const by = r.byFac ? ' · recorded by the facilitator' : '';
      if (r.parsed.action === 'hold') return ['NOT THIS CYCLE', `Capacity kept for the next cycle${by}.`];
      if (r.parsed.action === 'close') return ['CLOSE', `No further commitments this planning period${by}.`];
      return [r.parsed.action.toUpperCase(), `${capabilityById(r.parsed.cap)?.name}${by}`];
    };
    return (
      <Shell>
        <section className="vc-decision-room">
          <div className="eyebrow">PORTFOLIO · CYCLE {k} OF 2</div>
          <h1>{k === 3 ? 'The final cycle. Respond, or hold your ground.' : 'One decision per table.'}</h1>
          <p className="pullback-intro">{k === 1 && 'Bright tiles are within reach. Faded tiles can only be started or prepared. Grey tiles are out of reach in this planning period. '}Phones show the board through each role. Tapping a capability nominates it privately; the recorder then records one decision.{k < 3 ? ' A challenge arrives after cycle 2, then the operations layer.' : ''}</p>
          <div className="hb-grid">
            {rows.map((r) => {
              const [a, b] = describe(r);
              const reseq = tableResequence(responses, r.t)[0];
              const stuck = !r.parsed && r.canAct && late;
              return (
                <HospitalBoardCard key={r.t} t={r.t} ledger={r.l} signal={k === 3 ? currentSignal(responses) : null} extra={
                  <div className={`hb-status ${r.parsed ? 'done' : ''} ${stuck ? 'late' : ''}`}>
                    <b>{a}</b><span>{b}</span>{stuck && <span className="nudge">90s+ · DECIDE FOR THEM?</span>}
                    {r.diff && (r.diff.blocked.length > 0 || r.diff.cheaper.length > 0) && (
                      <p className="cause">{[r.diff.blocked.length ? `Now harder to reach: ${listJoin(r.diff.blocked.map((x) => x.c.name))}.` : '', r.diff.cheaper.length ? `Now cheaper: ${listJoin(r.diff.cheaper.map((x) => x.c.name))}.` : ''].filter(Boolean).join(' ')}</p>
                    )}
                    {!r.canAct && reseq && <p className="cause"><b>If we could resequence:</b> “{reseq}”</p>}
                    {!r.l.closed && r.canAct && <FacControls t={r.t} keyName={key} responses={responses} facSave={facSave} ledger={r.l} />}
                  </div>
                } />
              );
            })}
          </div>
          <div className="aha-line">{DECISION_PROMPT}</div>
          <RoleReveal label="REVEAL ALL ROLE PERSPECTIVES"><PerspectiveGrid /></RoleReveal>
          <div className="aha-line">{rows.length - waiting.length} of {rows.length} tables are ready.</div>
          {waiting.length > 0 && <p><b>Waiting for:</b> {waiting.map((r) => `Table ${r.t}`).join(', ')}. Tables without a decision make no change this cycle.</p>}
          <div className="room-actions">
            <Button disabled={waiting.length > 0} onClick={() => onAdvance(next)}>{waiting.length ? 'WAITING FOR TABLE DECISIONS' : k === 2 ? 'REVEAL THE CHALLENGE' : k === 3 ? 'SEE WHAT YOUR HOSPITALS BECAME' : 'BEGIN CYCLE 2'} <ArrowRight size={18} /></Button>
            {waiting.length > 0 && <Button secondary onClick={() => onAdvance(next)}>CONTINUE WITH READY TABLES</Button>}
          </div>
        </section>
      </Shell>
    );
  };
}

/* ===== BY DESIGN 0.6 · THE OPERATIONS LAYER · SCREENS ===== */
function OpsCatalog({ pressed = [] }) {
  return (
    <div className="ops-grid">
      {OPS_IDS.map((id) => {
        const o = OPS_COMMITMENTS[id];
        return (
          <article className="ops-card" key={id}>
            <b>{o.name}</b>
            <p>{o.what}</p>
            <div className="ops-covers">{o.covers.map((c) => <span key={c} className={pressed.includes(c) ? 'press' : ''}>{COND_LABEL[c]}</span>)}</div>
            <CostLine cost={o.cost} />
            {o.needsText && <p className="ops-need">{o.needsText}</p>}
          </article>
        );
      })}
    </div>
  );
}
function OpsDots({ preview }) {
  return (
    <div className="cdots ops-dots">
      {preview.map((x) => (
        <div key={x.id} className={`cdot cond-${x.state}${x.needsRun && !x.run ? ' paper' : ''}`}>
          <b>{x.label}</b><em>{STATE_WORD[x.state]}</em>
          {x.needsRun && <small>{x.run ? 'RUN' : 'ON PAPER'}</small>}
        </div>
      ))}
    </div>
  );
}
function OpsFacControls({ t, responses, facSave, l }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState([]);
  const proposal = activeProposal(responses, t, 'cycle-3');
  const go = async (choice, note = 'facilitator') => {
    setBusy(true);
    try { await facSave('fac_decision', facKey('cycle-3', t), t, choice, note); setOpen(false); setSel([]); } finally { setBusy(false); }
  };
  return (
    <div className="fac-ctl">
      {proposal ? (
        <button type="button" disabled={busy} onClick={() => go('', 'reopened')}>REOPEN</button>
      ) : (
        <>
          <button type="button" className="primary" disabled={busy} onClick={() => setOpen(!open)}>DECIDE FOR THIS TABLE</button>
          <button type="button" disabled={busy} onClick={() => go('ops|', 'skipped')}>SKIP THIS TABLE</button>
        </>
      )}
      {open && !proposal && (
        <div className="fo-panel">
          <div className="fo-row">
            {OPS_IDS.map((id) => {
              const on = sel.includes(id);
              const can = opsNeedsMet(l, id) && (on || fits(l.have, opsCostOf([...sel, id])));
              return <button type="button" key={id} className={on ? 'primary' : ''} disabled={busy || !can} onClick={() => setSel(on ? sel.filter((x) => x !== id) : [...sel, id])}>{OPS_COMMITMENTS[id].name}</button>;
            })}
          </div>
          <div className="fo-row"><b>{sel.length ? `${sel.length} chosen` : 'None chosen'}</b><button type="button" className="primary" disabled={busy} onClick={() => go(`ops|${sel.join(',')}`)}>RECORD</button></div>
        </div>
      )}
    </div>
  );
}
function OpsDecideRoom({ participants, responses, onAdvance, facSave }) {
  const late = useAfter(NUDGE_MS);
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  const pressed = opsPressed(signal);
  const rows = tables.map((t) => {
    const l = ledgerFor(participants, responses, t, 2);
    const row = activeProposal(responses, t, 'cycle-3');
    return { t, l, canAct: opsCanAct(l), ids: parseOps(row?.choice), byFac: row?.persona === 'facilitator', rec: recorderFor(participants, responses, t, 'cycle-3') };
  });
  const waiting = rows.filter((r) => r.canAct && !r.ids);
  return (
    <Shell>
      <section className="vc-decision-room">
        <div className="eyebrow">THE OPERATIONS LAYER · THE LAST DECISION</div>
        <h1>What will it take to run what you built?</h1>
        <p className="pullback-intro">Not another capability. These are the commitments that make what you chose work on a Tuesday, paid for with the capacity you kept. A promise holds only when it is run. Each phone shows what a commitment means for Arthur, for staff and for the building.</p>
        {signal && pressed.length > 0 && <p className="small-note">Highlighted: the conditions the challenge pressed ({listJoin(pressed.map((c) => COND_LABEL[c]))}).</p>}
        <OpsCatalog pressed={pressed} />
        <div className="hb-grid">
          {rows.map((r) => {
            const stuck = r.canAct && !r.ids && late;
            const preview = opsPreview(r.l, r.ids || []);
            return (
              <article className="hb-card" key={r.t}>
                <header style={{ backgroundImage: `linear-gradient(180deg,rgba(10,34,44,.05),rgba(10,34,44,.88)),url(${r.l.hospital.image})` }}>
                  <span>TABLE {r.t}</span>
                  <h3>{r.l.hospital.name}</h3>
                  <p>{HOSPITAL_PRESSURE[r.l.hospital.id]?.line}</p>
                </header>
                <div className="hb-body">
                  <div className={`hb-status ${r.ids ? 'done' : ''} ${stuck ? 'late' : ''}`}>
                    <b>{!r.canAct ? 'NOTHING FITS' : r.ids ? (r.ids.length ? 'COMMITTED' : 'NO COMMITMENTS') : late ? 'STILL WAITING' : 'DISCUSSING'}</b>
                    <span>
                      {!r.canAct ? `Nothing fits what is left. Main constraint: ${mainConstraint(r.l)}.`
                        : r.ids ? (r.ids.length ? listJoin(r.ids.map((id) => OPS_COMMITMENTS[id].name)) : 'The table chose not to commit.') + (r.byFac ? ' · recorded by the facilitator' : '')
                        : r.rec ? `Waiting for ${briefFor(r.rec.persona).name} to record.` : 'Waiting for a table decision.'}
                    </span>
                    {stuck && <span className="nudge">90s+ · DECIDE FOR THEM?</span>}
                  </div>
                  {signal && <SignalLens lens={challengeLens(participants, responses, r.t, signal)} />}
                  <Gauges have={r.l.have} start={startOf(r.l.hospital)} pending={r.ids && r.ids.length ? opsCostOf(r.ids) : undefined} />
                  <OpsDots preview={preview} />
                  {r.ids && r.ids.length > 0 && (
                    <div className="tc-sec">
                      {r.ids.map((id) => <p key={id}><b>{OPS_COMMITMENTS[id].name}.</b> People: {OPS_COMMITMENTS[id].staff} Building: {OPS_COMMITMENTS[id].facility}</p>)}
                    </div>
                  )}
                  {r.canAct && <OpsFacControls t={r.t} responses={responses} facSave={facSave} l={r.l} />}
                </div>
              </article>
            );
          })}
        </div>
        <div className="aha-line">{rows.length - waiting.length} of {rows.length} tables are ready.</div>
        {waiting.length > 0 && <p><b>Waiting for:</b> {waiting.map((r) => `Table ${r.t}`).join(', ')}. Tables without a decision commit to nothing.</p>}
        <div className="room-actions">
          <Button disabled={waiting.length > 0} onClick={() => onAdvance('f_cards')}>{waiting.length ? 'WAITING FOR TABLE DECISIONS' : 'SEE WHAT YOUR HOSPITALS BECAME'} <ArrowRight size={18} /></Button>
          {waiting.length > 0 && <Button secondary onClick={() => onAdvance('f_cards')}>CONTINUE WITH READY TABLES</Button>}
        </div>
      </section>
    </Shell>
  );
}
function OpsDecisionPhone({ player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const key = 'cycle-3';
  const l = ledgerFor(participants, responses, table, 2);
  const signal = currentSignal(responses);
  const proposal = activeProposal(responses, table, key);
  const ids = parseOps(proposal?.choice);
  const recorder = recorderFor(participants, responses, table, key);
  const isRecorder = !recorder || recorder.id === player.id;
  const pass = latestPass(responses, table, key);
  const tookFrom = isRecorder && pass && pass.participant_id === player.id && pass.note ? briefFor(pass.note).name : '';
  const byFac = proposal?.persona === 'facilitator';
  const mine = proposal && proposal.participant_id === player.id;
  const canReopen = Boolean(ids) && !byFac && (mine || isRecorder);
  const mates = joinOrder(participants, table).filter((p) => p.id !== player.id);
  const mineNom = myResponse(responses, player.id, 'cycle_nom', key);
  const [sel, setSel] = useState(() => (mineNom?.choice ? mineNom.choice.split(',').filter((x) => OPS_COMMITMENTS[x]) : []));
  const [pending, setPending] = useState(false);
  const { saving, run } = useSaver(onSubmit);
  useEffect(() => { if (!isRecorder && pending) setPending(false); }, [isRecorder]);
  const pressed = opsPressed(signal);
  const preview = opsPreview(l, ids || sel);
  const noms = responsesOfType(responses, 'cycle_nom', key).filter((r) => validTable(r.table_number) === table);
  const tally = OPS_IDS.map((id) => ({ id, n: new Set(noms.filter((r) => String(r.choice || '').split(',').includes(id)).map((r) => r.participant_id)).size })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const toggle = async (id) => {
    if (saving || ids) return;
    const on = sel.includes(id);
    const next = on ? sel.filter((x) => x !== id) : [...sel, id];
    if (!on && !fits(l.have, opsCostOf(next))) return;
    setSel(next);
    await run('cycle_nom', next.join(','), '', key);
  };
  const record = async () => { const ok = await run('table_decision', `ops|${sel.join(',')}`, '', key); if (ok) setPending(false); };
  const take = () => run('recorder_pass', player.id, recorder?.persona || '', key);
  const passTo = (p) => run('recorder_pass', p.id, player.persona, key);
  if (!opsCanAct(l)) {
    return (
      <Shell compact>
        <section className="phone-card">
          <div className="eyebrow">THE OPERATIONS LAYER · TABLE {table}</div>
          <h1>Nothing left to commit.</h1>
          <p>What you kept does not cover any operating commitment. Your main constraint is <b>{mainConstraint(l)}</b>. What you built may hold on paper, and nothing will run it.</p>
          <Gauges have={l.have} start={startOf(l.hospital)} />
          <OpsDots preview={preview} />
          <NoteBox player={player} responses={responses} onSubmit={onSubmit} type="resequence" keyName="final" title="Look back" prompt="Which earlier decision would you sequence differently, and why?" />
        </section>
      </Shell>
    );
  }
  if (ids) {
    const after = ledgerFor(participants, responses, table, 3);
    return (
      <Shell compact>
        <section className="phone-card">
          <div className="eyebrow">THE OPERATIONS LAYER · TABLE {table} · DECISION RECORDED</div>
          <h1>{ids.length ? 'You committed to run it.' : 'You committed to nothing.'}</h1>
          <p className="small-note">Recorded by {mine ? 'you' : recordedByName(proposal)}.</p>
          <Gauges have={l.have} start={startOf(l.hospital)} pending={ids.length ? sub(l.have, after.have) : undefined} />
          <OpsDots preview={opsPreview(l, ids)} />
          {ids.length > 0 ? ids.map((id) => (
            <div className="status-card" key={id}>
              <b>{OPS_COMMITMENTS[id].name.toUpperCase()}</b>
              <p>{OPS_COMMITMENTS[id].arthur}</p>
              <p><b>Asks of people:</b> {OPS_COMMITMENTS[id].staff}</p>
              <p><b>Asks of the building:</b> {OPS_COMMITMENTS[id].facility}</p>
            </div>
          )) : <div className="status-card"><b>WHAT THIS MEANS</b>Whatever your capabilities improved for Arthur holds on paper. Nobody is named to run it.</div>}
          {canReopen && <Button secondary disabled={saving} onClick={() => run('table_decision', '', 'reopened', key)}>CHANGE OUR DECISION</Button>}
          <ReflectionBox player={player} responses={responses} onSubmit={onSubmit} />
        </section>
      </Shell>
    );
  }
  const total = opsCostOf(sel);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">THE OPERATIONS LAYER · TABLE {table} · {briefFor(player.persona).name.toUpperCase()}</div>
        <h1>What will it take to run what you built?</h1>
          {signal && <p className="lens-arthur">{SIGNAL_LENS[signal.id]?.arthur}</p>}
          {signal && <SignalLens lens={challengeLens(participants, responses, table, signal)} />}
            <PromiseChip table={table} responses={responses} ledger={l} showRun conds={false} />
          <Gauges have={l.have} start={startOf(l.hospital)} pending={sel.length ? total : undefined} />
        <OpsDots preview={preview} />
        <RecorderBar isRecorder={isRecorder} recorder={recorder} tookFrom={tookFrom} saving={saving} onTake={take} mates={mates} onPass={passTo} />
        {isRecorder && <Button disabled={saving || pending} onClick={() => setPending(true)}>RECORD FOR THE TABLE{sel.length ? ` · ${sel.length}` : ' · NO COMMITMENTS'}</Button>}
        <p className="small-note">Tap to nominate what your table should commit to. A dashed dot is an improvement nobody is running yet.</p>
        {tally.length > 0 && <p><b>Your table’s nominations:</b> {tally.map((x) => `${OPS_COMMITMENTS[x.id].name} ${x.n}`).join(' · ')}</p>}
        <div className="ops-grid">
          {OPS_IDS.map((id) => {
            const o = OPS_COMMITMENTS[id];
            const on = sel.includes(id);
            const met = opsNeedsMet(l, id);
            const can = met && (on || fits(l.have, opsCostOf([...sel, id])));
            const lim = met && !on && !can ? limitingOf(sub(l.have, total), o.cost) : null;
            return (
              <div key={id} className={`ops-card${on ? ' selected' : ''}${can ? '' : ' off'}`}>
                  <button type="button" className="ops-tap" disabled={saving || !can} onClick={() => toggle(id)}>
                    <b>{on ? '✓ ' : ''}{o.name}</b>
                    <p>{o.arthur}</p>
                    <div className="ops-covers">{o.covers.map((c) => <span key={c} className={`${pressed.includes(c) ? 'press' : ''}${promiseOf(responses, table) && PROMISE_CONDS[promiseOf(responses, table)].includes(c) ? ' mine' : ''}`}>{COND_LABEL[c]}</span>)}</div>
                  <CostLine cost={o.cost} />
                  {!met && <p className="ops-need">{o.needsText}</p>}
                  {lim && <p className="ops-need">Short on {lim.label} with what you already chose.</p>}
                </button>
                <details><summary>WHAT IT ASKS</summary><p><b>Of people:</b> {o.staff}</p><p><b>Of the building:</b> {o.facility}</p></details>
              </div>
            );
          })}
        </div>
        {pending && (
          <ConfirmSheet
            title={`Record ${sel.length ? listJoin(sel.map((id) => lc1(OPS_COMMITMENTS[id].name))) : 'no commitments'} for Table ${table}?`}
            lines={[sel.length ? 'These use the capacity you kept.' : 'Whatever your capabilities improved will hold on paper, and nobody will run it.', tally.length ? `Your table’s nominations: ${tally.map((x) => `${OPS_COMMITMENTS[x.id].name} ${x.n}`).join(' · ')}` : 'No nominations yet.', tookFrom ? `You took this turn from ${tookFrom}.` : '']}
            busy={saving}
            onConfirm={record}
            onCancel={() => setPending(false)}
          />
        )}
      </section>
    </Shell>
  );
}
const filmPicks = (participants, responses, t) => {
  const l = ledgerFor(participants, responses, t, 3);
  const cap = (id, tag, kind) => ({ id, tag, kind, img: capabilityById(id).image, name: CAP_SHORT[id] });
  return [
    ...l.invested.map((id) => cap(id, 'COMMITTED', 'committed')),
    ...l.piloted.map((id) => cap(id, 'PILOT', 'pilot')),
    ...l.prepared.map((id) => cap(id, 'PREPARED', 'prepared')),
    ...(l.ops || []).map((id) => ({ id, tag: 'RUNS', kind: 'ops', img: '', name: OPS_COMMITMENTS[id].name })),
  ];
};
function RoomPicks({ participants, responses }) {
  const tables = activeTables(participants);
  const map = {};
  tables.forEach((t) => {
    const l = ledgerFor(participants, responses, t, 3);
    l.invested.forEach((id) => { (map[id] = map[id] || []).push(`T${t} committed`); });
    l.piloted.forEach((id) => { (map[id] = map[id] || []).push(`T${t} pilot`); });
    l.prepared.forEach((id) => { (map[id] = map[id] || []).push(`T${t} prepared`); });
  });
  const ids = BYD_CAPS.filter((id) => map[id]);
  return (
    <div className="room-picks">
      <b>WHAT THE ROOM CHOSE · CAPABILITIES NO TABLE CHOSE ARE NOT SHOWN</b>
      {ids.length ? (
        <div className="mini-caps committed">
          {ids.map((id) => { const c = capabilityById(id); return <figure key={id}><img src={c.image} alt="" onError={(e) => imageFallback(e)} /><figcaption>{CAP_SHORT[id]}<br />{map[id].join(' · ')}</figcaption></figure>; })}
        </div>
      ) : <p className="mini-empty">No table chose a capability.</p>}
    </div>
  );
}

const drawSignal = (exclude) => { const pool = FUTURE_SIGNALS.filter((x) => x.id !== exclude); return pool[Math.floor(Math.random() * pool.length)]; };
function PSignalRoom({ participants, responses, onAdvance, facSave, synced = true }) {
  const signal = currentSignal(responses);
  const tables = activeTables(participants);
  const revealed = challengeRevealed(responses);
  const drawn = useRef(false);
  /* The challenge is always drawn at random, once, when the room reaches this screen. The draw is stored, so a refresh cannot change it. */
  useEffect(() => {
    if (!synced || signal || drawn.current || !facSave) return;
    drawn.current = true;
    Promise.resolve(facSave('signal', 'room', 1, drawSignal().id, 'random')).catch(() => { drawn.current = false; });
  }, [signal, facSave, synced]);
  if (signal && !revealed) {
    return (
      <Shell>
        <section className="challenge-beat" style={{ '--ci': `url(${challengeImage(signal)}), url(${challengeFallback(signal)})` }}>
          <div className="challenge-copy">
            <div className="eyebrow">THE CHALLENGE</div>
            <h1>{signal.title}</h1>
            <p>{signal.text}</p>
            <div className="challenge-ask">{SIGNAL_LENS[signal.id]?.arthur || CHALLENGE_PROMPT}<small>Discuss at your table before the reveal.</small></div>
          </div>
        </section>
        <div className="room-actions"><Button onClick={() => facSave('signal_reveal', 'room', 1, 'shown')}>REVEAL WHAT IT MEANS FOR EACH HOSPITAL <ArrowRight size={18} /></Button></div>
        <div className="room-actions"><button type="button" className="redraw-link" onClick={() => facSave('signal', 'room', 1, drawSignal(signal.id).id, 'random')}>DRAW A DIFFERENT CHALLENGE</button></div>
      </Shell>
    );
  }
  if (!signal) {
    return (
      <Shell>
        <section className="pullback-hero">
          <div className="eyebrow">THE CHALLENGE</div>
          <h1>Something changes before the final cycle.</h1>
          <p className="pullback-intro">Drawing the challenge…</p>
        </section>
      </Shell>
    );
  }
  return (
    <Shell>
      <section>
        <div className="signal-hero has-img" style={{ '--ci': `url(${challengeImage(signal)}), url(${challengeFallback(signal)})` }}>
          <div className="eyebrow">THE CHALLENGE</div>
          <h1>{signal.title}</h1>
          <p>{signal.text}</p>
          <p className="challenge-arthur">{SIGNAL_LENS[signal.id]?.arthur}</p>
          <p className="small-note">{signal.kind === 'shock' ? 'What protects you:' : 'Capabilities that respond:'} {listJoin(capNames(signal.responds))}</p>
        </div>
        <TableCards tables={tables} render={(t) => {
          const st = standingText(signalStanding(participants, responses, t, signal));
          const before = ledgerFor(participants, responses, t, 2, { preSignal: true });
          const l = ledgerFor(participants, responses, t, 2);
          return (<>{tableHead(t)}<SignalLens lens={challengeLens(participants, responses, t, signal)} /><h3>{st.head}</h3><p className="small-note">{st.detail}</p><ResStrip have={l.have} before={signal.kind === 'shock' ? before.have : undefined} /></>);
        }} />
        <div className="aha-line">{signal.kind === 'shock' ? 'Foundations rarely look urgent until the day they are.' : 'The capacity you kept decides how well you can run what you have built.'}</div>
        <NextButton onAdvance={onAdvance} to="p3_decide">DECIDE HOW TO RUN WHAT YOU HAVE</NextButton>
        <div className="room-actions"><button type="button" className="redraw-link" onClick={() => facSave('signal_reveal', 'room', 1, 'hidden')}>REPLAY THE CHALLENGE</button></div>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   STEP 8 · DEBRIEF · four reveals, then the side-by-side summary
   --------------------------------------------------------------------- */

const unresolvedNeed = (l) => {
  const open = CAPABILITIES.filter((c) => !l.invested.includes(c.id))
    .map((c) => ({ c, rank: fitRank(fitFor(c.id, l.hospital.id).level), prepared: l.prepared.includes(c.id) }))
    .sort((a, b) => b.rank - a.rank);
  return open[0] || null;
};

function FTurnsRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL 2 OF 4 · TURNING POINTS</div>
        <h1>Which decisions shaped everything after them?</h1>
        <TableCards tables={tables} render={(t) => (<>{tableHead(t)}<TurnList items={turningPoints(participants, responses, t, signal)} /></>)} />
        <div className="aha-line">Earlier choices did not just cost something. They decided what came next.</div>
        <NextButton onAdvance={onAdvance} to="f_locks">REVEAL WHAT THE BUILDING LOCKS IN</NextButton>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   ROUND 2.8 · FIVE YEARS ON + WHAT THE BUILDING LOCKS IN, as pictures
   --------------------------------------------------------------------- */
const CAP_SHORT = { 'virtual-care': 'Virtual Care', 'ambient-intelligence': 'Ambient', 'smart-rooms': 'Smart Rooms', 'autonomous-logistics': 'Logistics', 'predictive-operations': 'Command Center', 'care-platform': 'Foundation' };
const LOCK_SHORT = {
  'virtual-care': ['Which rooms are remote-ready', 'Screens and carts'],
  'ambient-intelligence': ['Quiet, private consult rooms', 'Capture device, software'],
  'smart-rooms': ['Room standard: power, data', 'Controls and displays'],
  'autonomous-logistics': ['Routes, elevators, staging', 'Vehicles, fleet size'],
  'predictive-operations': ['Command center space, and space that can flex', 'Dashboards and software'],
  'care-platform': ['Tech rooms and pathways', 'Vendors and applications'],
};
const ICON_PATH = {
  access: <path d="M4 8h14m-4-4 4 4-4 4M20 16H6m4-4-4 4 4 4" />,
  workforce: <><circle cx="12" cy="8" r="3.2" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></>,
  experience: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  resilience: <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />,
  adaptability: <path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  protect: <path d="M12 3l8 9-8 9-8-9z" />,
  swap: <path d="M4 8h14m-4-4 4 4-4 4M20 16H6m4-4-4 4 4 4" />,
};
function Icon({ id }) { return <svg viewBox="0 0 24 24" aria-hidden="true">{ICON_PATH[id]}</svg>; }

/* ---------------------------------------------------------------------
   BY DESIGN · TEAM ARTHUR · brief, baseline, promise, design decision, cards, team card
   --------------------------------------------------------------------- */
function ArthurBrief({ both = false, compact = false }) {
  return (
    <div className="arthur-brief">
      <span className="tlabel">TEAM ARTHUR · THE SHARED BRIEF</span>
      <blockquote>“{ARTHUR.voice}”</blockquote>
      {!compact && <p className="small-note">{ARTHUR.source}</p>}
      {both && (
        <>
          <span className="tlabel">THE PERSON THE EASY ANSWER MISSES · A COMPOSITE, NOT PART OF ARTHUR’S STORY</span>
          <blockquote>“{ARTHUR.second}”</blockquote>
        </>
      )}
      <p><b>The test every role must answer:</b> {ARTHUR.test}</p>
      {compact ? <details><summary>MORE</summary><p className="small-note">{ARTHUR.source} {ARTHUR.limit}</p></details> : <p className="small-note">{ARTHUR.limit}</p>}
    </div>
  );
}
const baselineWord = (hid, s) => BASELINE_WORD[s];
function BaselineListOld({ hid, compact = false }) {
  return (
    <div className={`cond-list base${compact ? ' compact' : ''}`}>
      {COND_IDS.map((c) => {
        const s = { 2: 'H', 1: 'S', 0: 'X' }[ARTHUR_BASELINE[hid][c]];
        return (
          <div key={c} className={`cond cond-${s}`}>
            <span>{COND_LABEL[c]}</span><b>{baselineWord(hid, s)}</b>
            {!compact && BASELINE_TEXT[hid][c] && <small>{BASELINE_TEXT[hid][c]}</small>}
          </div>
        );
      })}
    </div>
  );
}
function OwnerPicker({ cap, kind, design, setDesign }) {
  const d = optionDetail(cap, kind);
  return (
    <div className="owner-picker">
      <p><b>WHO OWNS THIS ON TUESDAY?</b> One tap. The owner shows on the Tuesday card. It does not make the service run: funding the people who run it is the operations layer at the end.</p>
      <div className="approve-chips">
        {ROLE_ORDER.map((p) => <button type="button" key={p} className={design.owner === p ? 'active' : ''} onClick={() => setDesign({ ...design, owner: design.owner === p ? '' : p })}>{briefFor(p).name}</button>)}
      </div>
      <p className="small-note"><b>What it asks of people:</b> {d.wf} <b>Governance:</b> {d.gov}</p>
    </div>
  );
}
function DesignPanel({ cap, kind, design, setDesign, inheritedAlt }) {
  const copy = ALT_COPY[cap.id];
  const pick = (k) => setDesign({ ...design, alt: k });
  return (
    <div className="design-panel">
      <p className="design-head"><b>THE DESIGN DECISION</b> · <i>{BYD_MOMENT[cap.id]}</i></p>
      {SERVICE_REQUIREMENTS[cap.id] && <p className="small-note">{SERVICE_REQUIREMENTS[cap.id]}</p>}
      {inheritedAlt ? (
        <div className="alt-card selected"><b>{copy[inheritedAlt].name}</b><small>Chosen when the pilot began. Scaling keeps it.</small></div>
      ) : (
        <div className="alt-grid" role="radiogroup" aria-label="How will it be designed?">
          {['A', 'B'].map((k) => {
            const a = copy[k];
            return (
              <div key={k} role="radio" aria-checked={design.alt === k} tabIndex={0} className={`alt-card${design.alt === k ? ' selected' : ''}`} onClick={() => pick(k)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(k); } }}>
                <span className="alt-k">{k}</span>
                <b>{a.name}</b>
                <small>{a.what}</small>
                <dl>
                  <dt>REACH</dt><dd>{a.reach}</dd>
                  <dt>CAN RAISE</dt><dd>{raisesText(cap.id, k)}</dd>
                  <dt>SUPPORTS IT WHEN</dt><dd>{a.when}</dd>
                  <dt>ITS OWN LIMIT</dt><dd>{a.limit}</dd>
                  <dt>BEAUTY IT DESIGNS IN</dt><dd>{a.beauty}</dd>
                </dl>
              </div>
            );
          })}
        </div>
      )}
      <OwnerPicker cap={cap} kind={kind} design={design} setDesign={setDesign} />
    </div>
  );
}
function ConditionRows({ report, compact = false }) {
  return (
    <div className={`cond-list${compact ? ' compact' : ''}`}>
      {COND_IDS.map((c) => {
        const x = report.conditions[c];
        return (
          <div key={c} className={`cond cond-${x.state}`}>
            <span>{x.label}</span><b>{STATE_WORD[x.state]}</b>
            <em>{x.change}</em>
            {!compact && <small>{x.cause ? `${x.cause}.` : x.change === 'Improved' && x.byText.length ? listJoin(x.byText) : x.change === 'Kept' ? 'Already worked, and still does.' : COND_DESC[c]}</small>}
          </div>
        );
      })}
    </div>
  );
}
/* BY DESIGN 0.5 · the challenge through Arthur's lens, the promise as two moments, a lighter result card. */
const PROMISE_MOMENTS = { P1: ['C1', 'C2'], P2: ['C3', 'C4'], P3: ['C5', 'C6'] };
/* Which of Arthur's conditions each challenge presses on. Draft reading of the build's own capability lists; edit freely. */
const SIGNAL_LENS = {
  'demand-surge': { conds: ['C2'], arthur: 'A neighboring hospital has closed. If Arthur has to come back, he is competing with everyone else for the same beds.' },
  'virtual-shift': { conds: ['C1', 'C3', 'C4'], arthur: 'Follow-up is now a virtual visit by default. Can Arthur hear it, and can he speak privately?' },
  cyber: { conds: ['C1', 'C2'], arthur: 'The systems are down. Does anyone still notice a change at his follow-up, and can anyone reach him?' },
  workforce: { conds: ['C5', 'C4'], arthur: 'Fewer people on every shift. Who answers at 2 a.m., and who has time for a private conversation?' },
};
const challengeLens = (participants, responses, t, signal) => {
  const l = ledgerFor(participants, responses, t, 2);
  const ev = bydEvaluate(l.hospital.id, bydStatus(l), bydAlts(l), false);
  const def = SIGNAL_LENS[signal.id] || { conds: [], arthur: CHALLENGE_PROMPT };
  const conds = def.conds.map((c) => ({ id: c, label: COND_LABEL[c], state: ev.cs[c].state }));
  return { conds, exposed: conds.filter((x) => x.state !== 'H'), arthur: def.arthur, pressure: HOSPITAL_PRESSURE[l.hospital.id]?.line || '' };
};
function SignalLens({ lens }) {
  return (
    <div className="lens">
      <div className="lens-chips">{lens.conds.map((c) => <span key={c.id} className={`st-chip cond-${c.state}`}>{c.label} · {STATE_WORD[c.state]}</span>)}</div>
      <p className="lens-line">{lens.exposed.length ? lens.pressure : 'What it presses on holds today. The question is what keeps it holding.'}</p>
    </div>
  );
}
function PromiseMoments({ p, mini = false }) {
  return (
    <div className={`pm-pair${mini ? ' mini' : ''}`}>
      {PROMISE_MOMENTS[p].map((c) => (
        <figure key={c}>
          <img src={momentImage(c)} alt="" onError={(e) => imageFallback(e, momentFallback(c))} />
          {!mini && <figcaption><b>{COND_LABEL[c]}</b>{BYD_CARDS[c].title}</figcaption>}
        </figure>
      ))}
    </div>
  );
}
function TeamCard({ t, participants, responses, signal }) {
  const tc = bydTeamCard(participants, responses, t, signal);
  const h = tc.hospital;
  const hero = tc.frame.img;
  const sec = (title, items, empty) => (
    <div className="tc-sec"><b>{title}</b>{items.length ? items.map((x) => <p key={x}>{x}</p>) : <p className="small-note">{empty}</p>}</div>
  );
  const improvedAny = tc.improved.length > 0;
  return (
    <article className={`fut-card team-card${tc.promise.status === DESIGNED ? ' paper' : ''}`}>
      <header style={{ backgroundImage: `linear-gradient(180deg,rgba(10,34,44,.05) 20%,rgba(10,34,44,.92)),url(${hero}),url(${frameFallbackFor(tc.frame.key)}),url(${h.image})` }}>
        <span>TEAM ARTHUR · TABLE {t} · {h.name}</span>
        {tc.promise.status === DESIGNED && <i className="paper-ribbon">DESIGNED · NOT YET OPERATIONAL</i>}
        <h2>{tc.headline}</h2>
      </header>
      <div className="tc-body">
        <p className="tc-says">{tc.frame.lines.join(' ')}</p>
          <p className="tc-sp"><b>WHO STILL CANNOT USE WHAT WE DESIGNED?</b> {tc.spText}</p>
        <div className="cdots">
          {COND_IDS.map((c) => { const needs = (tc.conditions[c].state === 'H' || tc.conditions[c].state === 'PP') && tc.conditions[c].change === 'Improved'; const paper = tc.ops.onPaperIds.includes(c); return <div key={c} className={`cdot cond-${tc.conditions[c].state}${paper ? ' paper' : ''}`}><b>{COND_LABEL[c]}</b><em>{STATE_WORD[tc.conditions[c].state]}</em>{needs && <small>{paper ? 'ON PAPER' : 'RUN'}</small>}</div>; })}
        </div>
        {!improvedAny && tc.setup.length > 0 && <p className="tc-setup"><b>What you set up for him.</b> {tc.setup.slice(0, 2).join(' ')}</p>}
        {!improvedAny && tc.setup.length === 0 && <p className="tc-setup"><b>Nothing is different for Arthur yet.</b> Nothing was prepared or started.</p>}
          {tc.ops.onPaper.length > 0
            ? <p className="tc-setup"><b>On paper, not run.</b> {listJoin(tc.ops.onPaper)}: nothing operates {tc.ops.onPaper.length > 1 ? 'them' : 'it'} on Tuesday.</p>
            : tc.ops.chosen.length > 0 ? <p className="tc-setup"><b>Kept running by.</b> {listJoin(tc.ops.chosen.map((o) => lc1(o.name)))}.</p> : null}
        <div className="sfb-mini">
          <div><b>{ARTHUR_SAYS.Strength}</b>{tc.sfb.strength.length ? 'Provision secured and devices kept changeable.' : 'Nothing prepared yet.'}</div>
          <div><b>{ARTHUR_SAYS.Function}</b>{tc.sfb.func[0]}</div>
          <div><b>{ARTHUR_SAYS.Beauty}</b>{tc.sfb.beauty.length ? tc.sfb.beauty[0] : 'Nothing designed in beyond what the rooms had.'}</div>
        </div>
        <div className="tc-sec q"><b>QUESTION FOR THE NEXT TABLE</b><p>{tc.question}</p></div>
        <details className="fut-why">
          <summary>WHY · THE FULL READING</summary>
          <div className="promise-chips">
            {tc.promises.map((p) => <span key={p.id} className={`pchip pchip-${FRAME_KEY[p.status]}${p.chosen ? ' chosen' : ''}`}>{p.chosen ? '★ ' : ''}{PROMISES[p.id].name}<b>{p.status.toUpperCase()}</b></span>)}
          </div>
          <p><b>{tc.spText}</b></p>
          {tc.promise.defaulted && <p className="small-note">No promise was chosen, so the first promise is shown.</p>}
          <ConditionRows report={tc} />
          {sec('WHAT IMPROVED', tc.improved, 'No condition improved.')}
          {sec('WHAT YOU SET UP, NOT YET FELT', tc.setup, 'Nothing prepared or piloted.')}
          {sec('WHAT GOT HARDER, AND WHY', tc.harder, 'Nothing fell below where it started.')}
          {sec('WHAT IS STILL LIMITED', tc.limited, 'Every condition holds.')}
            <div className="tc-sec"><b>WHAT KEEPS IT RUNNING</b>{tc.ops.chosen.length ? tc.ops.chosen.map((o) => <p key={o.name}>{o.name}: {o.arthur} Asks of people: {o.staff} Asks of the building: {o.facility}</p>) : <p className="small-note">No operating commitments were made.</p>}</div>
          <div className="tc-sec">
            <b>WHO RUNS THIS ON TUESDAY</b>
            {tc.commits.length ? tc.commits.map((c) => <p key={c.cap}>{c.name} ({c.alt}): {c.owner ? `${c.ownerName} owns it.` : 'No owner named.'}{c.byFacilitator ? ' Recorded by the facilitator, so alternative A was assumed.' : ''}</p>) : <p className="small-note">Nothing committed, so nothing to run.</p>}
            <p className="small-note">Capacity kept to absorb a change: {RES_KEYS.map((k, i) => `${RES_SHORT[i]} ${tc.l.have[i]}`).join(' · ')}</p>
          </div>
          <div className="tc-sfb">
            <div><b>STRENGTH</b><small>Can he depend on it when circumstances change?</small>{tc.sfb.strength.length ? tc.sfb.strength.slice(0, 4).map((x) => <p key={x}>{x}</p>) : <p className="small-note">Nothing was prepared and no device was kept changeable by design.</p>}</div>
            <div><b>FUNCTION</b><small>Can he complete the care task, including the handoffs?</small>{tc.sfb.func.map((x) => <p key={x}>{x}</p>)}</div>
            <div><b>BEAUTY</b><small>Does it help him feel human, connected and at ease?</small>{tc.sfb.beauty.length ? tc.sfb.beauty.map((x) => <p key={x}>{x}</p>) : <p className="small-note">No Beauty was designed in beyond what the rooms already had.</p>}</div>
          </div>
        </details>
      </div>
    </article>
  );
}
function FFutureRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">TEAM ARTHUR · WHAT CHANGED FOR HIM</div>
        <h1>Did the promise hold, and what did the design contribute?</h1>
        <p className="pullback-intro">No score. One image, one sentence and six conditions per table. Open “Why” for the full reading.</p>
        <div className="fut-grid">{tables.map((t) => <TeamCard key={t} t={t} participants={participants} responses={responses} signal={signal} />)}</div>
        <div className="aha-line">Arthur experiences the design decisions we make long before he arrives.</div>
        <p className="building-q">Which decision changed Arthur’s experience, and when did we need to make it?</p>
        <NextButton onAdvance={onAdvance} to="f_locks">REVEAL WHAT THE BUILDING LOCKS IN</NextButton>
      </section>
    </Shell>
  );
}
/* ----- Choose the care promise ----- */
const attainText = (hid, pid) => {
  const a = ATTAINABLE[hid]?.[pid];
  if (!a) return '';
  if (a.held) return 'Already held here. Protect it.';
  if (a.min === null) return 'Not reachable this planning period.';
  if (pid === 'P1' && a.min >= 2) return 'Several things have to line up, then it has to be run.';
  return `Reachable with at least ${a.min} full investment${a.min === 1 ? '' : 's'}, then it has to be run.`;
};
/* BY DESIGN 0.9.2 · how hard a promise is to reach in each hospital. From the exhaustive check of every three-decision path
   in the 0.9 engine (Aging P1 3 of about 16,500 paths, Distributed P1 4 of about 19,200, Regional P1 130 of about 19,200,
   Greenfield P3 236 of about 19,300, Greenfield P1 none). Edit this table if the engine changes. */
const PROMISE_HARDNESS = {
  academic: { P1: ['VERY HARD HERE', 'x'] },
  regional: { P1: ['HARD HERE', 'hard'] },
  distributed: { P1: ['VERY HARD HERE', 'x'] },
  greenfield: { P1: ['NOT REACHABLE HERE', 'out'], P3: ['HARD HERE', 'hard'] },
};
function DiffTag({ hid, pid }) {
  const t = PROMISE_HARDNESS[hid]?.[pid];
  return t ? <i className={`diff-tag diff-${t[1]}`}>{t[0]}</i> : null;
}
function PromiseRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">TEAM ARTHUR · THE CARE PROMISE</div>
        <h1>Which care promise will your team focus on making reliable for Arthur?</h1>
        <p className="pullback-intro">Each promise rests on two moments. Choosing one does not drop the others. It holds only when both work and someone is funded to run it. Agree out loud, then record it on the phone.</p>
        <div className="pm-trio">
          {PROMISE_IDS.map((p) => <article className="pm-card" key={p}><h3>{PROMISES[p].name}</h3><PromiseMoments p={p} /></article>)}
        </div>
        <div className="promise-grid">
          {tables.map((t) => {
            const h = hospitalForTable(t);
            const ch = latestTableRow(responses, t, 'table_promise', 'promise');
            return (
              <article className="promise-card" key={t}>
                {tableHead(t)}
                <h3>{ch?.choice && PROMISES[ch.choice] ? `Chose: ${PROMISES[ch.choice].name}` : 'Deciding…'}</h3>
                {PROMISE_IDS.map((p) => (
                  <div key={p} className={`promise-row${ch?.choice === p ? ' chosen' : ''}`}>
                    <b>{PROMISES[p].name}</b>
                    <DiffTag hid={h.id} pid={p} /><small>{attainText(h.id, p)}</small>
                  </div>
                ))}
              </article>
            );
          })}
        </div>
        <div className="aha-line">Attainable is not the same as easy. Look at which promise your hospital can reach, and which it already holds.</div>
        <NextButton onAdvance={onAdvance} to="cap_nominate">OPEN THE CAPABILITY PORTFOLIO</NextButton>
      </section>
    </Shell>
  );
}
function PromisePhone({ player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const h = HOSPITALS[player.hospital_id] || hospitalForTable(table) || HOSPITALS.academic;
  const ch = latestTableRow(responses, table, 'table_promise', 'promise');
  const { saving, err, setErr, run } = useSaver(onSubmit);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">TEAM ARTHUR · TABLE {table || '—'} · THE CARE PROMISE</div>
        <h1>Which promise will your team focus on?</h1>
        <p>Agree out loud, then tap once for the table. Anyone can record it, and the latest tap wins.</p>
        <h3>WHAT ARTHUR IS UP AGAINST HERE</h3>
        <BaselineList hid={h.id} compact />
        <div className="promise-stack">
          {PROMISE_IDS.map((p) => {
            const held = ATTAINABLE[h.id]?.[p]?.held;
            return (
              <button type="button" key={p} disabled={saving || held} className={`promise-pick${ch?.choice === p ? ' selected' : ''}${held ? ' held' : ''}`} onClick={() => run('table_promise', p, '', 'promise')}>
                <PromiseMoments p={p} mini />
                <b>{PROMISES[p].name}</b>
                <span className="pm-names">{COND_LABEL[PROMISE_MOMENTS[p][0]]} + {COND_LABEL[PROMISE_MOMENTS[p][1]]}</span>
                <DiffTag hid={h.id} pid={p} /><em>{attainText(h.id, p)}</em>
              </button>
            );
          })}
        </div>
        {ch?.choice && PROMISES[ch.choice] && <div className="submitted-mark"><Check size={16} /> YOUR TABLE CHOSE · {PROMISES[ch.choice].name}</div>}
        {err && <div className="toast" onClick={() => setErr('')}>{err} · Tap to dismiss and try again.</div>}
      </section>
    </Shell>
  );
}
/* BY DESIGN 0.3 · Meet Arthur, hospital pressures, Arthur’s voice.
   Images: public/intro/home.png, drift.png, return.png. If missing, the scale images stand in. */
const ARTHUR_INTRO = [
  { id: 'home', file: 'home', fallback: 'scales/ecosystem', title: 'Arthur is going home.', text: 'He has had heart surgery. Today he leaves the hospital with his wife.' },
  { id: 'drift', file: 'drift', fallback: 'scales/room', title: 'For days, nothing dramatic happens.', text: 'Then his recovery starts to drift. It is subtle, and Arthur may not notice it himself.' },
  { id: 'return', file: 'return', fallback: 'scales/facility', title: 'If he needs to come back, will it be in time?', text: 'At each scheduled follow-up, someone has to notice a change. Someone has to reach him. A person and a place have to be ready.' },
];

/* One named pressure per hospital, taken from the build’s own BASELINE_TEXT and NEED_LINE. */
const HOSPITAL_PRESSURE = {
  academic: { line: 'Arthur’s specialists are overcommitted, and renovation takes beds out of service.' },
  regional: { line: 'Follow-up means hours of travel, and referral beds fill before the day is half over.' },
  distributed: { line: 'The sites do not connect, so his information does not follow him.' },
  greenfield: { line: 'No operating history yet. Every part of Arthur’s care has to be decided before the first patient arrives.' },
};

/* Strength, Function, Beauty in Arthur’s voice. Used as the caption on each moment card. */
const ARTHUR_SAYS = { Strength: 'I can depend on it.', Function: 'It works for me.', Beauty: 'I feel human here.' };
const arthurSays = (stress) => String(stress || '').split(' and ').map((s) => ARTHUR_SAYS[s.trim()]).filter(Boolean).join(' ');

const introImage = (b) => `${BASE}intro/${b.file}.png`;
const introFallback = (b) => `${BASE}${b.fallback}.png`;

function PressureLine({ hid }) {
  const p = HOSPITAL_PRESSURE[hid];
  if (!p) return null;
  return <div className="pressure-line"><b>{p.line}</b></div>;
}

/* The six-cell baseline is retired from player-facing screens. The baseline still drives the engine (ARTHUR_BASELINE).
   The three old call sites now show the one named pressure instead. */
function BaselineList({ hid }) {
  return <PressureLine hid={hid} />;
}

function IntroScene({ step }) {
  if (step >= ARTHUR_INTRO.length) {
    return (
      <section className="signal-hero intro-final">
        <div className="eyebrow">MEET ARTHUR · WHAT TODAY IS ABOUT</div>
        <KeyStatement />
        <p className="intro-quote-small"><span>WHAT ARTHUR IS LOOKING FOR</span>“{ARTHUR.voice}”</p>
        <details className="intro-more"><summary>MORE · WHAT THIS GAME COVERS</summary><p className="small-note">Your table decides what stands between that drift and Arthur getting back in time. {ARTHUR.limit}</p></details>
      </section>
    );
  }
  const b = ARTHUR_INTRO[step];
  return (
    <section className="challenge-beat" style={{ '--ci': `url(${introImage(b)}), url(${introFallback(b)})` }}>
      <div className="challenge-copy">
        <div className="eyebrow">MEET ARTHUR · {step + 1} OF {ARTHUR_INTRO.length}</div>
        <h1>{b.title}</h1>
        <p>{b.text}</p>
      </div>
    </section>
  );
}

function ArthurIntroRoom({ onAdvance }) {
  const [step, setStep] = useState(0);
  const total = ARTHUR_INTRO.length;
  return (
    <Shell>
      <IntroScene step={step} />
      <div className="room-actions">
        {step > 0 && <Button secondary onClick={() => setStep(step - 1)}>BACK</Button>}
        {step < total
          ? <Button onClick={() => setStep(step + 1)}>{step === total - 1 ? 'WHAT ARTHUR IS LOOKING FOR' : 'NEXT'} <ArrowRight size={18} /></Button>
          : <Button onClick={() => onAdvance('context')}>REVEAL YOUR HOSPITALS <ArrowRight size={18} /></Button>}
      </div>
    </Shell>
  );
}

function ArthurIntroPhone({ player }) {
  const table = validTable(player.table_number);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">MEET ARTHUR · TEAM ARTHUR · TABLE {table || '—'}</div>
        <KeyStatement compact />
        <h1>Meet Arthur.</h1>
        {ARTHUR_INTRO.map((b) => (
          <article className="moment-card" key={b.id}>
            <img className="moment-img" src={introImage(b)} alt="" onError={(e) => imageFallback(e, introFallback(b))} />
            <div className="moment-body"><b className="intro-beat">{b.title}</b><p>{b.text}</p></div>
          </article>
        ))}
        <div className="arthur-brief">
          <span className="tlabel">WHAT ARTHUR IS LOOKING FOR</span>
          <blockquote>“{ARTHUR.voice}”</blockquote>
        </div>
        <details className="intro-more"><summary>MORE · WHAT THIS GAME COVERS</summary><p className="small-note">{ARTHUR.limit}</p></details>
      </section>
    </Shell>
  );
}

/* ----- The moments: image first, then what it tests ----- */
function MomentImage({ id, className = '' }) {
  return <img className={`moment-img ${className}`} src={momentImage(id)} alt="" onError={(e) => imageFallback(e, momentFallback(id))} />;
}
function MomentCard({ id, tc, reveal }) {
  const card = BYD_CARDS[id];
  const out = momentOutcome(tc, id);
  const resolved = out !== 'stress';
  const held = BYD_HELD[id];
  const src = resolved ? heldImage(id) : momentImage(id);
  const title = resolved ? held.title : card.title;
  const scene = resolved ? held.scene : card.image;
  const tag = out === 'paper' ? 'DESIGNED · NOT YET OPERATIONAL' : out === 'pilot' ? 'PROVEN IN PILOT · ONE UNIT' : '';
  return (
    <article className={`moment-card${out === 'paper' ? ' paper' : ''}`}>
      <div className="moment-imgwrap">
        <img className="moment-img" src={src} alt="" onError={(e) => imageFallback(e, resolved ? momentImage(id) : momentFallback(id))} />
        {tag && <span className="moment-tag">{tag}</span>}
        <p className="moment-cap">{scene}</p>
      </div>
      <div className="moment-body">
        <div className="moment-top"><Trio stress={card.stress} />{id !== 'tuesday' && <span className="tlabel">{COND_LABEL[id].toUpperCase()}</span>}</div>
        <h3>{title}</h3>
        <p className="arthur-says">“{arthurSays(card.stress)}”</p>
        {reveal && tc && (
          <div className="moment-reads">
            <b>WHAT IT TESTS · {card.tests.toUpperCase()}</b>
            {id !== 'tuesday' && <span className={`st-chip cond-${tc.conditions[id].state}`}>{STATE_WORD[tc.conditions[id].state]}</span>}
            {id === 'tuesday' && tc.tuesday && <span className={`st-chip cond-${tc.tuesday}`}>{tc.tuesday === 'H' ? 'All owned' : tc.tuesday === 'S' ? 'Some unowned' : 'No owners'}</span>}
            {id === 'tuesday' ? <OwnerRows tc={tc} /> : <p>{cardReading(tc, id)}</p>}
          </div>
        )}
      </div>
    </article>
  );
}
function FCardsRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  const [step, setStep] = useState(0);
  const cards = tables.map((t) => bydTeamCard(participants, responses, t, signal));
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">THE MOMENTS · IMAGE FIRST, THEN WHAT IT TESTS</div>
        <h1>{step < 2 ? 'Who runs this on Tuesday?' : 'Same Arthur. Each table meets the moment its own choices left lowest.'}</h1>
        {step >= 2 && <p className="pullback-intro">Each card is the lowest condition inside the promise the table chose. Same Arthur, same need: what decided what he experienced?</p>}
        {step < 2 ? (
          <div className="moment-wide">
            <MomentCard id="tuesday" tc={cards[0]} reveal={false} />
            {step >= 1 && (
              <div className="moment-tables">
                {tables.map((t, i) => (
                  <div key={t} className="tcard"><span className="tlabel">TABLE {t} · {hospitalForTable(t).name}</span><OwnerRows tc={cards[i]} /></div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="moment-grid">
            {tables.map((t, i) => (
              <div key={t}><span className="tlabel">TABLE {t} · {hospitalForTable(t).name}</span><MomentCard id={cards[i].selected} tc={cards[i]} reveal={step >= 3} /></div>
            ))}
          </div>
        )}
        <div className="room-actions">
          {step > 0 && <Button secondary onClick={() => setStep(step - 1)}>BACK</Button>}
          {step < 3 ? <Button onClick={() => setStep(step + 1)}>{step === 0 ? 'SHOW WHAT IT TESTS' : step === 1 ? 'SHOW EACH TABLE’S OWN MOMENT' : 'SHOW WHAT IT TESTS'} <ArrowRight size={18} /></Button> : <Button onClick={() => onAdvance('f_future')}>SEE ARTHUR’S RESULT <ArrowRight size={18} /></Button>}
        </div>
      </section>
    </Shell>
  );
}
function FCardsPhone({ player, participants, responses }) {
  const table = validTable(player.table_number);
  const tc = bydTeamCard(participants, responses, table, currentSignal(responses));
  const [step, setStep] = useState(0);
  const id = step < 2 ? 'tuesday' : tc.selected;
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">THE MOMENTS · TEAM ARTHUR · TABLE {table || '—'}</div>
        <MomentCard id={id} tc={tc} reveal={step === 1 || step === 3} />
        <div className="action-row">
          {step < 3 && <Button onClick={() => setStep(step + 1)}>{['SHOW WHAT IT TESTS', 'NEXT: YOUR OWN MOMENT', 'SHOW WHAT IT TESTS'][step]}</Button>}
          {step > 0 && <Button secondary onClick={() => setStep(step - 1)}>BACK</Button>}
        </div>
        <p className="small-note">The room is on the same moment. Look at the image first, then read what it tests.</p>
      </section>
    </Shell>
  );
}

function LockTile({ c, tag, text, img }) {
  return (
    <figure className="lk-tile">
      <img src={img} alt="" onError={(e) => imageFallback(e, c.image)} />
      {tag && <em>{tag}</em>}
      <figcaption>{text}</figcaption>
    </figure>
  );
}
function LockCol({ cls, icon, title, tiles, empty }) {
  const shown = tiles.slice(0, 3);
  return (
    <div className={`lk-col ${cls}`}>
      <h3><span className="ico"><Icon id={icon} /></span>{title}</h3>
      <div className="lk-tiles">
        {shown.length ? shown : <p className="lk-empty">{empty}</p>}
        {tiles.length > 3 && <p className="lk-more">+{tiles.length - 3} more</p>}
      </div>
    </div>
  );
}
function LocksCard({ t, participants, responses }) {
  const l = ledgerFor(participants, responses, t, 3);
  const h = l.hospital;
  const now = l.invested.map(capabilityById);
  const prot = [...l.prepared.map((id) => ({ c: capabilityById(id), tag: 'PREPARED' })), ...l.piloted.map((id) => ({ c: capabilityById(id), tag: 'PILOT' }))];
  const keep = [...new Set([...l.invested, ...l.prepared, ...l.piloted])].map(capabilityById);
  return (
    <article className="lk-card">
      <div className="lk-head">
        <div><small>TABLE {t}</small><h2>{h.name}</h2></div>
        <b>{now.length} LOCKED · {prot.length} PROTECTED · {keep.length} KEEP OPEN</b>
      </div>
      <div className="lk-band">
        <LockCol cls="lk-now" icon="lock" title="DECIDE NOW" empty="Nothing locked yet" tiles={now.map((c) => <LockTile key={c.id} c={c} tag="COMMITTED" img={preparedImage(c)} text={`${CAP_SHORT[c.id]} · ${LOCK_SHORT[c.id][0]}`} />)} />
        <LockCol cls="lk-prot" icon="protect" title="PROTECT WHILE DEFERRED" empty="No provisions protected" tiles={prot.map(({ c, tag }) => <LockTile key={c.id} c={c} tag={tag} img={preparedImage(c)} text={`${CAP_SHORT[c.id]} · ${LOCK_SHORT[c.id][0]}`} />)} />
        <LockCol cls="lk-keep" icon="swap" title="KEEP CHANGEABLE" empty="Nothing to keep open yet" tiles={keep.map((c) => <LockTile key={c.id} c={c} img={c.image} text={LOCK_SHORT[c.id][1]} />)} />
      </div>
    </article>
  );
}
function FLocksRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL 2 OF 3 · WHAT YOUR BUILDING LOCKS IN</div>
        <h1>Your portfolio became design commitments.</h1>
        {tables.map((t) => <LocksCard key={t} t={t} participants={participants} responses={responses} />)}
        <div className="aha-line">Technology strategy became operating strategy. Operating strategy became design.</div>
        <NextButton onAdvance={onAdvance} to="f_compare">SEE ALL HOSPITALS SIDE BY SIDE</NextButton>
      </section>
    </Shell>
  );
}



  /* ---------------------------------------------------------------------
   VISUAL LANGUAGE · Round 2.3 · image tiles, gauges, hospital cards
   --------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   ROUND 2.4 · DIALS + OPTION CARDS
   --------------------------------------------------------------------- */
function Dial({ have, start, pending = 0, label }) {
  const r = 25;
  const c = 2 * Math.PI * r;
  const pct = start ? Math.max(0, Math.min(1, have / start)) : 0;
  const after = Math.max(0, have - pending);
  const pa = start ? Math.max(0, Math.min(1, after / start)) : 0;
  const short = pending > have;
  const cls = short ? 'short' : (pending ? after : have) === 0 ? 'empty' : (pending ? pa : pct) < 0.34 ? 'low' : '';
  return (
    <div className={`dial ${cls}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="dial-track" />
        <circle cx="32" cy="32" r={r} className={pending ? 'dial-have faded' : 'dial-have'} strokeDasharray={`${pct * c} ${c}`} />
        {pending > 0 && <circle cx="32" cy="32" r={r} className="dial-after" strokeDasharray={`${pa * c} ${c}`} />}
      </svg>
      <b>{pending ? after : have}</b>
      <span>{label}</span>
      {pending > 0 && <small>{short ? `need ${pending}` : `−${pending}`}</small>}
    </div>
  );
}
function Gauges({ have, start, pending }) {
  return (
    <div className="dials">
      {RES_KEYS.map((k, i) => <Dial key={k} have={have[i]} start={start[i]} pending={pending ? pending[i] : 0} label={RES_SHORT[i]} />)}
    </div>
  );
}

/* BY DESIGN 0.9.2 · the one resource a choice leans on hardest. The full four dials sit behind MORE. */
const tightestOf = (have, start, cost) => {
  let best = -1; let score = Infinity;
  cost.forEach((c, i) => { if (c > 0) { const left = (have[i] - c) / (start[i] || 1); if (left < score) { score = left; best = i; } } });
  return best;
};
function CostGlance({ have, start, cost }) {
  if (!cost || !have || !cost.some((c) => c > 0)) return null;
  const i = tightestOf(have, start, cost);
  if (i < 0) return null;
  const left = have[i] - cost[i];
  const short = left < 0;
  return (
    <p className={`cost-glance${short ? ' short' : ''}`}>
      <span>{short ? 'SHORT ON' : 'LEANS ON'}</span>
      <b>{RESOURCE_LABELS[RES_KEYS[i]]}</b>
      <em>{short ? `have ${have[i]}, needs ${cost[i]}` : `${have[i]} → ${left}`}</em>
    </p>
  );
}
/* Which options a table has for a capability, given its ledger. */
const optionCosts = (ledger, capId) => {
  const h = ledger.hospital.id;
  const f = ledger.foundation;
  if (ledger.invested.includes(capId)) return {};
  if (ledger.prepared.includes(capId)) return { invest: completeCost(h, capId, f) };
  if (ledger.piloted.includes(capId)) return { invest: scaleCost(h, capId, f) };
  return { invest: investCost(h, capId, f), start: startCost(h, capId), prepare: prepareCost(h, capId) };
};

function OptionCard({ cap, k, have, start, cost, onChoose, disabled, followOn }) {
  const d = optionDetail(cap, k);
  const ok = cost ? fits(have, cost) : false;
  const limit = cost && !ok ? limitingOf(have, cost) : null;
  const label = followOn ? (followOn === 'scale' ? 'SCALE THE PILOT' : 'FINISH WHAT YOU PREPARED') : OPTION_META[k].label;
  return (
    <article className={`opt-card opt-${k}${ok ? '' : ' opt-out'}`}>
      <div className={`opt-img opt-img-${k}${hasOptionArt(cap, k) ? ' has-art' : ''}`}>
        <img className="opt-base" src={cap.image} alt="" onError={(e) => imageFallback(e)} />
        {hasOptionArt(cap, k) && <img className="opt-art" src={optionImage(cap, k)} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
        <span className="opt-tag">{label}</span>
      </div>
      <div className="opt-body">
        <p className="opt-sub">{followOn ? 'Complete the full scope. You pay the remainder.' : OPTION_META[k].sub}</p>
        {d.pilot && <p className="opt-pilot">{d.pilot}</p>}
        <dl>
          <dt>YOU CAN</dt><dd>{d.can}</dd>
          <dt>EXPOSES</dt><dd>{d.exp}</dd>
        </dl>
        <CostGlance have={have} start={start} cost={cost} />
        <details className="opt-more">
          <summary>MORE · ALL FOUR RESOURCES</summary>
          <dl>
            <dt>NOT YET</dt><dd>{d.notYet}</dd>
            <dt>WORKFORCE</dt><dd>{d.wf}</dd>
            <dt>GOVERNANCE</dt><dd>{d.gov}</dd>
          </dl>
          {cost && <Gauges have={have} start={start} pending={cost} />}
        </details>
        {limit && <p className="limit">Short on {limit.label}: you have {limit.have}, it needs {limit.need}.</p>}
        {onChoose && <Button disabled={disabled || !ok} onClick={onChoose}>{ok ? `${label} · ${cap.name.toUpperCase()}` : 'OUT OF REACH'}</Button>}
      </div>
    </article>
  );
}
function OptionCards({ cap, ledger, have, start, costs, onChoose, disabled }) {
  const c = costs || (ledger ? optionCosts(ledger, cap.id) : { invest: investCost(HOSPITALS.academic.id, cap.id) });
  const followOn = ledger && ledger.prepared.includes(cap.id) ? 'complete' : ledger && ledger.piloted.includes(cap.id) ? 'scale' : null;
  const keys = followOn ? ['invest'] : OPTION_KEYS;
  return (
    <div className={`opt-grid n${keys.length}`}>
      {keys.map((k) => <OptionCard key={k} cap={cap} k={k} have={have} start={start} cost={c[k]} followOn={followOn} disabled={disabled} onChoose={onChoose ? () => onChoose(k) : null} />)}
    </div>
  );
}

const OPTION_CSS = `
.dials{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:12px 0}
.dial{position:relative;text-align:center;min-width:0}
.dial svg{width:100%;max-width:74px;display:block;margin:0 auto;transform:rotate(-90deg)}
.dial circle{fill:none;stroke-width:7;stroke-linecap:round}
.dial-track{stroke:#ece7e1}.dial-have{stroke:#00a6a6;transition:stroke-dasharray .6s ease}.dial-have.faded{stroke:#c9ebe8}
.dial-after{stroke:#49205d;transition:stroke-dasharray .6s ease}
.dial.low .dial-have:not(.faded),.dial.low .dial-after{stroke:#f0b323}.dial.empty .dial-have:not(.faded),.dial.empty .dial-after{stroke:#b54a5a}
.dial.short .dial-have{stroke:#e8c6cc}
.dial b{position:absolute;left:0;right:0;top:calc(min(37px, 50% - 14px));font-size:1.1rem;line-height:1}
.dial>span{display:block;font-size:.7rem;font-weight:900;letter-spacing:.08em;opacity:.75;margin-top:4px;text-transform:uppercase}
.dial small{display:block;font-size:.72rem;font-weight:800;color:#49205d}.dial.short small{color:#b54a5a}
.opt-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:16px 0}.opt-grid.n1{grid-template-columns:minmax(0,520px)}
.opt-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(10,34,44,.1);display:flex;flex-direction:column;min-width:0}
.opt-img{position:relative;aspect-ratio:16/10;overflow:hidden;background:#0a222c}
.opt-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.opt-img-prepare{background:#f4f1ec}
.opt-img-prepare .opt-base{filter:grayscale(1) contrast(1.4) brightness(1.3);mix-blend-mode:multiply;opacity:.85}
.opt-img-prepare:not(.has-art):after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(73,32,93,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(0,166,166,.18) 1px,transparent 1px);background-size:22px 22px;pointer-events:none}
.opt-img-start .opt-base{filter:saturate(.9)}
.opt-img-start:not(.has-art):after{content:'PILOT AREA';position:absolute;inset:16% 22%;border:3px dashed #f0b323;border-radius:8px;box-shadow:0 0 0 999px rgba(10,34,44,.62);display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;color:#f0b323;font-size:.7rem;font-weight:900;letter-spacing:.14em;pointer-events:none;z-index:1}
.opt-img .opt-art{z-index:1}
.opt-tag{position:absolute;left:12px;top:12px;background:#fff;color:#0a222c;font-size:.72rem;font-weight:900;letter-spacing:.12em;padding:6px 10px;border-radius:999px;z-index:2}
.opt-invest .opt-tag{background:#00a6a6;color:#fff}.opt-start .opt-tag{background:#f0b323}.opt-prepare .opt-tag{background:#49205d;color:#fff}
.opt-body{padding:14px 16px 18px;display:flex;flex-direction:column;gap:4px;flex:1}
.opt-sub{font-weight:800;margin:0 0 4px;font-size:.95rem}.opt-pilot{margin:0 0 6px;font-style:italic;color:#49205d;font-size:.9rem;line-height:1.35}
.opt-body dl{margin:4px 0;display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:.84rem;line-height:1.35}
.opt-body dt{font-size:.68rem;font-weight:900;letter-spacing:.1em;color:#6f2c91;padding-top:2px}.opt-body dd{margin:0}
.opt-out{opacity:.82}.opt-out .opt-img img{filter:grayscale(1);opacity:.5}
.opt-body .button{margin-top:auto}
.start-cap{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:8px 0}.start-cap b{font-size:.72rem;letter-spacing:.12em;color:#6f2c91}
.mini-opts{display:grid;gap:6px;margin-top:8px}.mini-opts>div{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:#f7f3ee}
.mini-opts b{font-size:.75rem;letter-spacing:.1em}.mini-opts .k-invest{border-left:4px solid #00a6a6}.mini-opts .k-start{border-left:4px solid #f0b323}.mini-opts .k-prepare{border-left:4px solid #49205d}
.planner-read{margin-top:12px;padding:12px;background:#f2eaf5;border-radius:10px;font-size:.86rem}.planner-read b{display:block;font-size:.7rem;letter-spacing:.1em;color:#49205d;margin-bottom:4px}
@media(max-width:900px){.opt-grid{grid-template-columns:1fr}}
`;

function CapTile({ b, signal, compact = false }) {
  const tag = signalTagFor(signal, b.c.id, b.state === 'committed');
  return (
    <figure className={`cap-tile tile-${b.state}${compact ? ' compact' : ''}`}>
      <img src={b.c.image} alt="" onError={(e) => imageFallback(e)} />
      <figcaption>
        <span className="tile-state">{b.state === 'committed' ? '✓ COMMITTED' : stateLabel(b)}</span>
        <b>{b.c.name}</b>
        {!compact && b.state === 'out' && b.limit && <small>Short on {b.limit.label}</small>}
        {!compact && b.state === 'prepare-only' && b.limit && <small>Full scope · {b.limit.label} short</small>}
      </figcaption>
      {tag && <span className="tile-signal">{tag}</span>}
    </figure>
  );
}
function CapTiles({ ledger, signal, compact = false }) {
  return <div className={`cap-tiles${compact ? ' compact' : ''}`}>{boardFor(ledger).map((b) => <CapTile key={b.c.id} b={b} signal={signal} compact={compact} />)}</div>;
}

function HospitalBoardCard({ t, ledger, signal, extra }) {
  const h = ledger.hospital;
  return (
    <article className="hb-card">
      <header style={{ backgroundImage: `linear-gradient(180deg,rgba(10,34,44,.05),rgba(10,34,44,.88)),url(${h.image})` }}>
        <span>TABLE {t}</span>
        <h3>{h.name}</h3>
        <p>{NEED_LINE[h.id]}</p>
      </header>
      <div className="hb-body">
        {extra}
        {ledger.closed ? <div className="hb-closed">PORTFOLIO CLOSED · CAPACITY KEPT</div> : <Gauges have={ledger.have} start={startOf(h)} />}
        <CapTiles ledger={ledger} signal={signal} />
      </div>
    </article>
  );
}

function StandCard({ t, ledger, s, onHold, busy }) {
  const h = ledger.hospital;
  return (
    <article className="stand-card">
      <header style={{ backgroundImage: `linear-gradient(180deg,rgba(10,34,44,.05),rgba(10,34,44,.88)),url(${h.image})` }}>
        <span>TABLE {t}</span>
        <h3>{h.name}</h3>
      </header>
      <div className="stand-body">
        <span className={`stand-chip ${s.kind}`}>{STAND_LABEL[s.kind]}{s.byFac ? ' · BY FACILITATOR' : ''}</span>
        <div className="stand-decision">
          <b>{capabilityById(ledger.teachCap).name}</b>
          <em>{choiceLabel(ledger.teach.choice)}</em>
          {ledger.teach.revised && <span className="revised-tag">REVISED</span>}
        </div>
        {ledger.teach.revised && <p className="small-note">First decision: {choiceLabel(ledger.teach.original)}</p>}
        {!s.done && <Button secondary disabled={busy} onClick={onHold}>MARK AS HELD</Button>}
      </div>
    </article>
  );
}
function POpenRoom({ participants, responses, onAdvance, facSave }) {
  const tables = activeTables(participants);
  const [busy, setBusy] = useState(0);
  const rows = tables.map((t) => ({ t, l: ledgerFor(participants, responses, t, 0), s: teachStand(responses, t) }));
  const ready = rows.filter((r) => r.s.done).length;
  const waiting = rows.length - ready;
  const all = rows.length > 0 && waiting === 0;
  const markHeld = async (t) => { setBusy(t); try { await facSave('teach_stand', facKey('teach', t), t, 'stand'); } finally { setBusy(0); } };
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">THE PORTFOLIO BOARD OPENS</div>
        <h1>Do you stand by your first decision?</h1>
        <p className="one-line">Answer on your phone: stand by it, or change it once.</p>
        <div className={`stand-progress${all ? ' all' : ''}`}><b>{ready} OF {rows.length}</b><span>{all ? 'TABLES READY · EVERYONE IS IN' : 'TABLES READY'}</span></div>
        <div className="stand-grid">
          {rows.map(({ t, l, s }) => <StandCard key={t} t={t} ledger={l} s={s} busy={busy === t} onHold={() => markHeld(t)} />)}
        </div>
        {all
          ? <NextButton onAdvance={onAdvance} to="p1_decide">EVERYONE IS IN · CHOOSE THE NEXT CAPABILITY</NextButton>
          : <>
              <div className="room-actions"><Button secondary onClick={() => onAdvance('p1_decide')}>CONTINUE WITHOUT {waiting} TABLE{waiting === 1 ? '' : 'S'} <ArrowRight size={18} /></Button></div>
              <p className="small-note">A table that has not answered carries on with its first decision.</p>
            </>}
      </section>
    </Shell>
  );
}

function makeBoardRoom(k) {
  return function PBoardRoom({ participants, responses, onAdvance }) {
    const tables = activeTables(participants);
    const signal = k === 3 ? currentSignal(responses) : null;
    return (
      <Shell>
        <section className="pullback-hero">
          <div className="eyebrow">PORTFOLIO · CYCLE {k} OF 2</div>
          <h1>{k === 3 ? 'The final cycle. Respond, or hold your ground.' : 'What does your hospital do next?'}</h1>
          <p className="pullback-intro">Every phone shows the same board through a different role. Nominate privately, then decide as a table.{k < 3 ? ' A challenge arrives after cycle 2, then the operations layer.' : ''}</p>
          <div className="hb-grid">
            {tables.map((t) => <HospitalBoardCard key={t} t={t} ledger={ledgerFor(participants, responses, t, k - 1, ledgerOpts(k))} signal={signal} />)}
          </div>
          <div className="aha-line">{DECISION_PROMPT}</div>
          <RoleReveal label="REVEAL ALL ROLE PERSPECTIVES"><PerspectiveGrid /></RoleReveal>
          <ProgressGrid participants={participants} responses={responses} type="cycle_nom" capabilityId={`cycle-${k}`} doneLabel="ALL NOMINATIONS IN" partialLabel="NOMINATIONS SUBMITTED" />
          <NextButton onAdvance={onAdvance} to={`p${k}_decide`}>MAKE THE TABLE DECISION</NextButton>
        </section>
      </Shell>
    );
  };
}

/* ---------- Side by side as hospital cards ---------- */
function MiniCaps({ ids, kind }) {
  if (!ids.length) return <p className="mini-empty">None</p>;
  return <div className={`mini-caps ${kind}`}>{ids.map((id) => { const c = capabilityById(id); return <figure key={id}><img src={c.image} alt="" onError={(e) => imageFallback(e)} /><figcaption>{c.name}</figcaption></figure>; })}</div>;
}
function HospitalSummaryCard({ t, participants, responses, signal, selected, onSelect }) {
  const l = ledgerFor(participants, responses, t, 3);
  const h = l.hospital;
  const need = unresolvedNeed(l);
  const said = tableReflections(responses, t)[0];
  const s = signal ? standingText(signalStanding(participants, responses, t, signal), true) : null;
  const tc = bydTeamCard(participants, responses, t, signal);
  return (
    <article className={`sum-card${selected ? ' selected' : ''}`} onClick={onSelect}>
      <header style={{ backgroundImage: `linear-gradient(180deg,rgba(10,34,44,.1),rgba(10,34,44,.9)),url(${h.image})` }}>
        <span>TABLE {t}{l.teach.revised && <span className="revised-tag">REVISED</span>}{facilitatorRecorded(responses, t).length > 0 && <span className="revised-tag fac">FACILITATOR-RECORDED</span>}</span>
        <h3>{h.name}</h3>
        <p>{tc.headline}</p>
      </header>
      <div className="sum-body">
        <div className="sum-label">COMMITTED</div>
        <MiniCaps ids={l.invested} kind="committed" />
        {l.piloted.length > 0 && <><div className="sum-label">STARTED · PILOT RUNNING</div><MiniCaps ids={l.piloted} kind="prepared" /></>}
        {l.prepared.length > 0 && <><div className="sum-label">PREPARED · OPTION KEPT OPEN</div><MiniCaps ids={l.prepared} kind="prepared" /></>}
        {l.ops && l.ops.length > 0 && <><div className="sum-label">KEPT RUNNING</div><p className="mini-empty">{listJoin(l.ops.map((id) => OPS_COMMITMENTS[id].name))}</p></>}
          <div className="sum-label">CAPACITY KEPT</div>
        <Gauges have={l.have} start={startOf(h)} />
        <div className="sum-callout">
          <b>UNRESOLVED</b>
          <p>{need ? <><strong>{need.c.name}.</strong> {need.c.exposure}</> : 'None of the six.'}</p>
          {said && <p className="sum-said">Your table said: “{said}”</p>}
        </div>
        <div className="sum-badges">
          <span className="badge-constraint">LIMIT · {mainConstraint(l).toUpperCase()}</span>
          {s && <span className="badge-signal">{s.head.toUpperCase()}</span>}
        </div>
        {selected && <div className="sum-more"><b>{tc.spText}</b><ConditionRows report={tc} compact /><div className="planner-read"><b>HOW A PLANNER MIGHT RATE THE FIT OF WHAT YOU CHOSE · DO YOU AGREE?</b>{[...l.invested, ...l.piloted, ...l.prepared].map((id) => `${capabilityById(id).name}: ${fitFor(id, h.id).level}`).join(' · ') || 'Nothing chosen yet.'}</div></div>}
      </div>
    </article>
  );
}

function FCompareRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  const [sel, setSel] = useState(null);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">SUMMARY · SIDE BY SIDE</div>
        <h1>Same six choices. Different hospitals.</h1>
        <p className="pullback-intro">Tap a hospital to open its five-year view.</p>
        <div className="sum-grid">
          {tables.map((t) => <HospitalSummaryCard key={t} t={t} participants={participants} responses={responses} signal={signal} selected={sel === t} onSelect={() => setSel(sel === t ? null : t)} />)}
        </div>
        <div className="aha-line">Context and earlier choices shape what is possible.</div>
        <NextButton onAdvance={onAdvance} to="f_debrief">OPEN THE CONVERSATION</NextButton>
      </section>
    </Shell>
  );
}

/* ---------- The conversation as question cards ---------- */
function FDebriefRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const dissent = tables.map((t) => {
    const choice = decisionForTable(responses, t, 'teach').choice;
    const differ = membersOf(participants, t).filter((p) => { const v = myResponse(responses, p.id, 'first_instinct', 'teach')?.choice; return v && choice && v !== choice; });
    return { t, choice, n: differ.length };
  }).filter((x) => x.n >= 2).sort((a, b) => b.n - a.n);
  const reflections = responsesOfType(responses, 'reflection', 'final').filter((r) => r.note);
  const cards = [
    dissent.length ? { kicker: `ASK TABLE ${dissent[0].t}`, q: `Your table chose to ${choiceLabel(dissent[0].choice).toLowerCase()} even though ${dissent[0].n} of you first preferred another direction. What persuaded you?`, img: hospitalForTable(dissent[0].t).image } : null,
    { kicker: 'ASK ACROSS TABLES', q: crossPrompt(participants, responses), img: HOSPITALS.distributed.image },
    { kicker: 'QUESTION 01', q: 'What did the technology enable for Arthur, and what did the design contribute?', img: HOSPITALS.regional.image },
    { kicker: 'QUESTION 02', q: 'Which turning point would you make differently, knowing what came next?', img: HOSPITALS.academic.image },
      { kicker: 'QUESTION 03', q: 'Which design decisions must be made now, and which can still change?', img: HOSPITALS.greenfield.image },
      ...tables.map((t) => ({ kicker: `ASK TABLE ${t} · FROM YOUR OWN MOMENT`, q: bydTeamCard(participants, responses, t, currentSignal(responses)).question, img: hospitalForTable(t).image })),
      ...tables.map((t) => { const c = decisionNotes(responses, t, 'teach').concerns[0]; return c ? { kicker: `ASK TABLE ${t} · A CONCERN YOU CARRIED`, q: `You recorded: “${c}” Was it resolved, or did your portfolio work around it?`, img: hospitalForTable(t).image } : null; }).filter(Boolean).slice(0, 2),
      ...tables.map((t) => { const r = tableResequence(responses, t)[0]; return r ? { kicker: `ASK TABLE ${t} · IF YOU COULD RESEQUENCE`, q: `“${r}” What would that have changed?`, img: hospitalForTable(t).image } : null; }).filter(Boolean).slice(0, 2),
      { kicker: 'THE LAST QUESTION', q: FINAL_QUESTION, img: SCALE_VISUALS.roomBehind },
    ].filter(Boolean);
  const [i, setI] = useState(0);
  const card = cards[Math.min(i, cards.length - 1)];
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">REVEAL 3 OF 3 · THE CONVERSATION</div>
        <article className="q-card" style={{ backgroundImage: `linear-gradient(90deg,rgba(10,34,44,.94) 0%,rgba(10,34,44,.78) 55%,rgba(10,34,44,.25) 100%),url(${card.img})` }}>
          <span>{card.kicker} · {i + 1} OF {cards.length}</span>
          <h2>{card.q}</h2>
          <div className="q-nav">
            <button type="button" disabled={i === 0} onClick={() => setI(i - 1)}><ArrowLeft size={18} /> Previous</button>
            <button type="button" disabled={i >= cards.length - 1} onClick={() => setI(i + 1)}>Next question <ArrowRight size={18} /></button>
          </div>
        </article>
        {reflections.length > 0 && (
          <div className="quote-grid">
            {[...new Set(reflections.map((r) => validTable(r.table_number)).filter(Boolean))].map((t) => {
              const need = unresolvedNeed(ledgerFor(participants, responses, t, 3));
              return (
                <figure className="quote-card" key={t}>
                  <blockquote>“{reflections.filter((r) => validTable(r.table_number) === t)[0].note}”</blockquote>
                  <figcaption>TABLE {t} · {hospitalForTable(t).name}<small>The game’s read: {need ? need.c.name : 'none of the six'}. Who is right?</small></figcaption>
                </figure>
              );
            })}
          </div>
        )}
        <NextButton onAdvance={onAdvance} to="f_film">YOUR HOSPITAL, IN MOTION</NextButton>
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   CLOSING SEQUENCE · room → building → system → ecosystem
   Built from each table's actual decisions. Plus a take-home AI prompt.
   --------------------------------------------------------------------- */
const CARE_SETTINGS = {
  'virtual-care': ['home', 'ambulatory'],
  'predictive-operations': ['ambulatory', 'post-acute'],
  'care-platform': ['home', 'community', 'ambulatory', 'post-acute'],
};
const filmFramesBase = (participants, responses, t) => {
  const l = ledgerFor(participants, responses, t, 3);
  const h = l.hospital;
  const caps = l.invested.map(capabilityById);
  const lead = caps[0] || capabilityById(l.teachCap);
  const pick = (f) => caps.map((c) => c.invest[f]).filter(Boolean).slice(0, 3);
  const lit = new Set(['hospital']);
  l.invested.forEach((id) => (CARE_SETTINGS[id] || []).forEach((x) => lit.add(x)));
  const none = !caps.length;
  return [
    { scale: 'THE ROOM', title: none ? 'The room stays as it is.' : 'Care changes at the bedside.', img: SCALE_VISUALS.room, fallback: lead.image, lines: none ? [lead.exposure] : pick('unit').slice(0, 2),
      behind: SCALE_VISUALS.roomBehind, behindTitle: 'What makes it possible.', behindLines: none ? l.prepared.map((id) => `${capabilityById(id).name}: provision protected behind the walls`) : caps.slice(0, 2).map((c) => `${c.name}: ${c.early}`) },
      { scale: 'THE UNIT', title: none ? 'The team works as it does today.' : 'The team works differently.', img: SCALE_VISUALS.unit, fallback: h.image, lines: none ? ['Current workflows continue.'] : caps.map((c) => c.scale.unit).slice(0, 2),
        behind: SCALE_VISUALS.unitBehind, behindTitle: 'What the floor must carry.', behindLines: none ? ['Pathways and capacity stay as they are today.'] : caps.slice(0, 2).map((c) => `${c.name}: ${c.support.find(([k]) => k === 'INFRASTRUCTURE')?.[1] || c.early}`) },
    { scale: 'THE FACILITY', title: 'The building makes it possible.', img: SCALE_VISUALS.facility, fallback: h.image, lines: none ? l.prepared.map((id) => `${capabilityById(id).name}: provision protected`) : pick('facility') },
    { scale: 'THE SYSTEM', title: 'The sites connect.', img: SCALE_VISUALS.system, fallback: HOSPITALS.distributed.image, lines: none ? ['Capacity was kept for the next planning period.'] : pick('system') },
    { scale: 'THE ECOSYSTEM', title: 'Care reaches further, or stays where it was.', img: SCALE_VISUALS.ecosystem, fallback: HOSPITALS.regional.image, lines: pick('flow'), continuum: lit },
  ];
};
const CAP_VISUAL = {
  'virtual-care': { room: 'a remote specialist on a wall display joins the bedside team, and the patient and family can see and hear clearly', building: 'patient rooms with clear sightlines, quiet acoustics and discreet integrated audiovisual infrastructure', system: 'a virtual care hub where specialists support several hospitals at once', eco: 'patients completing follow-up visits from home and community clinics' },
  'ambient-intelligence': { room: 'a clinician facing the patient in conversation, no keyboard between them, a discreet capture device in the room', building: 'acoustically private consult and exam spaces', system: 'clinicians at several sites reviewing drafted notes on tablets', eco: 'care settings unchanged, with more clinician time at the bedside' },
  'smart-rooms': { room: 'a patient adjusting lighting and shades from the bed, soft adaptive light and a calm in-room display', building: 'a sequence of patient rooms sharing one adaptable headwall and controls zone', system: 'room information flowing to a central care team station', eco: 'care stays in the hospital, with a better stay' },
  'autonomous-logistics': { room: 'an autonomous delivery robot quietly leaving supplies at a unit', building: 'wide service corridors, connected elevators and robot staging and charging alcoves', system: 'a central supply hub dispatching deliveries across the campus', eco: 'materials moving reliably while care settings stay the same' },
  'predictive-operations': { room: 'a charge nurse checking the command center view on a calm wall display with the team', building: 'flexible inpatient zones that can open or close as demand changes', system: 'a command center where bed flow, staffing and transport leads watch one live picture across sites', eco: 'patients planned into ambulatory and post-acute settings earlier' },
  'care-platform': { room: 'consistent information on bedside screens', building: 'a cutaway revealing generous technology rooms and cable pathways behind the walls', system: 'subtle lines of light connecting the hospital, clinics and homes', eco: 'information following the patient between hospital, clinic and home' },
};
const aiPrompt = (participants, responses, t, signal) => {
  const l = ledgerFor(participants, responses, t, 3);
  const h = l.hospital;
  const caps = l.invested.map(capabilityById);
  const roles = [...new Set(membersOf(participants, t).map((p) => briefFor(p.persona).name))];
  const s = signal ? standingText(signalStanding(participants, responses, t, signal), true).head : null;
  return [
    'Create a 30-second photorealistic architectural flythrough of a healthcare facility. Five continuous shots, slow camera, no on-screen text, no logos, people shown naturally and respectfully.',
    `Facility: ${h.name}. ${h.description} Inherited conditions: ${h.constraint.toLowerCase()}; ${h.condition.toLowerCase()}.`,
      `Decisions made by a leadership team (${listJoin(roles) || 'clinical, operations, digital, sponsor, workforce and design leaders'}): committed to ${caps.length ? listJoin(caps.map((c) => c.name)) : 'no new capabilities'}${l.piloted.length ? `; piloting ${listJoin(capNames(l.piloted))} at small scale` : ''}${l.prepared.length ? `; prepared but did not yet deploy ${listJoin(capNames(l.prepared))}` : ''}.`,
    `Shot 1 (0–7s), patient room, then a slow section cut revealing what is behind the walls and above the ceiling: ${caps.length ? caps.map((c) => CAP_VISUAL[c.id].room).join('; ') : 'the room as it is today.'}`,
    `Shot 2 (7–12s), the nursing unit: ${caps.length ? caps.map((c) => c.scale.unit).join(' ') : 'current workflows continue.'}`,
    `Shot 3 (12–18s), pull back through the building: ${caps.length ? caps.map((c) => CAP_VISUAL[c.id].building).join('; ') : 'reserved space and pathways for future capability.'}`,
    `Shot 4 (18–24s), rise above the campus to the health system: ${caps.length ? caps.map((c) => CAP_VISUAL[c.id].system).join('; ') : 'other sites remain as they are.'}`,
    `Shot 5 (24–30s), wide aerial of the region, home, community and ambulatory settings: ${caps.length ? caps.map((c) => CAP_VISUAL[c.id].eco).join('; ') : 'care continues to flow through existing settings.'}`,
    s ? `Context: the region recently faced this challenge: ${signal.title} Outcome for this hospital: ${s}.` : '',
    'Style: contemporary healthcare architecture, warm natural daylight, calm and human, materials of wood, glass and light stone, accents of deep purple, teal and gold. Show technology as quiet and integrated into the architecture, not as gadgets.',
  ].filter(Boolean).join('\n\n');
};

function CopyPrompt({ text }) {
  const [state, setState] = useState('');
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setState('COPIED'); }
    catch { setState('SELECT THE TEXT BELOW AND COPY'); }
  };
  return (
    <div className="prompt-box">
      <div className="prompt-head"><b>TAKE IT FURTHER · AI FLYTHROUGH PROMPT</b><Button secondary onClick={copy}>{state || 'COPY PROMPT'}</Button></div>
      <p className="small-note">Paste into an image or video generation tool to visualize your hospital. Generated output is illustrative, not a design.</p>
      <details><summary>VIEW PROMPT</summary><textarea readOnly value={text} onFocus={(e) => e.target.select()} /></details>
    </div>
  );
}

function Film({ frames, closing, picks = [] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const total = frames.length + 1;
  const dur = (k) => (frames[k]?.behind ? 10000 : 7000);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setTimeout(() => { if (i < total - 1) setI(i + 1); else setPlaying(false); }, dur(i));
    return () => clearTimeout(id);
  }, [i, playing, total]);
  const f = frames[i];
  return (
    <div className="film">
      <div className="film-progress">{Array.from({ length: total }).map((_, k) => <i key={k} style={{ '--d': `${dur(k)}ms` }} className={k < i ? 'done' : k === i ? (playing ? 'run' : 'done') : ''} />)}</div>
      {f ? (
        <div className={`film-frame${f.behind ? ' has-reveal' : ''}`} key={i}>
          <div className="film-move">
            <img src={f.img} alt="" onError={(e) => imageFallback(e, f.fallback)} />
            {f.behind && <div className="film-behind"><img src={f.behind} alt="" onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }} /></div>}
          </div>
          {f.behind && <i className="film-cut" />}
          <div className="film-copy first">
            <span>{f.scale}</span>
            <h2>{f.title}</h2>
            {f.lines.length > 0 && <ul>{f.lines.map((x) => <li key={x}>{x}</li>)}</ul>}
            {f.continuum && <div className="film-continuum">{['home', 'community', 'ambulatory', 'hospital', 'post-acute'].map((x) => <span key={x} className={f.continuum.has(x) ? 'lit' : ''}>{x.toUpperCase()}</span>)}</div>}
          </div>
          {f.behind && (
            <div className="film-copy second">
              <span>BEHIND THE WALLS</span>
              <h2>{f.behindTitle}</h2>
              {f.behindLines.length > 0 && <ul>{f.behindLines.map((x) => <li key={x}>{x}</li>)}</ul>}
            </div>
          )}
        </div>
      ) : (
        <div className="film-frame film-end" key="end">
          <div className="film-copy"><span>THE PULL BACK</span><h2>A technology decision is never only a technology decision.</h2>{closing && <p>{closing}</p>}<p className="film-final">{FINAL_QUESTION}</p></div>
        </div>
      )}
      {picks.length > 0 && (
          <div className="film-picks" aria-label="What your table chose">
            {picks.map((p) => (
              <span key={`${p.kind}-${p.id}`} className={`film-pick ${p.kind}`}>
                {p.img && <img src={p.img} alt="" onError={(e) => imageFallback(e)} />}
                {p.name} · {p.tag}
              </span>
            ))}
          </div>
        )}
        <div className="film-controls">
        <button type="button" onClick={() => { setI(0); setPlaying(true); }}><RotateCcw size={16} /> Replay</button>
        <button type="button" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button>
        <button type="button" disabled={i >= total - 1} onClick={() => setI(i + 1)}>Next <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
function FFilmRoom({ participants, responses, onAdvance }) {
  const tables = activeTables(participants);
  const [t, setT] = useState(tables[0]);
  const signal = currentSignal(responses);
  const table = tables.includes(t) ? t : tables[0];
  if (!table) return <Shell><section className="pullback-hero"><h1>No tables in this session.</h1></section></Shell>;
  const td = teachDecisionFor(responses, table);
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">CLOSING · YOUR HOSPITAL, IN MOTION</div>
        <h1>From the room, behind the walls, to the region.</h1>
        <div className="approve-chips">{tables.map((n) => <button type="button" key={n} className={n === table ? 'active' : ''} onClick={() => setT(n)}>Table {n} · {hospitalForTable(n).name}</button>)}</div>
        <Film key={table} frames={filmFrames(participants, responses, table)} closing={td.choice ? CLOSING_LINE[td.choice] : ''} picks={filmPicks(participants, responses, table)} />
          <RoomPicks participants={participants} responses={responses} />
          <CopyPrompt text={aiPrompt(participants, responses, table, signal)} />
          <NextButton onAdvance={onAdvance} to="f_takeaway">BRING THIS TO YOUR NEXT PROJECT</NextButton>
        </section>
    </Shell>
  );
}


/* ===== BY DESIGN 0.9.1 · BRING THIS TO YOUR NEXT PROJECT CONVERSATION =====
   Built from what the table actually did. Nothing is stored: the email is composed on the attendee's own phone. */
const takeawayFor = (participants, responses, t, signal) => {
  const tc = bydTeamCard(participants, responses, t, signal);
  const l = tc.l;
  const pid = chosenPromise(responses, t).id;
  const caps = [...l.invested, ...l.piloted].slice(0, 2);
  const name = (id) => capabilityById(id)?.name;
  const keepOps = tc.ops.ids.find((id) => ['fallback', 'coverage', 'responder'].includes(id));
  const strength = keepOps
    ? `${OPS_COMMITMENTS[keepOps].name}: ${OPS_COMMITMENTS[keepOps].scene}`
    : l.prepared.length ? `${name(l.prepared[0])}: ${capabilityById(l.prepared[0]).prepare.ready}` : 'Nothing yet. No provision or fallback was funded.';
  const ran = tc.ops.chosen.length ? `Run: ${listJoin(tc.ops.chosen.map((o) => lc1(o.name)))}.` : 'No operating commitment was funded.';
  const paper = tc.ops.onPaper.length ? ` On paper: ${listJoin(tc.ops.onPaper)}.` : '';
  return {
    t, hospital: tc.hospital.name, status: tc.promise.status, promise: PROMISES[pid].name,
    close: caps.length
      ? `You decided early: ${caps.map((id) => LOCK_SHORT[id][0]).join('; ')}. You kept changeable: ${caps.map((id) => LOCK_SHORT[id][1]).join('; ')}. ${tc.ops.onPaper.length ? `Nobody was yet funded to run: ${listJoin(tc.ops.onPaper)}.` : 'What you built has someone funded to run it.'}`
      : 'You committed to nothing, so nothing is locked in yet, and nothing needs running.',
    lead: caps[0] ? { early: LOCK_SHORT[caps[0]][0], open: LOCK_SHORT[caps[0]][1] } : null,
    fund: tc.ops.onPaper.length ? `Not yet funded to run: ${listJoin(tc.ops.onPaper)}` : tc.ops.chosen.length ? 'Funded to run' : 'Nothing yet needs running',
    paper: tc.ops.onPaper.length > 0,
    strength, func: tc.sfb.func[0], beauty: tc.sfb.beauty[0] || 'Nothing designed in beyond what the rooms already had.',
    early: caps.length ? caps.map((id) => `${name(id)}: ${LOCK_SHORT[id][0]}`).join('; ') : 'Nothing committed, so nothing is locked in yet.',
    open: caps.length ? caps.map((id) => `${name(id)}: ${LOCK_SHORT[id][1]}`).join('; ') : 'Nothing committed yet.',
    operational: `${ran}${paper}`,
  };
};
const takeawayMail = (tk, f) => {
  const body = [
    'BRING THIS TO YOUR NEXT PROJECT CONVERSATION',
    '',
    `The promise we protected: ${tk.promise} (${tk.status})`,
    `Strength, make it dependable: ${tk.strength}`,
    `Function, make it work for people: ${tk.func}`,
    `Beauty, make it feel human: ${tk.beauty}`,
    `Decide early: ${tk.early}`,
    `Keep adaptable: ${tk.open}`,
    `Make it operational: ${tk.operational}`,
    '',
    `For our project, our patients should be able to: ${String(f.promise || '…').slice(0, 100)}`,
    `Our next step: ${String(f.step || 'We will test this assumption with ___ before ___.').slice(0, 100)}`,
  ].join('\n');
  return `mailto:?subject=${encodeURIComponent('By Design · Team Arthur · what we decided')}&body=${encodeURIComponent(body)}`;
};
function TakeawayRows({ tk }) {
  const rows = [
    ['strength', 'STRENGTH · MAKE IT DEPENDABLE', tk.strength],
    ['function', 'FUNCTION · MAKE IT WORK FOR PEOPLE', tk.func],
    ['beauty', 'BEAUTY · MAKE IT FEEL HUMAN', tk.beauty],
    ['lock', 'DECIDE EARLY', tk.early],
    ['operations', 'KEEP ADAPTABLE', tk.open],
    ['run', 'MAKE IT OPERATIONAL', tk.operational],
  ];
  return <div className="tk-rows">{rows.map(([g, k, v]) => <div className="tk-row" key={k}><span className="tk-ico"><Glyph name={g} size={20} /></span><div><b>{k}</b><p>{v}</p></div></div>)}</div>;
}
function TakeawayRoom({ participants, responses }) {
  const tables = activeTables(participants);
  const signal = currentSignal(responses);
  const rows = tables.map((t) => takeawayFor(participants, responses, t, signal));
  return (
    <Shell>
      <section className="pullback-hero">
        <div className="eyebrow">BRING THIS TO YOUR NEXT PROJECT CONVERSATION</div>
        <h1>One patient promise. The decisions behind it.</h1>
        <p className="tk-why">{TAKEAWAY_WHY}</p>
        <div className="tk-grid">
          {rows.map((tk) => (
            <article className={`tk-card${tk.status === DESIGNED ? ' paper' : ''}`} key={tk.t}>
              <span className="tlabel">TABLE {tk.t} · {tk.hospital}</span>
              <h3>{tk.promise}</h3>
              <span className={`st-chip tk-status${tk.status === DESIGNED ? ' paper' : ''}`}>{tk.status.toUpperCase()}</span>
              {tk.lead
                ? (
                  <div className="tk-rows">
                    <div className="tk-row"><span className="tk-ico"><Glyph name="lock" size={20} /></span><div><b>DECIDED EARLY</b><p>{tk.lead.early}</p></div></div>
                    <div className="tk-row"><span className="tk-ico"><Glyph name="operations" size={20} /></span><div><b>KEPT CHANGEABLE</b><p>{tk.lead.open}</p></div></div>
                    <div className="tk-row"><span className={`tk-ico${tk.paper ? ' gap' : ''}`}><Glyph name={tk.paper ? 'paper' : 'run'} size={20} /></span><div><b>OPERATIONS</b><p>{tk.fund}</p></div></div>
                  </div>
                )
                : <p className="tk-close">{tk.close}</p>}
            </article>
          ))}
        </div>
        <div className="tk-blanks">
          <div><b>OUR PATIENTS SHOULD BE ABLE TO…</b><i /></div>
          <div><b>WE WILL TEST THIS ASSUMPTION WITH ___ BEFORE ___.</b><i /></div>
        </div>
        <div className="aha-line">{TAKEAWAY_ASK}</div>
        {TAKEAWAY_CONTACT && <p className="tk-contact">{TAKEAWAY_CONTACT}</p>}
        <p className="small-note">Each phone shows its own table’s card, and can email it to the person holding it.</p>
      </section>
    </Shell>
  );
}
function TakeawayPhone({ player, participants, responses }) {
  const table = validTable(player.table_number);
  const tk = takeawayFor(participants, responses, table, currentSignal(responses));
  const [f, setF] = useState({ promise: '', step: '' });
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">BRING THIS TO YOUR NEXT PROJECT · TABLE {table || '—'}</div>
        <h1>One patient promise. The decisions behind it.</h1>
        <div className={`tk-card${tk.status === DESIGNED ? ' paper' : ''}`}>
          <h3>{tk.promise}</h3>
          <span className={`st-chip tk-status${tk.status === DESIGNED ? ' paper' : ''}`}>{tk.status.toUpperCase()}</span>
          <TakeawayRows tk={tk} />
        </div>
        <label className="note-label">For your project: our patients should be able to…<textarea maxLength={100} value={f.promise} onChange={(e) => setF({ ...f, promise: e.target.value })} /></label>
        <label className="note-label">Our next step: we will test this assumption with ___ before ___<textarea maxLength={100} value={f.step} onChange={(e) => setF({ ...f, step: e.target.value })} /></label>
        <a className="button tk-mail" href={takeawayMail(tk, f)}>EMAIL THIS TO ME</a>
        <p className="small-note">Opens your own email app. Nothing you type here is saved or sent to the room.</p>
        <p className="tk-ask">{TAKEAWAY_ASK}</p>
        {TAKEAWAY_CONTACT && <p className="tk-contact">{TAKEAWAY_CONTACT}</p>}
      </section>
    </Shell>
  );
}

const VISUAL_CSS = `
.gauges{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}
.gauge span{display:block;font-size:.68rem;font-weight:900;letter-spacing:.1em;opacity:.7}
.gauge i{display:block;height:6px;background:#ece7e1;border-radius:6px;overflow:hidden;margin:5px 0}
.gauge em{display:block;height:100%;background:linear-gradient(90deg,#00a6a6,#49205d);border-radius:6px;transition:width .6s ease}
.gauge.low em{background:#f0b323}.gauge.empty em{background:#b54a5a}
.gauge b{font-size:1.05rem}.gauge b small{font-size:.7rem;opacity:.5;font-weight:600}
.cap-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.cap-tile{position:relative;margin:0;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:#0a222c}
.cap-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:filter .4s,opacity .4s}
.cap-tile figcaption{position:absolute;inset:auto 0 0 0;padding:28px 10px 9px;background:linear-gradient(180deg,transparent,rgba(10,34,44,.92));color:#fff}
.cap-tile figcaption b{display:block;font-size:.82rem;line-height:1.15}
.cap-tile figcaption small{display:block;font-size:.68rem;opacity:.85;margin-top:2px}
.tile-state{display:inline-block;font-size:.68rem;font-weight:900;letter-spacing:.1em;padding:3px 6px;border-radius:999px;background:rgba(255,255,255,.18);margin-bottom:4px}
.tile-committed{outline:3px solid #00a6a6;outline-offset:-3px}.tile-committed .tile-state{background:#00a6a6}
.tile-complete{outline:3px dashed #6f2c91;outline-offset:-3px}.tile-complete .tile-state{background:#6f2c91}
.tile-available .tile-state{background:#fff;color:#0a222c}
.tile-prepare-only img{filter:grayscale(.75);opacity:.75}.tile-prepare-only .tile-state{background:#f0b323;color:#0a222c}
.tile-out img{filter:grayscale(1);opacity:.35}.tile-out figcaption{color:rgba(255,255,255,.75)}
.tile-signal{position:absolute;top:8px;right:8px;font-size:.68rem;font-weight:900;letter-spacing:.08em;background:#f0b323;color:#0a222c;padding:3px 6px;border-radius:999px}
.hb-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:22px;margin:26px 0}
.hb-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(10,34,44,.1)}
.hb-card header{min-height:170px;padding:22px;background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}
.hb-card header span{font-size:.68rem;font-weight:900;letter-spacing:.14em;opacity:.85}
.hb-card header h3{margin:4px 0 6px;font-size:1.45rem;color:#fff}.hb-card header p{margin:0;font-size:.9rem;opacity:.92;line-height:1.35}
.hb-body{padding:16px 18px 20px}.hb-teach{font-size:.86rem;margin:0 0 6px}
.stand-chip{display:inline-flex;padding:4px 10px;border-radius:999px;font-size:.68rem;font-weight:900;letter-spacing:.1em;margin-bottom:8px}.stand-chip.deciding{background:#f3eee8;color:#0a222c}.stand-chip.revising{background:#fff0c9;color:#654800}.stand-chip.held{background:#e9f6f4;color:#006b6b}.stand-chip.revised{background:#6f2c91;color:#fff}
.stand-progress{display:flex;align-items:baseline;gap:12px;margin:18px 0 8px;font-size:.8rem;font-weight:900;letter-spacing:.1em}.stand-progress b{font-size:1.8rem;letter-spacing:0}.stand-progress.all{color:#006b6b}
.hb-stand-row .button{margin:6px 0}
  .room-actions .button.secondary,.stand-card .button.secondary,.prompt-box .button.secondary{color:#35124a!important;background:#fff!important;border:2px solid #35124a!important;opacity:1!important}
  .room-actions .button.secondary:hover,.stand-card .button.secondary:hover{background:#efe6f5!important}
  .stand-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;margin:22px 0}
  .stand-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(10,34,44,.1)}
  .stand-card header{min-height:130px;padding:18px 20px;background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}.stand-card header span{font-size:.68rem;font-weight:900;letter-spacing:.14em;opacity:.85}.stand-card header h3{margin:4px 0 0;color:#fff;font-size:1.35rem}
  .stand-body{padding:14px 18px 18px}.stand-decision{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin:2px 0 6px}.stand-decision b{font-size:1.1rem}.stand-decision em{font-style:normal;font-weight:900;letter-spacing:.08em;font-size:.78rem;color:#6f2c91}
.glyph{flex:none;display:inline-block;vertical-align:middle}
.role-mark{display:inline-flex;align-items:center;gap:8px}.role-mark .rm-disc{width:var(--rm-size);height:var(--rm-size);border-radius:50%;background:var(--rm-bg);color:var(--rm-fg);display:inline-flex;align-items:center;justify-content:center;flex:none;box-shadow:0 4px 12px rgba(10,34,44,.18)}.role-mark b{font-size:.8rem;letter-spacing:.04em}
.rl-name{display:flex!important;align-items:center;gap:8px}
.role-orbit{position:relative;width:min(100%,540px);aspect-ratio:1;margin:0 auto}
.role-orbit .ro-ring{position:absolute;inset:0;border:1px solid rgba(111,44,145,.35);border-radius:50%}
.role-orbit .ro-mid{position:absolute;inset:18%;border-radius:50%;background:#efe6f5}
.role-orbit .ro-core{position:absolute;inset:34%;border-radius:50%;background:#35124a;color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:900;letter-spacing:.14em;font-size:clamp(.68rem,1.6vw,.95rem);line-height:1.3}
.role-orbit .ro-node{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px}
.role-orbit .ro-node b{font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:#35124a;background:#fff;padding:3px 9px;border-radius:999px;box-shadow:0 3px 10px rgba(10,34,44,.1)}
@media(max-width:560px){.role-orbit .ro-node .rm-disc{width:46px!important;height:46px!important}.role-orbit .ro-node .glyph{width:26px;height:26px}.role-orbit .ro-node b{font-size:.56rem;padding:2px 6px}}
.trio{display:flex;flex-wrap:wrap;gap:6px}.trio span{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:.7rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;background:#f1ece6;color:#8a8392;opacity:.7}.trio span.on{background:#35124a;color:#fff;opacity:1}
.moment-imgwrap{position:relative}.moment-cap{position:absolute;left:0;right:0;bottom:0;margin:0;padding:34px 16px 12px;background:linear-gradient(180deg,transparent,rgba(10,34,44,.88));color:#fff;font-size:.92rem;font-style:italic;line-height:1.35}
.moment-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;justify-content:space-between}
.owner-rows{display:grid;gap:8px;margin-top:8px}.owner-row{display:grid;grid-template-columns:minmax(0,1.3fr) auto auto;align-items:center;gap:10px;padding:8px 10px;background:#fff;border-radius:10px;border-left:5px solid #00a6a6}.owner-row.paper{border-left-color:#f0b323;background:#fffaf0}
.or-cap{font-weight:800;font-size:.95rem}.or-none{display:inline-flex;align-items:center;gap:6px;font-size:.8rem;font-weight:800;color:#8a6a00}.or-tag{display:inline-flex;align-items:center;gap:5px;font-size:.68rem;font-weight:900;letter-spacing:.1em;padding:4px 9px;border-radius:999px;background:#e9f6f4;color:#006b6b}.owner-row.paper .or-tag{background:#fff0c9;color:#654800}
.owner-ops{display:flex;flex-wrap:wrap;gap:6px}.owner-ops span{display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:800;padding:4px 10px;border-radius:999px}.owner-ops .ok{background:#e9f6f4;color:#006b6b}.owner-ops .gap{background:#fff;border:1px dashed #d9a000;color:#654800}.owner-none{margin:6px 0 0;font-size:.9rem}
.pa-wrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin:16px 0}.pa-card{background:#fff;border-radius:14px;padding:14px 16px;box-shadow:0 10px 30px rgba(10,34,44,.08);border-top:5px solid #00a6a6}.pa-card h3{margin:0 0 10px;font-size:1.05rem;display:flex;justify-content:space-between;gap:8px;align-items:baseline}.pa-card h3 small{font-size:.68rem;letter-spacing:.1em;color:#6f2c91;font-weight:900;text-transform:uppercase}
.pa-row{display:grid;grid-template-columns:96px minmax(0,1fr) 28px;align-items:center;gap:8px;margin:6px 0}.pa-row span{font-size:.7rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.pa-row i{height:14px;background:#ece7e1;border-radius:99px;overflow:hidden;display:block}.pa-row em{display:block;height:100%;background:#a98cc0;border-radius:99px;transition:width .5s}.pa-row em.top{background:linear-gradient(90deg,#00a6a6,#49205d)}.pa-row b{font-size:1rem;text-align:right}
.moves-grid,.mf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin:16px 0}.moves-card,.mf-card{background:#fff;border-radius:16px;padding:16px 18px;box-shadow:0 14px 40px rgba(10,34,44,.1);border-top:5px solid #6f2c91}.moves-card h3,.mf-card h3{margin:2px 0 10px;font-size:1.25rem}.moves-line{margin:10px 0 0;font-size:.95rem;line-height:1.4}
.moves-chips{display:flex;flex-wrap:wrap;gap:8px}.moves-chips span{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border-radius:999px;background:#efe6f5;color:#35124a;font-weight:800;font-size:.85rem}.moves-chips.big span{padding:10px 16px;font-size:1.05rem}
.contrast-row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.contrast-row details{background:#f7f3ee;border-radius:12px;padding:8px 12px}.contrast-row summary{cursor:pointer;display:flex;align-items:center;gap:8px;font-weight:800;font-size:.88rem;list-style:none}.contrast-row summary::-webkit-details-marker{display:none}.contrast-row details p{margin:6px 0 0;font-size:.85rem;max-width:300px;line-height:1.35}
.mf-cols{display:grid;grid-template-columns:1fr 1.4fr;gap:14px}@media(max-width:640px){.mf-cols{grid-template-columns:1fr}}.mf-cols small{display:block;font-size:.64rem;font-weight:900;letter-spacing:.12em;color:#6f2c91;margin-bottom:6px}.mf-holds p{display:flex;gap:8px;align-items:flex-start;margin:0 0 8px;font-size:.95rem;line-height:1.3;font-weight:700}.mf-holds .glyph{color:#35124a;margin-top:1px}
.fac-back-float{position:fixed;left:14px;bottom:14px;z-index:60;display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border:0;border-radius:999px;background:#35124a;color:#fff;font:inherit;font-size:.72rem;font-weight:900;letter-spacing:.1em;cursor:pointer;box-shadow:0 8px 22px rgba(10,34,44,.3)}.fac-back-float:hover{background:#49205d}
.arthur-effect{background:#f7f3ee;border-left:5px solid #6f2c91;padding:10px 12px;margin:10px 0}.arthur-effect b{display:block;font-size:.66rem;letter-spacing:.12em;color:#49205d;margin-bottom:4px}.arthur-effect p{margin:3px 0;font-size:.92rem;line-height:1.35}
.stand-arthur{font-size:.82rem;line-height:1.35;margin:4px 0 8px;color:#35124a;font-weight:700}
.redraw-link{background:none;border:0;color:#6f2c91;font:inherit;font-size:.74rem;font-weight:900;letter-spacing:.1em;cursor:pointer;text-decoration:underline;padding:8px 4px}

.hb-closed{padding:12px;background:#f3eee8;font-weight:900;font-size:.72rem;letter-spacing:.1em;text-align:center;margin:10px 0}
  .intro-frame{margin:14px 0;padding:12px 14px;border-left:5px solid #f0b323;background:rgba(255,255,255,.1);font-weight:700;line-height:1.4;max-width:760px}.app.compact .intro-frame{background:#f7f3ee;color:#0a222c;font-size:.95rem}
  .tk-why{font-size:clamp(1.05rem,1.7vw,1.35rem);max-width:980px;line-height:1.45}
  .tk-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin:22px 0}
  .tk-card{background:#fff;border-radius:16px;padding:16px 18px;box-shadow:0 14px 40px rgba(10,34,44,.1);border-top:5px solid #00a6a6}.tk-card.paper{border-top-style:dashed;border-top-color:#d9a000}.tk-card h3{margin:4px 0 8px;font-size:1.15rem}
  .tk-status{background:#e9f6f4;color:#006b6b;margin-bottom:8px}.tk-status.paper{background:#fff0c9;color:#654800}
  .tk-close{margin:10px 0 0;font-size:.95rem;line-height:1.4}
  .tk-rows{display:grid;gap:10px;margin:12px 0}.tk-row{display:grid;grid-template-columns:34px minmax(0,1fr);gap:10px;align-items:start}.tk-ico{width:34px;height:34px;border-radius:50%;background:#35124a;color:#fff;display:flex;align-items:center;justify-content:center}.tk-ico.gap{background:#fff;color:#654800;border:2px dashed #d9a000}.tk-row b{display:block;font-size:.62rem;letter-spacing:.12em;color:#6f2c91}.tk-row p{margin:2px 0 0;font-size:.88rem;line-height:1.35}
  .tk-blanks{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin:10px 0 18px}.tk-blanks>div{background:#fff;border-radius:12px;padding:14px 16px}.tk-blanks b{font-size:.7rem;letter-spacing:.12em;color:#49205d}.tk-blanks i{display:block;border-bottom:2px solid #c9c3bb;height:34px}
  .tk-contact{font-weight:900;font-size:1.1rem;color:#49205d}.tk-ask{font-weight:800;line-height:1.4;color:#49205d}
  .tk-mail{display:flex;align-items:center;justify-content:center;text-decoration:none;margin:12px 0 6px}
  .promise-bar{margin:10px 0;padding:10px 12px;background:#35124a;border-radius:10px;color:#fff}.promise-bar .pb-k{display:block;font-size:.62rem;font-weight:900;letter-spacing:.16em;color:#f0b323}.promise-bar b{display:block;font-size:1rem;margin:2px 0 6px;color:#fff}.promise-bar .pb-conds{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}.promise-bar small{display:block;font-size:.76rem;line-height:1.35;opacity:.9;color:#fff}
  .lift-line{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 14px 0;font-size:.82rem}.lift-line b{font-size:.62rem;letter-spacing:.12em;color:#6f2c91;margin-right:2px}.lift-line.none{opacity:.65;font-weight:700}
    .ops-covers span.mine{outline:2px solid #35124a;outline-offset:1px}
    .state-legend{display:flex;flex-wrap:wrap;gap:4px 12px;margin:6px 0;font-size:.74rem;color:#fff}.state-legend span{display:flex;align-items:center;gap:6px;line-height:1.3}.state-legend .st-chip{margin:0}
    .touch-chip{display:inline-block;padding:3px 9px;border-radius:999px;background:#35124a;color:#fff;font-size:.72rem;font-weight:900;letter-spacing:.06em}
    .lift-line em{font-style:normal;font-weight:700;color:#35124a;flex-basis:100%;line-height:1.35}.lift-line.held b{color:#8a6a00}.lift-line.held em{color:#654800}
    .what-it-is{margin:8px 14px 0;font-weight:800;font-size:.92rem;line-height:1.3;color:#0a222c}
    .hb-k{display:block;margin-top:8px;font-size:.62rem;letter-spacing:.12em;color:#8a6a00}.hb-line{margin:3px 0;font-size:.86rem;line-height:1.35}
      .key-statement{margin:18px 0 22px;max-width:980px}.key-statement p{margin:0}
      .ks-lead,.ks-tail{font-size:clamp(1.5rem,3.2vw,2.6rem);font-weight:800;line-height:1.15}
      .ks-chips{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}.ks-chips span{display:inline-flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:#fff;color:#35124a;font-weight:900;font-size:clamp(1rem,1.8vw,1.35rem);box-shadow:0 8px 22px rgba(10,34,44,.22)}
      .ks-turn{margin-top:18px!important;font-size:clamp(1.3rem,2.6vw,2.1rem);font-weight:800;color:#f0b323;line-height:1.2}
      .key-statement.compact .ks-lead,.key-statement.compact .ks-tail{font-size:1.25rem;color:#0a222c}.key-statement.compact .ks-chips{gap:6px;margin:10px 0}.key-statement.compact .ks-chips span{padding:6px 12px;font-size:.84rem;background:#35124a;color:#fff;box-shadow:none}.key-statement.compact .ks-turn{font-size:1.1rem;color:#6f2c91;margin-top:10px!important}
      .app.compact .key-statement{padding:14px 16px;background:#f7f3ee;border-left:6px solid #f0b323;border-radius:6px}
      .intro-final .intro-quote-small{margin:26px 0 8px;font-size:clamp(1rem,1.6vw,1.25rem);font-style:italic;max-width:760px;opacity:.9}.intro-final .intro-quote-small span{display:block;font-style:normal;font-size:.66rem;font-weight:900;letter-spacing:.16em;color:#f0b323;margin-bottom:4px}
      .intro-more{margin-top:10px;max-width:760px}.intro-more summary{cursor:pointer;font-weight:900;font-size:.66rem;letter-spacing:.14em;color:#f0b323;padding:6px 0}.app.compact .intro-more summary{color:#6f2c91}.intro-more p{margin:6px 0}
      .one-line{font-size:clamp(1.2rem,2vw,1.75rem)!important;font-weight:800;color:#49205d;max-width:640px;line-height:1.3;margin:18px 0!important}
      .role-hero{display:flex;align-items:center;gap:12px;margin:6px 0}.role-hero h1{margin:0!important}
      .app.compact .brief-question.big p{font-size:1.3rem;font-weight:800;line-height:1.3}
      .pivot-q{margin:30px 0;padding:clamp(22px,4vw,46px);background:#35124a;border-radius:18px;border-left:12px solid #f0b323}.pivot-q span{display:block;font-size:.7rem;font-weight:900;letter-spacing:.18em;color:#f0b323}.pivot-q h2{margin:10px 0 0;color:#fff!important;font-size:clamp(1.9rem,4.6vw,3.6rem)!important;line-height:1.08;max-width:900px}
      .app.compact .pivot-q{margin:20px 0;padding:18px 16px;border-left-width:8px;border-radius:12px}.app.compact .pivot-q h2{font-size:clamp(1.5rem,7vw,2rem)!important;color:#fff!important}
      .mc-head{display:flex;gap:14px;align-items:center;margin-bottom:12px}.mc-head>div{min-width:0}.mc-head h3{margin:2px 0 0!important}.mc-name{display:block;font-size:1.1rem;margin-bottom:6px}
      .cap-thumb{width:104px;height:72px;object-fit:cover;border-radius:10px;flex:none;background:#0a222c;box-shadow:0 6px 16px rgba(10,34,44,.2)}.app.compact .cap-thumb{width:84px;height:60px}
      .what-moves{font-weight:800;font-size:1.05rem;color:#49205d;margin:10px 0}.phone-holds{margin:10px 0}
      .decision-ctx{margin:6px 0 12px;font-size:1rem}.decision-ctx .revised-tag{margin-left:8px}
      .decide-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0 14px}.decide-row.two{grid-template-columns:repeat(2,minmax(0,1fr))}
      .decide-row button{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;border:2px solid rgba(10,34,44,.15);background:#fff;color:#0a222c;border-radius:12px;padding:12px 12px;font:inherit;cursor:pointer;min-height:58px}
      .decide-row button b{font-size:.92rem;letter-spacing:.04em}.decide-row button small{font-size:.74rem;opacity:.75;line-height:1.25}
      .decide-row button.dr-invest{border-color:#00a6a6;background:#e9f6f4}.decide-row button.dr-start{border-color:#f0b323;background:#fff6dd}.decide-row button.dr-prepare{border-color:#49205d;background:#f3ecf7}.decide-row button.dr-stand{border-color:#00a6a6;background:#e9f6f4}.decide-row button.dr-change{border-color:#f0b323;background:#fff6dd}
      .decide-row button.dr-hold{border-style:dashed}.decide-row button:disabled{opacity:.45;cursor:default}
      .brief-more{margin:8px 0}.brief-more summary{cursor:pointer;font-weight:900;font-size:.66rem;letter-spacing:.12em;color:#6f2c91;padding:6px 0}
    .cost-glance{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin:8px 14px 0;font-size:.8rem}.cost-glance span{font-size:.6rem;font-weight:900;letter-spacing:.12em;color:#6f2c91}.cost-glance b{font-size:.88rem}.cost-glance em{font-style:normal;font-weight:800;color:#35124a}.cost-glance.short span,.cost-glance.short em{color:#b54a5a}
    .opt-body .cost-glance,.opt-row .cost-glance{margin:6px 0 0}
    .opt-more{margin-top:6px}.opt-more summary{cursor:pointer;font-weight:900;font-size:.68rem;letter-spacing:.1em;color:#6f2c91;padding:6px 0}
    .pb-more summary{cursor:pointer;font-weight:900;font-size:.62rem;letter-spacing:.14em;color:#f0b323;padding:4px 0}
    .diff-tag{display:inline-block;margin:4px 0;padding:3px 9px;border-radius:999px;font-style:normal;font-size:.64rem;font-weight:900;letter-spacing:.1em}.diff-hard{background:#fff0c9;color:#654800}.diff-x{background:#f6e3e6;color:#8a2f3e}.diff-out{background:#35124a;color:#fff}
  .moment-tag{position:absolute;top:12px;left:12px;background:#fff;color:#654800;font-size:.66rem;font-weight:900;letter-spacing:.12em;padding:5px 10px;border-radius:999px;border:2px dashed #d9a000}
  .moment-card.paper .moment-img{filter:saturate(.55) brightness(.82)}.moment-card.paper{outline:3px dashed #d9a000;outline-offset:-3px}
  .tc-sp{margin:10px 0;padding:10px 12px;background:#efe4f4;border-left:5px solid #6f2c91;font-size:.9rem;line-height:1.4}.tc-sp b{display:block;font-size:.64rem;letter-spacing:.12em;color:#49205d;margin-bottom:3px}
  .paper-ribbon{display:inline-block;align-self:flex-start;margin:6px 0 0;background:#fff;color:#654800;border:2px dashed #d9a000;border-radius:999px;padding:4px 10px;font-style:normal;font-size:.66rem;font-weight:900;letter-spacing:.12em}
  .fut-card.paper>header{box-shadow:inset 0 0 0 4px rgba(217,160,0,.85)}
  .pchip-designed{border-color:#d9a000;background:#fff8e6;border-top-style:dashed}
  .review-lock .phone-card button,.review-lock .phone-card textarea,.review-lock .phone-card input,.review-lock .phone-card [role=radio]{pointer-events:none;opacity:.55}
  /* the closing film: light text on the dark scene, in every view */
  .film .film-copy,.film .film-copy h2,.film .film-copy p,.film .film-copy li,.film .film-copy ul{color:#fff!important}.film .film-copy>span{color:#f0b323!important}.film .film-copy .film-final{color:#f0b323!important}.film .film-copy p{text-shadow:0 1px 8px rgba(10,34,44,.6)}.film .film-continuum span{color:#fff!important}
.sum-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px;margin:26px 0}
.sum-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(10,34,44,.1);cursor:pointer;transition:transform .25s,box-shadow .25s;border:2px solid transparent}
.sum-card:hover{transform:translateY(-3px)}.sum-card.selected{border-color:#6f2c91}
.sum-card header{min-height:190px;padding:22px;background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end}
.sum-card header span{font-size:.68rem;font-weight:900;letter-spacing:.14em;opacity:.85}
.sum-card header h3{color:#fff;margin:4px 0 6px;font-size:1.5rem}.sum-card header p{margin:0;font-weight:700}
.sum-body{padding:16px 18px 20px}
.sum-label{font-size:.68rem;font-weight:900;letter-spacing:.14em;color:#6f2c91;margin:14px 0 6px}
.mini-caps{display:flex;flex-wrap:wrap;gap:8px}.mini-caps figure{margin:0;width:84px}
.mini-caps img{width:84px;height:58px;object-fit:cover;border-radius:8px;display:block}
.mini-caps figcaption{font-size:.68rem;line-height:1.2;margin-top:4px}
.mini-caps.prepared img{filter:grayscale(.6);outline:2px dashed #6f2c91;outline-offset:-2px}
.mini-empty{font-size:.85rem;opacity:.6;margin:0}
.sum-callout{margin-top:14px;padding:14px;background:#fff6dd;border-radius:10px}
.sum-callout b{font-size:.68rem;letter-spacing:.14em;color:#654800}.sum-callout p{margin:6px 0 0;font-size:.88rem;line-height:1.4}
.sum-said{font-style:italic;color:#49205d}
.sum-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.sum-badges span{font-size:.68rem;font-weight:900;letter-spacing:.1em;padding:5px 9px;border-radius:999px}
.badge-constraint{background:#0a222c;color:#fff}.badge-signal{background:#efe4f4;color:#50226a}
.sum-more{margin-top:14px;font-size:.88rem}
.q-card{min-height:440px;border-radius:20px;padding:clamp(28px,5vw,64px);background-size:cover;background-position:center;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;margin:20px 0}
.q-card>span{font-size:.72rem;font-weight:900;letter-spacing:.16em;color:#f0b323}
.q-card h2{color:#fff;font-size:clamp(1.8rem,3.6vw,3.2rem);line-height:1.12;max-width:900px;margin:14px 0 26px}
.q-nav{display:flex;gap:10px;flex-wrap:wrap}.q-nav button{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 16px;font:inherit;font-weight:800;cursor:pointer}
.q-nav button:disabled{opacity:.35;cursor:default}
.quote-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin:10px 0 24px}
.quote-card{margin:0;background:#fff;border-radius:14px;padding:22px;border-top:5px solid #f0b323}
.quote-card blockquote{margin:0;font-size:1.15rem;font-weight:700;line-height:1.35;color:#0a222c;border:0;padding:0;background:none}
.quote-card figcaption{margin-top:12px;font-size:.68rem;font-weight:900;letter-spacing:.12em;color:#6f2c91}
.quote-card small{display:block;margin-top:4px;font-size:.8rem;letter-spacing:0;font-weight:500;color:#0a222c;opacity:.75}
.film{position:relative;border-radius:20px;overflow:hidden;background:#0a222c;margin:20px 0;aspect-ratio:16/8;min-height:380px}
.film-progress{position:absolute;top:14px;left:18px;right:18px;display:flex;gap:6px;z-index:3}
.film-progress i{flex:1;height:3px;background:rgba(255,255,255,.25);border-radius:3px;overflow:hidden;position:relative}
.film-progress i.done{background:#fff}.film-progress i.run:after{content:'';position:absolute;inset:0;background:#fff;animation:filmbar 7s linear forwards;transform-origin:left}
@keyframes filmbar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.film-frame{position:absolute;inset:0;animation:filmfade .9s ease}
.film-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:kenburns 7.5s ease-out forwards}
.film-frame:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,34,44,.92) 0%,rgba(10,34,44,.55) 50%,rgba(10,34,44,.1) 100%);z-index:1}
.film-copy{position:absolute;left:clamp(22px,5vw,64px);bottom:clamp(60px,8vw,90px);max-width:620px;color:#fff;z-index:2}
.film-copy>span{font-size:.72rem;font-weight:900;letter-spacing:.2em;color:#f0b323}
.film-copy h2{color:#fff;font-size:clamp(1.7rem,3.4vw,3rem);line-height:1.08;margin:10px 0 14px}
.film-copy ul{margin:0;padding-left:18px;font-size:1rem;line-height:1.45;opacity:.95}
.film-copy p{font-size:1.1rem}
.film-continuum{display:flex;flex-wrap:wrap;gap:6px;margin-top:14px}
.film-continuum span{font-size:.68rem;font-weight:900;letter-spacing:.1em;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.35);opacity:.55}
.film-continuum span.lit{background:#00a6a6;border-color:#00a6a6;opacity:1}
.film-end{background:radial-gradient(circle at 70% 30%,#49205d,#0a222c 65%)}.film-end:before{display:none}
.film-controls{position:absolute;right:16px;bottom:14px;display:flex;gap:8px;z-index:3}
.film-controls button{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:999px;padding:8px 13px;font:inherit;font-size:.82rem;font-weight:800;cursor:pointer}
.film-controls button:disabled{opacity:.35}
@keyframes kenburns{from{transform:scale(1.02) translate(0,0)}to{transform:scale(1.14) translate(-2%,-1%)}}
@keyframes filmfade{from{opacity:0}to{opacity:1}}
.pcard-img{margin:-12px -14px 10px;height:92px;overflow:hidden;position:relative}.pcard-img img{width:100%;height:100%;object-fit:cover;display:block}.pcard-img.tile-out img{filter:grayscale(1);opacity:.4}.pcard-img.tile-prepare-only img{filter:grayscale(.7);opacity:.75}.pcard-img.tile-committed{height:56px}
.prompt-box{background:#fff;border-radius:14px;padding:18px 20px;margin:10px 0 24px;border-left:5px solid #6f2c91}
.prompt-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.prompt-head b{font-size:.68rem;letter-spacing:.14em;color:#49205d}
.prompt-box textarea{width:100%;min-height:220px;margin-top:10px;font-size:.84rem;line-height:1.45}
.prompt-box summary{cursor:pointer;font-weight:900;font-size:.68rem;letter-spacing:.1em;color:#6f2c91;margin-top:6px}
@media(max-width:800px){.hb-grid,.sum-grid{grid-template-columns:1fr}.cap-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.gauges{grid-template-columns:repeat(2,minmax(0,1fr))}.film{aspect-ratio:auto;min-height:520px}.q-card{min-height:360px}}
@media (prefers-reduced-motion:reduce){.film-frame img,.film-frame,.film-progress i.run:after{animation:none}}
`;

class RoomErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(error,info){ console.error('Facilitator screen error',error,info); }
  componentDidUpdate(prev){ if(prev.resetKey!==this.props.resetKey && this.state.error) this.setState({error:null}); }
  render(){
    if(!this.state.error) return this.props.children;
    return <Shell><section className="center-stage"><div className="eyebrow">SCREEN RECOVERY</div><h1>This screen could not render.</h1><p>The room and all responses are saved. Go back one step or reload; the session will resume.</p><pre style={{whiteSpace:'pre-wrap',fontSize:13,padding:14,background:'#f3eee8',textAlign:'left'}}>{String(this.state.error?.message||this.state.error)}</pre><div className="room-actions">{this.props.onBack&&<Button secondary onClick={this.props.onBack}>BACK ONE STEP</Button>}<Button onClick={()=>location.reload()}>RELOAD ROOM</Button></div></section></Shell>;
  }
}

/* ---------------------------------------------------------------------
   FACILITATOR CONTROLLER
   --------------------------------------------------------------------- */

const FACILITATOR_SCREENS = {
  arthur_intro: ArthurIntroRoom, assignments: AssignmentRoom, context: ContextRoom, tension: TensionRoom, resources: ResourcesRoom, discussion: DiscussionRoom,
  brief_reveal: BriefRevealRoom, brief_read: BriefReadRoom, brief_share: BriefShareRoom, alignment: AlignmentRoom, ready: ReadyRoom,
  cap_portfolio: CapabilityPortfolioRoom, cap_nominate: CapabilityPortfolioRoom, cap_results: CapabilityResultsRoom,
  t_reveal: TRevealRoom, t_instinct: TInstinctRoom, t_cost: TCostRoom, t_mission: TMissionRoom, t_change_vote: TChangeVoteRoom,
  t_design: TDesignRoom, t_discuss: TDiscussRoom, t_decision: TDecisionRoom, t_checkpoint: TCheckpointRoom,
  t_scale_vote: TScaleVoteRoom, t_scale_reveal: TScaleRevealRoom, t_continuum_vote: TContinuumVoteRoom,
  t_continuum_reveal: TContinuumRevealRoom, t_ripple: TRippleRoom,
  p_open: POpenRoom, p1_board: makeBoardRoom(1), p1_decide: makeDecideRoom(1), p2_board: makeBoardRoom(2), p2_decide: makeDecideRoom(2),
  p_signal: PSignalRoom, p3_board: makeBoardRoom(3), p3_decide: OpsDecideRoom,
  promise: PromiseRoom, f_cards: FCardsRoom, f_future: FFutureRoom, f_turns: FTurnsRoom, f_locks: FLocksRoom, f_compare: FCompareRoom, f_debrief: FDebriefRoom, f_film: FFilmRoom, f_takeaway: TakeawayRoom,
};

/* Older builds used these phase names; route them safely. */
const LEGACY_PHASES = LEGACY_JOURNEY_PHASES;

function Facilitator({ onExit }) {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [responses, setResponses] = useState([]);
  const [maxReached, setMaxReached] = useState('lobby');
  const [syncedAt, setSyncedAt] = useState(0);
  const busy = useRef(false);

  const create = async () => {
    const now = new Date().toISOString();
    const s = { id: uid(), code: makeCode(), phase: 'lobby', created_at: now, updated_at: now };
    await saveSession(s);
    sessionStorage.setItem('bydesign-facilitator-code', s.code);
    setSession(s);
  };

  useEffect(() => {
    const code = sessionStorage.getItem('bydesign-facilitator-code');
    if (!code || session) return;
    fetchSession(code).then((s) => { if (s) setSession(s); }).catch(() => {});
  }, []);

    useEffect(() => {
      if (!session) return undefined;
      let alive = true;
      let again = false;
      let debounce;
      const refresh = async () => {
        if (busy.current) { again = true; return; }
        busy.current = true;
        try {
          const s = await fetchSession(session.code);
          if (s) { setSession((x) => ({ ...x, ...s })); setMaxReached((m) => phaseIndex(s.phase) > phaseIndex(m) ? (LEGACY_PHASES[s.phase] || s.phase) : m); }
          setParticipants(await fetchParticipants(session.id, session.code));
          setResponses(await fetchResponses(session.id, session.code));
          setSyncedAt(Date.now());
        } catch (e) {
          /* the pill reads RECONNECTING until the next read succeeds */
        } finally {
          busy.current = false;
          if (again && alive) { again = false; refresh(); }
        }
      };
      const soon = () => { clearTimeout(debounce); debounce = setTimeout(refresh, 400); };
      refresh();
      const timer = setInterval(refresh, 3000);
      let channel;
      if (hasSupabase) {
        channel = supabase
          .channel(`hybrid-room-${session.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_sessions', filter: `id=eq.${session.id}` }, soon)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_participants', filter: `session_id=eq.${session.id}` }, soon)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_responses', filter: `session_id=eq.${session.id}` }, soon)
          .subscribe();
      }
      return () => {
        alive = false;
        clearInterval(timer);
        clearTimeout(debounce);
        if (channel) supabase.removeChannel(channel);
      };
    }, [session?.id]);

  const facReady = useRef(false);
  const facSave = async (type, capabilityId, table, choice, note = '') => {
    if (!facReady.current) {
      await addParticipant({ id: session.id, session_id: session.id, initials: 'FAC', persona: 'facilitator', table_number: 1, hospital_id: TABLE_MAP[1], created_at: session.created_at || new Date().toISOString() }, session.code);
      facReady.current = true;
    }
    const t = validTable(table) || 1;
    await saveResponse({ id: uid(), session_id: session.id, participant_id: session.id, table_number: t, hospital_id: TABLE_MAP[t], persona: 'facilitator', capability_id: capabilityId, response_type: type, choice, note, updated_at: new Date().toISOString() }, session.code);
    setResponses(await fetchResponses(session.id, session.code));
  };

  const advance = async (phase) => {
    const next = { ...session, phase, updated_at: new Date().toISOString() };
    await saveSession(next);
    setSession(next);
    setMaxReached((m) => phaseIndex(phase) > phaseIndex(m) ? phase : m);
  };

  if (!session) return <FacilitatorStart onCreate={create} onBack={() => { sessionStorage.removeItem('bydesign-facilitator-code'); onExit(); }} />;
  const phase = LEGACY_PHASES[session.phase] || session.phase;
  if (phase === 'lobby') return <><JourneyNav phase={phase} maxPhase={maxReached} onGo={advance}/><Lobby session={session} participants={participants} onAdvance={advance} responses={responses} facSave={facSave} /></>;
  const Screen = FACILITATOR_SCREENS[phase] || FFilmRoom;
  const back = priorPhase(phase);
  const live = syncedAt && Date.now() - syncedAt < 10000;
    const syncPill = <div className={`sync-pill ${live ? 'live' : ''}`}>{live ? `${participants.length} JOINED · ${responses.length} RESPONSES` : 'RECONNECTING…'}</div>;
  return <>{syncPill}{back && <button type="button" className="fac-back-float" onClick={() => advance(back)} aria-label="Back one screen"><ArrowLeft size={18} />BACK</button>}<JourneyNav phase={phase} maxPhase={maxReached} onGo={advance}/><RoomErrorBoundary resetKey={phase} onBack={back ? () => advance(back) : null}><Screen session={session} participants={participants || []} responses={responses || []} onAdvance={advance} facSave={facSave} synced={syncedAt > 0} /></RoomErrorBoundary></>;
}

/* ---------------------------------------------------------------------
   PARTICIPANT · JOIN + ONBOARD
   --------------------------------------------------------------------- */

function JoinCode({ initial, onJoin, onExit }) {
  const [c, setC] = useState(initial || '');
  return (
    <Shell compact>
      <section className="phone-card">
        <button className="text-link" type="button" onClick={onExit}><ArrowLeft size={16} /> Home</button>
        <QrCode className="solo-icon" />
        <div className="eyebrow">JOIN A FACILITATED SESSION</div>
        <h1>Enter the room code.</h1>
        <input value={c} onChange={(e) => setC(e.target.value.toUpperCase())} placeholder="BYD-123" maxLength={7} />
        <Button disabled={c.length < 5} onClick={() => onJoin(c.trim())}>CONTINUE</Button>
      </section>
    </Shell>
  );
}

function Onboard({ session, onDone }) {
  const [step, setStep] = useState(0);
  const [initials, setInitials] = useState('');
  const [persona, setPersona] = useState('');
  const [table, setTable] = useState(null);
  const [error, setError] = useState('');

  const finish = async () => {
    const t = validTable(table);
    if (!t) {
      setError('Choose a table between 1 and 6.');
      return;
    }
    try {
      const p = {
        id: uid(),
        session_id: session.id,
        initials: initials.trim().toUpperCase(),
        persona,
        table_number: t,
        hospital_id: TABLE_MAP[t],
        created_at: new Date().toISOString(),
      };
      await addParticipant(p, session.code);
      sessionStorage.setItem(`bydesign-player-${session.code}`, JSON.stringify(p));
      onDone(p);
    } catch (e) {
      setError(e.message || 'Unable to join. Try again.');
    }
  };

  return (
    <Shell compact>
      <section className="phone-card">
        {step === 0 && (
          <>
            <div className="eyebrow">FIRST, WHO ARE YOU?</div>
            <h1>Add your initials.</h1>
            <input autoFocus value={initials} onChange={(e) => setInitials(e.target.value.slice(0, 3))} placeholder="CJ" />
            <Button disabled={!initials.trim()} onClick={() => setStep(1)}>CONTINUE</Button>
          </>
        )}
        {step === 1 && (
          <>
            <div className="eyebrow">YOUR PERSPECTIVE</div>
            <h1>What perspective are you bringing?</h1>
            <div className="persona-list">
              {PERSONAS.map((p) => (
                <button type="button" key={p.id} className={persona === p.id ? 'selected' : ''} onClick={() => setPersona(p.id)}>
                  <b className="rl-name"><RoleMark id={p.id} size={30} />{p.name}</b>
                  <span>{p.line}</span>
                  {persona === p.id && <Check />}
                </button>
              ))}
            </div>
            <Button disabled={!persona} onClick={() => setStep(2)}>CONTINUE</Button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="eyebrow">FIND YOUR TEAM</div>
            <h1>Which table are you sitting at?</h1>
            <div className="table-picker">
              {TABLE_NUMBERS.map((n) => (
                <button type="button" className={table === n ? 'selected' : ''} onClick={() => setTable(n)} key={n}>{n}</button>
              ))}
            </div>
            {table && (
              <div className="selection-summary">
                <span>TABLE {table}</span>
                <b>{hospitalForTable(table).name}</b>
              </div>
            )}
            <Button disabled={!table} onClick={finish}>JOIN TABLE {table || ''}</Button>
          </>
        )}
        {error && <p className="error">{error}</p>}
      </section>
    </Shell>
  );
}

/* ---------------------------------------------------------------------
   PARTICIPANT · INTERACTIVE PHONE SCREENS
   --------------------------------------------------------------------- */

function PerspectiveCapture({ player, brief, responses, onSubmit }) {
  const existing = myResponse(responses, player.id, 'perspective');
  const [choice, setChoice] = useState(existing?.choice || '');
  const [note, setNote] = useState(existing?.note || '');
  const [saved, setSaved] = useState(Boolean(existing));
  const table = validTable(player.table_number);

  const [err, setErr] = useState('');
  const submit = async () => {
    if (!choice) return;
    setErr('');
    try { await onSubmit('perspective', choice, note); setSaved(true); }
    catch (e) { setErr(e?.message || 'Could not be saved. Try again.'); }
  };

  return (
    <Shell compact>
      <section className="phone-card strategic-brief share-brief">
        <div className="eyebrow">YOUR PERSPECTIVE · {table ? `TABLE ${table}` : 'TABLE ASSIGNMENT UNAVAILABLE'}</div>
        <h1>What will you protect?</h1>
        <p>Select the priority that matters most for this hospital.</p>
        <div className="priority-picker">
          {brief.protect.map((x) => (
            <button type="button" key={x} className={choice === x ? 'selected' : ''} onClick={() => { setChoice(x); setSaved(false); }}>
              {choice === x && <Check size={18} />}
              <b>{x}</b>
            </button>
          ))}
        </div>
        <label className="note-label">
          Complete the sentence <small>optional · 140 characters</small>
          <textarea
            maxLength={140}
            value={note}
            onChange={(e) => { setNote(e.target.value); setSaved(false); }}
            placeholder={`Protect ${choice || 'this priority'} because...`}
          />
        </label>
        <Button disabled={!choice || saved} onClick={submit}>{saved ? 'PERSPECTIVE CAPTURED' : 'SAVE MY PERSPECTIVE'}</Button>
        {err && <p className="error">{err}</p>}
      </section>
    </Shell>
  );
}

function useSaver(onSubmit) {
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const run = async (...args) => {
    if (saving) return false;
    setSaving(true); setErr('');
    try { await onSubmit(...args); return true; } catch (e) { setErr(e?.message || 'Could not be saved.'); return false; } finally { setSaving(false); }
  };
  return { saving, err, setErr, run };
}

function VotePhone({ player, responses, onSubmit, type, keyName = 'teach', eyebrow, title, text, options, savedLabel }) {
  const mine = myResponse(responses, player.id, type, keyName);
  const { saving, err, setErr, run } = useSaver(onSubmit);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {text && <p>{text}</p>}
        <div className="phone-vote-grid">
          {options.map(([id, label, sub]) => (
            <button type="button" disabled={saving} key={id} className={mine?.choice === id ? 'selected' : ''} onClick={() => run(type, id, '', keyName)}>
              <b>{label}</b>{sub && <span>{sub}</span>}
            </button>
          ))}
        </div>
        {saving && <div className="submission-confirm">SAVING…</div>}
        {mine && !saving && <div className="submitted-mark"><Check size={16} /> {savedLabel || 'RESPONSE SAVED'} · {choiceLabel(mine.choice)}</div>}
        {err && <div className="toast" onClick={() => setErr('')}>{err} · Tap to dismiss and try again.</div>}
      </section>
    </Shell>
  );
}

function CapabilityNominationPhone({ player, responses = [], onSubmit }) {
  const existing = myResponse(responses, player.id, 'capability_nomination', 'portfolio');
  const { saving, err, setErr, run } = useSaver(onSubmit);
  const hid = player.hospital_id;
  const h = HOSPITALS[hid] || HOSPITALS.academic;
  return (
    <Shell compact>
      <section className="phone-card cap-phone">
        <div className="eyebrow">PRIVATE NOMINATION · {h.name}</div>
          <h1>Which capability should your table explore?</h1>
          <PromiseChip table={validTable(player.table_number)} responses={responses} ledger={blankLedger(h)} legend />
          <Gauges have={startOf(h)} start={startOf(h)} />
          <p className="need-line">{DECISION_PROMPT}</p>
          <div className="img-cards">
          {CAPABILITIES.map((c) => (
            <div key={c.id} className={`img-card ${existing?.choice === c.id ? 'selected' : ''}`}>
              <button type="button" disabled={saving} onClick={() => run('capability_nomination', c.id, '', 'portfolio')}>
                <div className="img-card-hero" style={{ backgroundImage: `linear-gradient(180deg,transparent 35%,rgba(10,34,44,.88)),url(${c.image})` }}>
                  <b>{c.name}</b>{existing?.choice === c.id && <span className="picked"><Check size={14} /> NOMINATED</span>}
                </div>
                  <p className="what-it-is">{c.promise}</p>
                  <p className="for-you">{shortLine(roleLine(c.id, player.persona))}</p>
                  <LiftLine rows={liftFor(blankLedger(h), c.id, promiseOf(responses, validTable(player.table_number)))} />
                  </button>
              <details><summary>MORE</summary><div className="mini-dials"><Gauges have={startOf(h)} start={startOf(h)} pending={investCost(hid, c.id)} /></div><p>{roleLine(c.id, player.persona)}</p><p><i>{careMoment(c.id)}</i></p>{burdenFor(c, player.persona) && <p><b>My team carries:</b> {burdenFor(c, player.persona)}</p>}<p><b>Your question:</b> {lensFor(c.id, player.persona)}</p></details>
            </div>
          ))}
        </div>
        {saving && <div className="submission-confirm">SAVING NOMINATION…</div>}
        {err && <div className="toast" onClick={() => setErr('')}>{err} · Tap to dismiss and try again.</div>}
      </section>
    </Shell>
  );
}

function CapabilityResultsPhone({ player, participants, responses }) {
  const table = validTable(player.table_number);
  const ranked = nominationRanking(participants, responses, table);
  const top = ranked[0];
  const cap = top && top.n > 0 ? top.c : null;
  const tied = top && top.n > 0 ? ranked.filter((x) => x.n === top.n) : [];
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">TABLE {table || '—'} · NOMINATIONS REVEALED</div>
        {cap && <img className="phone-hospital-image" src={cap.image} alt="" onError={(e) => imageFallback(e)} />}
        <h1>{cap ? (tied.length > 1 ? `Your table is tied: ${tied.map((x) => x.c.name).join(' or ')}.` : `Your table leads with ${cap.name}.`) : 'No nominations yet.'}</h1>
        <p>{tied.length > 1 ? 'Your facilitator will confirm which one your table explores.' : 'Your facilitator is confirming each table’s teaching capability.'} No resources have been committed yet.</p>
      </section>
    </Shell>
  );
}

/* The recorder rotates each decision (see recorderFor). Kept as a thin wrapper for older call sites. */
function recorderOf(participants, table, responses = [], key = 'teach') {
  return recorderFor(participants, responses, table, key);
}
const instinctTally = (responses, participants, table) => {
  const votes = membersOf(participants, table).map((p) => myResponse(responses, p.id, 'first_instinct', 'teach')?.choice).filter(Boolean);
  return CHOICES.map((c) => [c, votes.filter((v) => v === c).length]).filter(([, n]) => n > 0);
};

function ConfirmSheet({ title, lines = [], onConfirm, onCancel, busy, children, confirmDisabled = false, hint = '' }) {
  return (
    <div className="confirm-sheet" role="dialog" aria-label="Confirm table decision">
      <b>{title}</b>
      {lines.filter(Boolean).map((x) => <p key={x}>{x}</p>)}
      {children}
      <div className="action-row">
        <Button disabled={busy || confirmDisabled} onClick={onConfirm}>{busy ? 'RECORDING…' : 'CONFIRM · RECORD FOR THE TABLE'}</Button>
        {confirmDisabled && hint && <p className="small-note">{hint}</p>}
        <Button secondary disabled={busy} onClick={onCancel}>NOT YET · KEEP DISCUSSING</Button>
      </div>
    </div>
  );
}

/* Compact option rows for the portfolio cycles; the full text sits under WHAT IT MEANS. */
function OptionPicker({ cap, ledger, have, start, costs, onChoose, disabled }) {
  const c = costs || optionCosts(ledger, cap.id);
  const followOn = ledger && ledger.prepared.includes(cap.id) ? 'complete' : ledger && ledger.piloted.includes(cap.id) ? 'scale' : null;
  const keys = followOn ? ['invest'] : OPTION_KEYS;
  return (
    <div className="opt-pick">
      {keys.map((k) => {
        const d = optionDetail(cap, k);
        const cost = c[k];
        const ok = cost ? fits(have, cost) : false;
        const limit = cost && !ok ? limitingOf(have, cost) : null;
        const label = followOn ? (followOn === 'scale' ? 'SCALE THE PILOT' : 'FINISH WHAT YOU PREPARED') : OPTION_META[k].label;
        return (
          <div key={k} className={`opt-row opt-${k}${ok ? '' : ' opt-out'}`}>
            <div className="opt-row-head"><span className="opt-chip">{label}</span><small>{followOn ? 'Pay the remainder.' : OPTION_META[k].sub}</small></div>
            <CostGlance have={have} start={start} cost={cost} />
            {limit && <p className="limit">Short on {limit.label}: you have {limit.have}, it needs {limit.need}.</p>}
            <details>
              <summary>WHAT IT MEANS · ALL FOUR RESOURCES</summary>
              {cost && <Gauges have={have} start={start} pending={cost} />}
              {d.pilot && <p><i>{d.pilot}</i></p>}
              <p><b>You can:</b> {d.can}</p>
              <p><b>Not yet:</b> {d.notYet}</p>
              <p><b>Workforce:</b> {d.wf}</p>
              <p><b>Governance:</b> {d.gov}</p>
              <p><b>Exposes:</b> {d.exp}</p>
            </details>
            {onChoose && <Button disabled={disabled || !ok} onClick={() => onChoose(k)}>{ok ? `${label} · ${cap.name.toUpperCase()}` : 'OUT OF REACH'}</Button>}
          </div>
        );
      })}
    </div>
  );
}

function RecorderBar({ isRecorder, recorder, tookFrom, saving, onTake, mates, onPass }) {
  return (
    <>
      {isRecorder ? (
        <div className="recorder-banner">YOU ARE RECORDING THIS ONE<small>{tookFrom ? `You took this turn from ${tookFrom}.` : 'The recorder rotates with every decision.'}</small></div>
      ) : (
        <>
          <p className="small-note">Waiting for your {briefFor(recorder?.persona).name} to record this one.</p>
          <button type="button" className="text-link" disabled={saving} onClick={onTake}>Away? I will record it instead.</button>
        </>
      )}
      {isRecorder && mates.length > 0 && (
        <details className="pen"><summary>PASS THE PEN</summary>
          <div className="action-row">{mates.map((p) => <Button secondary key={p.id} disabled={saving} onClick={() => onPass(p)}>{briefFor(p.persona).name}</Button>)}</div>
        </details>
      )}
    </>
  );
}

function TableDecisionPhone({ player, participants, responses, onSubmit, keyName = 'teach', cap }) {
  const table = validTable(player.table_number);
  const h = HOSPITALS[player.hospital_id] || hospitalForTable(table) || HOSPITALS.academic;
  const proposal = activeProposal(responses, table, keyName);
  const notes = decisionNotes(responses, table, keyName);
  const recorder = recorderFor(participants, responses, table, keyName);
  const isRecorder = !recorder || recorder.id === player.id;
  const pass = latestPass(responses, table, keyName);
  const tookFrom = isRecorder && pass && pass.participant_id === player.id && pass.note ? briefFor(pass.note).name : '';
  const byFac = proposal?.persona === 'facilitator';
  const mine = proposal && proposal.participant_id === player.id;
  const canReopen = Boolean(proposal) && !byFac && (mine || isRecorder);
  const mates = joinOrder(participants, table).filter((p) => p.id !== player.id);
  const [pending, setPending] = useState(null);
  const [design, setDesign] = useState({ alt: '', owner: '' });
  const { saving, run } = useSaver(onSubmit);
  useEffect(() => { if (!isRecorder && pending) setPending(null); }, [isRecorder]);
  const l = ledgerFor(participants, responses, table, 0);
  const tally = instinctTally(responses, participants, table);
  const costs = { invest: investCost(h.id, cap.id), start: startCost(h.id, cap.id), prepare: prepareCost(h.id, cap.id) };
  const record = async (choice) => {
    if (choice === 'invest' || choice === 'start') { const okd = await run('table_design', `${cap.id}|${design.alt}`, design.owner, keyName); if (!okd) return; }
    const ok = await run('table_decision', choice, '', keyName);
    if (ok) { setPending(null); setDesign({ alt: '', owner: '' }); }
  };
  const take = () => run('recorder_pass', player.id, recorder?.persona || '', keyName);
  const passTo = (p) => run('recorder_pass', p.id, player.persona, keyName);
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">TABLE {table || '—'} · SHARED DECISION · {cap?.name?.toUpperCase()}</div>
        <h1>{proposal ? `Decision: ${choiceLabel(proposal.choice)}` : 'One team. One direction.'}</h1>
        {!proposal ? (
          <>
              <RecorderBar isRecorder={isRecorder} recorder={recorder} tookFrom={tookFrom} saving={saving} onTake={take} mates={mates} onPass={passTo} />
              <p className="small-note">Agree out loud first.</p>
              {isRecorder && (
                <div className="decide-row">
                  {OPTION_KEYS.map((k) => { const ok = fits(startOf(h), costs[k]); return (
                    <button type="button" key={k} className={`dr-${k}`} disabled={saving || Boolean(pending) || !ok} onClick={() => { setDesign({ alt: '', owner: '' }); setPending(k); }}><b>{OPTION_META[k].label}</b><small>{ok ? CHOICE_SHORT[k] : 'Out of reach'}</small></button>
                  ); })}
                  <button type="button" className="dr-hold" disabled={saving || Boolean(pending)} onClick={() => setPending('hold')}><b>NOT NOW</b><small>Keep our capacity</small></button>
                </div>
              )}
                <p className="need-line">{NEED_LINE[h.id]}</p>
                <PromiseChip table={table} responses={responses} ledger={ledgerFor(participants, responses, table, 0, { skipTeach: true })} legend />
              <Gauges have={ledgerFor(participants, responses, table, 0, { skipTeach: true }).have} start={startOf(h)} />
              <p className="need-line">{DECISION_PROMPT}</p>
              <LiftLine rows={liftFor(ledgerFor(participants, responses, table, 0, { skipTeach: true }), cap.id, promiseOf(responses, table))} />
              {tally.length > 0 && <p><b>Your table’s first instincts:</b> {tally.map(([c, n]) => `${choiceLabel(c)} ${n}`).join(' · ')}</p>}
            <OptionCards cap={cap} have={startOf(h)} start={startOf(h)} costs={costs} disabled={saving || Boolean(pending)} onChoose={isRecorder ? (k) => { setDesign({ alt: '', owner: '' }); setPending(k); } : null} />
            {pending && (
              <ConfirmSheet
                title={`Record ${choiceLabel(pending)} for Table ${table}?`}
                lines={[`${cap.name}: ${DECISION_TEXT[pending]}`, tally.length ? `First instincts at your table: ${tally.map(([c, n]) => `${choiceLabel(c)} ${n}`).join(' · ')}` : '', tookFrom ? `You took this turn from ${tookFrom}.` : '']}
                busy={saving}
                confirmDisabled={(pending === 'invest' || pending === 'start') && !design.alt}
                hint="Choose how it will be designed (A or B) to continue."
                onConfirm={() => record(pending)}
                onCancel={() => setPending(null)}
              >
                {(pending === 'invest' || pending === 'start') && <DesignPanel cap={cap} kind={pending} design={design} setDesign={setDesign} />}
              </ConfirmSheet>
            )}
          </>
        ) : (
          <>
            <div className="proposal-banner"><b>{byFac ? 'RECORDED BY THE FACILITATOR' : mine ? 'YOU RECORDED THIS' : `RECORDED BY ${recordedByName(proposal).toUpperCase()}`}</b><span>{DECISION_TEXT[proposal.choice]}</span></div>
            <Gauges have={l.have} start={startOf(l.hospital)} />
            {l.designs?.[cap.id] && <p className="small-note"><b>Designed as:</b> {ALT_COPY[cap.id][l.designs[cap.id].alt].name}{l.designs[cap.id].set ? '' : ' (default: no design choice was recorded)'} · <b>Owner:</b> {l.designs[cap.id].owner ? briefFor(l.designs[cap.id].owner).name : 'none named'}</p>}
            <p className="small-note">The software records your decision. It does not establish consensus. Anyone at the table can add a reason or a concern.</p>
            <NoteBox player={player} responses={responses} onSubmit={onSubmit} type="decision_reason" keyName={keyName} title="One reason we chose this" prompt="" max={120} />
            <NoteBox player={player} responses={responses} onSubmit={onSubmit} type="decision_concern" keyName={keyName} title="One concern that remains" prompt="" max={120} />
            {(notes.reasons.length > 0 || notes.concerns.length > 0) && <p className="small-note">Your table so far: {notes.reasons.length} reason{notes.reasons.length === 1 ? '' : 's'} · {notes.concerns.length} concern{notes.concerns.length === 1 ? '' : 's'}</p>}
            {canReopen && <Button secondary disabled={saving} onClick={() => run('table_decision', '', 'reopened', keyName)}>KEEP DISCUSSING</Button>}
          </>
        )}
      </section>
    </Shell>
  );
}

function TeachRevisePhone({ player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const l = ledgerFor(participants, responses, table, 0);
  const before = ledgerFor(participants, responses, table, 0, { skipTeach: true });
  const cap = capabilityById(l.teachCap);
  const st = teachStand(responses, table);
  const { saving, err, setErr, run } = useSaver(onSubmit);
  const [pending, setPending] = useState(null);
  const [design, setDesign] = useState({ alt: '', owner: '' });
  const needsDesign = pending === 'invest' || pending === 'start';
  const hasChoice = Boolean(l.teach.choice);
  const answer = (c) => run('teach_stand', c, '', 'teach');
  const pickChoice = (c) => { if (c === 'invest' || c === 'start') { setDesign({ alt: '', owner: '' }); setPending(c); } else run('teach_revise', c, '', 'teach'); };
  const confirm = async () => {
    if (needsDesign) { const okd = await run('table_design', `${cap.id}|${design.alt}`, design.owner, 'teach'); if (!okd) return; }
    const ok = await run('teach_revise', pending, '', 'teach');
    if (ok) setPending(null);
  };
  const title = { deciding: 'Do you stand by your first decision?', held: 'Your table is holding.', revising: 'Change your teaching decision.', revised: 'Your decision is changed.' }[st.kind];
  const acted = ['invest', 'start', 'prepare'].includes(l.teach.choice);
  const al = acted ? teachArthurLines(before, l) : [];
  const hb = holdBackLines(l, promiseOf(responses, table));
  return (
    <Shell compact>
      <section className="phone-card">
        <div className="eyebrow">THE BOARD OPENS · TEAM ARTHUR · TABLE {table}</div>
        <h1>{title}</h1>
        <p className="decision-ctx"><b>{cap.name} · {choiceLabel(l.teach.choice)}</b>{l.teach.revised && <span className="revised-tag">REVISED</span>}</p>

        {st.kind === 'deciding' && (
          <div className="decide-row two">
            <button type="button" className="dr-stand" disabled={saving} onClick={() => answer('stand')}><b>WE STAND BY IT</b><small>{hasChoice ? 'Keep it, move on' : 'Carry on, move on'}</small></button>
            <button type="button" className="dr-change" disabled={saving} onClick={() => answer('change')}><b>WE WANT TO CHANGE IT</b><small>Revise once</small></button>
          </div>
        )}
        {st.kind === 'held' && (
          <>
            <div className="submitted-mark"><Check size={16} /> HOLDING{st.byFac ? ' · RECORDED BY THE FACILITATOR' : ''} · waiting for the other tables</div>
            {!st.locked && <Button secondary disabled={saving} onClick={() => answer('change')}>ACTUALLY, WE WANT TO CHANGE IT</Button>}
          </>
        )}
        {st.kind === 'revising' && (
          <>
            <p className="small-note">Everything from the original decision is returned, then the new one is applied.</p>
            <div className="phone-choice-stack interactive">
              {CHOICES.map((c) => <button type="button" disabled={saving || Boolean(pending)} key={c} className={l.teach.choice === c ? 'selected' : ''} onClick={() => pickChoice(c)}><b>{choiceLabel(c)}</b><span>{DECISION_TEXT[c]}</span></button>)}
            </div>
            <Button secondary disabled={saving || Boolean(pending)} onClick={() => answer('stand')}>NEVER MIND · WE STAND BY IT</Button>
            {pending && (
              <ConfirmSheet title={`Revise to ${choiceLabel(pending)}?`} lines={[`${cap.name}: ${DECISION_TEXT[pending]}`]} busy={saving} confirmDisabled={needsDesign && !design.alt} hint="Choose how it will be designed (A or B) to continue." onConfirm={confirm} onCancel={() => setPending(null)}>
                {needsDesign && <DesignPanel cap={cap} kind={pending} design={design} setDesign={setDesign} />}
              </ConfirmSheet>
            )}
          </>
        )}
        {st.kind === 'revised' && <div className="submitted-mark"><Check size={16} /> REVISED · waiting for the other tables</div>}
        {st.kind === 'deciding' && <p className="small-note">Anyone at the table can answer for the table. The latest answer counts.</p>}

        <PromiseChip table={table} responses={responses} ledger={l} />
        <p className="need-line"><b>WHAT IT DID</b> · {teachEffectLine(before, l, cap.id, l.teach.choice, l.teach.revised)}</p>
        <div className="arthur-effect"><b>WHAT IT DID FOR ARTHUR</b>
          {al.length ? al.map((x, i) => <p key={i}>{x}</p>) : <p>{acted ? 'Nothing he would notice yet.' : 'You kept your capacity, so his care is unchanged.'}</p>}
          {hb.length > 0 && <b className="hb-k">STILL HOLDING YOUR PROMISE BACK</b>}
          {hb.map((x, i) => <p className="hb-line" key={`h${i}`}>{x}</p>)}
        </div>
        <Gauges have={l.have} start={startOf(l.hospital)} />
        <div className="cap-tiles">{boardFor(l).map((b) => <CapTile key={b.c.id} b={b} />)}</div>
        {err && <div className="toast" onClick={() => setErr('')}>{err} · Tap to dismiss and try again.</div>}
      </section>
    </Shell>
  );
}

function BoardCard({ b, persona, signal, selected, onClick, disabled, start, lift }) {
  const tag = signalTagFor(signal, b.c.id, b.state === 'committed');
  const primary = b.state === 'available' || b.state === 'complete' || b.state === 'scale' ? b.investCost : b.state === 'prepare-only' ? (b.ok?.start ? b.startCost : b.prepareCost) : null;
  const have = start?.have;
  return (
    <div className={`img-card ${selected ? 'selected' : ''} st-card-${b.state}`}>
      <button type="button" disabled={disabled} onClick={onClick}>
        <div className="img-card-hero" style={{ backgroundImage: `linear-gradient(180deg,transparent 35%,rgba(10,34,44,.88)),url(${b.c.image})` }}>
          <b>{b.c.name}</b>
          <span className={`st st-${b.state}`}>{stateLabel(b)}</span>
          {tag && <span className="signal-tag corner">{tag}</span>}
        </div>
          {persona && b.state !== 'committed' && <p className="for-you">{shortLine(roleLine(b.c.id, persona))}</p>}
          {b.state !== 'committed' && <LiftLine rows={lift} />}
        {primary && have && <CostGlance have={have} start={start.start} cost={primary} />}
        {b.state === 'out' && b.limit && <p className="limit">Short on {b.limit.label}: {b.limit.have} of {b.limit.need}.</p>}
      </button>
      {b.state !== 'committed' && (
        <details>
          <summary>MORE</summary>
          {primary && have && <div className="mini-dials"><Gauges have={have} start={start.start} pending={primary} /></div>}
          {persona && burdenFor(b.c, persona) && <p><b>My team carries:</b> {burdenFor(b.c, persona)}</p>}
          {persona && <p><b>Your question:</b> {lensFor(b.c.id, persona)}</p>}
          {b.cause && <p className="cause">{b.cause}</p>}
          <p><b>If you don’t act:</b> {b.c.exposure}</p>
        </details>
      )}
    </div>
  );
}

function BoardPhone({ k, player, participants, responses, onSubmit }) {
  const table = validTable(player.table_number);
  const l = ledgerFor(participants, responses, table, k - 1);
  const signal = k === 3 ? currentSignal(responses) : null;
  const key = `cycle-${k}`;
  const mine = myResponse(responses, player.id, 'cycle_nom', key);
  const { saving, run } = useSaver(onSubmit);
  if (l.closed) return <PhoneState kicker={`CYCLE ${k} · TABLE ${table}`} title="You chose to close your portfolio." text="Your remaining capacity is kept. Watch how the other hospitals decide." />;
  return (
    <Shell compact>
      <section className="phone-card">
          <div className="eyebrow">CYCLE {k} OF 2 · PRIVATE NOMINATION · {briefFor(player.persona).name.toUpperCase()}</div>
          <h1>{signal ? signal.title : 'What should your hospital do next?'}</h1>
          {signal ? <p>{signal.text}</p> : <p className="need-line">{NEED_LINE[l.hospital.id]}</p>}
          <Gauges have={l.have} start={startOf(l.hospital)} />
          <PromiseChip table={table} responses={responses} ledger={l} />
  <div className="img-cards">
              {boardFor(l).map((b) => <BoardCard key={b.c.id} b={b} persona={player.persona} signal={signal} start={{ have: l.have, start: startOf(l.hospital) }} lift={liftFor(l, b.c.id, promiseOf(responses, table))} selected={mine?.choice === b.c.id} disabled={saving || !canActOn(b)} onClick={() => run('cycle_nom', b.c.id, '', key)} />)}
        </div>
        {mine && <div className="submitted-mark"><Check size={16} /> NOMINATED · {capabilityById(mine.choice)?.name}</div>}
      </section>
    </Shell>
  );
}

function NoteBox({ player, responses, onSubmit, type, keyName, title, prompt, max = 160 }) {
  const existing = myResponse(responses, player.id, type, keyName);
  const [note, setNote] = useState(existing?.note || '');
  const { saving, err, run } = useSaver(onSubmit);
  return (
    <div className="reflect status-card">
      <b>{title}</b>
      {prompt}
      <textarea maxLength={max} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button disabled={saving || !note.trim()} onClick={() => run(type, 'note', note.trim(), keyName)}>{saving ? 'SAVING…' : existing?.note === note.trim() ? 'SAVED' : 'SAVE'}</Button>
      {err && <p className="error">{err}</p>}
    </div>
  );
}
function ReflectionBox({ player, responses, onSubmit }) {
  const existing = myResponse(responses, player.id, 'reflection', 'final');
  const [note, setNote] = useState(existing?.note || '');
  const { saving, run } = useSaver(onSubmit);
  return (
    <div className="reflect status-card">
      <b>While other tables decide</b>
      Name the biggest need your hospital is leaving unresolved, and the capacity you kept to respond to it.
      <textarea maxLength={160} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button disabled={saving || !note.trim()} onClick={() => run('reflection', 'note', note.trim(), 'final')}>{existing?.note === note.trim() ? 'SAVED' : 'SAVE'}</Button>
    </div>
  );
}

function CycleDecisionPhone({ k, player, participants, responses, onSubmit }) {
    const table = validTable(player.table_number);
    const key = `cycle-${k}`;
    const l = ledgerFor(participants, responses, table, k - 1, ledgerOpts(k));
    const signal = k === 3 ? currentSignal(responses) : null;
    const board = boardFor(l);
    const proposal = activeProposal(responses, table, key);
    const parsed = parseCycleChoice(proposal?.choice);
    const recorder = recorderFor(participants, responses, table, key);
    const isRecorder = !recorder || recorder.id === player.id;
    const pass = latestPass(responses, table, key);
    const tookFrom = isRecorder && pass && pass.participant_id === player.id && pass.note ? briefFor(pass.note).name : '';
    const byFac = proposal?.persona === 'facilitator';
    const mine = proposal && proposal.participant_id === player.id;
    const canReopen = Boolean(proposal) && !byFac && (mine || isRecorder);
    const mates = joinOrder(participants, table).filter((p) => p.id !== player.id);
    const [cap, setCap] = useState(null);
    const [design, setDesign] = useState({ alt: '', owner: '' });
    const [pending, setPending] = useState(null);
    const { saving, run } = useSaver(onSubmit);
    useEffect(() => { if (!isRecorder && pending) setPending(null); }, [isRecorder]);
    if (l.closed) {
      return <Shell compact><section className="phone-card"><div className="eyebrow">CYCLE {k} · TABLE {table}</div><h1>You chose to close your portfolio.</h1><p>Your remaining capacity is kept for what comes next.</p><ReflectionBox player={player} responses={responses} onSubmit={onSubmit} /></section></Shell>;
    }
    if (!board.some(canActOn)) {
      const blocked = board.filter((b) => b.state === 'out' && b.cause).slice(0, 3);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">CYCLE {k} · TABLE {table}</div>
            <h1>Nothing on the board fits what you have left.</h1>
            <p>Within this planning period. Your main constraint is <b>{mainConstraint(l)}</b>.</p>
            <Gauges have={l.have} start={startOf(l.hospital)} />
            {blocked.map((b) => <p className="cause" key={b.c.id}><b>{b.c.name}:</b> {b.cause}</p>)}
            <NoteBox player={player} responses={responses} onSubmit={onSubmit} type="resequence" keyName="final" title="Look back" prompt="Which earlier decision would you sequence differently, and why?" />
          </section>
        </Shell>
      );
    }
    if (parsed) {
      const label = parsed.action === 'hold' ? 'NOT THIS CYCLE' : parsed.action === 'close' ? 'CLOSE OUR PORTFOLIO' : `${parsed.action.toUpperCase()} · ${capabilityById(parsed.cap)?.name}`;
      const status = parsed.action === 'hold' ? 'You chose to hold capacity. Your resources are intact for what comes next.' : parsed.action === 'close' ? 'No further commitments this planning period.' : 'Here is what this decision changed.';
      const acted = parsed.action === 'invest' || parsed.action === 'prepare' || parsed.action === 'start';
      const after = acted ? ledgerFor(participants, responses, table, k, ledgerOpts(k)) : null;
      const d = acted ? diffBoards(l, after, parsed.cap) : null;
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">CYCLE {k} · TABLE {table} · DECISION RECORDED</div>
            <h1>{label}</h1>
            <p>{status}</p>
            <p className="small-note">Recorded by {mine ? 'you' : recordedByName(proposal)}.</p>
            {d && (
              <div className="status-card">
                <b>WHAT THIS DECISION CHANGED</b>
                <Gauges have={l.have} start={startOf(l.hospital)} pending={sub(l.have, after.have)} />
                {d.blocked.length > 0 && <p className="cause">Now harder to reach: {d.blocked.map((x) => `${x.c.name} (${STATE_LABEL[x.to].toLowerCase()}${x.limit ? `, short on ${x.limit.label}` : ''})`).join('; ')}.</p>}
                {d.cheaper.length > 0 && <p>Now cheaper: {listJoin(d.cheaper.map((x) => x.c.name))}.</p>}
                {d.opened.length > 0 && <p>Now easier to reach: {listJoin(d.opened.map((x) => x.c.name))}.</p>}
                {!d.blocked.length && !d.cheaper.length && !d.opened.length && <p>No other option changed. You still have room on the board.</p>}
                {parsed.action === 'invest' && <p><b>Decide early:</b> {capabilityById(parsed.cap)?.early}</p>}
              </div>
            )}
            {acted && (
                <div className="status-card">
                  <b>WHAT THIS DID FOR ARTHUR</b>
                  {parsed.action === 'prepare'
                    ? <><p>Provision secured: {capabilityById(parsed.cap)?.prepare.pkg} Today nothing is different for Arthur.</p><p><b>What changes later:</b> {prepareLater(parsed.cap, l.hospital.id)}</p></>
                    : (() => { const ch = bydChanges(bydNow(l), bydNow(after)); return ch.length ? ch.map((x) => <p key={x}>{x}</p>) : <p>No condition changed for Arthur.</p>; })()}
                </div>
              )}
              {canReopen && <Button secondary disabled={saving} onClick={() => run('table_decision', '', 'reopened', key)}>CHANGE OUR DECISION</Button>}
            {!acted && <ReflectionBox player={player} responses={responses} onSubmit={onSubmit} />}
          </section>
        </Shell>
      );
    }
    const record = async (action, id) => {
      if (action === 'invest' || action === 'start') {
        const inherited = action === 'invest' && l.piloted.includes(id) ? l.designs?.[id]?.alt : '';
        const okd = await run('table_design', `${id}|${inherited || design.alt}`, design.owner, key);
        if (!okd) return;
      }
      const ok = await run('table_decision', id ? `${action}|${id}` : action, '', key);
      if (ok) { setPending(null); setDesign({ alt: '', owner: '' }); }
    };
    const take = () => run('recorder_pass', player.id, recorder?.persona || '', key);
    const passTo = (p) => run('recorder_pass', p.id, player.persona, key);
    const noms = responsesOfType(responses, 'cycle_nom', key).filter((r) => validTable(r.table_number) === table);
    const tally = CAPABILITIES.map((c) => ({ c, n: new Set(noms.filter((r) => r.choice === c.id).map((r) => r.participant_id)).size })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
    const tied = tally.length > 1 && tally[0].n === tally[1].n;
    const pendingLabel = pending ? (pending.action === 'close' ? 'CLOSE OUR PORTFOLIO' : pending.action === 'hold' ? 'NOT THIS CYCLE' : `${pending.action.toUpperCase()} · ${capabilityById(pending.cap)?.name}`) : '';
    return (
      <Shell compact>
        <section className="phone-card">
          <div className="eyebrow">CYCLE {k} OF 2 · TABLE {table} · {briefFor(player.persona).name.toUpperCase()}</div>
          <h1>{signal ? signal.title : 'One decision for your table.'}</h1>
          {signal && <p>{signal.text}</p>}
            <Gauges have={l.have} start={startOf(l.hospital)} />
            <PromiseChip table={table} responses={responses} ledger={l} />
            <p className="need-line">{DECISION_PROMPT}</p>
          <RecorderBar isRecorder={isRecorder} recorder={recorder} tookFrom={tookFrom} saving={saving} onTake={take} mates={mates} onPass={passTo} />
          {isRecorder && (
            <div className="decide-row two">
              {k < 3 && <button type="button" className="dr-hold" disabled={saving || Boolean(pending)} onClick={() => setPending({ action: 'hold' })}><b>NOT THIS CYCLE</b><small>A challenge is coming</small></button>}
              <button type="button" className="dr-hold" disabled={saving || Boolean(pending)} onClick={() => setPending({ action: 'close' })}><b>CLOSE OUR PORTFOLIO</b><small>No more commitments</small></button>
            </div>
          )}
          <p className="small-note">Or tap a capability to nominate it privately. {isRecorder ? 'The choices open right under it.' : ''}</p>
          {tally.length > 0 && <p><b>Your table’s nominations:</b> {tally.map((x) => `${x.c.name} ${x.n}`).join(' · ')}{tied ? ' · tied, decide out loud' : ''}</p>}
          <div className="img-cards">
            {board.filter(canActOn).map((b) => (
              <React.Fragment key={b.c.id}>
                <BoardCard b={b} persona={player.persona} signal={signal} start={{ have: l.have, start: startOf(l.hospital) }} lift={liftFor(l, b.c.id, promiseOf(responses, table))} selected={cap === b.c.id} disabled={saving} onClick={() => { setCap(b.c.id); run('cycle_nom', b.c.id, '', key); }} />
                {cap === b.c.id && isRecorder && (
                  <div className="inline-options">
                    <OptionPicker cap={b.c} ledger={l} have={l.have} start={startOf(l.hospital)} costs={b.costs} disabled={saving || Boolean(pending)} onChoose={(kk) => { setDesign({ alt: '', owner: '' }); setPending({ action: kk, cap: b.c.id }); }} />
                  </div>
                )}
                {cap === b.c.id && !isRecorder && <div className="status-card"><b>YOU NOMINATED {b.c.name.toUpperCase()}</b>Your {briefFor(recorder?.persona).name} records this decision after your table agrees.</div>}
              </React.Fragment>
            ))}
          </div>
          {pending && (
            <ConfirmSheet
              title={`Record ${pendingLabel} for Table ${table}?`}
              lines={[
                pending.action === 'close' ? 'Your table will not act in the remaining cycles.' : '',
                tally.length ? `Your table’s nominations: ${tally.map((x) => `${x.c.name} ${x.n}`).join(' · ')}` : 'No nominations yet.',
                tookFrom ? `You took this turn from ${tookFrom}.` : '',
              ]}
              busy={saving}
              confirmDisabled={(pending.action === 'invest' || pending.action === 'start') && !(pending.action === 'invest' && l.piloted.includes(pending.cap)) && !design.alt}
              hint="Choose how it will be designed (A or B) to continue."
              onConfirm={() => record(pending.action, pending.cap)}
              onCancel={() => setPending(null)}
            >
              {(pending.action === 'invest' || pending.action === 'start') && <DesignPanel cap={capabilityById(pending.cap)} kind={pending.action} design={design} setDesign={setDesign} inheritedAlt={pending.action === 'invest' && l.piloted.includes(pending.cap) ? l.designs?.[pending.cap]?.alt : ''} />}
            </ConfirmSheet>
          )}
        </section>
      </Shell>
    );
  }

  /* ---------------------------------------------------------------------
   PARTICIPANT · PHASE ROUTER
   --------------------------------------------------------------------- */

function PlayerView({ session, player, participants, responses, onSubmit }) {
  const h = HOSPITALS[player.hospital_id] || hospitalForTable(validTable(player.table_number)) || HOSPITALS.academic;
  const brief = briefFor(player.persona);
  const table = validTable(player.table_number);
  const tableLabel = table ? `TEAM ARTHUR · TABLE ${table}` : 'TABLE ASSIGNMENT UNAVAILABLE';
  const phase = LEGACY_PHASES[session.phase] || session.phase;
  const cap = capabilityById(teachCapFor(participants, responses, table)) || CAPABILITIES[0];
  switch (phase) {
    case 'lobby':
      return <PhoneState kicker={tableLabel} title={'You’re in.'} text={`${h.name}. Stay here. Your facilitator will reveal the challenge.`} />;

    case 'arthur_intro':
      return <ArthurIntroPhone player={player} />;

    case 'assignments':
      return (
        <Shell compact>
          <section className="phone-card hospital-card">
            <div className="eyebrow">YOU ARE {tableLabel}</div>
            <img className="phone-hospital-image" src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
            <h1>{h.name}</h1>
            <p className="need-line">You are Team Arthur. Every table cares for the same patient in a different hospital.</p>
            <h2>{NEED_LINE[h.id]}</h2>
            <p>{h.tagline}</p>
            <div className="wait-note">Your facilitator is guiding the room.</div>
          </section>
        </Shell>
      );

    case 'context':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">{tableLabel} · YOUR CHALLENGE</div>
            <img className="phone-hospital-image compact-image" src={h.image} alt={h.name} onError={(e)=>imageFallback(e)} />
            <h1>{h.name}</h1>
            <h3>What the mission demands</h3>
            <ol className="mission-list">
              {h.mission.map((m, i) => <li key={m}><span>0{i + 1}</span>{m}</li>)}
            </ol>
            <div className="inherit">
              <p><b>STRENGTH</b>{h.strength}</p>
              <p><b>CONSTRAINT</b>{h.constraint}</p>
              <p><b>CONDITION</b>{h.condition}</p>
            </div>
            <h3>WHAT ARTHUR IS UP AGAINST HERE</h3>
            <BaselineList hid={h.id} />
          </section>
        </Shell>
      );

    case 'tension':
      return <PhoneState kicker="WATCH THIS TENSION" title={h.tension} text="Understand the problem before you begin optimizing the resources." />;

    case 'resources':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">YOUR CAPACITY TO CHANGE</div>
            <h1>These resources are finite.</h1>
            <p>Future capabilities will draw on different kinds of capacity. As your table invests, resources will be used.</p>
            <div className="phone-resources">
              {Object.entries(h.resources).map(([k, v]) => (
                <div key={k}><span>{RESOURCE_LABELS[k]}</span><b>{v}</b><small>{RESOURCE_MEANING[k]}</small></div>
              ))}
            </div>
            <div className="phone-mechanic">
              <b>INVEST</b> commits · <b>START</b> pilots · <b>PREPARE</b> builds the conditions · or <b>NOT NOW</b>
            </div>
            <blockquote>Advance the mission without exhausting your system’s ability to adapt.</blockquote>
          </section>
        </Shell>
      );

    case 'discussion':
      return <PhoneState kicker={tableLabel} title="Talk with your team." text="What is the one thing your health system cannot afford to get wrong?" />;

    case 'brief_reveal':
    case 'brief_read':
      return (
        <Shell compact>
          <section className="phone-card strategic-brief">
              <div className="eyebrow">YOUR ROLE · {tableLabel}</div>
              <div className="role-hero"><RoleMark id={player.persona} size={46} /><h1>{brief.name}</h1></div>
              <div className="brief-question big"><b>YOUR QUESTION</b><p>{brief.question}</p></div>
              <details className="brief-more"><summary>MORE · YOUR ROLE AND ARTHUR’S BRIEF</summary>
                <p className="brief-responsibility">{brief.responsibility}</p>
                <div className="brief-columns">
                  <div><b>PROTECT</b>{brief.protect.map((x) => <span key={x}>{x}</span>)}</div>
                  <div><b>WATCH</b>{brief.watch.map((x) => <span key={x}>{x}</span>)}</div>
                </div>
                <ArthurBrief both compact />
              </details>
              <small className="private-note">Next, your table chooses the promise.</small>
          </section>
        </Shell>
      );

    case 'brief_share':
      return <PerspectiveCapture player={player} brief={brief} responses={responses} onSubmit={onSubmit} />;

    case 'alignment':
      return <PhoneState kicker="PRODUCTIVE TENSION" title="You should not all agree." text="Bring your responsibility into the next decision. Six capabilities are coming, and your hospital cannot pursue them all." />;

    case 'ready':
      return <PhoneState kicker="NEXT: CAPABILITY PORTFOLIO" title={brief.name} text="Six capabilities are coming. Your hospital cannot pursue them all." />;

    case 'cap_portfolio':
      return <PhoneState kicker={'SIX POSSIBILITIES · LIMITED CAPACITY'} title="Every table chooses where to go deep first." text="Your facilitator will open private nominations next. Costs differ by hospital." />;
    case 'cap_nominate':
      return <CapabilityNominationPhone player={player} responses={responses} onSubmit={onSubmit} />;
    case 'cap_results':
      return <CapabilityResultsPhone player={player} participants={participants} responses={responses} />;
    case 't_reveal':
      return (
        <Shell compact>
          <section className="phone-card vc-phone">
            <div className="eyebrow">TEACHING ROUND · {tableLabel}</div>
            <img className="phone-hospital-image" src={cap.image} alt="" onError={(e) => imageFallback(e)} />
            <h1>{cap.name}</h1>
            <p className="moment">{careMoment(cap.id)}</p>
            <div className="brief-question"><b>FOR YOU · {brief.name.toUpperCase()}</b><p>{roleLine(cap.id, player.persona)}</p></div>
            {burdenFor(cap, player.persona) && <p className="burden"><b>MY TEAM CARRIES</b>{burdenFor(cap, player.persona)}</p>}
            <div className="brief-question"><b>YOUR QUESTION</b><p>{lensFor(cap.id, player.persona)}</p></div>
            <h3>INVEST DELIVERS</h3><p>{cap.scope}</p>
            <h3>NOT INCLUDED</h3><p>{cap.excluded}</p>
            <p className="small-note">Make this case to your table before the room reveals every perspective.</p>
          </section>
        </Shell>
      );
    case 't_instinct':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="first_instinct" eyebrow="PRIVATE FIRST INSTINCT" title={`What would you do about ${cap.name}?`} text={lensFor(cap.id, player.persona)} options={CHOICES.map((c) => [c, choiceLabel(c), CHOICE_TEXT[c]])} savedLabel="FIRST INSTINCT SAVED · YOUR TABLE DECIDES LATER" />;
    case 't_cost':
        return <TableDecisionPhone player={player} participants={participants} responses={responses} onSubmit={onSubmit} keyName="teach" cap={cap} />;
      case 't_mission': {
      const d = optionDetail(cap, 'invest');
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">WHAT IT ASKS OF YOU · {h.name}</div>
            <h1>What would {cap.name} ask of your hospital?</h1>
            <p className="need-line">{NEED_LINE[h.id]}</p>
            <h3>THE TRADE-OFF HERE</h3><p>{cap.tradeoff[h.id]}</p>
            <h3>WORKFORCE</h3><p>{d.wf}</p>
            <h3>GOVERNANCE</h3><p>{d.gov}</p>
            <div className="brief-question"><b>YOUR QUESTION</b><p>{lensFor(cap.id, player.persona)}</p></div>
          </section>
        </Shell>
      );
    }
    case 't_change_vote':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="change_prediction" eyebrow="PRIVATE PREDICTION · DESIGN" title="The hospital has opened. What would be hardest to change?" text={`Think about ${cap.name}.`} options={CHANGE_OPTIONS.map(([id, label]) => [id, label])} />;
    case 't_design': {
      const mine = myResponse(responses, player.id, 'change_prediction', 'teach');
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">DECIDE EARLY · KEEP CHANGEABLE</div>
            <h1>The device is the easiest thing to change.</h1>
            <p>Your prediction: <b>{CHANGE_OPTIONS.find(([id]) => id === mine?.choice)?.[1] || 'No vote'}</b></p>
            <div className="share-priorities">
              <span><b>DECIDE EARLY</b> · {cap.early}</span>
              <span><b>KEEP CHANGEABLE</b> · {cap.open}</span>
            </div>
            <blockquote>Where it lives, and the infrastructure behind it, is what the building locks in.</blockquote>
          </section>
        </Shell>
      );
    }
    case 't_discuss': {
      const vote = myResponse(responses, player.id, 'first_instinct', 'teach');
      return (
        <Shell compact>
          <section className="phone-card strategic-brief share-brief">
            <div className="eyebrow">DISCUSS AT YOUR TABLE</div>
            <h1>Explain your first instinct.</h1>
            <p>Your first instinct: <b>{vote?.choice ? choiceLabel(vote.choice) : 'NOT SUBMITTED'}</b></p>
            <div className="brief-question"><b>YOUR QUESTION</b><p>{lensFor(cap.id, player.persona)}</p></div>
          </section>
        </Shell>
      );
    }
    case 't_decision':
      return <TableDecisionPhone player={player} participants={participants} responses={responses} onSubmit={onSubmit} keyName="teach" cap={cap} />;
    case 't_checkpoint': {
      const l = ledgerFor(participants, responses, table, 0);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">TEACHING CHECKPOINT · {tableLabel}</div>
            <h1>{cap.name}: {choiceLabel(l.teach.choice)}</h1>
            <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{startOf(h)[i]} → {l.have[i]}</b></div>)}</div>
            <p>This is your remaining capacity for everything still ahead.</p>
          </section>
        </Shell>
      );
    }
    case 't_scale_vote':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="scale_prediction" eyebrow="PRIVATE PREDICTION" title={`Where does the greatest consequence of ${cap.name} fall for your hospital?`} options={PULLBACK_LEVELS.map((x) => [x.id, x.title, x.subtitle])} />;
    case 't_scale_reveal': {
      const mine = myResponse(responses, player.id, 'scale_prediction', 'teach');
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">REVEAL</div>
            <h1>The scales connect.</h1>
            <p>Your prediction: <b>{mine?.choice?.toUpperCase() || 'NO VOTE'}</b></p>
            <div className="share-priorities">
              {PULLBACK_LEVELS.map((x) => <span className="phone-scale-row" key={x.id}><img className="phone-scale-thumb" src={SCALE_VISUALS[x.id]} alt="" onError={(e) => imageFallback(e)} /><span><b>{x.title}</b> · {cap.scale[x.id]}</span></span>)}
            </div>
            <blockquote>The architecture may be enterprise-wide even when the consequence is local.</blockquote>
          </section>
        </Shell>
      );
    }
    case 't_continuum_vote':
      return <VotePhone player={player} responses={responses} onSubmit={onSubmit} type="continuum_prediction" eyebrow="PRIVATE PREDICTION" title={`Where does care go because of ${cap.name}?`} text="Choose the setting that changes most." options={CONTINUUM_OPTIONS.map(([a, b]) => [a.toLowerCase(), a, b])} />;
    case 't_continuum_reveal':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">REVEAL · {tableLabel}</div>
            <div className="mc-head"><CapThumb cap={cap} /><div><b className="mc-name">{cap.name}</b><MovesChips capId={cap.id} /></div></div>
            <p className="what-moves">{cap.revealLine}</p>
            <PivotQuestion />
            <div className="mf-holds phone-holds"><small>THE BUILDING HOLDS STILL</small>{(HOLDS_STILL[cap.id] || []).map((x) => <p key={x}><Glyph name="lock" size={18} />{x}</p>)}</div>
            <details className="brief-more"><summary>MORE</summary><p>{cap.continuum}</p></details>
          </section>
        </Shell>
      );
    case 't_ripple': {
      const choice = decisionForTable(responses, table, 'teach').choice;
      const x = rippleFor(cap, choice);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">YOUR HOSPITAL CHANGED · {tableLabel}</div>
            <h1>{cap.name}: {choiceLabel(choice)}</h1>
            <p>{x.headline}</p>
            <div className="share-priorities">
              <span><b>CLINICAL WORK</b> · {x.unit}</span>
              <span><b>FACILITY</b> · {x.facility}</span>
              <span><b>SYSTEM</b> · {x.system}</span>
              <span><b>CARE FLOW</b> · {x.flow}</span>
            </div>
            <p>{cap.context[h.id]}</p>
            {choice === 'prepare' && <p className="need-line"><b>WHAT CHANGES LATER</b> · {prepareLater(cap.id, h.id)}</p>}
            {choice && <blockquote>{CLOSING_LINE[choice]}</blockquote>}
          </section>
        </Shell>
      );
    }
    case 'p_open':
      return <TeachRevisePhone player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p1_board': return <BoardPhone key="board-1" k={1} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p2_board': return <BoardPhone key="board-2" k={2} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p3_board': return <BoardPhone key="board-3" k={3} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p1_decide': return <CycleDecisionPhone key="decide-1" k={1} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p2_decide': return <CycleDecisionPhone key="decide-2" k={2} player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p3_decide': return <OpsDecisionPhone key="decide-3" player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'p_signal': {
      const signal = currentSignal(responses);
      if (!signal) return <PhoneState kicker="THE CHALLENGE" title="Something is about to change." text="Your facilitator is revealing a challenge before the final cycle." />;
      if (!challengeRevealed(responses)) {
        return (
          <Shell compact>
            <section className="phone-card">
              <div className="eyebrow">THE CHALLENGE</div>
              <img className="phone-hospital-image" src={challengeImage(signal)} alt="" onError={(e) => imageFallback(e, challengeFallback(signal))} />
              <h1>{signal.title}</h1>
              <p>{signal.text}</p>
              <div className="brief-question"><b>DISCUSS AT YOUR TABLE</b><p>{SIGNAL_LENS[signal.id]?.arthur || CHALLENGE_PROMPT}</p></div>
            </section>
          </Shell>
        );
      }
      const st = standingText(signalStanding(participants, responses, table, signal));
      const before = ledgerFor(participants, responses, table, 2, { preSignal: true });
      const l = ledgerFor(participants, responses, table, 2);
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">THE CHALLENGE</div>
            <h1>{signal.title}</h1>
            <p>{signal.text}</p>
            <p className="lens-arthur">{SIGNAL_LENS[signal.id]?.arthur}</p>
            <SignalLens lens={challengeLens(participants, responses, table, signal)} />
            <div className="status-card"><b>{st.head}</b>{st.detail}</div>
            <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{signal.kind === 'shock' ? `${before.have[i]} → ${l.have[i]}` : l.have[i]}</b></div>)}</div>
            <p>{signal.kind === 'shock' ? 'Protection' : 'Capabilities that respond'}: {listJoin(capNames(signal.responds))}</p>
          </section>
        </Shell>
      );
    }
    case 'promise':
      return <PromisePhone player={player} participants={participants} responses={responses} onSubmit={onSubmit} />;
    case 'f_cards':
      return <FCardsPhone player={player} participants={participants} responses={responses} />;
    case 'f_future':
        return (
          <Shell compact>
            <section className="phone-card">
              <div className="eyebrow">WHAT CHANGED FOR ARTHUR · {tableLabel}</div>
              <TeamCard t={table} participants={participants} responses={responses} signal={currentSignal(responses)} />
                </section>
          </Shell>
        );
      case 'f_turns':
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">TURNING POINTS · {tableLabel}</div>
            <h1>The decisions that shaped what came next.</h1>
            <TurnList items={turningPoints(participants, responses, table, currentSignal(responses))} />
          </section>
        </Shell>
      );
    case 'f_locks':
        return (
          <Shell compact>
            <section className="phone-card">
              <div className="eyebrow">WHAT YOUR BUILDING LOCKS IN · {tableLabel}</div>
              <LocksCard t={table} participants={participants} responses={responses} />
            </section>
          </Shell>
        );
      case 'f_compare': {
      const l = ledgerFor(participants, responses, table, 3);
      const need = unresolvedNeed(l);
      const s = signalStanding(participants, responses, table, currentSignal(responses));
      const names = (ids) => (ids.length ? listJoin(capNames(ids)) : 'None');
      const tc = bydTeamCard(participants, responses, table, currentSignal(responses));
      return (
        <Shell compact>
          <section className="phone-card">
            <div className="eyebrow">YOUR HOSPITAL · {tableLabel}</div>
            <h1>{h.name}</h1>
            <div className="share-priorities">
              <span><b>THE PROMISE</b> · {tc.headline}</span>
                <span><b>COMMITTED</b> · {names(l.invested)}</span>
              <span><b>PREPARED</b> · {names(l.prepared)}</span>
              <span><b>UNRESOLVED NEED · THE GAME’S READ</b> · {need ? `${need.c.name}: ${need.c.exposure}` : 'None of the six'}</span>
              {tableReflections(responses, table).length > 0 && <span><b>UNRESOLVED NEED · YOUR TABLE SAID</b> · “{tableReflections(responses, table)[0]}”</span>}
              <span><b>MAIN CONSTRAINT</b> · {mainConstraint(l)}</span>
              {s && <span><b>CHALLENGE</b> · {standingText(s, true).head}</span>}
            </div>
            <div className="res-strip">{RES_KEYS.map((k, i) => <div key={k}><small>{RES_SHORT[i]}</small><b>{l.have[i]}</b></div>)}</div>
            <blockquote>Context and earlier choices shape what is possible.</blockquote>
          </section>
        </Shell>
      );
    }
    case 'f_film': {
        const td = teachDecisionFor(responses, table);
        return (
          <Shell compact>
            <section className="phone-card">
              <div className="eyebrow">YOUR HOSPITAL, IN MOTION · {tableLabel}</div>
              <Film frames={filmFrames(participants, responses, table)} closing={td.choice ? CLOSING_LINE[td.choice] : ''} picks={filmPicks(participants, responses, table)} />
              <CopyPrompt text={aiPrompt(participants, responses, table, currentSignal(responses))} />
            </section>
          </Shell>
        );
      }
      case 'f_takeaway':
        return <TakeawayPhone player={player} participants={participants} responses={responses} />;
      case 'f_debrief': {
      const td = teachDecisionFor(responses, table);
      return <PhoneState kicker="THE LAST QUESTION" title={FINAL_QUESTION} text={td.choice ? CLOSING_LINE[td.choice] : 'A technology decision is never only a technology decision.'} />;
    }

      default:
        return <PhoneState kicker={tableLabel} title="Stay with your table." text="Your facilitator will guide the next step." />;
  }
}

/* ---------------------------------------------------------------------
   PARTICIPANT CONTROLLER
   --------------------------------------------------------------------- */

function Participant({ initialCode, onExit }) {
  const [codeValue, setCodeValue] = useState(initialCode || '');
  const [session, setSession] = useState(null);
  const [player, setPlayer] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState('');
    const [reviewPhase, setReviewPhase] = useState(null);
    const [online, setOnline] = useState(true);
    const seq = useRef(0);
  const applied = useRef(0);
  const refreshRef = useRef(null);

  const join = async (c) => {
    const found = await fetchSession(c);
    if (!found) {
      setError('Session not found. Check the code and try again.');
      return;
    }
    setCodeValue(c);
    setSession(found);
    if (new URLSearchParams(location.search).get('join') !== c) history.replaceState({}, '', `${location.pathname}?join=${encodeURIComponent(c)}`);
    const saved = sessionStorage.getItem(`bydesign-player-${c}`);
    if (saved) setPlayer(JSON.parse(saved));
  };

  useEffect(() => {
    if (initialCode) join(initialCode);
  }, []);

    useEffect(() => {
      if (!session) return undefined;
      let alive = true;
      let again = false;
      let busy = false;
      let tick = 0;
      let debounce;
      const refresh = async () => {
        if (busy) { again = true; return; }
        busy = true;
        const mine = ++seq.current;
        try {
          const needPeople = tick % 4 === 0;
          tick += 1;
          const [current, people, resp] = await Promise.all([
            fetchSession(session.code),
            needPeople ? fetchParticipants(session.id, session.code) : Promise.resolve(null),
            fetchResponses(session.id, session.code),
          ]);
          if (!alive) return;
          if (mine > applied.current) {
            applied.current = mine;
            if (current) { setSession((prev) => ({ ...prev, ...current })); setReviewPhase((r) => r === current.phase ? null : r); }
            if (people) setParticipants(people);
            setResponses(resp);
          }
          setOnline(true);
        } catch (e) {
          if (alive) setOnline(false);
        } finally {
          busy = false;
          if (again && alive) { again = false; refresh(); }
        }
      };
      refreshRef.current = refresh;
      const soon = () => { clearTimeout(debounce); debounce = setTimeout(refresh, 400); };
      refresh();
      const timer = setInterval(refresh, 3000);
      let channel;
      if (hasSupabase) {
        channel = supabase
          .channel(`hybrid-player-session-${session.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_sessions', filter: `id=eq.${session.id}` }, soon)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'hybrid_responses', filter: `session_id=eq.${session.id}` }, soon)
          .subscribe();
      }
      return () => {
        alive = false;
        clearInterval(timer);
        clearTimeout(debounce);
        if (channel) supabase.removeChannel(channel);
      };
    }, [session?.id]);

  const submit = async (type, choice, note = '', capabilityId = 'teach') => {
    if (!session || !player) throw new Error('You are not connected to a session.');
    const table = validTable(player.table_number);
    if (!table) {
      setError('A valid table assignment is required.');
      throw new Error('A valid table assignment is required.');
    }
    const response = {
      id: uid(),
      session_id: session.id,
      participant_id: player.id,
      table_number: table,
      hospital_id: player.hospital_id,
      persona: player.persona,
      capability_id: capabilityId,
      response_type: type,
      choice,
      note,
      updated_at: new Date().toISOString(),
    };
    try {
      await saveResponse(response, session.code);
      if (refreshRef.current) await refreshRef.current();
    } catch (e) {
      setError(e.message || 'Response could not be saved.');
      throw e;
    }
  };

  if (!session) {
    return (
      <>
        <JoinCode initial={codeValue} onJoin={join} onExit={onExit} />
        {error && <div className="toast">{error}</div>}
      </>
    );
  }
  if (!player) return <Onboard session={session} onDone={setPlayer} />;
      const livePhase = LEGACY_PHASES[session.phase] || session.phase;
      const visiblePhase = reviewPhase || livePhase;
      const reviewSubmit = async () => { throw new Error('You are reviewing an earlier screen. Tap Return live to answer.'); };
    const viewSession = { ...session, phase: visiblePhase };
    return (
      <>
          {!online && <div className="sync-pill">RECONNECTING…</div>}
          <JourneyNav phase={visiblePhase} maxPhase={livePhase} livePhase={livePhase} participant onGo={(id)=>setReviewPhase(id===livePhase?null:id)} />
          <div className={reviewPhase ? 'review-lock' : ''}>
            <PhoneErrorBoundary resetKey={visiblePhase}><PlayerView session={viewSession} player={player} participants={participants || []} responses={responses || []} onSubmit={reviewPhase ? reviewSubmit : submit} /></PhoneErrorBoundary>
          </div>
        {error && <div className="toast" onClick={() => setError('')}>{error}</div>}
      </>
    );
}

class PhoneErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(error,info){ console.error('Participant screen error',error,info); }
  componentDidUpdate(prev){ if(prev.resetKey!==this.props.resetKey && this.state.error) this.setState({error:null}); }
  render(){
    if(!this.state.error) return this.props.children;
    return <Shell compact><section className="phone-card"><div className="eyebrow">SCREEN RECOVERY</div><h1>This screen could not render.</h1><p>Your response is not lost. Return to the live step or reload this phone.</p><pre style={{whiteSpace:'pre-wrap',fontSize:12,padding:12,background:'#f3eee8'}}>{String(this.state.error?.message||this.state.error)}</pre><Button onClick={()=>location.reload()}>RELOAD PHONE</Button></section></Shell>;
  }
}

/* ---------------------------------------------------------------------
   APP ROOT
   --------------------------------------------------------------------- */

export default function App() {
  const query = new URLSearchParams(location.search);
  const joinCode = query.get('join');
  const [mode, setMode] = useState(joinCode ? 'participant' : sessionStorage.getItem('bydesign-facilitator-code') ? 'facilitator' : 'landing');
  useEffect(() => {
    const m = document.querySelector('meta[name="viewport"]');
    if (m) m.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover');
  }, []);

  if (mode === 'landing') return <Landing onFacilitated={() => setMode('facilitator')} />;
  if (mode === 'facilitator') return <Facilitator onExit={() => setMode('landing')} />;
  return (
    <Participant
      initialCode={joinCode}
      onExit={() => {
        history.replaceState({}, '', location.pathname);
        setMode('landing');
      }}
    />
  );
}
