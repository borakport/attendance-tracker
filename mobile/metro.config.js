const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add additional extensions
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'otf');

// Exclude test files
config.resolver.blockList = [
  /.*__tests__\/.*/,
  /.*\.test\.(js|jsx|ts|tsx)$/,
  /.*\.spec\.(js|jsx|ts|tsx)$/,
];

module.exports = config;
