const { as } = require("../db/connection");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service");
/**
 * List handler for reservation resources
 */
const REQUIRED_PROPS = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

const STATUSES = ["booked", "seated", "finished", "cancelled"];

function isDateValid(date) {
  let today = new Date();
  today = `${today.getFullYear().toString(10)}-${(today.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${today.getDate().toString(10).padStart(2, "0")}`;
  const userDate = new Date(date);
  if (date < today || userDate.getUTCDay() === 2) return false;
  return true;
}

function isStatusValid(req, res, next) {
  const { status } = req.body.data;
  const { reservation } = res.locals;
  STATUSES.includes(status) === true
    ? (res.locals.status = status)
    : next({ status: 400, message: "Error, unknown status" });
  if (reservation.status === "finished") {
    return next({
      status: 400,
      message: "Error, cannot update finished reservation",
    });
  }
  next();
}

function isTimeValid(time) {
  if (time < "10:30:00" || time > "21:30:00") return false;
  return true;
}

function hasRequiredProperties(req, res, next) {
  const { data } = req?.body || {};
  if (!data) {
    return next({
      status: 400,
      message: "Error, data was not entered",
    });
  }
  if (data.status === "cancelled") return next();
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

async function fieldIsntEmpty(req, res, next) {
  const { data } = req.body;
  let reservation_date = "";
  let dateChanged = true;
  if (data.reservation_id) {
    reservation_date = (await service.read(data.reservation_id))
      .reservation_date;

    reservation_date = `${reservation_date.getFullYear().toString(10)}-${(
      reservation_date.getMonth() + 1
    )
      .toString(10)
      .padStart(2, "0")}-${reservation_date
      .getDate()
      .toString(10)
      .padStart(2, "0")}`;

    dateChanged = reservation_date !== data.reservation_date;
  }
  for (let field in data) {
    if (!data[field]) {
      return next({
        status: 400,
        message: `Error ${field} is empty`,
      });
    }
    if (field === "reservation_date") {
      if (isNaN(Date.parse(data[field]))) {
        return next({
          status: 400,
          message: "Error invalid reservation_date",
        });
      } else if (!isDateValid(data[field]) && dateChanged) {
        return next({
          status: 400,
          message: `Error can only input future reservation_date and we are closed on Tuesday ${data[field]}`,
        });
      }
    }
    if (field === "reservation_time") {
      if (
        isNaN(Date.parse(`${data.reservation_date}T${data[field]}`)) ||
        !isTimeValid(data[field])
      ) {
        return next({
          status: 400,
          message: "Error invalid reservation_time",
        });
      }
    }
    if (field === "people") {
      if (data[field] < 1 || typeof data[field] !== "number") {
        return next({
          status: 400,
          message: `Error invalid number of people. input:${typeof data[
            field
          ]}`,
        });
      }
    }
  }
  next();
}

async function doesExist(req, res, next) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Error reservation_id: ${reservation_id} does not exist`,
  });
}

async function read(req, res) {
  const { reservation } = res.locals;
  res.status(200).json({ data: reservation });
}

async function list(req, res) {
  const date = req.query.date;
  const mobile = req.query.mobile_number;
  if (mobile) {
    return res.json({ data: await service.search(mobile) });
  }
  let reservations = await service.list(date);
  reservations = reservations.filter(
    (reserve) => reserve.status !== "finished"
  );
  res.json({ data: reservations });
}

async function create(req, res, next) {
  const { data } = req.body;
  if (data.status) {
    if (data.status !== "booked") {
      return next({
        status: 400,
        message: `status is: ${data.status}, when it should be booked`,
      });
    }
  }
  const newReservation = await service.create(data);
  res.status(201).json({ data: newReservation[0] });
}

async function update(req, res) {
  const { reservation } = res.locals;
  const { data } = req.body;
  const updatedReservation = { ...reservation, ...data };
  await service.update(updatedReservation);
  res
    .status(200)
    .json({ data: await service.read(updatedReservation.reservation_id) });
}

async function updateStatus(req, res) {
  const { reservation, status } = res.locals;
  const updatedReservation = { ...reservation, status: status };
  await service.update(updatedReservation);
  res
    .status(200)
    .json({ data: await service.read(updatedReservation.reservation_id) });
}

module.exports = {
  read: [asyncErrorBoundary(doesExist), asyncErrorBoundary(read)],
  list: [asyncErrorBoundary(list)],
  create: [hasRequiredProperties, fieldIsntEmpty, asyncErrorBoundary(create)],
  update: [
    asyncErrorBoundary(doesExist),
    hasRequiredProperties,
    asyncErrorBoundary(fieldIsntEmpty),
    asyncErrorBoundary(update),
  ],
  updateStatus: [
    asyncErrorBoundary(doesExist),
    isStatusValid,
    asyncErrorBoundary(updateStatus),
  ],
};
