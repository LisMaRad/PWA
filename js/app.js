const container = document.querySelector(".container")

function Meal() {
    this.name;
    this.category;
    this.country;
}

var selectedMeal = new Meal();

// Initialize deferredPrompt for use later to show browser install prompt.
var deferredPrompt;

async function findMeal () {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const jsonData = await response.json();
    if(jsonData){
        selectedMeal.name = jsonData.meals[0].strMeal;
        selectedMeal.country = jsonData.meals[0].strArea;
        selectedMeal.category = jsonData.meals[0].strCategory;
        document.getElementById("generatedMeal").innerHTML = `
<div>Name: ${selectedMeal.name}</div>
<div>Country: ${selectedMeal.country}</div>
<div>Category: ${selectedMeal.category}</div>
<button id="mealDataButton" onclick="addToList()">Add to list</button>`
    }
    else{
        document.getElementById("generatedMeal").innerHTML = `<div>Sorry something went wrong! Try again</div>`
    }
}
function addToList(){
    if(localStorage.getItem('meal')){
        const mealArray = JSON.parse(localStorage.getItem('meal'));
        mealArray.push({"name" : selectedMeal.name,"country": selectedMeal.country,"category" : selectedMeal.category});
        localStorage.setItem('meal', JSON.stringify(mealArray));
        showMeals();
    }
    else{
        localStorage.setItem('meal', JSON.stringify([{"name" : selectedMeal.name,"country": selectedMeal.country,"category" : selectedMeal.category}]));
        showMeals();
    }
}

const showMeals = () => {
    if(JSON.parse(localStorage.getItem('meal'))){
        let output = ""
        const mealArray = JSON.parse(localStorage.getItem('meal'));
        mealArray.forEach(
            ({name, country, category}) =>
                (output += `
              <div class="card">
                <h1 class="card--title">${name}</h1>
                <p>${country}</p>
                <p>${category}</p>
              </div>
              `)
        )
        container.innerHTML = output
    }

}
document.addEventListener("DOMContentLoaded", showMeals)

const shareButton = document.querySelector('#share');
const copyButton = document.querySelector('#copy');
const pasteButton = document.querySelector('#paste');
const installButton = document.querySelector('#install');
const notificationButton = document.querySelector('#notification');
const messageButton = document.querySelector('#message');

messageButton.addEventListener("click", function () {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.controller.postMessage({
            name: "Lisa",
            surname: "Rader",
            title: "Ich sende eine Nachricht",
        });
    }
});

window.addEventListener("beforeinstallprompt", function (e) {
    console.log("beforeinstallprompt Event fired");
    e.preventDefault();

    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    return false;
});

installButton.addEventListener("click", function () {
    if (deferredPrompt !== undefined) {
        // The user has had a positive interaction with our app and Chrome
        // has tried to prompt previously, so let's show the prompt.
        deferredPrompt.prompt();

        // Follow what the user has done with the prompt.
        deferredPrompt.userChoice.then(function (choiceResult) {
            console.log(choiceResult.outcome);

            if (choiceResult.outcome == "dismissed") {
                console.log("User cancelled home screen install");
            } else {
                console.log("User added to home screen");
            }

            // We no longer need the prompt.  Clear it up.
            deferredPrompt = null;
        });
    }
});

const share = async (title, text) => {
    const data = {
        files: [
            new File([localStorage.getItem('meal')], 'mealPlan.txt', {
                type: "text/plain",
            }),
        ],
        title: title,
        text: text,
    };
    try {
        if (navigator.share) {
            console.log('The native share feature is implemented');
            await navigator.share(data);
        } else {
            console.log('The native share feature is not implemented');
            throw new Error("Can't share data.", data);
        }

    } catch (err) {
        console.error(err.name, err.message);
    }
};

shareButton.style.display = 'block';
shareButton.addEventListener('click', async () => {
    return share('Meal plan', 'Some meal suggestions from all around the world');
});

const copy = async (blob) => {
        try {
            await navigator.clipboard.writeText(blob);
            console.log('saved content copied');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
};

copyButton.style.display = 'block';
copyButton.addEventListener('click', async () => {
    await copy(localStorage.getItem('meal'));
});

pasteButton.style.display = 'block';
pasteButton.addEventListener('click', async () => {{
        try {
            const text = await navigator.clipboard.readText();
            console.log('Pasted content: ', text);
            document.getElementById("pasteField").innerHTML = `<p>${text}</p><button id="close" onclick="closeField()">close</button>`;
            document.getElementById('pasteField').style.cssText = 'display: block';

        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }}
});

function closeField(){
    document.getElementById('pasteField').style.cssText = 'display: none';
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", function (event) {
        console.log(event.data);
    });
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}