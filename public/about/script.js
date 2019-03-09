var s = function () {
    var oldOnload = window.onload;
    window.onload = () => {
        if (oldOnload) oldOnload();

        document.getElementById('say').onclick = function () {
            alert('About');
        };
    };
}();