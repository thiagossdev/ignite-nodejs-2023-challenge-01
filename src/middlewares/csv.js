import { parse } from 'csv-parse';

export async function csv(request, response) {
  const buffers = [];

  const parser = request.pipe(parse());
  for await (const record of parser) {
    buffers.push({
      title: record[0],
      description: record[1],
    });
  }

  try {
    request.body = buffers;
  } catch (e) {
    request.body = null;
  }

  response.setHeader('Content-Type', 'application/json');
}
