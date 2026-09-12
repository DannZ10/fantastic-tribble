# Drop zone

Raw capture files go here, named per `PROJECTS-INTAKE.md`:

```
p02-logo.png
p02-preview.png
p02-desktop-01.png
p02-mobile-01.png
p02-mobile-rec.mp4
```

Then run:

```bash
python scripts/process_raw.py
```

That converts everything into what the site actually serves — `public/projects/`,
`public/frames/`, `public/arc/` — trimming the blank lead-in from recordings on
the way.

This folder sits outside `public/` on purpose: `public/` ships verbatim to
production, and these originals are large and unused at runtime. It is
gitignored too, so the source files stay on your machine.
