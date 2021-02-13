'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKEDGE APP

// Data
const account1 = {
  owner: 'Thomas Nelson',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Emily Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Grant Adelson Clark',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sophia Madison',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
// The left container of movements
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// display = functions that calculate values for the display

const displayMovements = function (movements) {
  // Clear the movements container first
  containerMovements.textContent = '';

  // Construct an html structure to push into the container for each movement
  movements.forEach((movement, i) => {
    // If value is positive, type is withdrawal, otherwise it is a deposit
    const type = movement < 0 ? 'withdrawal' : 'deposit'; // Don't allow 0

    // Construct html to insert into the movements container on the front-end
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">3 days ago</div>
        <div class="movements__value">${movement}€</div>
      </div>
    `;
    // Insert the template string as HTML inside and at the beginning of the container
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
displayMovements(account1.movements);

// Function to calculate the balance
const calcDisplayBalance = (movements) => {
  const balance = movements.reduce((acc, movement) => acc + movement, 0);
  labelBalance.textContent = `${balance}€`;
};
calcPrintBalance(account1.movements);

const eurToUsd = 1.1; // Conversion rate EUR to USD
// Movements converted to USD from EUR
const movementsUSD = account1.movements.map((movement) => movement * eurToUsd);

// Function to create descriptions from movements
const movementDescriptions = account1.movements.map(
  (movement, i, arr) =>
    `Movement ${i + 1}: You ${
      movement > 0 ? 'deposited' : 'withdrew'
    } ${Math.abs(movement)}`
);

// Function to create usernames for each of the accounts
const createUsernames = (accounts) => {
  accounts.forEach((account) => {
    account.username = account.owner
      .toLowerCase() // return full name in lowercase
      .split(' ') // split name into words
      .map((name) => name[0]) // take only the first letter of each word
      .join(''); // join array of first letters into a string for the username
  });
};
createUsernames(accounts);

// Function to filter out withdrawals / deposits
const deposits = account1.movements.filter((movement) => movement > 0);
console.log(deposits);
const withdrawals = account1.movements.filter((movement) => movement < 0);
console.log(withdrawals);

// Function to reduce all movements to a total value
const balance = account1.movements.reduce(
  // Return the total of movements added to accumulator
  (acc, movement, i, arr) => acc + movement,
  0
);
console.log(balance);
