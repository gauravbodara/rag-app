const { initTracer } = require('jaeger-client');
module.exports = function initJaegerTracer(serviceName) {
  const config = {
    serviceName,
    reporter: {
      logSpans: true,
      agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
      agentPort: process.env.JAEGER_AGENT_PORT || 6832,
    },
    sampler: {
      type: 'const',
      param: 1,
    },
  };
  const options = {
    logger: {
      info: function logInfo(msg) {
        console.log('JAEGER INFO', msg);
      },
      error: function logError(msg) {
        console.error('JAEGER ERROR', msg);
      },
    },
  };
  return initTracer(config, options);
} 