const express = require('express'),
    fs = require('fs'),
    path = require('path'),

    app = express(),
    appWidget = express();

app.set('port', 4000);
appWidget.set('port', 3000);

app.use(express.static('public'));
appWidget.use(express.static('widget'));

app.get('/*', (req, res) => {
    const stream = fs.createReadStream(path.resolve('public/index.html'));
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    stream.pipe(res);
});

app.listen(app.get('port'), () => console.log('Site server is started on port ' + app.get('port')));
appWidget.listen(appWidget.get('port'), () => console.log('Widget server is started on port ' + appWidget.get('port')));