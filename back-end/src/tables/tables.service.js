const knex = require("../db/connection");

function update(updatedTable) {
  return knex("tables as t")
    .select("*")
    .where({ "t.table_id": updatedTable.table_id })
    .update(updatedTable);
}

function create(newTable) {
  return knex("tables").insert(newTable, "*");
}

function list() {
  return knex("tables as t").select("*").orderBy("t.table_name");
}

function read(tableId) {
  return knex("tables").where({ table_id: tableId }).first();
}

module.exports = {
  read,
  create,
  list,
  update,
};
