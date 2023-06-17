import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database();

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select(
        'tasks',
        search
          ? {
              name: search,
              email: search,
            }
          : null,
      );

      return response.end(JSON.stringify(tasks));
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      let tasks = request.body;
      if (!Array.isArray(tasks)) {
        const { title, description } = request.body;

        if (
          !title ||
          !description ||
          title.length <= 0 ||
          description.length <= 0
        ) {
          throw new Error('Invalid title or description');
        }

        tasks = [
          { title: 'title', description: 'description' },
          { title, description },
        ];
      }

      for (const task of tasks.slice(1)) {
        database.insert('tasks', {
          id: randomUUID(),
          title: task.title,
          description: task.description,
          completed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      return response.writeHead(201).end();
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const task = database.get('tasks', id);
      if (!task) {
        return response.writeHead(404).end(
          JSON.stringify({
            message: 'Task not found',
          }),
        );
      }

      const { title, description } = request.body;
      if (
        !title ||
        !description ||
        title.length <= 0 ||
        description.length <= 0
      ) {
        throw new Error('Invalid title or description');
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date(),
      });
      return response.writeHead(204).end();
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params;
      const task = database.get('tasks', id);
      if (!task) {
        return response.writeHead(404).end(
          JSON.stringify({
            message: 'Task not found',
          }),
        );
      }

      database.delete('tasks', id);
      return response.writeHead(204).end();
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params;
      const task = database.get('tasks', id);
      if (!task) {
        return response.writeHead(404).end(
          JSON.stringify({
            message: 'Task not found',
          }),
        );
      }

      database.update('tasks', id, {
        ...task,
        completed_at: task.completed_at ? null : new Date(),
        updated_at: new Date(),
      });
      return response.writeHead(204).end();
    },
  },
];

export function match(request) {
  const { method, url } = request;
  return routes.find(
    (route) => route.method === method && route.path.test(url),
  );
}
