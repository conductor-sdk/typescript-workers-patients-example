import { ConductorWorker } from "@io-orkes/conductor-javascript";
import { Pool } from "pg";
import { has, isEmpty } from "ramda";

type FindPatientInputData = {
  DBConnectionString: string;
  first_name: string;
  last_name: string;
  dob: string;
  table: string;
};

const attributeNames = [
  "DBConnectionString",
  "first_name",
  "last_name",
  "dob",
  "table",
];

const hasAllAttributesWithValue = (obj: FindPatientInputData) =>
  attributeNames.filter((attr) => has(attr, obj));

async function performQuery(data: FindPatientInputData) {
  {
    const { DBConnectionString, first_name, last_name, dob, table } = data;

    const pool = new Pool({
      connectionString: DBConnectionString,
    });

    const client = await pool.connect();

    const query = `SELECT first_name, last_name, dob::text, family_doctor_assigned FROM ${table} WHERE first_name = $1 AND last_name = $2 AND dob = $3::date;`;
    const params = [first_name, last_name, dob];
    const result = await client.query(query, params);
    const actualResult = result.rows;
    client.release();
    return actualResult;
  }
}

async function performUpdate(data: FindPatientInputData) {
  const { DBConnectionString, first_name, last_name, dob, table } = data;

  const pool = new Pool({
    connectionString: DBConnectionString,
  });

  const client = await pool.connect();

  const query = `UPDATE ${table} SET family_doctor_assigned = true WHERE first_name = $1 AND last_name = $2 AND dob = $3::date;`;
  const params = [first_name, last_name, dob];
  const result = await client.query(query, params);
  const actualResult = result.rowCount;

  client.release();
  return actualResult;
}

export const findPatientWorker = (): ConductorWorker => ({
  taskDefName: "find_patient",
  execute: async ({ inputData }) => {
    const maybeMissingAttributes = hasAllAttributesWithValue(
      inputData as FindPatientInputData
    );
    if (isEmpty(maybeMissingAttributes)) {
      return {
        reasonForIncompletion: `Missing attributes: ${maybeMissingAttributes.join(
          ", "
        )}`,
        status: "FAILED",
      };
    }

    try {
      const [result] = await performQuery(inputData as FindPatientInputData);

      return {
        outputData: result,
        status: "COMPLETED",
      };
    } catch (error: any) {
      return {
        reasonForIncompletion: "Failed performing query",
        status: "FAILED",
      };
    }
  },
});

export const updatePatientWorker = (): ConductorWorker => ({
  taskDefName: "update_patient",
  execute: async ({ inputData }) => {
    const maybeMissingAttributes = hasAllAttributesWithValue(
      inputData as FindPatientInputData
    );
    if (isEmpty(maybeMissingAttributes)) {
      return {
        reasonForIncompletion: `Missing attributes: ${maybeMissingAttributes.join(
          ", "
        )}`,
        status: "FAILED",
      };
    }
    try {
      await performUpdate(inputData as FindPatientInputData);
      const [result] = await performQuery(inputData as FindPatientInputData);

      return {
        outputData: result,
        status: "COMPLETED",
      };
    } catch (error: any) {
      return {
        reasonForIncompletion: "Failed performing update",
        status: "FAILED",
      };
    }
  },
});
