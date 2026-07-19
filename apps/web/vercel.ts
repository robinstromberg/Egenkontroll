import { createAppRedirects } from './src/config/appUrls';

export const config = {
  redirects: createAppRedirects(process.env.PUBLIC_APP_ORIGIN).map(({ source, destination }) => ({
    source,
    destination,
    permanent: true,
  })),
};
