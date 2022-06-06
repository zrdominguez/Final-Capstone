import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";
import formatReservationDate from "../../utils/format-reservation-date";
import formatReservationTime from "../../utils/format-reservation-time";

function CreateReservation() {
  const initialForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };

  const [reservation, setReservation] = useState(initialForm);
  const [formErrors, setFormErrors] = useState(null);
  const history = useHistory();

  const changeHandler = ({ target: { name, value } }) => {
    setReservation((preState) => ({
      ...preState,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    reservation.people = Number(reservation.people);
    reservation.reservation_date =
      formatReservationDate(reservation).reservation_date;
    reservation.reservation_time =
      formatReservationTime(reservation).reservation_time;
    const abortController = new AbortController();
    setFormErrors(null);
    try {
      await createReservation(reservation, abortController.signal);
      history.push(`/dashboard?date=${reservation.reservation_date}`);
    } catch (err) {
      setFormErrors(err);
    }
    return () => abortController.abort;
  };

  return (
    <form>
      <label>
        First Name
        <input
          name="first_name"
          type="text"
          required
          value={reservation.first_name}
          onChange={changeHandler}
        />
      </label>
      <label>
        Last Name
        <input
          name="last_name"
          type="text"
          required
          value={reservation.last_name}
          onChange={changeHandler}
        />
      </label>
      <label>
        Mobile Number
        <input
          name="mobile_number"
          type="tel"
          placeholder="123-456-7890"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          required
          value={reservation.mobile_number}
          onChange={changeHandler}
        />
      </label>
      <label>
        Reservation Date
        <input
          name="reservation_date"
          type="date"
          placeholder="YYYY-MM-DD"
          pattern="\d{4}-\d{2}-\d{2}"
          required
          value={reservation.reservation_date}
          onChange={changeHandler}
        />
      </label>
      <label>
        Reservation Time
        <input
          name="reservation_time"
          type="time"
          placeholder="HH:MM"
          pattern="[0-9]{2}:[0-9]{2}"
          required
          value={reservation.reservation_time}
          onChange={changeHandler}
        />
      </label>
      <label>
        People
        <input
          name="people"
          type="number"
          min="1"
          value={reservation.people}
          onChange={changeHandler}
        />
      </label>
      <button type="submit" onClick={submitHandler}>
        Submit
      </button>
      <button onClick={() => history.goBack()}>Cancel</button>
      <ErrorAlert error={formErrors} />
    </form>
  );
}

export default CreateReservation;
