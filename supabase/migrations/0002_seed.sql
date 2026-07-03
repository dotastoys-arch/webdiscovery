-- =============================================================
-- Seed: bedrijfsprofiel + Nederlandse e-mailsjablonen
-- Pas de VUL_IN-velden aan met je echte KvK/adresgegevens.
-- Placeholders in sjablonen worden runtime vervangen:
--   {{company_name}}   = naam van het lead-bedrijf
--   {{preview_url}}    = link naar de klaarstaande website
--   {{sender_name}}    = jouw naam
--   {{kvk_number}}     = KvK-nummer (vertrouwen)
--   {{unsubscribe_url}}= verplichte afmeldlink
-- =============================================================

insert into company_profile
  (name, legal_name, kvk_number, vat_number, address, postal_code, city,
   email, phone, website, sender_name, sender_email, standard_price_cents)
values
  ('Webdiscovery', 'VUL_IN B.V.', 'VUL_IN', 'VUL_IN', 'VUL_IN', 'VUL_IN', 'VUL_IN',
   'info@webdiscovery.nl', 'VUL_IN', 'https://webdiscovery.nl',
   'Team Webdiscovery', 'hallo@mail.webdiscovery.nl', 50000);

-- ---------- INTRO: eerste contact ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('intro', 'Intro — website staat klaar',
 'Een vernieuwde website voor {{company_name}} — staat klaar om te bekijken',
$$<p>Hoi,</p>
<p>Wij zijn Webdiscovery, een erkend Nederlands webbureau (KvK {{kvk_number}}). Wij bouwen moderne websites die niet alleen mooi zijn, maar ook goed gevonden worden — óók door AI-zoekmachines zoals ChatGPT en Google's AI-overzichten.</p>
<p>We zagen <strong>{{company_name}}</strong> en hebben alvast een vernieuwd ontwerp voor jullie klaargezet. Geen verplichtingen — even kijken kan gewoon:</p>
<p><a href="{{preview_url}}">👉 Bekijk de website die voor jullie klaarstaat</a></p>
<p>Wat vind je ervan? Een korte reactie is genoeg.</p>
<p>Hartelijke groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888">Je ontvangt deze mail omdat we denken dat dit relevant is voor {{company_name}}. Geen interesse? <a href="{{unsubscribe_url}}">Afmelden</a> — dan hoor je niets meer van ons.</p>$$,
$$Hoi,

Wij zijn Webdiscovery, een erkend Nederlands webbureau (KvK {{kvk_number}}). Wij bouwen moderne websites die goed gevonden worden, ook door AI-zoekmachines.

We hebben alvast een vernieuwd ontwerp voor {{company_name}} klaargezet. Even kijken kan vrijblijvend:
{{preview_url}}

Wat vind je ervan?

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- PREVIEW_OFFER: mét de link + prijs ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('preview_offer', 'Preview + aanbod €500',
 'Jullie nieuwe website — inclusief prijs en hoe je live gaat',
$$<p>Hoi,</p>
<p>Fijn dat je interesse hebt! Dit is de website die we voor <strong>{{company_name}}</strong> hebben gemaakt:</p>
<p><a href="{{preview_url}}">👉 Bekijk jullie website</a></p>
<p>Voor <strong>€500,-</strong> maken we hem helemaal af naar jullie wensen, koppelen we jullie domeinnaam en zetten we hem live. Je kunt direct online via een simpel stappenplan.</p>
<p>Zullen we hem live zetten? Reageer gerust op deze mail met je vragen.</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888"><a href="{{unsubscribe_url}}">Afmelden</a></p>$$,
$$Hoi,

Fijn dat je interesse hebt! Dit is de website voor {{company_name}}:
{{preview_url}}

Voor €500,- maken we hem af naar wens, koppelen we jullie domein en zetten we hem live.

Zullen we hem live zetten?

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- FOLLOWUP_2DAY: 2 dagen later ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('followup_2day', 'Follow-up na 2 dagen',
 'Heb je de website voor {{company_name}} al kunnen bekijken?',
$$<p>Hoi,</p>
<p>Een paar dagen geleden stuurde ik de website die we voor <strong>{{company_name}}</strong> hebben klaargezet. Heb je hem al kunnen bekijken?</p>
<p><a href="{{preview_url}}">👉 Hier staat hij nog</a></p>
<p>Ik ben benieuwd wat je ervan vindt — ook als het een &quot;nee&quot; is, dan weet ik het. 😊</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888"><a href="{{unsubscribe_url}}">Afmelden</a></p>$$,
$$Hoi,

Een paar dagen geleden stuurde ik de website voor {{company_name}}. Heb je hem al kunnen bekijken?
{{preview_url}}

Benieuwd wat je ervan vindt — ook als het een nee is.

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- FOLLOWUP_FINAL: laatste herinnering ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('followup_final', 'Laatste herinnering',
 'Laatste mail over de website voor {{company_name}}',
$$<p>Hoi,</p>
<p>Ik wil je niet lastigvallen, dus dit is mijn laatste mailtje hierover. De website voor <strong>{{company_name}}</strong> staat nog klaar:</p>
<p><a href="{{preview_url}}">👉 Bekijken</a></p>
<p>Interesse? Antwoord gewoon op deze mail. Anders hoor je niets meer van me — succes met alles!</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>
<hr><p style="font-size:12px;color:#888"><a href="{{unsubscribe_url}}">Afmelden</a></p>$$,
$$Hoi,

Dit is mijn laatste mail hierover. De website voor {{company_name}} staat nog klaar:
{{preview_url}}

Interesse? Antwoord op deze mail. Anders hoor je niets meer van me.

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}

Afmelden: {{unsubscribe_url}}$$);

-- ---------- REPLY_INTERESTED: reactie bij interesse ----------
insert into email_templates (step, name, subject, body_html, body_text) values
('reply_interested', 'Reactie bij interesse',
 'Top! Zo gaan we jullie website live zetten',
$$<p>Hoi,</p>
<p>Wat leuk dat je verder wilt met de website voor <strong>{{company_name}}</strong>! Zo werkt het:</p>
<ol>
<li>We stemmen de laatste wensen af (teksten, kleuren, foto's).</li>
<li>Je koppelt of registreert je domeinnaam — we helpen je stap voor stap.</li>
<li>Je rekent veilig €500,- af (iDEAL).</li>
<li>Wij zetten de site live — vaak binnen een paar dagen.</li>
</ol>
<p>Zullen we starten? Laat maar weten, dan stuur ik je de link om alles te regelen.</p>
<p>Groet,<br>{{sender_name}}<br>Webdiscovery · KvK {{kvk_number}}</p>$$,
$$Hoi,

Wat leuk dat je verder wilt met de website voor {{company_name}}! Zo werkt het:
1. We stemmen de laatste wensen af.
2. Je koppelt/registreert je domein — we helpen stap voor stap.
3. Je rekent veilig €500,- af (iDEAL).
4. Wij zetten de site live, vaak binnen een paar dagen.

Zullen we starten?

Groet,
{{sender_name}}
Webdiscovery · KvK {{kvk_number}}$$);
