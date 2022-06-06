import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../../utils/api";
import { today } from "../../utils/date-time";

function CreateTable() {
  const initialTable = {
    table_name: "",
    capacity: "",
  };
  const [table, setTable] = useState(initialTable);
  const [formErrors, setFormErrors] = useState({});
  const history = useHistory();

  const validate = (properties) => {
    const errors = {};
    if (properties.table_name.length < 2) {
      errors.table_name = "Error, table name must be atleast 2 characters long";
    }
    if (properties.capacity < 1) {
      errors.capacity = "Error, capacity must be greater than 1";
    }
    return errors;
  };

  const changeHandler = ({ target: { name, value } }) => {
    setTable((preState) => ({
      ...preState,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    table.capacity = parseInt(table.capacity);
    setFormErrors(validate(table));
    const abortController = new AbortController();
    try {
      await createTable(table, abortController.signal);
      setTable(initialTable);
      history.push(`/dashboard?date=${today()}`);
    } catch (error) {
      console.log(error);
    }
    return () => abortController.abort;
  };

  return (
    <form>
      <label>
        Table Name
        <input
          name="table_name"
          type="text"
          required
          placeholder="Table Name"
          value={table.table_name}
          onChange={changeHandler}
        />
        {formErrors.table_name && (
          <p className="alert alert-danger">{formErrors.table_name}</p>
        )}
      </label>

      <label>
        Capacity
        <input
          name="capacity"
          type="number"
          min="1"
          required
          value={table.capacity}
          onChange={changeHandler}
        />
        {formErrors.capacity && (
          <p className="alert alert-danger">{formErrors.capacity}</p>
        )}
      </label>
      <div>
        <button type="submit" onClick={submitHandler}>
          Submit
        </button>
        <button onClick={() => history.goBack()}>Cancel</button>
      </div>
    </form>
  );
}
export default CreateTable;
