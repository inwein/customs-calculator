// Global variables imitating state for the whole page
// STATE STATE STATE
let currencyData = [];
let engineType = 'petrol';
let capacity = 0;
let yearIndex = 1;
let carPrice = 0;
let currencyName = 'USD';
let importer = 'person';
let eur1 = 'false';
let priceUah = 0;
let customsPayments = 0;
let usdRate = 0;
let countryBought = 'usa';
let cityServicing = 'odessa';
let brokerData = [];
let terminalChargesData = [];
let sertificationData = '';
let registrationData;
// STATE STATE STATE 

// Getting Year Manufactured
let yearList = [];
let thisYear = new Date().getFullYear();
for (let i = 0; i <= 16; i++) {
    let yearText = thisYear - i;
    let yearValue = i - 1
    if (yearText >= thisYear - 2) { yearValue = 1 }
    if (yearText === 2004) { yearText = 'Старше' }
    yearList.push({text: yearText + '', value: yearValue})
}
const options = yearList.map((item, index) => `<option 
value=${item.value} key=${item.value+index}>${item.text}</option>`)
const yearManufactured = document.querySelector('.year-manufactured');
const select = yearManufactured.querySelector('select');
select.innerHTML = options;
// Fetching data about currency rates
const fetchData = async () => { 
    try {
        const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json?');
        const result = await response.json();
        let filteredData = result.filter(item => item.r030 === 840 || item.r030 === 978 ||
        item.r030 === 985 || item.r030 === 784 || item.r030 === 975)
        currencyData = filteredData    
    } catch (error) {
        console.log(error)
    }
}
fetchData()

// Change listener for ENGINE TYPE field
const changeEngineType = event => {
    const engine = event.target.value
    engineType = engine   
    const metric = document.querySelector('#engineMetric')
    const input = document.querySelector('#capacity').firstElementChild
    if (engine === 'electro') {
        metric.innerHTML = 'кВт'
        input.value = ''
        input.setAttribute('placeholder', '30')
    } else {
        metric.innerHTML = 'куб.см.'
        input.setAttribute('placeholder', '1998')
    }
}
const engineTypeForm = document.querySelector('#engine-type');
engineTypeForm.addEventListener('change', changeEngineType)

// Change listener for ENGINE CAPACITY field
const changeEngineCapacity = event => { capacity = event.target.value }
const capacityForm = document.querySelector('#capacity')
capacityForm.addEventListener('change', changeEngineCapacity)

// Change listener for CAR YEAR MANUFACTURED field 
const changeManufacturedYear = event => { yearIndex = event.target.value }
const yearForm = document.querySelector('#year')
yearForm.addEventListener('change' , changeManufacturedYear)

// Change listener for CAR PRICE field
const changeCarPrice = event => { carPrice = event.target.value }
const carPriceForm = document.querySelector('#price')
carPriceForm.addEventListener('change', changeCarPrice);

// Change listener for CURRENCY field
const changeCurrency = event => { currencyName = event.target.value }
const currencyField = document.querySelector('#currency')
currencyField.addEventListener('change', changeCurrency)

// Change listener for IMPORTER field and toggle Eur-One
const changeImporter = event => {
    importer = event.target.value
    const eurBlock = document.querySelector('.eur-one')
    if (event.target.value === 'company') { 
        eurBlock.hidden = false
    } else { 
        eurBlock.hidden = true 
        eur1 = 'false'
    }
}
const importerForm = document.querySelector('#importer');
importerForm.addEventListener('change', changeImporter)

// Change listener for EUR1 field
const changeEurOne = event => {eur1 = event.target.value}
const eurOne = document.querySelector('.eur-one')
eurOne.addEventListener('change', changeEurOne)

// Function that counts payments and creates the table
// Helper
const checkEngineType = (type, capacity, eur) => {
    let ratio = 0
    if (type === 'petrol' && capacity <= 3000) {
        ratio = 50;
    }
    if (type === 'petrol' && capacity > 3000) {
        ratio = 100;
    }
    if (type === 'diesel' && capacity <= 3500) {
        ratio = 75;
    }
    if (type === 'diesel' && capacity > 3500) {
        ratio = 150;
    }
    if (type === 'electro') {
        ratio = 1;
    }
    if (type === 'hybrid' && capacity <= 3000) {
        ratio = 50;
    }
    if (type === 'hybrid' && capacity > 3000) {
        ratio = 100;
    }
    return ratio*eur
}
// Helper
const checkCurrencies = (name, data) => {
    return data.filter(item => item.cc === name)[0].rate
}

// Core function 
const calculateAll = () => {
    if (capacity !== 0 && carPrice !== 0) {
    const eur = currencyData.filter(item => item.r030 === 978)[0].rate;
    const usd = currencyData.filter(item => item.r030 === 840)[0].rate;
    const engineRatio = checkEngineType(engineType, capacity, eur);
    let yearForExcise = engineType === 'electro' ? 1 : yearIndex
    const exciseRatioMetric = (engineRatio/eur)*yearForExcise;
    const excise = engineType === 'electro' ? Math.ceil(engineRatio*capacity) : Math.ceil((engineRatio*(capacity / 1000)*yearIndex));
    const exciseEngineMetric = engineType === 'electro' ? ' кВт' : ' куб.см.'
    const rate = checkCurrencies(currencyName, currencyData);
        const tollBasis = Math.round(((carPrice * rate)*100)/100);
        let tollrate = 0.1;
        if (eur1 === 'true') { tollrate = 0.055} else {tollrate = 0.1};
        if (engineType === 'electro') { tollrate = 0};
        const toll = Math.round(((tollBasis * tollrate)*100)/100)
    const vatBasis = Math.round(((tollBasis + toll + excise)*100)/100);
    const vatRate = engineType === 'electro' ? 0 : 0.2
    const vat = Math.round(((vatBasis * vatRate)*100)/100);
    const total = toll + excise + vat;
        // set Results for Calculation Table
        priceUah = tollBasis;
        customsPayments = total;
        usdRate = usd;
        
        document.querySelector('#currentRateCheck').innerHTML = '1 ' + currencyName +  ' = ' +  rate + ' грн'
        
        document.querySelector('#tollRow2').innerHTML = tollBasis + ' грн'
        document.querySelector('#tollRow3').innerHTML = (tollrate*100) + ' %'
        document.querySelector('#tollRow4').innerHTML = toll + ' грн'

        document.querySelector('#exciseRow2').innerHTML = capacity + exciseEngineMetric
        document.querySelector('#exciseRow3').innerHTML = exciseRatioMetric + ' EUR'
        document.querySelector('#exciseRow4').innerHTML = excise + ' грн'

        document.querySelector('#vatRow2').innerHTML = vatBasis + ' грн'
        document.querySelector('#vatRow3').innerHTML = (vatRate*100) + ' %'
        document.querySelector('#vatRow4').innerHTML = vat + ' грн'

        document.querySelector('#totalRow2').innerHTML = total + ' грн'
        document.querySelector('#totalInCurrency').innerHTML = ' составляют: ' + Math.ceil(total / rate) + ' ' +  currencyName
    }
}

// Event listener for COUNT CUSTOMS button
const countCustomsButton = document.querySelector('#countCustomsButton')
const countAll = () => {
    calculateAll()
}
countCustomsButton.addEventListener('click', countAll)

// Change listener for COUNTRY BOUGHT form
const changeCountry = event => countryBought = event.target.value
const countryForm = document.querySelector('#countryBought')
countryForm.addEventListener('change', changeCountry)

// Change listener for CITY SERVICING form
const changeCity = event => cityServicing = event.target.value
const cityForm = document.querySelector('#cityServicing')
cityForm.addEventListener('change', changeCity)

// function for calculating broker
function brokerCalc (country, city) {
    let name = 'Услуги брокера ';
    let price;
    let val = 'uah';
    if (country === 'usa') {
        price = '700 USD'
        name = 'Услуги брокера и экспедитора'
        val = 'usd'
    }
    if (country === 'georgia' && city === 'odessa') {
        price = '7000 грн'
        name = 'Услуги брокера '
    }
    if (country === 'georgia' && city === 'zaporozhye') {
        price = '4000 грн'
        name = 'Услуги брокера '
    }
    if (country === 'europe' && city === 'odessa') {
        price = '7000 грн'
        name = 'Услуги брокера '
    }
    if (country === 'europe' && city === 'zaporozhye') {
        price = '4000 грн'
        name = 'Услуги брокера '
    }
    if (country === 'emirates') {
        price = '700 USD'
        name = 'Услуги брокера и экспедитора '
        val = 'usd'
    }
    let holder = [name, price, val]
    return holder;
}

// function to calculate the terminal charges
function terminalCalc (country, city) {
    let name = 'Терминальные расходы'
    let price;
    let val = 'uah';

    if (country === 'usa') {
        price = '30 USD'
        name = 'Стоянка в порту '
        val = 'usd'
    }
    if (country === 'georgia' && city === 'odessa') {
        price = '600 грн'
        name = 'Въезд на терминал '
    }
    if (country === 'georgia' && city === 'zaporozhye') {
        price = '600 грн'
        name = 'Въезд на терминал '
    }
    if (country === 'europe' && city === 'odessa') {
        price = '600 грн'
        name = 'Въезд на терминал '
    }
    if (country === 'europe' && city === 'zaporozhye') {
        price = '600 грн'
        name = 'Въезд на терминал '
    }
    if (country === 'emirates') {
        price = '30 USD'
        name = 'Стоянка в порту '
        val = 'usd'
    }
    let holder = [name, price, val]
    return holder;
}

// function to calculate sertification charges
function sertificationCalc (country) {
    let price;
    if (country === 'usa' || country === 'georgia') {
        price = '6500 грн'
    }
    if (country === 'europe') {
        price = '3000 грн'
    }
    if (country === 'emirates') {
        price = '7000 грн'
    }
    return price
}

// calculation of registration fees
function registrationCalc (price) {
    let pf;
    let total ;
    if (price <= 346830) {
        pf = price * 0.03
    }
    if (price > 346830 && price < 609580 ) {
        pf = price * 0.04
    }
    if (price > 609850) {
        pf = price * 0.05
    }

    if (pf !== 0) {
        total = Math.ceil(pf + 900) + ' грн'
    }
    return total
}

// Calculation of total cost of import 

const finalCalculation =  (customs, broker, terminal, sertificate, register, usd) => {

    let customsNumber = parseInt(customs)
    let brokerNumber = parseInt(broker[1])
    let terminalNumber = parseInt(terminal[1])
    let sertificateNumber = parseInt(sertificate)
    let registerNumber = parseInt(register);

    if (broker[2] === 'usd') {
        brokerNumber = brokerNumber * usd
    }
    if (terminal[2] === 'usd') {
        terminalNumber = terminalNumber * usd 
    }

    const uahTotal = Math.ceil(customsNumber + brokerNumber + terminalNumber + sertificateNumber + registerNumber) 
    const usdTotal = Math.ceil(uahTotal / usd)
    
    const result = [uahTotal + ' грн', usdTotal + ' USD']
    return result
}


// Event listener for COUNT ADDITIONAL OPTIONS button 
const calculateAdditional = () => {
    if (carPrice !== 0) {
    const brokerBox = document.querySelector('#broker');
    const terminalBox = document.querySelector('#terminal');
    const sertificationBox = document.querySelector('#sertification');
    const registrationBox = document.querySelector('#registration');
    const totalCostUahBox = document.querySelector('#totalCostUah');
    const totalCostUsdBox = document.querySelector('#totalCostUsd');
    const whatIncluded = document.querySelector('#whatIncluded');

    brokerData = brokerCalc(countryBought, cityServicing)
    brokerBox.firstElementChild.innerHTML = brokerData[1]
    brokerBox.lastElementChild.innerHTML = brokerData[0]

    terminalChargesData = terminalCalc(countryBought, cityServicing)
    terminalBox.firstElementChild.innerHTML = terminalChargesData[1]
    terminalBox.lastElementChild.innerHTML = terminalChargesData[0]

    sertificationData = sertificationCalc(countryBought)
    sertificationBox.firstElementChild.innerHTML = sertificationData;

    registrationData = registrationCalc(priceUah)
    registrationBox.firstElementChild.innerHTML = registrationData;

    const totalCost = finalCalculation(customsPayments, brokerData, terminalChargesData, sertificationData, 
    registrationData, usdRate)
    totalCostUahBox.innerHTML = totalCost[0];
    totalCostUsdBox.innerHTML = totalCost[1];

    whatIncluded.innerHTML = 'В эту стоимость включены таможенные платежи, ' + brokerData[0].toLowerCase() + 
    ', ' + terminalChargesData[0].toLowerCase() + ', ' + 
    'сертификация авто, постановка на учет с оплатой сбора за первую регистрацию в Пенсионный Фонд.' 
    }
}
const calcAdditionalButton = document.querySelector('#countAdditionalOptions')
calcAdditionalButton.addEventListener('click', calculateAdditional)

// Mobile menu toggler 
const mobileMenuDiv = document.querySelector('.mobile-menu')
const toggleIcon = event => {
    const i = event.target.closest('i');
    const drawer = document.querySelector('.mobile-menu-drawer')
    
    if (i!== null && i.classList[1] === 'fa-times') {
        i.classList.remove('fa-times')
        i.classList.add('fa-bars')
        drawer.style.left = '-500px'
    } else if (i!== null && i.classList[1] === 'fa-bars') {
        i.classList.remove('fa-bars')
        i.classList.add('fa-times')
        drawer.style.left = '0px'
    }

}
mobileMenuDiv.addEventListener('click' , toggleIcon)