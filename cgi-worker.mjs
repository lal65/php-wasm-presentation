// cgi-worker.js

const { PhpCgiWorker } = require('php-cgi-wasm/PhpCgiWorker.mjs');
const { unzipSync } = require('fflate');

const static_site_deployment_path = self.location.pathname.replace(
  'cgi-worker.js',
  ''
);

// This CGI worker handles all fetches that request any route under /php-wasm.
const php = new PhpCgiWorker({
  prefix:  static_site_deployment_path + 'php-wasm',
  persist: [
    { mountPath:'/www' },
    { mountPath:'/config' }
  ],
  docroot: '/www/public',

  // The bundler lifts libraries to the document root.Prefix is:
  locateFile: filename => static_site_deployment_path + filename,

  // Symfony 7.4 requires the iconv and mbstring extensions.
  sharedLibs: [
    require('php-wasm-iconv'),
    require('php-wasm-mbstring'),
  ],
});

self.addEventListener('install',  event => php.handleInstallEvent(event));
self.addEventListener('activate', event => php.handleActivateEvent(event));

// The fetch event lazily installs the Symfony application as needed.
self.addEventListener('fetch', event => {

  // Only check for the symfony app installation on the first request to it.
  // This allows Storybook to finish loading its internal files very quickly.
  if (new URL(event.request.url).pathname.includes('/php-wasm/')) {
    return event.respondWith((async () => {

      // The Symfony app lives in the IndexedDB storage mechanism under the
      // "/www" object store with the front controller existing at exactly
      // "/www/public/index.php".  When php-wasm boots, this object store
      // is mounted to the virtual filesystem, so we can simply check if the
      // front controller exists via a php-wasm filesystem operation.
      if (!(await php.analyzePath('/www/public/index.php')).exists) {

        // If the app isn't installed, start by downloading the zip archive.
        const response = await fetch(static_site_deployment_path + 'www.zip');

        // Convert the response to a format to feed into fflate.
        const buffer = new Uint8Array(await response.arrayBuffer());

        // Extract the zip.
        const unzipped = unzipSync(buffer);

        // Extract the extracted files into /www.
        for (const [path, data] of Object.entries(unzipped)) {
          if (data.length === 0) {
            await php.mkdir('/www/' + path);
          } else {
            await php.writeFile('/www/' + path, data);
          }
        }
      }

      // Pass the request onto the CGI.
      return await php.request(event.request);
    })());
  }

  // This request likely won't be handled by the CGI.
  return php.handleFetchEvent(event);
});


self.addEventListener('message',  event => php.handleMessageEvent(event));