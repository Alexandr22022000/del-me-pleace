let safariFix;

class SafariFix {
    constructor (createWidget) {
        this.createWidget = createWidget;
        this.notUpdateScripts = ['http://localhost:3000/index.js', 'jquery.min.js'];

        this.createWidget();
        this.replaceLinks();
    }

    // virtual redirect
    redirect (page) {
        document.body.innerHTML = '<h1>Loading...</h1>';
        this.createWidget();

        $.ajax({
            url: page,
        }).done((data) => {
            document.body.innerHTML = SafariFix.getTagContent('body', data);
            document.head.innerHTML = SafariFix.getTagContent('head', data);
            window.history.pushState(null, null, page);
            this.createWidget();
            this.replaceLinks();
            this.loadScripts();
        });
    }

    // add virtual redirect to links in body
    replaceLinks () {
        const links = document.getElementsByTagName('a');
        for (let key in links) {
            if (links[key].href && (links[key].href.substring(0, 4) !== 'http' || links[key].href.indexOf(document.location.host) !== -1)) {
                links[key].onclick = (e) => {
                    this.redirect(e.target.href);
                    return false;
                };
            }
        }
    }

    //load and run scripts
    loadScripts () {
        let scripts = document.getElementsByTagName('script'),
            notUpdateScripts = this.notUpdateScripts;

        scripts = Array.from(scripts);

        scripts = scripts.filter(script => {
            let ok = true;
            notUpdateScripts.forEach(notUpdate => {
                if (script.src && script.src.indexOf(notUpdate) !== -1) ok = false;
            });
            return ok;
        });

        let scriptsSrc = scripts.filter(script => script.src),
            scriptsCode = scripts.filter(script => script.innerHTML);

        scriptsSrc = scriptsSrc.map(script => script.src);
        scriptsCode = scriptsCode.map(script => script.innerHTML);

        scriptsCode.forEach((code) => {
            let script = document.createElement('script');
            script.innerHTML = code;
            script.async = false;
            document.head.appendChild(script);
        });

        let i = 0;
        const onloadScript = () => {
            i++;
            if (i === scriptsSrc.length)
                window.onload();
        };

        scriptsSrc.forEach((src) => {
            let script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.onload = onloadScript;
            document.head.appendChild(script);
        });
    }

    static getTagContent (tag, html) {
        let start = html.indexOf('<' + tag) + 1;
        start = html.indexOf('>', start) + 1;
        let end = html.lastIndexOf(`</${tag}>`);
        return html.substring(start, end);
    }
}

// for testing audio api
const audioWork = () => {
    navigator.getUserMedia(
        { audio: true },
        function (stream) {
            var AudioContext = window.AudioContext || window.webkitAudioContext;
            var ctx = new AudioContext();

            var source = ctx.createMediaStreamSource(stream);
            var analyser = ctx.createAnalyser();
            var processor = ctx.createScriptProcessor(2048, 1, 1);

            source.connect(analyser);
            source.connect(processor);
            analyser.connect(ctx.destination);
            processor.connect(ctx.destination);

            analyser.fftSize = 128;

            var data = new Uint8Array(analyser.frequencyBinCount);
            processor.onaudioprocess = function (){
                analyser.getByteFrequencyData(data);
                document.getElementById('sound').innerText = "Sound: " + data;
            }
        },
        function (error) {
            console.log(error);
        }
    );
};

// create widget interface
const createWidget = () => {
    const widgetHtml = `
        <div id="widget" style="border: black 1px solid; width: 500px; position: absolute; top: 300px">
            <h1>VoiceSell widget:</h1>
            <button id="home-button">Go home</button>
            <button id="search-button">Go search</button>
            <button id="checkout-button">Go checkout</button>
            <button id="about-button">Go about</button>
            <h3 id="sound"></h3>
        </div>
    `;

    let widget = document.createElement('div');
    widget.innerHTML = widgetHtml;
    document.body.appendChild(widget);

    const buttons = {
        'home-button': '/',
        'search-button': '/search',
        'checkout-button': '/checkout',
        'about-button': '/about',
    };

    for (let key in buttons) {
        document.getElementById(key).onclick = () => {
            safariFix.redirect(buttons[key]);       // for safari
            //window.location.href = buttons[key];  // for other browsers
        };
    }
};

var s = function () {
    var oldOnload = window.onload,
        isLoaded = false;
    window.onload = () => {
        if (!isLoaded) {
            safariFix = new SafariFix(createWidget);    // for safari
            audioWork();
            isLoaded = true;
        }

        if (oldOnload) oldOnload();
    };
}();