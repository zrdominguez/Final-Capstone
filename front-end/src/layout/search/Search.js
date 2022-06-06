import React, { useState } from "react";
import { searchReservation, editReservationStatus } from "../../utils/api";
import DisplayReservations from "../../dashboard/DisplayReservations";
import ErrorAlert from "../ErrorAlert";

function Search() {
  const [number, setNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [searchErrors, setSearchErrors] = useState(null);
  const phoneFormat = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  const changeHandler = (e) => {
    e.preventDefault();
    setNumber(e.target.value);
  };

  const cancelHandler = async (reservation_id) => {
    try {
      if (
        window.confirm(
          "Do you want to cancel this reservation? This cannot be undone."
        )
      ) {
        const response = await editReservationStatus(reservation_id, {
          status: "cancelled",
        });
        setReservations([response]);
      }
    } catch (err) {
      console.log(err);
      setSearchErrors(err);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const abortController = new AbortController();
    setSearchErrors(null);
    if (!number.match(phoneFormat))
      return setSearchErrors({ message: "Incorrect Format" });
    await searchReservation(number, abortController.signal)
      .then((foundReservations) => {
        if (foundReservations.length) return setReservations(foundReservations);
        setSearchErrors({ message: "No reservations found" });
      })
      .catch(setSearchErrors);
    return () => abortController.signal;
  };

  return (
    <>
      <form onSubmit={submitHandler}>
        <label>
          Search
          <input
            type="text"
            name="mobile_number"
            placeholder="Enter a customer's phone number"
            value={number}
            onChange={changeHandler}
          />
        </label>
        <button type="submit">Find</button>
      </form>
      <ErrorAlert error={searchErrors} />
      {reservations.length ? (
        <DisplayReservations
          reservations={reservations}
          cancelHandler={cancelHandler}
        />
      ) : null}
    </>
  );
}

export default Search;
