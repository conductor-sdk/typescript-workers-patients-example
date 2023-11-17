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
