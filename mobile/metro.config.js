const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix ESM packages that Metro can't resolve (like lucide-react-native v0.4+)
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
