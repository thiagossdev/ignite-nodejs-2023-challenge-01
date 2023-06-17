import http from 'node:http';
import { json } from './middlewares/json.js';
import { match } from './routes.js';
import { extractQueryParams } from './utils/extract-query-params.js';
import { csv } from './middlewares/csv.js';

const server = http.createServer(async (request, response) => {
  if (request.headers['content-type'] === 'text/csv') {
    await csv(request, response);
  } else {
    await json(request, response);
  }

  const route = match(request);
  try {
    if (route) {
      const routeParams = request.url.match(route.path);
      const { query, ...params } = routeParams.groups;

      request.params = params;
      request.query = query ? extractQueryParams(query) : {};

      return route.handler(request, response);
    }
  } catch (error) {
    return response.writeHead(400).end(
      JSON.stringify({
        message: error.message,
      }),
    );
  }

  return response.writeHead(404).end();
});

server.listen(3333);
