import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { listTables } from "../../utils/api";
import { seatReservation } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

function SeatReservation() {
  const [tables, setTables] = useState([]);
  const [selection, setSelection] = useState("");
  const [seatingError, setSeatingError] = useState(null);

  const { reservation_id } = useParams();
  const history = useHistory();

  function findTableId(nameAndCapacity) {
    let result = "";
    const stop = nameAndCapacity.indexOf("-");
    for (let i = 0; i < stop; i++) {
      result += nameAndCapacity[i];
    }
    return tables.find((table) => table.table_name === result).table_id;
  }

  const changeHandler = (e) => {
    setSelection(e.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const abortController = new AbortController();
    try {
      await seatReservation(
        findTableId(selection),
        parseInt(reservation_id),
        abortController.signal
      );
      history.push(`/dashboard`);
    } catch (error) {
      setSeatingError(error);
      console.log(error);
    }
    return () => abortController.abort;
  };

  useEffect(
    function () {
      async function loadTables() {
        const abortController = new AbortController();
        const tables = await listTables(abortController.signal);
        setTables(tables);
        setSelection(tables[0].table_id);

        return () => abortController.abort();
      }
      loadTables();
    },
    [reservation_id]
  );

  return (
    <form onSubmit={submitHandler}>
      <label className="form-label">
        Table Number:
        <select
          name="table_id"
          onChange={changeHandler}
          className="form-select"
          value={selection}
        >
          <option name="table" value="">
            Select
          </option>
          {tables.map((table) => (
            <option
              key={table.table_id}
              name="table"
              value={`${table.table_name}-${table.capacity}`}
            >
              {`${table.table_name} - ${table.capacity}`}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Submit</button>
      <ErrorAlert error={seatingError} />
    </form>
  );
}

export default SeatReservation;
