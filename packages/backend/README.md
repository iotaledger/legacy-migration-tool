# Legacy Migration Tool - Backend

Legacy Migration Tool uses [wallet.rs](https://github.com/iotaledger/wallet.rs) in the backend to handle functionality around value-based transfers.
See its [README](https://github.com/iotaledger/wallet.rs#dependencies) for the required dependencies.

## Building

This directory contains various bindings for the original wallet.rs library (written in Rust) - each can be built and purposed as needed.

### Node.js

Run `yarn` in `legacy-migration-tool/packages/backend/bindings/node` to bundle and build the Javascript bindings for a Node app.

## Other Branches / Commits

The default branch of wallet.rs is `dev`, however to test another branch one follow these steps:

- Change the dependency in `legacy-migration-tool/packages/backend/Cargo.toml`
- Run `cargo update` in both `legacy-migration-tool/packages/backend` __AND__ `legacy-migration-tool/packages/backend/bindings/node/native`
- Build desired bindings 

To include most recent commits, simply run `cargo update` in both `legacy-migration-tool/packages/backend` __AND__ `legacy-migration-tool/packages/backend/bindings/node/native`.
