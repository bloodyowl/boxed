<img width="108" alt="@bloodyowl/boxed logo" src="https://github.com/bloodyowl/boxed/blob/main/docs/static/img/logo.svg?raw=true">

# @bloodyowl/boxed

[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/bloodyowl/boxed/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/@bloodyowl/boxed?style=for-the-badge)](https://www.npmjs.org/package/@bloodyowl/boxed)
[![bundlephobia](https://img.shields.io/bundlephobia/minzip/@bloodyowl/boxed?label=size&style=for-the-badge)](https://bundlephobia.com/result?p=@bloodyowl/boxed)

> Essential building-blocks for functional & safe TypeScript code

**Boxed** provides essential building-blocks (in the form of types and functions) so that you can write functional, safe TypeScript code.

## Design principles

- Provide utility types that **make data-manipulation and storage easier**
- **Immutable** (all provided types are)
- Give a **good development experience** (chaining API, reliable types)
- Simple **interoperability** (you can convert back and forth to JS native types)
- Compatibility with `ts-pattern` (using `patterns` we provide).

## What's in the box?

- `Option<Value>`
- `Result<Ok, Error>`
- `Future<Value>`
- `AsyncData<Value>`
- `Lazy<Value>`
- Some utils like `Deferred`, `Dict` & `Array`

## Installation

```bash
$ yarn add @bloodyowl/boxed
# --- or ---
$ npm install --save @bloodyowl/boxed
```

## Links

- 📘 [**Documentation**](https://boxed.cool)
- ⚖️ [**License**](./LICENSE)
