/*!
 * express-ruid
 * Express.js request id middleware
 *
 * Copyright(c) 2020 Luca Stasio <joshuagame@gmail.com>, IT Resources s.r.l. <http://www.itresources.it>
 *
 * Use of this source code is governed by a MIT license.
 * You can find the MIT license terms for this source code in the LICENSE file.
 *
 * lib/express-ruid.js
 */

const crypto = require('crypto');
const httpContext = require('express-http-context');
const hostname = require('os').hostname();
const pid = process.pid;

module.exports = ({
    setHeader = true,
    header = 'request-id',
    attribute = 'rid',
    setInContext = false,
    prefixRoot = `${pid}@${hostname}`,
    prefixSeparator = '/',
    upBytes = 12,
    idSeparator = '-',
    idMax = Number.MAX_SAFE_INTEGER,
} = {}) => {
    const rp = { seqId: 0, prefixUnique: '', idPadLen: idMax.toString().length };

    const generatePrefixRoot = () => {
        return typeof prefixRoot === 'function' ? prefixRoot() : prefixRoot;
    }

    const generateId = () => {
        // reset prefix unique part if we reach the max (super-worst case!!!)
        if (rp.seqId === idMax || rp.seqId === 0) {
            rp.seqId = 0;
            const buf = crypto.randomBytes(upBytes);
            rp.prefixUnique = buf.toString('hex');
        }
        rp.seqId = rp.seqId + 1;
        const id = rp.seqId.toString().padStart(rp.idPadLen, '0');
        return `${generatePrefixRoot()}${prefixSeparator}${rp.prefixUnique}${idSeparator}${id}`;
    }

    return (req, res, next) => {
        req[attribute] = req.headers[header.toLowerCase()] || generateId();
        if (setInContext) httpContext.set(attribute, req[attribute]);
        if (setHeader) res.setHeader(header, req[attribute]);
        next();
    }
}