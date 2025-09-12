const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Metro configuration for Expo web bundling
const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
	...(config.resolver.extraNodeModules || {}),
	'@supabase/node-fetch': require.resolve('cross-fetch/dist/browser-ponyfill.js')
};

// Normalize any absolute async-require resolution to the installed module path
let asyncRequireResolvedPath;
try {
  asyncRequireResolvedPath = require.resolve('@expo/metro-config/build/async-require.js');
} catch (_) {
  asyncRequireResolvedPath = path.join(__dirname, 'node_modules/expo/node_modules/@expo/metro-config/build/async-require.js');
}

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (typeof moduleName === 'string' && moduleName.includes('/@expo/metro-config/build/async-require.js')) {
    return { type: 'sourceFile', filePath: asyncRequireResolvedPath };
  }
  if (typeof originalResolveRequest === 'function') {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Keep Metro aware of Expo's nested node_modules to avoid SHA-1 errors
config.watchFolders = Array.from(new Set([
	...(config.watchFolders || []),
	path.join(__dirname, 'node_modules/expo/node_modules')
]));

module.exports = config;


