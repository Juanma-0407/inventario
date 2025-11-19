This folder contains route definitions for the backend.

Endpoints added:
- GET `/api/tables` -> list all tables in the database
- GET `/api/tables/:table` -> return all rows from table
- POST `/api/tables/:table` -> insert a row (JSON body)
- PUT `/api/tables/:table/:id` -> update row by primary key (JSON body)
- DELETE `/api/tables/:table/:id` -> delete row by primary key

Notes:
- The controllers attempt to detect the primary key via `SHOW KEYS ... WHERE Key_name = 'PRIMARY'`.
- Use with care; generic endpoints allow modifying any table.
