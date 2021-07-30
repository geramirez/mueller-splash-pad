// Manually setup proxy for development
//see: https://create-react-app.dev/docs/proxying-api-requests-in-development/
const createProxyMiddleware = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/status',
    createProxyMiddleware({
      target: process.env.REACT_APP_PROXY || 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};