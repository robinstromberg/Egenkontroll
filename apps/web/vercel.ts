import { createAppRedirects } from './src/config/appUrls';

export default {
  redirects: createAppRedirects(process.env.PUBLIC_APP_ORIGIN).map(({ source, destination }) => ({
    source,
    destination,
    permanent: true,
  })),
};
