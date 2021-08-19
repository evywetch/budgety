/*
								Example of how to create modules
		Steps
- We create 3 modules: budgetController, UIController, controller
- Each module is encapsulate by (), we called IIFI, so that they dont interfere each other. And they will be immediately called

*/

// this is Data module: BUDGET CONTROLLER
var budgetController = (function () {
  /*
						About FUNCTION CONSTRUCTOR

	- Keep Expense and Income separate object, coz later, Expense and Income may need some different data or methods
	- In case that we need some methods for them, we can put these methods in a prototype property of the expense or of the income
		So that all object created through them will inharit these methods.
		So instead of writing these methods right into the constructors, we can put them into the prototyps.
		This way, the methods are not attached to each individual object, but instead, its object will then inharit it from the prototype.
	*/

  // create a FUNCTION CONSTRUCTOR for expenses
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1; // set -1 as default value
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  // create a FUNCTION CONSTRUCTOR for income
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    // ******** We use [] to access the property of the object's property ex. data.allItems[exp]
    // coz it allows us to pass an argument of what we want to access
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });

    data.totals[type] = sum;
  };

  // create an object to store all datas
  var data = {
    allItems: {
      exp: [], // array to store all expense objects
      inc: [], // array to store all income objects
    },

    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    // Set to -1 coz it's a value that we use to say that something that's nonexistent,
    // if there are no budget value or no total expenses on incomes, then there can't be a percentage
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on 'inc' oe 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      // push it into our data structure
      data.allItems[type].push(newItem);
      // return the new element
      return newItem;
    },

    calculateBudget: function () {
      // Calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp; // ******** Or can use . to access properties of object's property ex. data.totals.inc

      // Calculate the percentage of income that we spent4
      if (data.totals.inc > 0) {
        // Percentage of expense will be calculated if income > 0
        // Coz if we devided by 0 ( 100/ 0) we will a result as 'infinity' , we don't want it
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); // Use Math.round() so we don't get decimals
      } else {
        data.percentage = -1; // -1 means 'nonexistent'
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPercentages = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });

      return allPercentages; // return an array of all percentages
    },

    deleteItem: function (type, id) {
      var ids, index;
      // use map() to loop over an array
      // map() accept a callback function which can also access current element, current index and
      // The different between map & forEach is that map will always returns something and that will be stored in a brand new array
      // with the same lenght of the looped array (data.allItems[type])
      ids = data.allItems[type].map(function (current) {
        return current.id; // return the id of all the elements in data.allItems[type] and store in a new array
      });

      index = ids.indexOf(id); // if id doesn't exist in 'ids' -> will return -1

      if (index !== -1) {
        data.allItems[type].splice(index, 1); // 1 = numbers of element that we want to delete
      }
    },

    getBudget: function () {
      // this function do nothing, only return an object
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// this is UI module: UI CONTROLLER
var UIController = (function () {
  // Create an object to store all the DOM class name Strings
  //  => this helps us easier to controll if we want to change the DOM class name later, then we dont have to go change it all over the place, just chagnge in this object
  var DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensePercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    // private method

    var numSplit, int, decimal;
    /*
			+ or - before number
			exactly 2 decimal points
			comma seperating the thousands

			2310.4567 -> + 2310.46
			2000 -> + 2000.00
			*/

    num = Math.abs(num); // abs() -> stands for absolute -> it removes the sign of the number
    num = num.toFixed(2); // put 2 decimal numbers -> toFix() is a method of a Number prototype -> returns a string
    numSplit = num.split("."); // returns an array
    int = numSplit[0];

    if (int.length > 3) {
      // Add comma sapperating the thousands
      // substr() -> allows as to only take a part of a string -> returns a part of string that we want
      // 1st argument is the index where we want to start, 2nd argument is how many characters we want
      // int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

      for (var i = int.length - 3; i > 0; i -= 3) {
        int = int.substr(0, i) + "," + int.substr(i);
      }
    }

    decimal = numSplit[1];

    type === "exp" ? (sign = "-") : (sign = "+");

    return (type === "exp" ? "-" : "+") + " " + int + "." + decimal;
  };

  // create our own function to loop through a node list
  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    // this is how we return an 'object' which this object will be assigned to variable 'UIController'
    getInput: function () {
      // this is a method of an object
      return {
        // data inside {} like this => return an object

        // Because we want to return 3 values; type, description, value => we have to return as an object that contains these 3 values
        type: document.querySelector(DOMStrings.inputType).value, // read the value of '.add__type', will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        // parseFloat() will convert a string into a float number (number with decimals)
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      // Create HTML String with placeholder text
      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        // id="income-%id%"  => %id% means we can replace this %id% from data we get from object
        // %description% will be replace with the object's description
        // %value% will be replaced with onject's value
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type)); // formatNumber(obj.value, type) is how to call a private method(dont use 'this keyword')

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml); // we want to insert html string into a div at position 'before end'
    },

    // Removing something from the DOM, we have removeChild() -> In JS we can only delete a child(from the parent, that's why have to call parent first)
    // , can't delete an element directly
    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArray;
      // querySelectorAll can select more than one field  => it returns a list
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      // slice() => is an array's method => returns a copy of the array that its called on
      // Array.prototype.slice.call(fields); is how to trick a slice() to think that we give it an array, so it will return an array
      fieldsArray = Array.prototype.slice.call(fields);

      /*
			- Use foreach to loop all element in fieldsArray
			- the callback function inside foreach, can recieve up to 3 arguments 
			- It works like the callback function on the event listener which has access to event object
			- But this one, It does automatically have access to 3 things; 
				-the current value: the value of the array that is currently being processed
				- index number
				- array 
			*/
      fieldsArray.forEach(function (current, index, array) {
        current.value = "";
      });

      // Set focus to 'description' which is the 1st element in the array
      fieldsArray[0].focus();
    },

    displayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      /*
			* In the DOM tree, where all of the html elements of our page are stored, each element is called 'a node'

			*/
      var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel); // returns a nodelist

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function () {
      var now, months, month, year;

      now = new Date(); // gives the current date

      year = now.getFullYear(); // returns full year ex. 2020

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      month = now.getMonth(); // returns integer as 0 based  ex. 10 = November

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDescription +
          "," +
          DOMStrings.inputValue
      ); // returns a nodeList of elements

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus"); // toggle() will add class 'red-focus' if it doesn;t occur, but if it does 'red-focus' will be removed
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
    },

    getDOMStrings: function () {
      return DOMStrings; // then we can use DOM class name Strings in other modules
    },
  };
})();

// this module will connect budgetController & UIController to be able to talk to each other
// It take budgetController & UIController as a parameter so that they can talk to each other
// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    // this function still have to be called(in line 91), otherwise, the 'addEventListener' won't be call either

    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    // Add event listener to the global document
    // Means this 'keypress' event doesn't happens on specific element, but it happens on the global webpage, anywhere on the document
    // When user presses the 'enter', it will execute the code
    // We pass 'event' (which is the keyboardEvent object) to function 'function(event)' coz we want to specify that the 'keypress' event means only for 'exter key'
    // The call back function of the addEventListener method has always access to the event object
    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        // some browser use 'which' property to store key code
        ctrlAddItem();
      }
    });
    // This how we use 'Event Delegation' by adding eventListener on the container that contain the target button(delete button)
    // Each time someone clicks 'delete button' in class = 'container', some element in it will be deleted
    // to delete Expense or Income
    // We dont pass event parameter here BUT in the ctrlDeleteItem declaration coz we want to know wat the target element is
    // It also works COZ The call back function of the addEventListener method has always access to the event object

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    // If a user change the type(inc or exp) it will switch to other color of all the input fields(type, description, value)
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // 2, Return the budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UIController.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. Get the field input data
    input = UICtrl.getInput();

    // It will add items if description is not empty and value has to be a number (must not be NaN)
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller

      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update percentages
      updatePercentages();
    }
  };
  // Pass 'event object' here -> The call back function of the addEventListener method has always access to the event object
  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    // get the id of the 4th parent of the target that we click
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // returns a string

    // If the place where we click has an ID, things will happen
    if (itemID) {
      // 1. Get the ID of the parent block of the delete button

      // As soon as we call a method on a String, JS will automatically puts a wrapper around a String and coverts it from primetive to an object
      // this also happens to Numbers
      splitID = itemID.split("-"); //it will return an array of strings that r plited by '-' ex. ['inc', '1']
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 2. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 3. delete the item from UI
      UICtrl.deleteListItem(itemID);

      // 4. Update and shows the new budget
      updateBudget();

      // 5. Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started!");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });

      UICtrl.displayMonth();
      setupEventListeners();
    },
  };
})(budgetController, UIController); // it means => budgetController & UIController will be assigned as arguments of function(budgetCtrl, UICtrl)

// ###########  This is where the app is started   #############

// this is how we call the returned method from the module -> why it works like this -> read line 144 (getInput())
controller.init(); // have to call init() coz then setupEventListeners(); will be called => and from setupEventListeners() being called => ctrlAddItem() will be called
