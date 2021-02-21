'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKEDGE APP

// Data
const account1 = {
  owner: 'Thomas Nelson',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-02-17T23:36:17.929Z',
    '2021-02-20T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Emily Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const accounts = [account1, account2];

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

// STATE
// GLOBAL DATA
let currentAccount;
/* let currentAccount = account1;
inputLoginUsername.value = 'tn';
inputLoginPin.value = 1111; */

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// DISPLAY FUNCTIONS

const internationalizeCurrency = (value, locale, options) =>
  new Intl.NumberFormat(locale, options).format(value.toFixed(2));

// CALCULATE DATE //
const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  };

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  if (daysPassed > 7) return new Intl.DateTimeFormat(locale).format(date);
};

// DISPLAY ALL MOVEMENTS //
const displayMovements = function (
  { movements, movementsDates: dates, locale, currency },
  sort = false
) {
  // Clear the movements container first
  containerMovements.textContent = '';

  // Sort if sort parameter is true, otherwise display as normal
  const movs = sort
    ? currentAccount.movements.slice().sort((a, b) => a - b)
    : movements;

  // Construct an html structure to push into the container for each movement
  movs.forEach((movement, i) => {
    // Date string
    const date = new Date(dates[i]);
    const displayDate = formatMovementDate(date, locale);

    const options = {
      style: 'currency',
      currency: currency,
    };
    // Value of amount moved, internationalized
    const value = internationalizeCurrency(movement, locale, options);

    // If value is positive, type is withdrawal, otherwise it is a deposit
    const type = movement < 0 ? 'withdrawal' : 'deposit'; // Don't allow 0

    // Construct html to insert into the movements container on the front-end
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${value}</div>
      </div>
    `;
    // Insert the template string as HTML inside and at the beginning of the container
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// CALCULATE TOTAL BALANCE //
const calcDisplayBalance = (account) => {
  // Setting the agruments balance to the reduced value total, but it updates it on the global scale because objects are passed by sharing (value is reference), so it will update in the heap and all references pointing to that will now have the new value
  // Generate a balance key with value of all movements reduced into 1 value
  account.balance = account.movements.reduce(
    (acc, movement) => acc + movement,
    0
  );
  // Balance number options
  const options = {
    style: 'currency',
    currency: account.currency,
  };
  // Formatting balance based on user locale
  labelBalance.textContent = new Intl.NumberFormat(
    account.locale,
    options
  ).format(account.balance.toFixed(2));
};

// CALCULATE THE SUMMARY OF TOTAL DEPOSITS, WITHDRAWALS, & INTEREST
const calcDisplaySummary = (movements, rate = 1) => {
  // Filter and reduce all deposits into a total
  const incomes = movements
    .filter((deposit) => deposit > 0)
    .reduce((acc, deposit) => acc + deposit, 0);
  // Filter and reduce all withdrawals into a total
  const out = movements
    .filter((withdrawal) => withdrawal < 0)
    .reduce((acc, withdrawal) => acc + withdrawal, 0);
  // Filter in only deposits, map them to interests, filter out the ones below 1, and reduce it into a total of interest gain
  const interest = movements
    .filter((deposit) => deposit > 0)
    .map((deposit) => (deposit * rate) / 100)
    .filter((int, _, arr) => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumIn.textContent = `${incomes.toFixed(2)}€`;
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

// CREATE USERNAMES FOR ALL ACCOUNTS
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

// RERENDER/UPDATE THE DISPLAY //
const updateUI = (account) => {
  displayMovements(account);
  calcDisplaySummary(account.movements, account.interestRate);
  calcDisplayBalance(account);
};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// EVENT HANDLERS

// Fake logged in
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 1;

/* // DATES
const now = new Date(); // --- day/month/year

// Options
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  weekday: 'long',
};

// Locale
const locale = navigator.language;

// Internationalization
labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now); */

/* // Defining all the date variables for the heading
const [day, month, year, hours, minutes] = [
  `${now.getDate()}`.padStart(2, 0),
  `${now.getMonth() + 1}`.padStart(2, 0),
  now.getFullYear(),
  `${now.getHours()}`.padStart(2, 0),
  `${now.getMinutes()}`.padStart(2, 0),
];
// Set the text under the current balance heading to a string of the date at login
labelDate.textContent = `${month}/${day}/${year}, ${hours}:${minutes}`; */

// LOGIN EVENT //
btnLogin.addEventListener('click', function (e) {
  // containerApp.addEventListener('click', function (e) {
  e.preventDefault();
  // Find the account with the same username as inputted
  currentAccount = accounts.find(
    (account) => account.username === inputLoginUsername.value
  );
  // Only access pin if the username relates to an actual account (to avoid TypeError)
  if (currentAccount?.pin === +inputLoginPin.value) {
    const { owner, movements, interestRate: rate } = currentAccount; // Destructure data
    // Make the UI visible
    containerApp.style.opacity = 1;
    // Display UI message notifying a successful login
    //labelWelcome
    labelWelcome.textContent = `Welcome back, ${
      // Split the name by the spaces, and only take the first name/element
      owner.split(' ')[0]
    }`;
    updateUI(currentAccount);
    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = ''; // Assignment operator goes from right to left, so it will set all fields to ''
    inputLoginPin.blur();

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );
  }
});

// TRANSFER FUNDS //
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // Amount to transfer
  const amount = +inputTransferAmount.value;

  // Account to recieve transfer
  const recieverAccount = accounts.find(
    (account) => account.username === inputTransferTo.value
  );

  inputTransferTo.value = inputTransferAmount.value = '';

  // Only allow transfer if it is non-negative, is an existing user, is less than total balance, and is not the users own account
  console.log(recieverAccount);
  if (
    amount > 0 &&
    recieverAccount &&
    amount <= currentAccount.balance &&
    recieverAccount?.username !== currentAccount.username
  ) {
    // Add inputted amount to recieverAccount
    recieverAccount.movements.push(amount);
    recieverAccount.movementsDates.push(new Date().toISOString()); // Date too

    // Remove inputted amount to logged in account
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString()); // Date too
  }
  updateUI(currentAccount);
});

// REQUEST LOAN //
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  // Amount to deposit as loan
  const amount = Math.floor(inputLoanAmount.value);

  // Check if request is above 0 and an existing deposit greater than 10% of request exists, to ensure the user is trustworthy
  if (
    amount > 0 &&
    currentAccount.movements
      .filter((movement) => movement > 0)
      .some((deposit) => deposit >= amount / 10)
  )
    currentAccount.movements.push(amount);

  currentAccount.movementsDates.push(new Date().toISOString());

  // Update display
  updateUI(currentAccount);
});

// DELETE ACCOUNT //
btnClose.addEventListener('click', function (e) {
  e.preventDefault(); // Prevent reload

  // Check if the input username and pin match the logged in user
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const indexToDelete = accounts.findIndex(
      (account) => account.username === currentAccount.username
    );
    // Splice mutates the array by removing the index parameter, and 1 to say 1 element
    accounts.splice(indexToDelete, 1);
    console.log(accounts);

    // Remove the UI (the account display)
    containerApp.style.opacity = 0;
    // Remove the welcome message
    labelWelcome.textContent = 'Log in to get started';
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// SORT MOVEMENTS //
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sorted = !sorted; // Flip the boolean
  // Display movements (update only this part of the UI)
  displayMovements(currentAccount, sorted);
});

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// UNUSED

/* const eurToUsd = 1.1; // Conversion rate EUR to USD
// Movements converted to USD from EUR
const movementsUSD = account1.movements.map((movement) => movement * eurToUsd);

// Function to create descriptions from movements
const movementDescriptions = account1.movements.map(
  (movement, i, arr) =>
    `Movement ${i + 1}: You ${
      movement > 0 ? 'deposited' : 'withdrew'
    } ${Math.abs(movement)}`
);

const totalDeposits = account1.movements
  .filter((mov, _, arr) => {
    console.log(arr);
    return mov < 0;
  })
  .map((mov, _, arr) => {
    console.log(arr);
    return mov * eurToUsd;
  })
  .reduce((acc, mov, _, arr) => {
    console.log(arr);
    return acc + mov;
  });
console.log(totalDeposits); */

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// TESTING

/* console.log('\n\nTESTING\n\n\n');

console.log(account1.movements);
console.log(account1.movements.includes(-130));

// Check if there are SOME movements that are positive
console.log(account1.movements.some((mov) => mov > 0));

const arr = [
  [1, 2, 3],
  [9, 9, [1, 1, 1, 1, [1], [[[1]]]]],
  222,
  [('a', 'b', 'c')],
];

const accountMovements = accounts.map((acc) => acc.movements);
console.log(accountMovements);

console.log(
  accounts.flatMap((acc) => acc.movements).reduce((acc, mov) => acc + mov)
); */

/* console.log(arr.flat());
console.log(arr.flat(2));
console.log(arr.flat(3)); */

/* const testArr = [200, 450, -400, 3000, -650, -130, 70, 1300]; */
// Sort method

// Strings
/* const owners = ['Jonas', 'Tyler', 'Kaden', 'Mortimer', 'Rick'];
console.log(owners.sort()); */

// +s
// return < 0 ? A => B (keep order)
// return > 0 ? B => A (switch order)

// Return a negative if the two current arguments are ordered as you want them, otherwise return a positive
/* testArr.sort((a, z) => {
  if (a < z) return -1; // Correct ordering, so left less than right
  if (a > z) return 1; // Incorrect ordering, so left more than right
}); */
/* testArr.sort((a, z) => z - a);
console.log(testArr); */

///////////////////////////////////////////////////////////////////////////////////////////////////
/* labelBalance.addEventListener('click', function (e) {
  e.preventDefault();
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    (el) => el.textContent.replace('€', '')
  );
  console.log(movementsUI);
}); */

/* const obj = {
  length: 4,
  name: 'Thomas',
  age: 24,
  weight: '192',
  eyeColor: 'black',
};
const objArr = Array.from(obj, (cur, i) => this, obj);
console.log(objArr); */

// Testing
/* console.log(Number.parseInt('30px', 10));
console.log(Number.parseFloat('2.5rem', 10));
console.log(typeof Infinity); */

/* console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN('Potato')); // false
console.log(Number.isNaN(Infinity)); // false
console.log(Number.isNaN(false)); // false
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN(+'20x')); // true */

// console.log(Math.min(0.45, 1, 544, 23, 0.9));
// console.log(Math.trunc(Math.random() * 6 + 1));

/* const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min + 1) + min);

console.log(randomInt(15, 20)); */

/* const isEven = (num) => !(num % 2);
console.log(isEven(2)); */

/* labelBalance.addEventListener('click', function () {
  document.querySelectorAll('.movements__row').forEach(function (row, i) {
    if (!(i % 3)) row.style.backgroundColor = 'orangered';
  });
}); */

/* console.log(20n > 50); */

/* const now = new Date();
console.log(now); */

console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));
