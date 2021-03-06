// Example of usage js
var s = function () {
    var oldOnload = window.onload;
    window.onload = () => {
        if (oldOnload) oldOnload();

        document.getElementById('say_js').onclick = function () {
            alert('Main');
        };
    };
}();

// Example of usage js with jquery
$('document').ready(function() {
    $('#say_jquery').on('click', () => {
        alert("Main");
    });
});