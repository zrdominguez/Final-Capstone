import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import { useLocation, Link } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, next, today } from "../utils/date-time";
import DisplayTables from "./DisplayTables";
import DisplayReservations from "./DisplayReservations";
import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";
import { editReservationStatus } from "../utils/api";
/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const { search } = useLocation();
  const date = search ? search.slice(6) : today();

  useEffect(loadDash, [date]);
  function loadDash() {
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesError(null);
    listTables(abortController.signal).then(setTables).catch(setTablesError);
    listReservations({ date }, abortController.signal)
      .then((reservations) => {
        formatReservationDate(reservations);
        formatReservationTime(reservations);
        return setReservations(reservations);
      })
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  const cancelHandler = async (reservation_id) => {
    try {
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      ) &&
        (await editReservationStatus(reservation_id, { status: "cancelled" }));
      loadDash();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date</h4>
      </div>
      <div>
        <Link to={`/dashboard?date=${previous(date)}`}>
          <button>Previous</button>
        </Link>
        <Link to={`/dashboard?date=${today()}`}>
          <button>Today</button>
        </Link>
        <Link to={`/dashboard?date=${next(date)}`}>
          <button>Next</button>
        </Link>
      </div>
      <ErrorAlert error={reservationsError} />
      <DisplayReservations
        reservations={reservations}
        cancelHandler={cancelHandler}
      />
      <ErrorAlert error={tablesError} />
      <DisplayTables tables={tables} loadDash={loadDash} />
    </main>
  );
}

export default Dashboard;
