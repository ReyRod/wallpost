const { Client } = require('pg');

module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { message } = body;
    if (!message) {
      return response(400, 'You must specify the message');
    }

    const client = new Client({
      host: process.env.DB_HOSTNAME,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    });

    await client.connect();

    const tableExists = await client
      .query('SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = \'public\' AND tablename  = \'posts\');')
      .then((result) => result.rows[0].exists);
    if (!tableExists) {
      await client.query(`
        CREATE TABLE public.posts (id serial, message text NOT NULL);
      `);
    }

    const result = await client.query(`
        INSERT INTO public.posts (message) VALUES ('${message}') RETURNING posts.id, posts.message
      `);

    await client.end();

    return response(200, { posts: result.rows });
  } catch (e) {
    return response(500, e);
  }
};

const response = (responseCode, message) => ({
  statusCode: responseCode,
  body: JSON.stringify(responseCode === 200
    ? {
      ...message,
    }
    : {
      message,
    },
  null,
  2),
});
