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

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// DISPLAY FUNCTIONS

// DISPLAY ALL MOVEMENTS //
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

// CALCULATE TOTAL BALANCE //
const calcDisplayBalance = (account) => {
  // Setting the agruments balance to the reduced value total, but it updates it on the global scale because objects are passed by sharing (value is reference), so it will update in the heap and all references pointing to that will now have the new value
  // Generate a balance key with value of all movements reduced into 1 value
  account.balance = account.movements.reduce(
    (acc, movement) => acc + movement,
    0
  );
  labelBalance.textContent = `${account.balance}€`;
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

  labelSumIn.textContent = `${incomes}€`;
  labelSumOut.textContent = `${Math.abs(out)}€`;
  labelSumInterest.textContent = `${interest}€`;
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
  displayMovements(account.movements);
  calcDisplaySummary(account.movements, account.interestRate);
  calcDisplayBalance(account);
};

// DELETE ACCOUNT //
const deleteAccount = (account) => {};

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// EVENT HANDLERS

// GLOBAL DATA
let currentAccount;
/* let currentAccount = account1;
inputLoginUsername.value = 'tn';
inputLoginPin.value = 1111; */

// LOGIN EVENT //
btnLogin.addEventListener('click', function (e) {
  // containerApp.addEventListener('click', function (e) {
  e.preventDefault();
  // Find the account with the same username as inputted
  currentAccount = accounts.find(
    (account) => account.username === inputLoginUsername.value
  );
  // Only access pin if the username relates to an actual account (to avoid TypeError)
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
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
  }
});

// TRANSFER FUNDS //
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // Amount to transfer
  const amount = Number(inputTransferAmount.value);

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
    accounts
      .find((account) => account.username === recieverAccount.username)
      .movements.push(amount);

    // Remove inputted amount to logged in account
    currentAccount.movements.push(-amount);
  }
  updateUI(currentAccount);
});

// REQUEST LOAN //
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  // Amount to deposit as loan
  const amount = Number(inputLoanAmount.value);

  // Check if request is above 0 and an existing deposit greater than 10% of request exists, to ensure the user is trustworthy
  if (
    amount > 0 &&
    currentAccount.movements
      .filter((movement) => movement > 0)
      .some((deposit) => deposit >= amount / 10)
  )
    currentAccount.movements.push(amount);

  // Update display
  updateUI(currentAccount);
});

// DELETE ACCOUNT //
btnClose.addEventListener('click', function (e) {
  e.preventDefault(); // Prevent reload

  // Check if the input username and pin match the logged in user
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
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

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  console.log('Sort');
});
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// UNUSED

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
console.log(totalDeposits);

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
// TESTING

console.log('\n\nTESTING\n\n\n');

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
);

/* console.log(arr.flat());
console.log(arr.flat(2));
console.log(arr.flat(3)); */
