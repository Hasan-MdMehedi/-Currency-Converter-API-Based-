
const main_url = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@1/v1/currencies";
const dropdown = document.querySelectorAll(".dropdown select");
const mybutton = document.querySelector("form button");
const formcurrency = document.querySelector(".form select");
const tocurrency = document.querySelector(".to select");
const mass = document.querySelector(".mass");

for (let select of dropdown) {
    for (let codec in countryList) {
        let newoption = document.createElement("option");
        newoption.innerText = codec;
        newoption.value = codec;
        if (select.name === "from" && codec === "USD") {
            newoption.selected = "selected";
        } else if (select.name === "to" && codec === "BD") {
            newoption.selected = "selected";
        }
        select.append(newoption);
    }
    select.addEventListener("change", (evt) => {
        updateflag(evt.target);
    });
}

const updateflag = (element) => {
    let curcode = element.value;
    let countrycode = countryList[curcode];
    let newsrc = `https://flagsapi.com/${countrycode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    img.src = newsrc;
}

mybutton.addEventListener("click", async (evt) => {
    evt.preventDefault();
    let amount = document.querySelector(".amount input");
    let amount_value = amount.value;
    if (amount_value === "" || amount_value < 1) {
        amount_value = 1;
        amount.value = "1";
    }

    console.log(formcurrency, tocurrency);

    const url = `${main_url}/${formcurrency.value.toLowerCase()}.json`;
    try {
        let response = await fetch(url);
        let mydata = await response.json();
        let rate = mydata[formcurrency.value.toLowerCase()][tocurrency.value.toLowerCase()];  // Access nested object
        let finalamount = amount_value * rate;
        mass.innerText = `${amount_value} ${formcurrency.value} = ${finalamount} ${tocurrency.value}`;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
    }
});

