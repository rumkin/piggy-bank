async function origin({req, res}, next) {
    res.headers.set('access-control-allow-origin', '*');
    res.headers.set('access-control-allow-methods', 'DELETE,POST,PUT,GET');
    res.headers.set('access-control-allow-headers', 'content-type,authorization');

    if (req.method === 'options') {
        res.status(204);
        res.end();
        return;
    }

    return await next();
}

module.exports = origin;
