# Workspace Scripts Utility

This folder contains utilities used during development of the Portfolio Builder Studio templates.

## Scripts

### [inject_templates.js](inject_templates.js)
This Node.js script is a one-shot developer utility used to patch or update elements in the main `templates.js` template bundle using RegExp replacements and file input streams. 

#### Usage
To execute the template injector:
```bash
node scripts/inject_templates.js
```
> [!NOTE]
> This is a local developer utility and is not bundled or loaded in the client-side production application.
