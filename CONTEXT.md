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
A Work Case with a real public URL and media; Preview and Live are honest and enabled.
_Avoid_: demo mock, redacted reconstruction

**Internal Dossier**:
A Work Case for auth-walled or non-public work: outcomes and artifacts without fake screenshots; Preview off; Live states the lack of a public URL.
_Avoid_: redacted screenshot case, fake UI recreation

**Production / Prototype**:
Badges on a Work Case indicating shipped production work versus exploratory/prototype work.
_Avoid_: WIP, concept (unless matching existing data labels)

**Resume Surface**:
The Resume Mode whose source of truth is an embedded PDF viewer, not an HTML rebuild of the CV.
_Avoid_: CV page, HTML resume

**Context Rail**:
The right column of the Triptych Dock; content follows the active Mode or Work Case (availability, Live, Role, Outcomes, Stack, facts, links).
_Avoid_: Outputs, Sources, sidebar widgets

**Hire Signal**:
The availability / open-to-roles call to action in the desktop Context Rail and as a mobile floating chip. It can be turned off site-wide; on mobile a visitor can snooze it temporarily without hiding the desktop rail.
_Avoid_: sticky hire bar, chat composer CTA

**Work Folder**:
An employer or grouping node in the Work tree that contains Work Cases (e.g. Labor Solutions, Advance Auto Parts, Prototypes, Tools).
_Avoid_: category, tab, project group

**Public Claim**:
A proof-safe outcome or metric allowed in public Work Case copy.
_Avoid_: hero vanity metric (when meaning interview-only volume stats)

**Interview-Only Claim**:
An evidenced career-archive claim kept off the public site for interviews or private briefing.
_Avoid_: secret claim, off-record
