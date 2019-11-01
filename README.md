# scratch-cloud-http

## config.json

"project_id": The project ID

## Using the server

Use "node server.js" to lanuch the server.
Possible requests:

http://localhost:8000/?type=get&name=<name> :
Gets the value of a cloud variable with the name of <name>
Possible responses:
* {"status": "error", "code": ..., "text": ...} - Error. Code and text will vary.
* {"status": "ok", "value": <value>} - Succeeded. The "value" key has the value of the vavriable
http://localhost:8000/?type=set&name=<name>&value=<value> - Set the value of a cloud variable with the name of <name> to <value>
* {"status": "error", "code": ..., "text": ...} - Error. Code and text will vary.
* {"status": "ok"} - Succeeded.

## Errors
All the error explanations are in the "text" field.
Possible values:
* code = 0: No query specified.
* code = 1: Missing 'type' field.
* code = 2: Missing 'name' field.
* code = 3: Missing 'value' field.
* code = 4: No such variable exists.