const normalRate = document.querySelector('.btn.normal'); // Fix the selector
const pppRate = document.querySelector('.btn.ppp'); // Fix the selector
const dropList = document.querySelectorAll('.drop-list select');
const fromCurrency = document.querySelector('.from select');
const toCurrency = document.querySelector('.to select');
const getButton = document.querySelector('form button');
const exchangeRateTxt = document.querySelector('.exchange-rate');
const amount = document.querySelector('.amount input');

let amountVal = 1; // Default value

// Set up the dropdowns with currencies
for (let i = 0; i < dropList.length; i++) {
  for (currency_code in country_code) {
    let selected = (i === 0 && currency_code === 'USD') || (i === 1 && currency_code === 'NGN') ? 'selected' : '';
    let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
    dropList[i].insertAdjacentHTML('beforeend', optionTag);
  }
  dropList[i].addEventListener('change', e => loadFlag(e.target));
}

function loadFlag(element) {
  for (code in country_code) {
    if (code === element.value) {
      let imgTag = element.parentElement.querySelector('img');
      imgTag.src = `https://flagsapi.com/${country_code[code]}/flat/64.png`;
    }
  }
}

function setUp() {
  amountVal = amount.value || 1;
  exchangeRateTxt.innerText = 'Getting rate...';
}

function useExchangeRate() {
  setUp();

  let url = `https://v6.exchangerate-api.com/v6/c0e47268524d473b2a3e7a76/latest/${fromCurrency.value}`;
  fetch(url)
    .then(response => response.json())
    .then(result => {
      let exchangeRate = result.conversion_rates[toCurrency.value];
      let totalExchangeRate = (amountVal * exchangeRate).toFixed(2);
      exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExchangeRate} ${toCurrency.value}`;
    })
    .catch(() => {
      exchangeRateTxt.innerText = 'Something went wrong';
    });
}

async function usePPPRate() {
  setUp(); // Set up initial state

  const baseUrl = "https://api.worldbank.org/v2/country";
  const indicator = "PA.NUS.PPP";
  const year = 2023 // new Date().getFullYear(); - This is the correct code as it gives the current year.
  const format = "json";
  const fromCountry = countryCode[fromCurrency.value];
  const toCountry = countryCode[toCurrency.value];

  try {
    // Fetch PPP data for 'fromCurrency'
    const fromResponse = await fetch(
      `${baseUrl}/${fromCountry}/indicator/${indicator}?date=${year}&format=${format}`
    );
    const fromData = await fromResponse.json();
    if (!fromData[1]) throw new Error(`No PPP data found for ${fromCurrency.value}`);
    const fromPPP = fromData[1][0].value;

    // Fetch PPP data for 'toCurrency'
    const toResponse = await fetch(
      `${baseUrl}/${toCountry}/indicator/${indicator}?date=${year}&format=${format}`
    );
    const toData = await toResponse.json();
    if (!toData[1]) throw new Error(`No PPP data found for ${toCurrency.value}`);
    const toPPP = toData[1][0].value;

    // Convert the price
    let pppRate = ((amountVal / fromPPP) * toPPP).toFixed(2);

    exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${pppRate} ${toCurrency.value}`;
  } catch (error) {
    exchangeRateTxt.innerText = error.message || "Something went wrong";
  }
}



// Event listeners for buttons
normalRate.addEventListener('click', useExchangeRate);
pppRate.addEventListener('click', usePPPRate);

// Exchange icon click
const exchangeIcon = document.querySelector('.drop-list .icon');
exchangeIcon.addEventListener('click', () => {
  [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
  loadFlag(fromCurrency);
  loadFlag(toCurrency);
});


// Get Exchange Rate on load

window.onload = () => {
  useExchangeRate();
};