export default {
  folderPROCESSING: process.env.folderPROCESSING,
  host: process.env.rethinkdbHOST,
  port: process.env.rethinkdbPORT,

  // helpers
  isProduction() {
    return this.get('express.environment') === 'production';
  },
};
