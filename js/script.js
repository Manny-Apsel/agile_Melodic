//reset results
function reset() {
    document.getElementById("idOriginal").innerHTML = "";
    document.getElementById("idTranslated").innerHTML = "";
    var strong1 = document.createElement("strong");
    var text1 = document.createTextNode("Original Text");
    var strong2 = document.createElement("strong");
    var text2 = document.createTextNode("Translated Text");
    strong1.append(text1);
    strong2.append(text2);
    document.getElementById("idOriginal").appendChild(strong1);
    document.getElementById("idTranslated").appendChild(strong2);
}

//error message
function errorMsg(msg) {
    alert(msg);
    document.querySelector("input[type='button']").disabled = false;
}

//async functie to pick up json data
async function fetchTranslateText(text, translatedLanguageCode) {
    let response = await fetch(`https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20190917T143143Z.c1229abdc907b884.5520b5430c18e7eb1926dd0166c1bd73473c23f0&text=${text}&lang=${translatedLanguageCode}`);
    return response.json();
}

//process text and return translated text
function returnText(data) {
    let text = data.text[0];
    if (text === "|") {
        document.getElementById("idTranslated").appendChild(document.createElement("br"));
    } else {
        let paragraph = document.createElement("p");
        paragraph.innerHTML = text;
        document.getElementById("idTranslated").appendChild(paragraph);
    }
}

//fetch search song
function getData(artist, song, countryCodeTranslation) {
    // /\s/g is a regular expression covering all white space
    // the white space is replaced to %2520 because the api weblink doesn't recognize
    // white space; this is needed because some songs & artists have 2 or more words
    try {
        artist = artist.replace(/\s/g, "%2520");
        song = song.replace(/\s/g, "%2520");

        if (artist === "" || song === "") throw "please fill in the form";

    } catch (e) {
        errorMsg(e)
    }


    let url = `https://api-gateway-becode.herokuapp.com/?goto=http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect%3Fartist%3D${artist}%26song%3D${song}`;

    fetch(url, {
        "method": "GET",
    })
        .then(response => {
            return response.text();
        })

        .then(async function (data) {
            document.querySelector("input[type='button']").disabled = true;

            let parser = new DOMParser(),
                xmlDoc = parser.parseFromString(data, 'text/xml');

            let text = xmlDoc.getElementsByTagName('Lyric')[0].innerHTML;
            try {
                if (text === "") throw "no data/lyrics found";
            }
            catch (e) {
                errorMsg(e);
            }

            let textArray = text.split("\n");

            for (let i = 0; i < textArray.length; i++) {
                if (textArray[i] === "") {
                    document.getElementById("idOriginal").appendChild(document.createElement("br"));
                } else {
                    let paragraph = document.createElement("p");
                    paragraph.innerHTML = textArray[i];
                    document.getElementById("idOriginal").appendChild(paragraph);
                }
            }


            for (let i = 0; i < textArray.length; i++) {
                if (textArray[i] === "") {
                    textArray[i] = "|"
                }
                await fetchTranslateText(textArray[i], countryCodeTranslation)
                    .then(function (data) {
                        returnText(data);
                        if (i === textArray.length - 1) {
                            document.querySelector("input[type='button']").disabled = false;
                        }
                    })
                    .catch(err => {
                        errorMsg("You cannot translate to this language");
                    })
            }

        })

        .catch(err => {
            errorMsg("no data found");
            document.querySelector("input[type='button']").disabled = false;
        });
}

function scrollFunction() {
    let mybutton = document.getElementById("myBtn");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

window.onscroll = function () {
    scrollFunction()
};

document.getElementById("idSearchButton").addEventListener("click", async function () {
    let song = document.getElementById("idSearchBar").value;
    let artist = document.getElementById("artist").value;
    let countryCode = document.getElementById("idLanguageCode").value;
    await reset();
    getData(artist, song, countryCode);
});