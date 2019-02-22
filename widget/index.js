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

const widgetHtml = `
        <div id="widget" style="border: black 1px solid; width: 300px">
            <h1>VoiceSell widget:</h1>
            <button id="home-button">Go home</button>
            <button id="search-button">Go search</button>
            <h3 id="sound"></h3>
        </div>
    `;

const addCallbacks = () => {
    const buttons = [
        {id: 'home-button', page: '/'},
        {id: 'search-button', page: '/search'},
    ];

    buttons.map(button => {
        document.getElementById(button.id).onclick = () => {
            redirect(button.page);
        };
    });
};

const replaceLinks = () => {
    const links = document.getElementsByTagName('a');
    for (let key in links) {
        if (links[key].href) {
            links[key].onclick = (e) => {
                redirect(e.target.href);
                return false;
            };
        }
    }
};

const getTagContent = (tag, html) => {
    let start = html.indexOf('<' + tag) + 1;
    start = html.indexOf('>', start) + 1;
    let end = html.lastIndexOf(`</${tag}>`);
    return html.substring(start, end);
};

const redirect = (page) => {
    $.ajax({
        url: page,
    }).done((data) => {
        document.body.innerHTML = getTagContent('body', data);
        document.head.innerHTML = getTagContent('head', data);
        window.history.pushState(null, null, page);
        document.body.innerHTML += widgetHtml;
        addCallbacks();
        replaceLinks();
    });
};

window.onload = () => {
    document.body.innerHTML += widgetHtml;
    addCallbacks();
    replaceLinks();
    audioWork();
};