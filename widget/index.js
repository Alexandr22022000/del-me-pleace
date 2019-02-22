let safariFix;

class SafariFix {
    constructor (createWidget) {
        this.createWidget = createWidget;

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
        });
    }

    // add virtual redirect to links in body
    replaceLinks () {
        const links = document.getElementsByTagName('a');
        for (let key in links) {
            if (links[key].href) {
                links[key].onclick = (e) => {
                    this.redirect(e.target.href);
                    return false;
                };
            }
        }
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
    document.body.innerHTML += widgetHtml;

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

window.onload = () => {
    safariFix = new SafariFix(createWidget);    // for safari
    audioWork();
};