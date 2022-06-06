const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const rService = require("../reservations/reservations.service");
const service = require("./tables.service");

const REQUIRED_PROPS = ["table_name", "capacity"];

function dataIsntEmpty(req, res, next) {
  const { data } = req?.body || {};
  for (let field in data) {
    if (field === "table_name") {
      if (data[field].length < 2)
        return next({
          status: 400,
          message: `Error, table_name ${data[field]} needs to have atleast 2 characters`,
        });
    }
    if (field === "capacity") {
      if (typeof data[field] !== "number")
        return next({
          status: 400,
          message: "Error, capacity needs to be a number",
        });
    }
    if (!data[field])
      return next({
        status: 400,
        message: `Error ${field} is empty`,
      });
  }
  res.locals.table = data;
  next();
}

function hasRequiredProperties(req, res, next) {
  const { data } = req?.body || {};
  if (!data) {
    return next({
      status: 400,
      message: "Error, data was not entered",
    });
  }
  const test = Object.keys(data);
  const invalidFields = REQUIRED_PROPS.filter((field) => !test.includes(field));
  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function enoughCapacity(req, res, next) {
  const { table, reservation } = res.locals;
  if (table.capacity < reservation.people) {
    return next({
      status: 400,
      message: `Error, table: ${table.table_name} does not have sufficient capacity`,
    });
  }
  next();
}

function isOccupied(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    return next({
      status: 400,
      message: "Error this table is occupied",
    });
  }
  next();
}

async function doesReservationExist(req, res, next) {
  const { data } = req?.body || {};
  if (!data) {
    return next({
      status: 400,
      message: "Error data is missing",
    });
  }
  const { reservation_id } = data;
  if (!reservation_id) {
    return next({
      status: 400,
      message: `Error reservation_id missing: ${reservation_id}`,
    });
  }
  const reservation = await rService.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  } else {
    next({
      status: 404,
      message: `reservation_id: ${reservation_id} does not exist`,
    });
  }
}

async function doesTableExist(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Error table_id: ${table_id} does not exist`,
  });
}

async function isSeated(req, res, next) {
  const { reservation } = res.locals;
  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: "Error, reservation is already seated",
    });
  }
  reservation.status = "seated";
  await rService.update(reservation);
  next();
}

async function update(req, res) {
  const { table, reservation } = res.locals;
  const updatedTable = {
    ...table,
    reservation_id: reservation.reservation_id,
  };
  await service.update(updatedTable);
  const data = await service.read(table.table_id);
  res.status(200).json({ data });
}

async function create(req, res) {
  const newTable = await service.create(res.locals.table);
  res.status(201).json({ data: newTable[0] });
}

async function list(req, res) {
  res.status(200).json({ data: await service.list() });
}

async function destroy(req, res, next) {
  const { table } = res.locals;
  if (!table.reservation_id) {
    return next({
      status: 400,
      message: "table is not occupied",
    });
  }
  const reservation = await rService.read(table.reservation_id);
  table.reservation_id = null;
  reservation.status = "finished";
  await rService.update(reservation);
  await service.update(table);
  res.status(200).json({ data: await service.read(table.table_id) });
}

module.exports = {
  update: [
    asyncErrorBoundary(doesTableExist),
    asyncErrorBoundary(doesReservationExist),
    enoughCapacity,
    isOccupied,
    asyncErrorBoundary(isSeated),
    asyncErrorBoundary(update),
  ],
  list: [asyncErrorBoundary(list)],
  delete: [asyncErrorBoundary(doesTableExist), asyncErrorBoundary(destroy)],
  create: [hasRequiredProperties, dataIsntEmpty, asyncErrorBoundary(create)],
};
