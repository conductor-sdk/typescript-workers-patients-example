# typescript-workers-patients-example
### Set environment variables
```
KEY
SECRET
CONDUCTOR_SERVER_URL
```
Make sure your application has permission to execute workflow,
poll and execute tasks. <br>
The quickest way to set this up is to grant Unrestricted Worker,
Workflow Manager roles.

### Database setup
Workflow execution command is at the end of this document. Example input for the workflow execution specifies local postgres database `test` with user `postgres`,
no password, no SSL, `patients1` (meant to serve as local) and `patients2` tables (meant to serve as external) in `public` schema.

Run following commands from the command line:
```
createdb test
psql test
```
You should be logged into the test database via psql.

### Table setup for successful run:
Paste the following commands to setup the tables from the psql shell.
```
create table patients1 (
    first_name text,
    last_name text,
    dob date,
    family_doctor_assigned bool
);

create table patients2 (
    first_name text,
    last_name text,
    dob date,
    family_doctor_assigned bool
);
INSERT INTO patients1 VALUES ('John', 'Smith', '1983-05-21'::date, false);
INSERT INTO patients2 VALUES ('John', 'Smith', '1983-05-21'::date, true);
```
or

`docker-compose up` will create a container with the database in it

### Run the Application
Navigate to the root of the cloned repository and run the following command
```
yarn &&
ts-node src/main.ts
```
or for node
````
yarn &&
yarn build &&
node dist/main.js
```

### Workflow Setup
Make sure this workflow definition is added to your Orkes instance if not testing on the Playground - https://play.orkes.io/workflowDef/PatientWorkflow/1.

### Trigger the workflow

```
 curl -X POST localhost:3000/ --data '{"localTable":"patients1","externalTable":"patients2","dob":"1983-05-21","LocalDBConnectionString":"postgres://patients:patients@localhost:5432/patients","last_name":"Smith","first_name":"John","ExternalDBConnectionString":"postgres://patients:patients@localhost:5432/patients"}' -H "Content-Type: application/json"
```

The above command should result in a successfult workflow execution of the PatientWorkflow similar to https://play.orkes.io/execution/ffe5f01d-83fb-11ee-b9e2-3e6b0496d0cf?tab=diagram.