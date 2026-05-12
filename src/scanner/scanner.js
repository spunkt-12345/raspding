document.addEventlistener("DOMContentLoaded", () => {

    
    const scanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbos: 250 }
    )
    scanner.render(success)
    
    function success(decodeText, decodeResult) {
        alert("!!!" + decodeText, decodeResult)
    }
})