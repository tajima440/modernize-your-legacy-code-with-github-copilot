#!/usr/bin/env node

/**
 * Student Account Management System
 * 
 * This is a Node.js migration of the COBOL application originally composed of:
 * - main.cob (MainProgram): User interface and menu handling
 * - operations.cob (Operations): Business logic for account operations
 * - data.cob (DataProgram): Data storage and retrieval
 * 
 * Migration Date: 2026-03-27
 * Architecture: Single-file application preserving original 3-tier logic
 */

const prompt = require('prompt-sync')({ sigint: true });

/**
 * ============================================================================
 * DATA LAYER - Equivalent to DataProgram (data.cob)
 * ============================================================================
 * Manages persistent storage of account balance
 */
class DataProgram {
  constructor() {
    // STORAGE-BALANCE (PIC 9(6)V99 VALUE 1000.00)
    this.storageBalance = 1000.00;
  }

  /**
   * READ operation: Retrieves current balance
   * Equivalent to: IF OPERATION-TYPE = 'READ' MOVE STORAGE-BALANCE TO BALANCE
   * 
   * @returns {number} Current balance
   */
  read() {
    return this.storageBalance;
  }

  /**
   * WRITE operation: Updates balance with new value
   * Equivalent to: IF OPERATION-TYPE = 'WRITE' MOVE BALANCE TO STORAGE-BALANCE
   * 
   * @param {number} balance - New balance value to persist
   */
  write(balance) {
    this.storageBalance = balance;
  }

  /**
   * Format balance with proper decimal places for display
   * COBOL format: PIC 9(6)V99
   * 
   * @param {number} balance - Balance to format
   * @returns {string} Formatted balance string
   */
  formatBalance(balance) {
    return balance.toFixed(2).padStart(9, '0');
  }
}

/**
 * ============================================================================
 * BUSINESS LOGIC LAYER - Equivalent to Operations (operations.cob)
 * ============================================================================
 * Implements account operations: TOTAL, CREDIT, DEBIT
 */
class Operations {
  constructor(dataProgram) {
    // Dependency injection of data layer
    this.dataProgram = dataProgram;
  }

  /**
   * TOTAL operation: Display current balance
   * Equivalent to COBOL:
   *   IF OPERATION-TYPE = 'TOTAL '
   *       CALL 'DataProgram' USING 'READ', FINAL-BALANCE
   *       DISPLAY "Current balance: " FINAL-BALANCE
   */
  displayBalance() {
    const finalBalance = this.dataProgram.read();
    console.log(`Current balance: ${this.dataProgram.formatBalance(finalBalance)}`);
  }

  /**
   * CREDIT operation: Add funds to account
   * Equivalent to COBOL:
   *   IF OPERATION-TYPE = 'CREDIT'
   *       DISPLAY "Enter credit amount: "
   *       ACCEPT AMOUNT
   *       CALL 'DataProgram' USING 'READ', FINAL-BALANCE
   *       ADD AMOUNT TO FINAL-BALANCE
   *       CALL 'DataProgram' USING 'WRITE', FINAL-BALANCE
   *       DISPLAY "Amount credited. New balance: " FINAL-BALANCE
   */
  creditAccount() {
    // Prompt for credit amount
    const amountInput = prompt('Enter credit amount: ');
    const amount = parseFloat(amountInput);

    // Validate input
    if (isNaN(amount)) {
      console.log('Invalid amount entered.');
      return;
    }

    // Read current balance from data layer
    let finalBalance = this.dataProgram.read();

    // Add amount to balance (ADD AMOUNT TO FINAL-BALANCE)
    finalBalance += amount;

    // Write updated balance to data layer
    this.dataProgram.write(finalBalance);

    // Display confirmation message
    console.log(`Amount credited. New balance: ${this.dataProgram.formatBalance(finalBalance)}`);
  }

  /**
   * DEBIT operation: Withdraw funds from account
   * Equivalent to COBOL:
   *   IF OPERATION-TYPE = 'DEBIT '
   *       DISPLAY "Enter debit amount: "
   *       ACCEPT AMOUNT
   *       CALL 'DataProgram' USING 'READ', FINAL-BALANCE
   *       IF FINAL-BALANCE >= AMOUNT
   *           SUBTRACT AMOUNT FROM FINAL-BALANCE
   *           CALL 'DataProgram' USING 'WRITE', FINAL-BALANCE
   *           DISPLAY "Amount debited. New balance: " FINAL-BALANCE
   *       ELSE
   *           DISPLAY "Insufficient funds for this debit."
   *       END-IF
   */
  debitAccount() {
    // Prompt for debit amount
    const amountInput = prompt('Enter debit amount: ');
    const amount = parseFloat(amountInput);

    // Validate input
    if (isNaN(amount)) {
      console.log('Invalid amount entered.');
      return;
    }

    // Read current balance from data layer
    let finalBalance = this.dataProgram.read();

    // Check if sufficient funds (IF FINAL-BALANCE >= AMOUNT)
    if (finalBalance >= amount) {
      // Subtract amount from balance (SUBTRACT AMOUNT FROM FINAL-BALANCE)
      finalBalance -= amount;

      // Write updated balance to data layer
      this.dataProgram.write(finalBalance);

      // Display confirmation message
      console.log(`Amount debited. New balance: ${this.dataProgram.formatBalance(finalBalance)}`);
    } else {
      // Display error message when insufficient funds
      console.log('Insufficient funds for this debit.');
    }
  }
}

/**
 * ============================================================================
 * PRESENTATION LAYER - Equivalent to MainProgram (main.cob)
 * ============================================================================
 * Handles user interface and menu navigation
 */
class MainProgram {
  constructor(operations) {
    // Dependency injection of business logic layer
    this.operations = operations;
    this.continueFlag = true;
  }

  /**
   * Display main menu
   * Equivalent to COBOL DISPLAY statements in MAIN-LOGIC
   */
  displayMenu() {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  /**
   * Process user choice and route to appropriate operation
   * Equivalent to COBOL EVALUATE statement
   * 
   * @param {number} choice - User's menu selection
   */
  processChoice(choice) {
    switch (choice) {
      case 1:
        // WHEN 1: CALL 'Operations' USING 'TOTAL '
        this.operations.displayBalance();
        break;
      case 2:
        // WHEN 2: CALL 'Operations' USING 'CREDIT'
        this.operations.creditAccount();
        break;
      case 3:
        // WHEN 3: CALL 'Operations' USING 'DEBIT '
        this.operations.debitAccount();
        break;
      case 4:
        // WHEN 4: MOVE 'NO' TO CONTINUE-FLAG
        this.continueFlag = false;
        break;
      default:
        // WHEN OTHER: DISPLAY error message
        console.log('Invalid choice, please select 1-4.');
    }
  }

  /**
   * Main event loop
   * Equivalent to COBOL: PERFORM UNTIL CONTINUE-FLAG = 'NO'
   */
  run() {
    // PERFORM UNTIL CONTINUE-FLAG = 'NO'
    while (this.continueFlag) {
      this.displayMenu();

      // ACCEPT USER-CHOICE
      const choiceInput = prompt('Enter your choice (1-4): ');
      const choice = parseInt(choiceInput);

      // EVALUATE USER-CHOICE
      this.processChoice(choice);
    }

    // DISPLAY "Exiting the program. Goodbye!"
    console.log('Exiting the program. Goodbye!');
    // STOP RUN
    process.exit(0);
  }
}

/**
 * ============================================================================
 * APPLICATION INITIALIZATION
 * ============================================================================
 * Compose the three layers and start the application
 */

// Export classes for testing
module.exports = {
  DataProgram,
  Operations,
  MainProgram
};

// Run application only if this module is executed directly (not required as a module)
if (require.main === module) {
  // Instantiate data layer
  const dataProgram = new DataProgram();

  // Instantiate business logic layer (passing data layer as dependency)
  const operations = new Operations(dataProgram);

  // Instantiate presentation layer (passing business logic layer as dependency)
  const mainProgram = new MainProgram(operations);

  // Start the application main loop
  mainProgram.run();
}
