const container = document.querySelector(".container")

function Meal() {
    this.name;
    this.category;
    this.country;
}

var selectedMeal = new Meal();

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

const share = async (title, text) => {
    console.log(localStorage.getItem('meal'));
    const data = {
        files: [
            new File(localStorage.getItem('meal'), 'mealPlan.txt', {
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

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}