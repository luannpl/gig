const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclui os arquivos de teste do bundle
config.resolver.blacklistRE = /.*\.test\.tsx$/;

module.exports = withNativeWind(config, { input: "./src/styles/global.css" });
