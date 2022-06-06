import React from "react";
import { finishTable } from "../utils/api";

function DisplayTables({ tables, loadDash }) {
  const finish = async (e) => {
    e.preventDefault();
    try {
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      ) && (await finishTable(e.target.dataset.tableIdFinish));
      await loadDash();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h4 className="mt-2">Tables</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Table Name</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table.table_id}>
              <td>{table.table_name}</td>
              <td>{table.capacity}</td>
              {table.reservation_id ? (
                <>
                  <td data-table-id-status={table.table_id}>Occupied</td>
                  <td>
                    <button
                      data-table-id-finish={table.table_id}
                      onClick={finish}
                    >
                      Finished
                    </button>
                  </td>
                </>
              ) : (
                <td data-table-id-status={table.table_id}>Free</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default DisplayTables;
