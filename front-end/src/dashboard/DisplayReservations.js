import React from "react";
import { Link } from "react-router-dom";

function DisplayReservations({ reservations, cancelHandler }) {
  return (
    <table className="table mt-2">
      <thead>
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Mobile Number</th>
          <th>Reservation Date</th>
          <th>Reservation Time</th>
          <th>People</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {reservations.map((reservation) => (
          <tr key={reservation.reservation_id}>
            <td>{reservation.first_name}</td>
            <td>{reservation.last_name}</td>
            <td>{reservation.mobile_number}</td>
            <td>{reservation.reservation_date}</td>
            <td>{reservation.reservation_time}</td>
            <td>{reservation.people}</td>
            <td data-reservation-id-status={reservation.reservation_id}>
              {reservation.status}
            </td>
            <td>
              {reservation.status === "booked" && (
                <Link to={`/reservations/${reservation.reservation_id}/edit`}>
                  <button>Edit</button>
                </Link>
              )}
              {reservation.status === "booked" && (
                <Link to={`/reservations/${reservation.reservation_id}/seat`}>
                  <button>Seat</button>
                </Link>
              )}
              {reservation.status === "booked" && (
                <button
                  data-reservation-id-cancel={reservation.reservation_id}
                  onClick={() => cancelHandler(reservation.reservation_id)}
                >
                  Cancel
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DisplayReservations;
