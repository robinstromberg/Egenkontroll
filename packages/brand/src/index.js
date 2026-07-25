import brandContract from '../brand-contract.json' with { type: 'json' };

export const brandAssets = Object.freeze(brandContract.assets);
export const brandMetadata = Object.freeze(brandContract.metadata);
