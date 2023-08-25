const Hapi = require('@hapi/hapi');
require('dotenv').config();
const routes = require('./src/routes/authRouter');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: process.env.HOST || 'localhost',
    'routes': {
      'cors': true
    }
  });

  server.route(routes);

  await server.start();
  console.log(`Server running on ${process.env.PORT || 8080} port`);
};

init();