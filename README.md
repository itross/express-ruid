## express-ruid

An Express.js middleware to generate unique id for incoming requests. The generated id will have a prefix and a sequence number.

In case a request has the _request-id_ header valued, then the middleware will use it (header name can be configured, as described in the options section).

### Contents
* [Installation](#installation)
* [Request id format](#request-id-format)
* [Request attribute](#request-attribute)
* [Response header](#response-header)
* [Max id and unique part regeneration](#max-id-and-unique-part-regeneration)
* [Options](#options)
* [Sample usage](#sample-usage)

#### Installation
```bash
npm install express-ruid
```
#### Request id format
The request id will be composed of the three parts. The first two will form the _prefix_ while the third will be the _sequence id_ part:
* prefix
    * pid
    * hostname
* unique part (generated)
* sequence id (number)

Theese parts will be composed in the form of _pid_@_hostname_**/**_unique_part_**-**_sequenceid_

As an example, a reuest id might be something like this: _**4409@redrock/4f1704658fdd4d797c833563-0000000000000001**_.

The _prefix_ part and the separators _'/'_ and _'-'_ can be configured, as described in the options section.

#### Request attribute
The request id (generated or inherited from the request-id header) will be set as req attribute. The default attribute name is _rid_, but it can be configured, as described in the options section.
You can access the request id directly from the Express req object:
```js
app.get('/', (req, res) => {
    console.log(`incoming request-id: ${req.rid}`);
});
```

#### Response header
The request id will be returned as response header. It is added to the Express res object headers as _request-id_ header. The name for the response header is configurable.
Note that you can choose to not add the res header, by configuring the _setHeader_ option to _false_, as described in the options section.

#### Max id and unique part regeneration
When the sequence id reach the max (default is Number.MAX_DAFE_INTEGER = 9007199254740991 on a 64bit machine), the unique part of the prefix will be regenerated and the sequence restart from 0 (so the first id will be ...00001).
The max id is configurable.
```bash
$ curl -i localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
request-id: 7522@redrock/4f1704658fdd4d797c833563-9007199254740991

$ curl -i localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
request-id: 7522@redrock/dafbb8dd5eb2193ee436e8b4-0000000000000001

```
#### Options
```ruid()``` supports the following options:
* **setHeader**: (_boolean_) to add or not the response header. Default: `true`
* **header**: (_string_) to specify the response header name. Default: `'request-id'`
* **attribute**: (_string_) to specify the attribute name to set the request id into to Express req object. Default: `'rid'`
* **prefixRoot**: (_string | function_) to specify custom prefix part of the request id string. Default: `'<process-pid>@<machine-hostname>'`
* **prefixSeparator**: (_string_) to set custom separator between prefix and unique part of the request id string. Default: `'/'`
* **upBytes**: (_number_) number of bytes to generate the unique part of the riquest id. Default: `12`
* **idSeparator**: (_string_) to set custom separator between the unique part and the sequene number of the request id string. Default: `'-'`
* **isMax**: (_number_) the max number for the sequence number in the request id string. Default: `Number.MAX_SAFE_INTEGER`

#### Sample usage
```js
const express = require('express');
const ruid = require('express-ruid');

const app = express();

app.use(ruid());

app.get('/', function (req, res, next) {
    return res.sendStatus(200);
});

const server =
    app.listen(3000, '0.0.0.0')
        .on('listening', () => {
            console.log(`server listening on ${server.address().address}:${server.address().port}`);
        })
        .on('error', (err) => {
            console.error(err);
            process.exit(1);
        });
```

To test the sample:
```bash
$ curl -i localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
request-id: 7522@redrock/4f1704658fdd4d797c833563-0000000000000001

$ curl -i localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
request-id: 7522@redrock/4f1704658fdd4d797c833563-0000000000000002

...
...
$ curl -i localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
request-id: 7522@redrock/4f1704658fdd4d797c833563-0000000000002491
```
### Acknowledgements
This project is inspired by [express-request-id](https://www.npmjs.com/package/express-request-id) and the [chi request_id](https://github.com/go-chi/chi/blob/master/middleware/request_id.go) middleware.

### License

express-ruid is [MIT licensed](LICENSE).

