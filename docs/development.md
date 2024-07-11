# Development

- Do NOT use custom tsconfig paths, they rollup/typescript cannot easily produce declaration files.
- After running `yarn typechain`, edit 3 source files in src/contracts/ ethersv5/ethersv6 to replace the "ethers" imports with "ethersv5" or "ethersv6".

## Generate typescript interfaces for EVM contract

`yarn typechain`

## Publish to npmjs.com

### Publishing account (NPM)

- Be a member of organization: @bel2labs

### Useful commands

- `yarn login` (once)
- `yarn publish --access=public`
