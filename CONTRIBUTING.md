# Contributing

Thanks for helping improve this reference project. Early contributions are especially useful when they make device states easier to understand, improve accessibility, add tests, or document a reusable hardware-integration boundary.

## Before opening a change

1. Search existing issues and open a focused issue for non-trivial work.
2. Do not contribute confidential employer material, production credentials, private datasets, or unlicensed media.
3. Keep nutrition values clearly identified as illustrative unless a documented public source and validation method are added.
4. Avoid presenting simulated camera or scale behavior as production hardware support.

## Development

```bash
npm ci
npm run typecheck
npm run lint
```

Use a short branch name, keep commits focused, and complete the pull-request checklist. A maintainer must review changes before merge.

## Good first contribution areas

- Unit and state-transition tests
- English localization
- Screen-reader and reduced-motion improvements
- Public interface definitions for camera, load-cell, and firmware adapters
- Documentation and reproducible bug reports

By contributing, you agree that your contribution is licensed under Apache-2.0.
