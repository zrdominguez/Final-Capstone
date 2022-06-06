import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { findReservation, editReservation } from "../../utils/api";
import formatReservationDate from "../../utils/format-reservation-date";
import ErrorAlert from "../ErrorAlert";

function EditReservation() {
  const initialForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };
  const [reservation, setReservation] = useState(initialForm);
  const [editErrors, setEditErrors] = useState(null);
  const history = useHistory();
  const { reservation_id } = useParams();

  useEffect(() => {
    const abortController = new AbortController();
    async function loadReservation() {
      await findReservation(reservation_id, abortController.signal)
        .then((foundReso) =>
          setReservation({
            ...foundReso,
            reservation_date: formatReservationDate(foundReso).reservation_date,
          })
        )
        .catch((err) => console.log(err));
    }
    loadReservation();
    return () => abortController.abort;
  }, [reservation_id]);

  const changeHandler = ({ target: { name, value } }) => {
    setReservation((preState) => ({
      ...preState,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const abortController = new AbortController();
    setEditErrors(null);
    reservation.people = Number(reservation.people);
    try {
      await editReservation(
        reservation_id,
        reservation,
        abortController.signal
      );
      history.goBack();
    } catch (err) {
      console.log(err);
      setEditErrors(err);
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
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
      <ErrorAlert error={editErrors} />
    </form>
  );
}

export default EditReservation;
