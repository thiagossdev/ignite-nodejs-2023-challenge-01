import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url);

export class Database {
  #schemas = {};

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then((data) => {
        this.#schemas = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#schemas));
  }

  select(table, search) {
    const rows = this.#schemas[table] ?? [];

    if (search) {
      return rows.filter((row) => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase());
        });
      });
    }

    return rows;
  }

  insert(table, data) {
    if (Array.isArray(this.#schemas[table])) {
      this.#schemas[table].push(data);
    } else {
      this.#schemas[table] = [data];
    }

    this.#persist();
    return data;
  }

  get(table, id) {
    const rows = this.select(table);
    return rows.find((row) => row.id === id);
  }

  update(table, id, data) {
    const rows = this.select(table);
    const index = rows.findIndex((row) => row.id === id);
    if (index > -1) {
      rows[index] = {
        ...rows[index],
        id,
        ...data,
      };
      this.#persist();
      return rows[index];
    }

    return null;
  }

  delete(table, id) {
    const rows = this.select(table);
    const index = rows.findIndex((row) => row.id === id);
    if (index > -1) {
      rows.splice(index, 1);
      this.#persist();
      return id;
    }

    return null;
  }
}
