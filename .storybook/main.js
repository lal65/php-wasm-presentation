/** @type { import('@storybook/server-webpack5').StorybookConfig } */
const config = {
  "stories": [
    "../stories/**/*.stories.@(json|yaml|yml)"
  ],
  "staticDirs": [ // <-- Add this.
    '../build/',  // <-- Add this.
  ],              // <-- Add this.
  "addons": [
    "@storybook/addon-webpack5-compiler-swc"
  ],
 "framework": "@storybook/server-webpack5"
};
export default config;