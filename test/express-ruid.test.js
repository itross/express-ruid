/*!
* express-ruid
* Express.js request id middleware
*
* Copyright(c) 2020 Luca Stasio <joshuagame@gmail.com>, IT Resources s.r.l. <http://www.itresources.it>
*
* Use of this source code is governed by a MIT license.
* You can find the MIT license terms for this source code in the LICENSE file.
*
* test/express-ruid.test.js
*/

const ruid = require('../lib/express-ruid');
const supertest = require('supertest');
const express = require('express');
const os = require('os');

describe('request id generation', function () {

    it('should have "rid" as request attribute', async function (done) {
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req).toHaveProperty('rid');
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);

        done();
    });

    it('should have rid with prefix === hostname', async function (done) {
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req.rid).toMatch(new RegExp(os.hostname(), 'gi'));
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);

        done();
    });

    it('should have rid with custom prefix', async function (done) {
        const app = express();
        app.use(ruid({
            prefixRoot: 'CUSTOM'
        }));
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req.rid).toMatch(new RegExp('CUSTOM', 'gi'));
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);

        done();
    });

    it('should have rid with custom prefix as function', async function (done) {
        const app = express();
        app.use(ruid({
            prefixRoot: () => {
                return `CUSTOM${os.hostname()}CUSTOM`
            }
        }));
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req.rid).toMatch(new RegExp(`CUSTOM${os.hostname()}CUSTOM`, 'gi'));
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);

        done();
    });

    it('should have rid ending with "000001"', async function (done) {
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req.rid).toMatch(/.*00001.?$/i);
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);

        done();
    });

    it('should have rid with default separators', async function (done) {
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req.rid).toMatch(/.*\/.*-.*?$/i);
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);

        done();
    });

    it('should have rid with "#" as prefix separator and "@" as sequence separator', async function (done) {
        const app = express();
        app.use(ruid({ prefixSeparator: '#', idSeparator: '@' }));
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req.rid).toMatch(/.*#.*@.*?$/i);
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);

        done();
    });

    it('should have response "request-id" header', async function (done) {
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            res.send('it works');
        });

        const res = await supertest(app).get('/').expect(200);
        expect(res.header).toHaveProperty('request-id');

        done();
    });

    it('should have custom response header "X-Request-Id"', async function (done) {
        const app = express();
        app.use(ruid({ header: 'X-Request-Id' }));
        app.get('/', function (req, res) {
            res.send('it works');
        });

        const res = await supertest(app).get('/');
        expect(res.header).toHaveProperty('x-request-id');

        done();
    });

    it('should not have response "request-id" header', async function (done) {
        const app = express();
        app.use(ruid({ setHeader: false }));
        app.get('/', function (req, res) {
            res.send('it works');
        });

        const res = await supertest(app).get('/').expect(200);
        expect(res.header).not.toHaveProperty('request-id');

        done();
    });
});

describe('request id in header, prefix reset', function () {

    it('should recive "request-id" header and req.rid === header value', async function (done) {
        const headerName = 'request-id';
        const headerValue = 'fake-request-id';
        const app = express();
        app.use(ruid());
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(req.headers).toHaveProperty(headerName);
            expect(req.header(headerName)).toBe(headerValue);
            expect(req.rid).exists;
            expect(req.rid).toBe(headerValue);
            res.send('it works');
        });

        await supertest(app).get('/').set(headerName, headerValue).expect(200);
        done();
    });

    it('should reset id prefix (idMax = 2)', async function (done) {
        const prefixUniquePart = (rid) => {
            return rid.substring(
                rid.lastIndexOf("/") + 1,
                rid.lastIndexOf("-")
            );
        }

        const app = express();
        const agent = supertest(app);
        app.use(ruid({ idMax: 2 }));
        app.get('/', function (req, res) {
            expect(req).exists;
            res.send('it works');
        });

        // first call --> rid: host/xxxxxxxxxx-1
        const res1 = await agent.get('/').expect(200);
        const rid1 = res1.header['request-id'];

        // second call --> rid: host/xxxxxxxxxx-2
        const res2 = await agent.get('/').expect(200);
        const rid2 = res2.header['request-id'];

        // third call, (maxId(=2) === seqId) => prefix reset so --> rid: host/yyyyyyyyy-1
        const res3 = await agent.get('/').expect(200);
        const rid3 = res3.header['request-id'];

        // expect "xxxxxxxxxx" === "xxxxxxxxxx"
        expect(prefixUniquePart(rid1)).toBe(prefixUniquePart(rid2));

        // expect "xxxxxxxxxx" !== "yyyyyyyyy"
        expect(prefixUniquePart(rid1)).not.toBe(prefixUniquePart(rid3));
        done();
    });

});



/////////////////////////

describe('request id in httpContext', function () {

    it('should have rid in httpContext', async function (done) {
        const app = express();
        const httpContext = require('express-http-context');
        app.use(httpContext.middleware);
        app.use(ruid({ setInContext: true }));
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(httpContext).exists;
            expect(httpContext.get('rid')).toBe(req.rid);
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);
        done();
    });

    it('should have rid with custom attribute name "requestId" in req and in httpContext', async function (done) {
        const app = express();
        const httpContext = require('express-http-context');
        app.use(httpContext.middleware);
        app.use(ruid({ attribute: 'requestId', setInContext: true }));
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(httpContext).exists;
            console.log('req.requestId: ' + req.requestId);
            console.log('in context: ' + httpContext.get("requestId"));
            expect(httpContext.get('requestId')).toBe(req.requestId);
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);
        done();
    });

    it('should not have request id in httpContext', async function (done) {
        const app = express();
        const httpContext = require('express-http-context');
        app.use(httpContext.middleware);
        app.use(ruid());
        app.get('/', function (req, res) {
            expect(req).exists;
            expect(httpContext.get('rid')).not.exists;
            res.send('it works');
        });

        await supertest(app).get('/').expect(200);
        done();
    });

});