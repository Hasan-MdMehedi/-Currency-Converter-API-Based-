
const main_url = "https://api.exchangerate.host";
const dropdown = document.querySelectorAll(".dropdown select");
const mybutton = document.querySelector("form button");
const formcurrency = document.querySelector(".form select");
const tocurrency = document.querySelector(".to select");
const mass = document.querySelector(".mass");

const regionNames = typeof Intl !== "undefined" && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

for (let select of dropdown) {
    for (let codec in countryList) {
        let newoption = document.createElement("option");
        const regionCode = countryList[codec];
        const countryName = regionNames ? regionNames.of(regionCode) : regionCode;
        newoption.innerText = countryName ? `${countryName} (${codec})` : codec;
        newoption.value = codec;
        if (select.name === "from" && codec === "USD") {
            newoption.selected = "selected";
        } else if (select.name === "to" && codec === "BDT") {
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

const fetchAndUpdate = async () => {
    let amountInput = document.querySelector(".amount input");
    let amount_value = parseFloat(amountInput.value);
    if (isNaN(amount_value) || amount_value < 1) {
        amount_value = 1;
        amountInput.value = "1";
    }

    mass.innerText = "Loading...";

    //Provider 1: exchangerate.host
   const url1 = `${main_url}/convert?from=${encodeURIComponent(formcurrency.value)}&to=${encodeURIComponent(tocurrency.value)}&amount=${encodeURIComponent(amount_value)}`;
    console.log("Fetching (provider1):", url1);
    try {
        let response = await fetch(url1);
        let mydata = await response.json();
        console.log("provider1 response:", response.status, mydata);
        if (!response.ok || !mydata || typeof mydata.result !== "number") {
            throw new Error("Invalid response from provider1");
        }
        let rate = mydata.info && typeof mydata.info.rate === "number" ? mydata.info.rate : (mydata.result / amount_value);
        let finalamount = mydata.result;
        mass.innerText = `1 ${formcurrency.value} = ${rate} ${tocurrency.value} | ${amount_value} ${formcurrency.value} = ${finalamount} ${tocurrency.value}`;
        return;
    } catch (error1) {
        console.warn("Provider1 failed:", error1);
    }

    // Provider 2: open.er-api.com (no amount param; compute manually)
    const url2 = `https://open.er-api.com/v6/latest/${encodeURIComponent(formcurrency.value)}`;
    console.log("Fetching (provider2):", url2);
    try {
        let response = await fetch(url2);
        let mydata = await response.json();
        console.log("provider2 response:", response.status, mydata);
        if (!response.ok || !mydata || mydata.result !== "success" || !mydata.rates || typeof mydata.rates[tocurrency.value] !== "number") {
            throw new Error("Invalid response from provider2");
        }
        let rate = mydata.rates[tocurrency.value];
        let finalamount = rate * amount_value;
        mass.innerText = `1 ${formcurrency.value} = ${rate} ${tocurrency.value} | ${amount_value} ${formcurrency.value} = ${finalamount} ${tocurrency.value}`;
        return;
    } catch (error2) {
        console.error("Provider2 failed:", error2);
        mass.innerText = "Failed to fetch exchange rate from both providers.";
    }
}

mybutton.addEventListener("click", async (evt) => {
    evt.preventDefault();
    fetchAndUpdate();
});

formcurrency.addEventListener("change", fetchAndUpdate);
tocurrency.addEventListener("change", fetchAndUpdate);
document.querySelector(".amount input").addEventListener("input", fetchAndUpdate);
window.addEventListener("DOMContentLoaded", fetchAndUpdate);

