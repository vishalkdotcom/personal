# vishalk.com portfolio

Personal site for Vishal Kumar. The public surface is an app-shell workspace over Work, About, Resume, and Contact — not a chat or IDE product.

## Language

**App Shell**:
The whole-site chrome: left IA, center stage, and right context, used for every mode.
_Avoid_: layout, dashboard, IDE, chat UI

**Triptych Dock**:
The desktop App Shell geometry with three always-on collapsible columns (left · center · right).
_Avoid_: floating-only shell, two-pane shell

**Mode**:
A top-level App Shell destination in the left chrome. v1 Modes are Work, About, Resume, and Contact.
_Avoid_: page, tab, route (when meaning the IA concept)

**Work Case**:
A single piece of work under an employer or project folder in Work, shown as a proof-first narrative in the center stage.
_Avoid_: project card, portfolio item, task

**Public Storefront**:
A Work Case with a real public URL and media; Live opens that URL honestly (no in-shell Preview surface).
_Avoid_: demo mock, redacted reconstruction, Preview (as a product surface)

**Internal Dossier**:
A Work Case for auth-walled or non-public work: outcomes and artifacts (including an honest access-description when useful); authentic product screenshots when available; approved illustrative mocks only when a Spec explicitly locks them for that case; never unapproved lookalikes or reconstructed client UI; omit Live when there is no public URL. Does not carry an impact-metrics row.
_Avoid_: redacted screenshot case, fake UI recreation, unapproved mock, Preview (as a product surface), auth-walled apology banner, impact-metrics row

**Selected Work**:
A short About-center strip of a few Work Case peeks with an affordance to the full Work index — not the full index itself.
_Avoid_: All work on About, featured home

**Production / Prototype**:
Badges on a Work Case indicating shipped production work versus exploratory/prototype work.
_Avoid_: WIP, concept (unless matching existing data labels)

**Resume Surface**:
The Resume Mode whose source of truth is an embedded PDF viewer, not an HTML rebuild of the CV.
_Avoid_: CV page, HTML resume

**Context Rail**:
The right column of the Triptych Dock; content follows the active Mode or Work Case (availability, Live, Role, Stack, facts, links). Work Case Outcomes belong on the stage, not the rail.
_Avoid_: Outputs, Sources, sidebar widgets

**Hire Signal**:
The availability / open-to-roles call to action in the desktop Context Rail and as a mobile floating chip. It can be turned off site-wide; on mobile a visitor can snooze it temporarily without hiding the desktop rail.
_Avoid_: sticky hire bar, chat composer CTA

**Work Folder**:
An employer or grouping node in the Work tree and on the Work index that contains Work Cases (e.g. Labor Solutions, Advance Auto Parts, Prototypes, Tools). It is not its own routed index surface — cases open from the tree or the Work index.
_Avoid_: category, tab, project group, folder index page

**Public Claim**:
A proof-safe outcome allowed in public Work Case copy.
_Avoid_: hero vanity metric (when meaning interview-only volume stats), impact metric (retired concept)

**Outcome lead-label**:
A short accent lead word on a Work Case outcome (e.g. Consistency, Depth) that names the beat before the claim text.
_Avoid_: outcome title, bullet heading, section header (when meaning the in-line lead)

**Interview-Only Claim**:
An evidenced career-archive claim kept off the public site for interviews or private briefing.
_Avoid_: secret claim, off-record
