// Get DOM elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');
const swapButton = document.getElementById('swap-button');
const resultLabel = document.getElementById('result-label');
const resultAmount = document.getElementById('result-amount');
const exchangeRate = document.getElementById('exchange-rate');
const loadingSpinner = document.getElementById('loading-spinner');
const resultContent = document.getElementById('result-content');

const API_URL = 'https://api.frankfurter.app';
const FLAG_API_BASE = 'https://www.countryflags.io/';

// --- Functions ---

/**
 * Fetches currencies and populates the dropdowns.
 */
async function populateCurrencies() {
    try {
        const response = await fetch(`${API_URL}/currencies`);
        const currencies = await response.json();

        for (const currency in currencies) {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = `${currency} - ${currencies[currency]}`;

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = `${currency} - ${currencies[currency]}`;

            fromCurrencySelect.appendChild(option1);
            toCurrencySelect.appendChild(option2);
        }

        // Set default values
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';
        updateFlags();
        convertCurrency();
    } catch (error) {
        console.error('Error fetching currencies:', error);
        resultContent.innerHTML = '<p>Could not load currencies.</p>';
    }
}

/**
 * Updates the flag images based on the selected currencies.
 */
function updateFlags() {
    const fromCountryCode = fromCurrencySelect.value.substring(0, 2).toLowerCase();
    const toCountryCode = toCurrencySelect.value.substring(0, 2).toLowerCase();
    
    fromFlag.src = `${FLAG_API_BASE}/${fromCountryCode}/shiny/64.png`;
    toFlag.src = `${FLAG_API_BASE}/${toCountryCode}/shiny/64.png`;
}

/**
 * Fetches the exchange rate and updates the UI.
 */
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (isNaN(amount) || amount <= 0) {
        // Reset result if amount is invalid
        resultAmount.textContent = '-';
        exchangeRate.textContent = '-';
        return;
    }

    // Show loading state
    loadingSpinner.style.display = 'block';
    resultContent.style.display = 'none';

    if (fromCurrency === toCurrency) {
        resultAmount.textContent = amount.toFixed(2) + ` ${toCurrency}`;
        exchangeRate.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
        loadingSpinner.style.display = 'none';
        resultContent.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
        const data = await response.json();
        
        const convertedAmount = data.rates[toCurrency];
        const singleUnitRate = (convertedAmount / amount).toFixed(4);

        resultLabel.textContent = `${amount} ${fromCurrency} is equal to`;
        resultAmount.textContent = `${convertedAmount.toFixed(2)} ${toCurrency}`;
        exchangeRate.textContent = `1 ${fromCurrency} = ${singleUnitRate} ${toCurrency}`;

    } catch (error) {
        console.error('Error during conversion:', error);
        resultContent.innerHTML = '<p>Conversion failed. Please try again.</p>';
    } finally {
        // Hide loading state
        loadingSpinner.style.display = 'none';
        resultContent.style.display = 'block';
    }
}

/**
 * Swaps the 'from' and 'to' currencies.
 */
function swapCurrencies() {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;

    updateFlags();
    convertCurrency();
}

// --- Event Listeners ---

amountInput.addEventListener('input', convertCurrency);
fromCurrencySelect.addEventListener('change', () => {
    updateFlags();
    convertCurrency();
});
toCurrencySelect.addEventListener('change', () => {
    updateFlags();
    convertCurrency();
});
swapButton.addEventListener('click', swapCurrencies);

// --- Initial Load ---

document.addEventListener('DOMContentLoaded', populateCurrencies);