/** @type { import('@storybook/server-webpack5').Preview } */

const origin = self.location.origin;                                 // <-- Add this.
const base_path = self.location.pathname.replace('iframe.html', ''); // <-- Add this.

const preview = {
 parameters: {
   controls: {
     matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
     },
   },
   server: {                                    // <-- Add this.
     url: origin + base_path + 'php-wasm/twig', // <-- Add this.
   },                                           // <-- Add this.
 },
};

export default preview;