import brandContract from '../brand-contract.json';

export const brandAssets = brandContract.assets;
export const brandMetadata = brandContract.metadata;

export type BrandAsset = keyof typeof brandAssets;
export type BrandAssetUrl = (typeof brandAssets)[BrandAsset];
