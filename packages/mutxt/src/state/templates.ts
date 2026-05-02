import type {SlateDocument} from '@jsonjoy.com/collaborative-slate';

export type MuTxtTemplateCategory = 'work' | 'personal';

export interface MuTxtTemplate {
  id: string;
  name: string;
  description: string;
  fileName: string;
  category: MuTxtTemplateCategory;
  doc: SlateDocument;
}

const designDoc: SlateDocument = [
  {type: 'h1', children: [{text: 'RFC: <Title>'}]},
  {
    type: 'p',
    children: [
      {text: 'Author: '},
      {text: '<your name>', italic: true},
      {text: ' · Status: '},
      {text: 'Draft', bold: true},
      {text: ' · Last updated: '},
      {text: '<date>', italic: true},
    ],
  },
  {
    type: 'callout',
    icon: '📌',
    title: 'TL;DR',
    children: [{text: 'One-paragraph summary of the proposal and the change it produces.'}],
  },
  {type: 'h2', children: [{text: 'Background'}]},
  {type: 'p', children: [{text: 'Why are we doing this? What problem are we solving, and for whom? Link to prior art, incidents, and related docs.'}]},
  {type: 'h2', children: [{text: 'Goals'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Goal 1 — concrete, measurable.'}]},
      {type: 'li', children: [{text: 'Goal 2 — concrete, measurable.'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Non-goals'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Things we are explicitly not solving in this round.'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Proposal'}]},
  {type: 'p', children: [{text: 'High-level approach, then drill into the specifics. Describe the data model, API surface, and any user-facing changes.'}]},
  {type: 'h3', children: [{text: 'API'}]},
  {
    type: 'code-block',
    language: 'ts',
    children: [{text: '// Sketch the public API here\nexport interface Example {\n  id: string;\n}'}],
  },
  {type: 'h3', children: [{text: 'Data model'}]},
  {type: 'p', children: [{text: 'Schema, migration plan, and storage characteristics.'}]},
  {type: 'h2', children: [{text: 'Alternatives considered'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Alternative A — '}, {text: 'why rejected', italic: true}, {text: '.'}]},
      {type: 'li', children: [{text: 'Alternative B — '}, {text: 'why rejected', italic: true}, {text: '.'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Risks & open questions'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Risk: …  Mitigation: …'}]},
      {type: 'li', children: [{text: 'Open question: …'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Rollout plan'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: 'Land behind a feature flag'}]},
      {type: 'li', checked: false, children: [{text: 'Internal dogfood'}]},
      {type: 'li', checked: false, children: [{text: 'Staged rollout'}]},
      {type: 'li', checked: false, children: [{text: 'GA + cleanup'}]},
    ],
  },
];

const meetingNotes: SlateDocument = [
  {type: 'h1', children: [{text: 'Meeting notes — <topic>'}]},
  {
    type: 'p',
    children: [
      {text: 'Date: '},
      {text: '<YYYY-MM-DD>', italic: true},
      {text: ' · Facilitator: '},
      {text: '<name>', italic: true},
      {text: ' · Notetaker: '},
      {text: '<name>', italic: true},
    ],
  },
  {type: 'h2', children: [{text: 'Attendees'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<name>'}]},
      {type: 'li', children: [{text: '<name>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Agenda'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Item 1'}]},
      {type: 'li', children: [{text: 'Item 2'}]},
      {type: 'li', children: [{text: 'Item 3'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Discussion'}]},
  {type: 'p', children: [{text: 'Capture key points, decisions, and dissenting views as the conversation unfolds.'}]},
  {
    type: 'blockquote',
    children: [{text: 'Decision: ', bold: true}, {text: 'short statement of what was decided and by whom.'}],
  },
  {type: 'h2', children: [{text: 'Action items'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: '<owner> — <action> — due <date>'}]},
      {type: 'li', checked: false, children: [{text: '<owner> — <action> — due <date>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Follow-ups'}]},
  {type: 'p', children: [{text: 'Topics parked for later discussion.'}]},
];

const bugReport: SlateDocument = [
  {type: 'h1', children: [{text: 'Bug: <one-line summary>'}]},
  {
    type: 'callout',
    icon: '🐞',
    title: 'Severity',
    children: [{text: 'P0 / P1 / P2 / P3 — describe user impact in one sentence.'}],
  },
  {type: 'h2', children: [{text: 'Environment'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Build / version: '}, {text: '<sha or tag>', code: true}]},
      {type: 'li', children: [{text: 'Platform / OS / browser: '}, {text: '<…>', code: true}]},
      {type: 'li', children: [{text: 'Account / tenant: '}, {text: '<…>', code: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Steps to reproduce'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Step 1'}]},
      {type: 'li', children: [{text: 'Step 2'}]},
      {type: 'li', children: [{text: 'Step 3'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Expected behavior'}]},
  {type: 'p', children: [{text: 'What should happen.'}]},
  {type: 'h2', children: [{text: 'Actual behavior'}]},
  {type: 'p', children: [{text: 'What actually happens. Attach screenshots or screen recordings as embeds.'}]},
  {type: 'h2', children: [{text: 'Logs / stack trace'}]},
  {
    type: 'code-block',
    children: [{text: 'Paste relevant log output here'}],
  },
  {type: 'h2', children: [{text: 'Workaround'}]},
  {type: 'p', children: [{text: 'Any temporary mitigation users can apply, or '}, {text: 'none', italic: true}, {text: '.'}]},
  {type: 'h2', children: [{text: 'Investigation notes'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Hypothesis 1 — …'}]},
      {type: 'li', children: [{text: 'Hypothesis 2 — …'}]},
    ],
  },
];

const readme: SlateDocument = [
  {type: 'h1', children: [{text: '<project-name>'}]},
  {
    type: 'p',
    children: [
      {text: 'A '},
      {text: 'one-line', italic: true},
      {text: ' description of what this project does and who it is for.'},
    ],
  },
  {type: 'h2', children: [{text: 'Features'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Feature one'}]},
      {type: 'li', children: [{text: 'Feature two'}]},
      {type: 'li', children: [{text: 'Feature three'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Installation'}]},
  {
    type: 'code-block',
    language: 'bash',
    children: [{text: 'npm install <project-name>'}],
  },
  {type: 'h2', children: [{text: 'Usage'}]},
  {
    type: 'code-block',
    language: 'ts',
    children: [
      {text: "import {example} from '<project-name>';\n\nexample();"},
    ],
  },
  {type: 'h2', children: [{text: 'API'}]},
  {type: 'p', children: [{text: 'Document each public export — its signature, parameters, return value, and side effects.'}]},
  {type: 'h2', children: [{text: 'Development'}]},
  {
    type: 'code-block',
    language: 'bash',
    children: [{text: 'git clone <repo>\nnpm install\nnpm test'}],
  },
  {type: 'h2', children: [{text: 'Contributing'}]},
  {type: 'p', children: [{text: 'Issues and pull requests are welcome. See '}, {text: 'CONTRIBUTING.md', code: true}, {text: ' for guidelines.'}]},
  {type: 'h2', children: [{text: 'License'}]},
  {type: 'p', children: [{text: 'MIT'}]},
];

const postmortem: SlateDocument = [
  {type: 'h1', children: [{text: 'Postmortem: <incident name>'}]},
  {
    type: 'p',
    children: [
      {text: 'Date: '},
      {text: '<YYYY-MM-DD>', italic: true},
      {text: ' · Authors: '},
      {text: '<names>', italic: true},
      {text: ' · Status: '},
      {text: 'Draft', bold: true},
    ],
  },
  {
    type: 'callout',
    icon: '🔥',
    title: 'Summary',
    children: [{text: 'One paragraph: what broke, who was affected, how long, and how it was fixed.'}],
  },
  {type: 'h2', children: [{text: 'Impact'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Users affected: '}, {text: '<count / %>', code: true}]},
      {type: 'li', children: [{text: 'Duration: '}, {text: '<HH:MM UTC – HH:MM UTC>', code: true}]},
      {type: 'li', children: [{text: 'Systems affected: '}, {text: '<services>', code: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Timeline (UTC)'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<HH:MM> — first signal / page'}]},
      {type: 'li', children: [{text: '<HH:MM> — incident declared, IC assigned'}]},
      {type: 'li', children: [{text: '<HH:MM> — root cause identified'}]},
      {type: 'li', children: [{text: '<HH:MM> — mitigation applied'}]},
      {type: 'li', children: [{text: '<HH:MM> — incident resolved'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Root cause'}]},
  {type: 'p', children: [{text: 'Walk the chain of events down to the underlying cause. Resist stopping at the first plausible explanation.'}]},
  {type: 'h2', children: [{text: 'Detection'}]},
  {type: 'p', children: [{text: 'How was the issue detected? How long did detection take, and could we have detected it sooner?'}]},
  {type: 'h2', children: [{text: 'What went well'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'What went poorly'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Action items'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: '<owner> — prevention — <action>'}]},
      {type: 'li', checked: false, children: [{text: '<owner> — detection — <action>'}]},
      {type: 'li', checked: false, children: [{text: '<owner> — response — <action>'}]},
    ],
  },
  {
    type: 'callout',
    icon: '🙅',
    title: 'Blameless',
    children: [{text: 'Focus on systems and processes, not individuals. The goal is learning, not assigning fault.'}],
  },
];

const retro: SlateDocument = [
  {type: 'h1', children: [{text: 'Sprint retrospective — <sprint / dates>'}]},
  {
    type: 'p',
    children: [
      {text: 'Team: '},
      {text: '<team>', italic: true},
      {text: ' · Facilitator: '},
      {text: '<name>', italic: true},
    ],
  },
  {type: 'h2', children: [{text: 'What went well 🎉'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'What didn’t go well 😬'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'What we learned 💡'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Action items'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: '<owner> — <action> — due <date>'}]},
      {type: 'li', checked: false, children: [{text: '<owner> — <action> — due <date>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Carry-over from last retro'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Status of previous action items.'}]},
    ],
  },
];

const streamCheck: SlateDocument = [
  {type: 'h1', children: [{text: 'Going live: <stream title>'}]},
  {
    type: 'callout',
    icon: '🔴',
    title: 'Schedule',
    children: [{text: '<day>, <HH:MM> <timezone> · est. <duration>'}],
  },
  {type: 'h2', children: [{text: 'Pre-stream check'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: 'Mic levels + pop filter'}]},
      {type: 'li', checked: false, children: [{text: 'Camera framing & lighting'}]},
      {type: 'li', checked: false, children: [{text: 'OBS scenes & alerts'}]},
      {type: 'li', checked: false, children: [{text: 'Game/app updated, captures running'}]},
      {type: 'li', checked: false, children: [{text: 'Internet speed test (up '}, {text: '> 8 Mbps', code: true}, {text: ')'}]},
      {type: 'li', checked: false, children: [{text: 'Snacks + water within reach'}]},
      {type: 'li', checked: false, children: [{text: 'Phone on do-not-disturb'}]},
      {type: 'li', checked: false, children: [{text: 'Stream title + tags + category set'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Today’s plan'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Welcome / catch-up (~5 min)'}]},
      {type: 'li', children: [{text: 'Main segment — '}, {text: '<topic>', italic: true}]},
      {type: 'li', children: [{text: 'Break / Q&A'}]},
      {type: 'li', children: [{text: 'Wrap-up + raid'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Talking points'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Shoutouts & sponsors'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '@<creator> — '}, {text: 'why', italic: true}]},
      {type: 'li', children: [{text: '<sponsor> — code '}, {text: '<CODE>', code: true}, {text: ' · plug at <time>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Stream goals'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: 'Hit <N> concurrent viewers'}]},
      {type: 'li', checked: false, children: [{text: '<N> new follows'}]},
      {type: 'li', checked: false, children: [{text: 'Reach charity/donation goal'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Post-stream notes'}]},
  {type: 'p', children: [{text: 'What worked, what to fix next time, clip ideas, VOD timestamps.'}]},
];

const videoScript: SlateDocument = [
  {type: 'h1', children: [{text: '<video title>'}]},
  {
    type: 'p',
    children: [
      {text: 'Platform: '},
      {text: '<YouTube / TikTok / Reels / Shorts>', italic: true},
      {text: ' · Length: '},
      {text: '<m:ss>', italic: true},
      {text: ' · Aspect: '},
      {text: '<16:9 / 9:16>', italic: true},
    ],
  },
  {
    type: 'callout',
    icon: '🪝',
    title: 'Hook (first 3 seconds)',
    children: [{text: 'One sentence that stops the scroll. Promise the payoff.'}],
  },
  {type: 'h2', children: [{text: 'Intro'}]},
  {type: 'p', children: [{text: 'Who you are, what this video gives them, why they should stay.'}]},
  {type: 'h2', children: [{text: 'Beat sheet'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Beat 1 — set up the problem'}]},
      {type: 'li', children: [{text: 'Beat 2 — first reveal / demo'}]},
      {type: 'li', children: [{text: 'Beat 3 — twist or deeper insight'}]},
      {type: 'li', children: [{text: 'Beat 4 — payoff'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Script'}]},
  {type: 'p', children: [{text: 'Write spoken lines exactly as you’ll deliver them. Short sentences. Read them aloud.'}]},
  {type: 'h3', children: [{text: 'B-roll / on-screen'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<timestamp> — '}, {text: '<shot description>', italic: true}]},
      {type: 'li', children: [{text: '<timestamp> — '}, {text: '<text overlay>', italic: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Call to action'}]},
  {type: 'p', children: [{text: 'Like, subscribe, follow, link in bio — be specific about what you want them to do next.'}]},
  {type: 'h2', children: [{text: 'Outro'}]},
  {type: 'p', children: [{text: 'Tease the next video and end strong.'}]},
  {type: 'h2', children: [{text: 'Description / SEO'}]},
  {
    type: 'code-block',
    children: [{text: 'Title: <title>\n\n<2–3 sentence description with target keyword>\n\n#<tag1> #<tag2> #<tag3>'}],
  },
  {type: 'h2', children: [{text: 'Thumbnail ideas'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Concept A — '}, {text: '<text + visual>', italic: true}]},
      {type: 'li', children: [{text: 'Concept B — '}, {text: '<text + visual>', italic: true}]},
    ],
  },
];

const journal: SlateDocument = [
  {type: 'title', children: [{text: '<YYYY-MM-DD>'}]},
  {
    type: 'p',
    children: [
      {text: 'Mood: '},
      {text: '<emoji or word>', italic: true},
      {text: ' · Weather: '},
      {text: '<…>', italic: true},
    ],
  },
  {type: 'h2', children: [{text: 'Today’s highlights'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Grateful for'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Today I learned'}]},
  {type: 'p', children: [{text: 'One thing — could be tiny.'}]},
  {type: 'h2', children: [{text: 'Mind dump'}]},
  {type: 'p', children: [{text: 'Anything that’s rattling around — write without editing.'}]},
  {
    type: 'blockquote',
    children: [{text: 'Quote / lyric / line that stuck with me today.'}],
  },
  {type: 'h2', children: [{text: 'Tomorrow'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: 'One thing I will do'}]},
      {type: 'li', checked: false, children: [{text: 'One thing I will not do'}]},
    ],
  },
];

const recipe: SlateDocument = [
  {type: 'h1', children: [{text: '<recipe name>'}]},
  {
    type: 'p',
    children: [
      {text: 'Serves: '},
      {text: '<N>', bold: true},
      {text: ' · Prep: '},
      {text: '<N min>', bold: true},
      {text: ' · Cook: '},
      {text: '<N min>', bold: true},
      {text: ' · '},
      {text: '<vegetarian / vegan / gluten-free>', italic: true},
    ],
  },
  {
    type: 'callout',
    icon: '👩‍🍳',
    title: 'Notes',
    children: [{text: 'Where the recipe came from, why you love it, what to swap if you’re missing something.'}],
  },
  {type: 'h2', children: [{text: 'Ingredients'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<amount> '}, {text: '<unit>', italic: true}, {text: ' <ingredient>'}]},
      {type: 'li', children: [{text: '<amount> '}, {text: '<unit>', italic: true}, {text: ' <ingredient>'}]},
      {type: 'li', children: [{text: '<amount> '}, {text: '<unit>', italic: true}, {text: ' <ingredient>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Equipment'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<pan / pot / bowl / etc>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Instructions'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: 'Prep — wash, chop, measure.'}]},
      {type: 'li', children: [{text: 'Heat the pan…'}]},
      {type: 'li', children: [{text: 'Combine…'}]},
      {type: 'li', children: [{text: 'Season to taste and serve.'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Variations'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Spicier: add '}, {text: '<…>', code: true}]},
      {type: 'li', children: [{text: 'Vegetarian swap: '}, {text: '<…>', code: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Pairings'}]},
  {type: 'p', children: [{text: 'Goes well with…'}]},
];

const travel: SlateDocument = [
  {type: 'h1', children: [{text: '<destination> — <month YYYY>'}]},
  {
    type: 'p',
    children: [
      {text: 'Dates: '},
      {text: '<YYYY-MM-DD> → <YYYY-MM-DD>', bold: true},
      {text: ' · Travelers: '},
      {text: '<names>', italic: true},
      {text: ' · Budget: '},
      {text: '<$>', italic: true},
    ],
  },
  {type: 'h2', children: [{text: 'Reservations'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '✈️ '}, {text: '<flight / confirmation #>', code: true}]},
      {type: 'li', children: [{text: '🏨 '}, {text: '<hotel / Airbnb / confirmation #>', code: true}]},
      {type: 'li', children: [{text: '🚗 '}, {text: '<car rental / transit pass>', code: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Packing list'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: 'Passport / ID'}]},
      {type: 'li', checked: false, children: [{text: 'Chargers + adapter'}]},
      {type: 'li', checked: false, children: [{text: 'Meds'}]},
      {type: 'li', checked: false, children: [{text: 'Weather-appropriate clothes'}]},
      {type: 'li', checked: false, children: [{text: 'Snacks for the trip'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Day-by-day'}]},
  {type: 'h3', children: [{text: 'Day 1 — arrival'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Morning — …'}]},
      {type: 'li', children: [{text: 'Afternoon — …'}]},
      {type: 'li', children: [{text: 'Evening — …'}]},
    ],
  },
  {type: 'h3', children: [{text: 'Day 2'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Want-to-eat / want-to-see'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '🍜 <restaurant> — '}, {text: '<dish>', italic: true}]},
      {type: 'li', children: [{text: '🏛️ <landmark>'}]},
      {type: 'li', children: [{text: '🌳 <park / view>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Important contacts'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Embassy: '}, {text: '<phone>', code: true}]},
      {type: 'li', children: [{text: 'Hotel front desk: '}, {text: '<phone>', code: true}]},
      {type: 'li', children: [{text: 'Travel insurance: '}, {text: '<policy / phone>', code: true}]},
    ],
  },
];

const competitorAnalysis: SlateDocument = [
  {type: 'h1', children: [{text: 'Competitor analysis: <market / category>'}]},
  {
    type: 'p',
    children: [
      {text: 'Owner: '},
      {text: '<your name>', italic: true},
      {text: ' · Last updated: '},
      {text: '<YYYY-MM-DD>', italic: true},
      {text: ' · Status: '},
      {text: 'Living document', bold: true},
    ],
  },
  {
    type: 'callout',
    icon: '🎯',
    title: 'TL;DR',
    children: [{text: 'One paragraph: who the players are, where we stand, and the one move we should make next.'}],
  },
  {type: 'h2', children: [{text: 'Market & context'}]},
  {type: 'p', children: [{text: 'What is this market? Size, growth, target buyer, dominant trends. Why it matters now.'}]},
  {type: 'h2', children: [{text: 'Our positioning'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Who we serve: '}, {text: '<segment>', italic: true}]},
      {type: 'li', children: [{text: 'Core promise: '}, {text: '<value prop>', italic: true}]},
      {type: 'li', children: [{text: 'Wedge / unfair advantage: '}, {text: '<…>', italic: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Competitors'}]},
  {type: 'h3', children: [{text: '<Competitor A>'}]},
  {
    type: 'p',
    children: [
      {text: 'Site: '},
      {text: '<url>', a: {href: 'https://example.com'}},
      {text: ' · HQ: '},
      {text: '<city>', italic: true},
      {text: ' · Founded: '},
      {text: '<year>', italic: true},
      {text: ' · Funding: '},
      {text: '<stage / $>', italic: true},
      {text: ' · Headcount: '},
      {text: '<N>', italic: true},
    ],
  },
  {
    type: 'p',
    children: [{text: 'One-line description of what they do and who they serve.'}],
  },
  {
    type: 'callout',
    icon: '✅',
    title: 'Strengths',
    color: '#3aaf5f',
    children: [{text: 'Where they’re genuinely better than us — features, distribution, brand, capital, talent.'}],
  },
  {
    type: 'callout',
    icon: '⚠️',
    title: 'Weaknesses',
    color: '#e07a5f',
    children: [{text: 'Where they fall short — gaps, complaints, missing segments, organizational drag.'}],
  },
  {
    type: 'p',
    children: [
      {text: 'Pricing: '},
      {text: '<starting tier / model>', code: true},
      {text: ' · Notable customers: '},
      {text: '<…>', italic: true},
    ],
  },
  {type: 'h3', children: [{text: '<Competitor B>'}]},
  {
    type: 'p',
    children: [
      {text: 'Site: '},
      {text: '<url>', a: {href: 'https://example.com'}},
      {text: ' · HQ: '},
      {text: '<city>', italic: true},
      {text: ' · Founded: '},
      {text: '<year>', italic: true},
      {text: ' · Funding: '},
      {text: '<stage / $>', italic: true},
    ],
  },
  {type: 'p', children: [{text: 'One-line description.'}]},
  {
    type: 'callout',
    icon: '✅',
    title: 'Strengths',
    color: '#3aaf5f',
    children: [{text: '…'}],
  },
  {
    type: 'callout',
    icon: '⚠️',
    title: 'Weaknesses',
    color: '#e07a5f',
    children: [{text: '…'}],
  },
  {type: 'h3', children: [{text: '<Competitor C>'}]},
  {type: 'p', children: [{text: 'Repeat the same template for each player worth tracking.'}]},
  {type: 'h2', children: [{text: 'Feature comparison'}]},
  {type: 'p', children: [{text: 'Score each player on the dimensions that actually drive purchase decisions. Use ✅ / ⚠️ / ❌ for quick scanning.'}]},
  {type: 'h3', children: [{text: 'Core capability'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Us — '}, {text: '✅ ', bold: true}, {text: 'best-in-class for '}, {text: '<scenario>', italic: true}]},
      {type: 'li', children: [{text: '<Competitor A> — '}, {text: '✅ ', bold: true}, {text: '…'}]},
      {type: 'li', children: [{text: '<Competitor B> — '}, {text: '⚠️ ', bold: true}, {text: '…'}]},
    ],
  },
  {type: 'h3', children: [{text: 'Pricing & packaging'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Us — '}, {text: '<model>', italic: true}]},
      {type: 'li', children: [{text: '<Competitor A> — '}, {text: '<model>', italic: true}]},
      {type: 'li', children: [{text: '<Competitor B> — '}, {text: '<model>', italic: true}]},
    ],
  },
  {type: 'h3', children: [{text: 'Distribution & GTM'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Us — '}, {text: '<channels>', italic: true}]},
      {type: 'li', children: [{text: '<Competitor A> — '}, {text: '<channels>', italic: true}]},
    ],
  },
  {type: 'h3', children: [{text: 'Ecosystem & integrations'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Us — '}, {text: '<…>', italic: true}]},
      {type: 'li', children: [{text: '<Competitor A> — '}, {text: '<…>', italic: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'SWOT — us vs. the field'}]},
  {
    type: 'callout',
    icon: '💪',
    title: 'Strengths',
    color: '#3aaf5f',
    children: [{text: 'What we do better than anyone — protect and amplify these.'}],
  },
  {
    type: 'callout',
    icon: '🩹',
    title: 'Weaknesses',
    color: '#e07a5f',
    children: [{text: 'Honest gaps — where we lose deals or look weak.'}],
  },
  {
    type: 'callout',
    icon: '🚀',
    title: 'Opportunities',
    color: '#4d96ff',
    children: [{text: 'Open lanes — underserved segments, missing features, regulatory shifts.'}],
  },
  {
    type: 'callout',
    icon: '☁️',
    title: 'Threats',
    color: '#8b8b8b',
    children: [{text: 'What could blindside us — funded entrants, platform changes, pricing pressure.'}],
  },
  {type: 'h2', children: [{text: 'Recommendations'}]},
  {
    type: 'checklist',
    children: [
      {type: 'li', checked: false, children: [{text: '<owner> — defend: <action>'}]},
      {type: 'li', checked: false, children: [{text: '<owner> — close gap: <action>'}]},
      {type: 'li', checked: false, children: [{text: '<owner> — exploit opportunity: <action>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Sources & evidence'}]},
  {
    type: 'ol',
    children: [
      {type: 'li', children: [{text: '<source — link or note>'}]},
      {type: 'li', children: [{text: '<customer interview / win-loss / analyst report>'}]},
    ],
  },
];

const toolComparison: SlateDocument = [
  {type: 'h1', children: [{text: 'Tool comparison: <decision>'}]},
  {
    type: 'p',
    children: [
      {text: 'Owner: '},
      {text: '<name>', italic: true},
      {text: ' · Decision needed by: '},
      {text: '<YYYY-MM-DD>', italic: true},
    ],
  },
  {
    type: 'callout',
    icon: '🎯',
    title: 'Decision criteria',
    children: [{text: 'What we’re optimizing for — performance, ergonomics, cost, ecosystem, lock-in, etc. Rank in order of priority.'}],
  },
  {type: 'h2', children: [{text: 'Requirements'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Must-have — '}, {text: '<requirement>', italic: true}]},
      {type: 'li', children: [{text: 'Must-have — '}, {text: '<requirement>', italic: true}]},
      {type: 'li', children: [{text: 'Nice-to-have — '}, {text: '<requirement>', italic: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Options'}]},
  {type: 'h3', children: [{text: '<Option A>'}]},
  {
    type: 'p',
    children: [
      {text: 'Docs: '},
      {text: '<url>', a: {href: 'https://example.com'}},
      {text: ' · License: '},
      {text: '<…>', code: true},
      {text: ' · Maintainer: '},
      {text: '<…>', italic: true},
      {text: ' · Last release: '},
      {text: '<date / version>', code: true},
    ],
  },
  {
    type: 'code-block',
    language: 'bash',
    children: [{text: 'npm install <package-a>'}],
  },
  {type: 'h4', children: [{text: 'Pros'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h4', children: [{text: 'Cons'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h4', children: [{text: 'Cost / footprint'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Bundle size: '}, {text: '<kB>', code: true}]},
      {type: 'li', children: [{text: 'Runtime cost: '}, {text: '<…>', code: true}]},
      {type: 'li', children: [{text: 'Pricing: '}, {text: '<$ / free>', code: true}]},
    ],
  },
  {type: 'h3', children: [{text: '<Option B>'}]},
  {
    type: 'p',
    children: [
      {text: 'Docs: '},
      {text: '<url>', a: {href: 'https://example.com'}},
      {text: ' · License: '},
      {text: '<…>', code: true},
      {text: ' · Maintainer: '},
      {text: '<…>', italic: true},
    ],
  },
  {
    type: 'code-block',
    language: 'bash',
    children: [{text: 'npm install <package-b>'}],
  },
  {type: 'h4', children: [{text: 'Pros'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h4', children: [{text: 'Cons'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '…'}]},
    ],
  },
  {type: 'h3', children: [{text: 'Build it ourselves'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'Estimated effort: '}, {text: '<weeks>', code: true}]},
      {type: 'li', children: [{text: 'Why we might: '}, {text: '<…>', italic: true}]},
      {type: 'li', children: [{text: 'Why we wouldn’t: '}, {text: '<…>', italic: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Scorecard'}]},
  {type: 'p', children: [{text: 'Rate each option against the criteria — keep it lightweight (✅ / ⚠️ / ❌).'}]},
  {type: 'h3', children: [{text: 'Performance'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'A — ✅ '}, {text: '<note>', italic: true}]},
      {type: 'li', children: [{text: 'B — ⚠️ '}, {text: '<note>', italic: true}]},
    ],
  },
  {type: 'h3', children: [{text: 'Developer experience'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'A — '}, {text: '<note>', italic: true}]},
      {type: 'li', children: [{text: 'B — '}, {text: '<note>', italic: true}]},
    ],
  },
  {type: 'h3', children: [{text: 'Ecosystem & community'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'A — '}, {text: '<github stars / discord / SO>', italic: true}]},
      {type: 'li', children: [{text: 'B — '}, {text: '<…>', italic: true}]},
    ],
  },
  {type: 'h3', children: [{text: 'Risk & lock-in'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: 'A — '}, {text: '<note>', italic: true}]},
      {type: 'li', children: [{text: 'B — '}, {text: '<note>', italic: true}]},
    ],
  },
  {type: 'h2', children: [{text: 'Decision'}]},
  {
    type: 'callout',
    icon: '✅',
    title: 'We’ll go with: <option>',
    color: '#3aaf5f',
    children: [{text: 'One-paragraph justification — which criteria pushed us over the line, and what we are accepting as trade-offs.'}],
  },
  {type: 'h2', children: [{text: 'Open questions'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<question to follow up on>'}]},
    ],
  },
];

const tierList: SlateDocument = [
  {type: 'h1', children: [{text: 'Tier list: <what you’re ranking>'}]},
  {
    type: 'p',
    children: [
      {text: 'Ranked by '},
      {text: '<your criteria>', italic: true},
      {text: ' — '},
      {text: '<who / when>', italic: true},
      {text: '.'},
    ],
  },
  {
    type: 'blockquote',
    children: [{text: 'How I’m ranking these — be specific so future-you remembers what S actually meant.'}],
  },
  {
    type: 'callout',
    icon: 'S',
    title: 'God tier',
    color: '#ff5e5e',
    children: [{text: 'Defining, must-have, perfect for what it does.'}],
  },
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<item>'}]},
      {type: 'li', children: [{text: '<item>'}]},
    ],
  },
  {
    type: 'callout',
    icon: 'A',
    title: 'Great',
    color: '#ff9f43',
    children: [{text: 'Excellent — small flaws keep it from S.'}],
  },
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<item>'}]},
      {type: 'li', children: [{text: '<item>'}]},
    ],
  },
  {
    type: 'callout',
    icon: 'B',
    title: 'Good',
    color: '#ffd93d',
    children: [{text: 'Solid — happy to recommend.'}],
  },
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<item>'}]},
      {type: 'li', children: [{text: '<item>'}]},
    ],
  },
  {
    type: 'callout',
    icon: 'C',
    title: 'Average',
    color: '#6bcb77',
    children: [{text: 'Fine. Take it or leave it.'}],
  },
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<item>'}]},
      {type: 'li', children: [{text: '<item>'}]},
    ],
  },
  {
    type: 'callout',
    icon: 'D',
    title: 'Below average',
    color: '#4d96ff',
    children: [{text: 'Real problems — only if nothing else is around.'}],
  },
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<item>'}]},
    ],
  },
  {
    type: 'callout',
    icon: 'F',
    title: 'Avoid',
    color: '#8b8b8b',
    children: [{text: 'Don’t.'}],
  },
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<item>'}]},
    ],
  },
  {type: 'h2', children: [{text: 'Honorable mentions'}]},
  {
    type: 'ul',
    children: [
      {type: 'li', children: [{text: '<item>'}, {text: ' — couldn’t place yet.', italic: true}]},
    ],
  },
];

export const templates: MuTxtTemplate[] = [
  {
    id: 'design-doc',
    name: 'Engineering design doc (RFC)',
    description: 'Goals, proposal, alternatives.',
    fileName: 'Design doc',
    category: 'work',
    doc: designDoc,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting notes',
    description: 'Agenda, discussion, decisions, action items.',
    fileName: 'Meeting notes',
    category: 'work',
    doc: meetingNotes,
  },
  {
    id: 'bug-report',
    name: 'Bug report',
    description: 'Repro steps, environment, logs.',
    fileName: 'Bug report',
    category: 'work',
    doc: bugReport,
  },
  {
    id: 'readme',
    name: 'Project README',
    description: 'Description, features, install, usage, API.',
    fileName: 'README',
    category: 'work',
    doc: readme,
  },
  {
    id: 'postmortem',
    name: 'Incident postmortem',
    description: 'Impact, timeline, root cause, action items.',
    fileName: 'Postmortem',
    category: 'work',
    doc: postmortem,
  },
  {
    id: 'sprint-retro',
    name: 'Sprint retrospective',
    description: 'What went well, what did not.',
    fileName: 'Retrospective',
    category: 'work',
    doc: retro,
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor analysis',
    description: 'Market, positioning, SWOT, recommendations.',
    fileName: 'Competitor analysis',
    category: 'work',
    doc: competitorAnalysis,
  },
  {
    id: 'tool-comparison',
    name: 'Tool / library comparison',
    description: 'Requirements, options, pros/cons, scorecard.',
    fileName: 'Tool comparison',
    category: 'work',
    doc: toolComparison,
  },
  {
    id: 'stream-check',
    name: 'Stream go-live checklist',
    description: 'Pre-stream check, plan, shoutouts, notes.',
    fileName: 'Stream notes',
    category: 'personal',
    doc: streamCheck,
  },
  {
    id: 'video-script',
    name: 'Video script',
    description: 'Hook, beats, script, B-roll, CTA, thumbnails.',
    fileName: 'Video script',
    category: 'personal',
    doc: videoScript,
  },
  {
    id: 'journal',
    name: 'Daily journal',
    description: 'Highlights, gratitude, mind dump, plan.',
    fileName: 'Journal',
    category: 'personal',
    doc: journal,
  },
  {
    id: 'recipe',
    name: 'Recipe',
    description: 'Servings, ingredients, equipment, steps.',
    fileName: 'Recipe',
    category: 'personal',
    doc: recipe,
  },
  {
    id: 'travel',
    name: 'Travel itinerary',
    description: 'Reservations, packing, plan, contacts.',
    fileName: 'Trip',
    category: 'personal',
    doc: travel,
  },
  {
    id: 'tier-list',
    name: 'Tier list (S–F)',
    description: 'S/A/B/C/D/F rows for ranking anything.',
    fileName: 'Tier list',
    category: 'personal',
    doc: tierList,
  },
];
