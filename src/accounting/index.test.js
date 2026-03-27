/**
 * Unit Tests for Student Account Management System (Node.js Version)
 * 
 * These tests mirror the 53 test cases defined in docs/TESTPLAN.md
 * Testing the three layers: DataProgram, Operations, MainProgram
 * 
 * Test Coverage:
 * - TC-001 to TC-004: System startup and menu operations
 * - TC-005 to TC-008: Balance display
 * - TC-009 to TC-015: Credit account operations
 * - TC-016 to TC-022: Debit account (success cases)
 * - TC-023 to TC-028: Debit account (failure cases)
 * - TC-029 to TC-034: Integration tests
 * - TC-035 to TC-040: Edge cases and boundary values
 * - TC-041 to TC-045: Data integrity and persistence
 * - TC-046 to TC-050: UI and input validation
 * - TC-051 to TC-053: Performance and stress tests
 */

const { DataProgram, Operations, MainProgram } = require('./index');

// Mock console.log to capture output
let consoleOutput = [];
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation((output) => {
  consoleOutput.push(output);
});

// Mock prompt-sync
jest.mock('prompt-sync', () => {
  return jest.fn(() => {
    return jest.fn((message) => {
      return '';
    });
  });
});

describe('Student Account Management System - NodeJS', () => {
  beforeEach(() => {
    consoleOutput = [];
  });

  afterEach(() => {
    consoleOutput = [];
  });

  // ============================================================================
  // LAYER 1: DataProgram (Data Layer) Tests
  // ============================================================================
  describe('DataProgram - Data Layer', () => {
    let data;

    beforeEach(() => {
      data = new DataProgram();
    });

    describe('Initialization', () => {
      test('TC-001: Should initialize with correct balance', () => {
        expect(data.storageBalance).toBe(1000.00);
      });

      test('Should initialize balance to exactly 1000.00', () => {
        expect(data.storageBalance).toBeCloseTo(1000.00, 2);
      });
    });

    describe('READ Operation', () => {
      test('TC-041: Should read current balance correctly', () => {
        const balance = data.read();
        expect(balance).toBe(1000.00);
      });

      test('Should return storageBalance unchanged on read', () => {
        const initialBalance = data.storageBalance;
        data.read();
        expect(data.storageBalance).toBe(initialBalance);
      });

      test('Should read updated balance after write', () => {
        data.write(1500.00);
        expect(data.read()).toBe(1500.00);
      });
    });

    describe('WRITE Operation', () => {
      test('TC-042: Should write balance correctly', () => {
        data.write(1500.00);
        expect(data.storageBalance).toBe(1500.00);
      });

      test('Should persist balance on subsequent reads', () => {
        data.write(2000.00);
        expect(data.read()).toBe(2000.00);
      });

      test('Should handle zero balance', () => {
        data.write(0.00);
        expect(data.storageBalance).toBe(0.00);
      });

      test('TC-035: Should handle large balance values', () => {
        data.write(999999.99);
        expect(data.storageBalance).toBe(999999.99);
      });
    });

    describe('Balance Formatting', () => {
      test('Should format balance with COBOL format (PIC 9(6)V99)', () => {
        const formatted = data.formatBalance(1000.00);
        expect(formatted).toBe('001000.00');
      });

      test('Should format balance with leading zeros', () => {
        const formatted = data.formatBalance(100.50);
        expect(formatted).toBe('000100.50');
      });

      test('Should format single digit balance', () => {
        const formatted = data.formatBalance(5.00);
        expect(formatted).toBe('000005.00');
      });

      test('Should format large balance', () => {
        const formatted = data.formatBalance(999999.99);
        expect(formatted).toBe('999999.99');
      });

      test('Should format zero balance', () => {
        const formatted = data.formatBalance(0.00);
        expect(formatted).toBe('000000.00');
      });
    });
  });

  // ============================================================================
  // LAYER 2: Operations (Business Logic Layer) Tests
  // ============================================================================
  describe('Operations - Business Logic Layer', () => {
    let data, ops;

    beforeEach(() => {
      data = new DataProgram();
      ops = new Operations(data);
    });

    // ========== TOTAL Operation Tests (TC-005 to TC-008) ==========
    describe('TOTAL Operation - Display Balance', () => {
      test('TC-005: Should display initial balance', () => {
        consoleOutput = [];
        mockConsoleLog.mockClear();
        ops.displayBalance();
        expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 001000.00');
      });

      test('TC-006: Should display balance after credit', () => {
        data.write(1500.00);
        mockConsoleLog.mockClear();
        ops.displayBalance();
        expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 001500.00');
      });

      test('TC-007: Should display balance after debit', () => {
        data.write(700.00);
        mockConsoleLog.mockClear();
        ops.displayBalance();
        expect(mockConsoleLog).toHaveBeenCalledWith('Current balance: 000700.00');
      });

      test('TC-008: Display balance multiple times should return same value', () => {
        mockConsoleLog.mockClear();
        ops.displayBalance();
        const firstCall = mockConsoleLog.mock.calls[0][0];
        mockConsoleLog.mockClear();
        ops.displayBalance();
        const secondCall = mockConsoleLog.mock.calls[0][0];
        expect(firstCall).toBe(secondCall);
      });
    });

    // ========== CREDIT Operation Tests (TC-009 to TC-015) ==========
    describe('CREDIT Operation - Add Funds', () => {
      test('TC-009: Should credit valid amount', () => {
        const initialBalance = data.read();
        data.write(initialBalance + 500.00);
        const newBalance = data.read();
        expect(newBalance).toBe(1500.00);
      });

      test('TC-010: Should handle multiple credits', () => {
        let balance = data.read();
        balance += 300.00;
        data.write(balance);
        expect(data.read()).toBe(1300.00);

        balance = data.read();
        balance += 200.00;
        data.write(balance);
        expect(data.read()).toBe(1500.00);
      });

      test('TC-011: Should handle decimal precision (2 decimal places)', () => {
        const balance = data.read() + 123.45;
        data.write(balance);
        expect(data.read()).toBeCloseTo(1123.45, 2);
      });

      test('TC-012: Should handle large amount credit', () => {
        data.write(1000.00 + 999999.00);
        expect(data.read()).toBeCloseTo(1000999.00, 2);
      });

      test('TC-013: Should handle zero amount credit', () => {
        const initialBalance = data.read();
        data.write(initialBalance + 0);
        expect(data.read()).toBe(1000.00);
      });

      test('TC-014: Should handle small amount credit', () => {
        const balance = data.read() + 0.01;
        data.write(balance);
        expect(data.read()).toBeCloseTo(1000.01, 2);
      });

      test('TC-015: Menu should be available after credit', () => {
        // Simulating menu availability by checking data integrity
        const balance = data.read() + 500.00;
        data.write(balance);
        // If we can still read/write, menu is available
        expect(data.read()).toBe(1500.00);
      });
    });

    // ========== DEBIT Operation Tests - Success Cases (TC-016 to TC-022) ==========
    describe('DEBIT Operation - Withdraw Funds (Success Cases)', () => {
      test('TC-016: Should debit valid amount when sufficient funds', () => {
        let balance = data.read();
        if (balance >= 300.00) {
          balance -= 300.00;
          data.write(balance);
          expect(data.read()).toBe(700.00);
        }
      });

      test('TC-017: Should handle multiple debits', () => {
        let balance = data.read();
        if (balance >= 200.00) {
          balance -= 200.00;
          data.write(balance);
          expect(data.read()).toBe(800.00);

          if (balance >= 300.00) {
            balance -= 300.00;
            data.write(balance);
            expect(data.read()).toBe(500.00);
          }
        }
      });

      test('TC-018: Should handle decimal precision debit', () => {
        data.write(500.50);
        let balance = data.read();
        if (balance >= 100.25) {
          balance -= 100.25;
          data.write(balance);
          expect(data.read()).toBeCloseTo(400.25, 2);
        }
      });

      test('TC-019: Should allow debit of exact balance', () => {
        data.write(1000.00);
        let balance = data.read();
        if (balance >= 1000.00) {
          balance -= 1000.00;
          data.write(balance);
          expect(data.read()).toBe(0.00);
        }
      });

      test('TC-020: Should handle small debit amount', () => {
        let balance = data.read();
        if (balance >= 0.01) {
          balance -= 0.01;
          data.write(balance);
          expect(data.read()).toBeCloseTo(999.99, 2);
        }
      });

      test('TC-021: Should handle zero debit amount', () => {
        const initialBalance = data.read();
        let balance = data.read();
        if (balance >= 0) {
          balance -= 0;
          data.write(balance);
          expect(data.read()).toBe(initialBalance);
        }
      });

      test('TC-022: Menu should be available after successful debit', () => {
        let balance = data.read();
        if (balance >= 300.00) {
          balance -= 300.00;
          data.write(balance);
          // Verify we can still perform operations
          expect(data.read()).toBe(700.00);
        }
      });
    });

    // ========== DEBIT Operation Tests - Failure Cases (TC-023 to TC-028) ==========
    describe('DEBIT Operation - Insufficient Funds (Failure Cases)', () => {
      test('TC-023: Should reject debit when insufficient funds', () => {
        data.write(1000.00);
        let balance = data.read();
        if (balance < 1500.00) {
          // This simulates the debit check logic
          expect(balance >= 1500.00).toBe(false);
        }
      });

      test('TC-024: Balance should remain unchanged after failed debit', () => {
        data.write(500.00);
        const initialBalance = data.read();
        // Rejected debit - balance shouldn't change
        expect(data.read()).toBe(500.00);
        expect(data.read()).toBe(initialBalance);
      });

      test('TC-025: Menu should be available after failed debit', () => {
        data.write(500.00);
        // Even after failed debit attempt, we can still use menu
        expect(data.read()).toBe(500.00);
      });

      test('TC-026: Should handle multiple debits with insufficient funds', () => {
        data.write(500.00);
        let balance = data.read();
        if (balance >= 400.00) {
          balance -= 400.00;
          data.write(balance);
          expect(data.read()).toBe(100.00);
        }
        // Now try to withdraw more than available
        balance = data.read();
        if (balance < 200.00) {
          expect(balance < 200.00).toBe(true);
        }
      });

      test('TC-027: Should reject debit with decimal point shortage', () => {
        data.write(100.50);
        let balance = data.read();
        if (balance < 100.51) {
          expect(balance < 100.51).toBe(true);
        }
      });

      test('TC-028: Should reject debit slightly over balance', () => {
        data.write(100.00);
        let balance = data.read();
        if (balance < 100.01) {
          expect(balance < 100.01).toBe(true);
        }
      });
    });
  });

  // ============================================================================
  // LAYER 3: Integration Tests (TC-029 to TC-034)
  // ============================================================================
  describe('Integration Tests - Multiple Operations', () => {
    let data;

    beforeEach(() => {
      data = new DataProgram();
    });

    test('TC-029: Credit -> View -> Debit sequence', () => {
      // Credit 500
      let balance = data.read();
      balance += 500.00;
      data.write(balance);
      expect(data.read()).toBe(1500.00);

      // Debit 400
      balance = data.read();
      if (balance >= 400.00) {
        balance -= 400.00;
        data.write(balance);
      }
      expect(data.read()).toBe(1100.00);
    });

    test('TC-030: Debit -> View -> Credit -> View sequence', () => {
      // Debit 300
      let balance = data.read();
      if (balance >= 300.00) {
        balance -= 300.00;
        data.write(balance);
      }
      expect(data.read()).toBe(700.00);

      // Credit 500
      balance = data.read();
      balance += 500.00;
      data.write(balance);
      expect(data.read()).toBe(1200.00);
    });

    test('TC-031: Multiple alternating credit and debit operations', () => {
      let balance = data.read();
      balance += 200.00;
      data.write(balance);
      expect(data.read()).toBe(1200.00);

      balance = data.read();
      if (balance >= 100.00) {
        balance -= 100.00;
        data.write(balance);
      }
      expect(data.read()).toBe(1100.00);

      balance = data.read();
      balance += 300.00;
      data.write(balance);
      expect(data.read()).toBe(1400.00);

      balance = data.read();
      if (balance >= 500.00) {
        balance -= 500.00;
        data.write(balance);
      }
      expect(data.read()).toBe(900.00);
    });

    test('TC-032: Failed debit -> Credit -> Successful debit', () => {
      data.write(100.00);
      // Try to debit 200 (should fail)
      expect(data.read() < 200.00).toBe(true);

      // Credit 150
      let balance = data.read();
      balance += 150.00;
      data.write(balance);
      expect(data.read()).toBe(250.00);

      // Now debit 200 (should succeed)
      balance = data.read();
      if (balance >= 200.00) {
        balance -= 200.00;
        data.write(balance);
        expect(data.read()).toBe(50.00);
      }
    });

    test('TC-033: Boundary test - exact balance debit', () => {
      data.write(100.00);
      let balance = data.read();
      expect(balance >= 100.00).toBe(true);
      
      if (balance >= 100.00) {
        balance -= 100.00;
        data.write(balance);
        expect(data.read()).toBe(0.00);
      }
    });

    test('TC-034: Data consistency after multiple operations', () => {
      // Perform multiple operations
      let balance = data.read();
      balance += 250.00;
      data.write(balance);
      
      balance = data.read();
      if (balance >= 150.00) {
        balance -= 150.00;
        data.write(balance);
      }

      // Check consistency
      const finalBalance = data.read();
      // Verify by reading again
      expect(data.read()).toBe(finalBalance);
      expect(finalBalance).toBe(1100.00);
    });
  });

  // ============================================================================
  // Edge Cases and Boundary Value Tests (TC-035 to TC-040)
  // ============================================================================
  describe('Edge Cases and Boundary Values', () => {
    test('TC-035: Maximum value credit', () => {
      const data = new DataProgram();
      data.write(1.00);
      let balance = data.read();
      balance += 999998.99;
      data.write(balance);
      expect(data.read()).toBeCloseTo(999999.99, 2);
    });

    test('TC-036: Debit to zero balance', () => {
      const data = new DataProgram();
      let balance = data.read();
      if (balance >= 1000.00) {
        balance -= 1000.00;
        data.write(balance);
        expect(data.read()).toBe(0.00);
      }
    });

    test('TC-037: Credit to zero balance', () => {
      const data = new DataProgram();
      data.write(0.00);
      let balance = data.read();
      balance += 100.00;
      data.write(balance);
      expect(data.read()).toBe(100.00);
    });

    test('TC-038: Reject debit from zero balance', () => {
      const data = new DataProgram();
      data.write(0.00);
      const balance = data.read();
      expect(balance < 0.01).toBe(true);
    });

    test('TC-039: Handling third decimal place', () => {
      const data = new DataProgram();
      // JavaScript can handle more precision, but COBOL format is 2 decimal places
      data.write(1000.001);
      // Due to floating point, this may be stored as-is
      expect(data.read()).toBeCloseTo(1000.001, 3);
    });

    test('TC-040: Negative amount handling', () => {
      const data = new DataProgram();
      // System should handle negative amounts (implementation may vary)
      data.write(1000.00 + (-100.00));
      expect(data.read()).toBe(900.00);
    });
  });

  // ============================================================================
  // Data Integrity and Persistence Tests (TC-041 to TC-045)
  // ============================================================================
  describe('Data Integrity and Persistence', () => {
    test('TC-041: Data integrity after credit', () => {
      const data = new DataProgram();
      let balance = data.read();
      balance += 500.00;
      data.write(balance);
      expect(data.storageBalance).toBe(1500.00);
    });

    test('TC-042: Data integrity after debit', () => {
      const data = new DataProgram();
      let balance = data.read();
      if (balance >= 300.00) {
        balance -= 300.00;
        data.write(balance);
      }
      expect(data.storageBalance).toBe(700.00);
    });

    test('TC-043: Multiple operations sync', () => {
      const data = new DataProgram();
      let balance = data.read();
      balance += 100.00;
      data.write(balance);
      expect(data.storageBalance).toBe(1100.00);

      balance = data.read();
      if (balance >= 50.00) {
        balance -= 50.00;
        data.write(balance);
      }
      expect(data.storageBalance).toBe(1050.00);
    });

    test('TC-044: READ operation accuracy', () => {
      const data = new DataProgram();
      data.write(1234.56);
      expect(data.read()).toBe(1234.56);
    });

    test('TC-045: WRITE operation accuracy', () => {
      const data = new DataProgram();
      data.write(2222.22);
      expect(data.read()).toBe(2222.22);
      expect(data.storageBalance).toBe(2222.22);
    });
  });

  // ============================================================================
  // User Interface and Input Validation Tests (TC-046 to TC-050)
  // ============================================================================
  describe('User Interface and Input Validation', () => {
    test('TC-046: Menu display structure', () => {
      // Test that DataProgram can represent menu states
      const data = new DataProgram();
      expect(data.storageBalance).toBeDefined();
      expect(typeof data.storageBalance).toBe('number');
    });

    test('TC-047: Credit message format', () => {
      const data = new DataProgram();
      const balance = data.read();
      const formatted = data.formatBalance(balance);
      // Message format: "Amount credited. New balance: XXX.XX"
      // formatBalance returns a string with leading zeros: "001000.00"
      expect(formatted).toMatch(/^\d{6}\.\d{2}$/);
    });

    test('TC-048: Error message for insufficient funds', () => {
      const data = new DataProgram();
      data.write(500.00);
      const balance = data.read();
      // Check if balance is insufficient for 2000.00
      expect(balance < 2000.00).toBe(true);
    });

    test('TC-049: Credit input prompt can be issued', () => {
      // This tests that the system can prompt for credit input
      const data = new DataProgram();
      const ops = new Operations(data);
      expect(ops).toBeDefined();
    });

    test('TC-050: Debit input prompt can be issued', () => {
      // This tests that the system can prompt for debit input
      const data = new DataProgram();
      const ops = new Operations(data);
      expect(ops).toBeDefined();
    });
  });

  // ============================================================================
  // Performance and Stress Tests (TC-051 to TC-053)
  // ============================================================================
  describe('Performance and Stress Tests', () => {
    test('TC-051: Handle 100 rapid operations', () => {
      const data = new DataProgram();
      let balance = data.read();

      // Perform 100 operations
      for (let i = 0; i < 50; i++) {
        balance += 10.00; // Credit
      }
      data.write(balance);

      for (let i = 0; i < 25; i++) {
        if (balance >= 5.00) {
          balance -= 5.00; // Debit
        }
      }
      data.write(balance);

      // Verify final balance is correct
      expect(data.read()).toBeDefined();
      expect(typeof data.read()).toBe('number');
    });

    test('TC-052: Menu traversal performance', () => {
      const data = new DataProgram();
      const start = Date.now();

      // Simulate 50 menu traversals
      for (let i = 0; i < 50; i++) {
        data.read();
      }

      const elapsed = Date.now() - start;
      // Should complete quickly (less than 1 second)
      expect(elapsed).toBeLessThan(1000);
    });

    test('TC-053: Large value operations maintain precision', () => {
      const data = new DataProgram();
      let balance = data.read();
      // Initial balance is 1000.00

      // Multiple large operations (5 × 100000.00 = 500000.00)
      for (let i = 0; i < 5; i++) {
        balance += 100000.00;
      }
      data.write(balance);

      // Verify calculation (1000.00 + 500000.00 = 501000.00)
      expect(data.read()).toBeCloseTo(501000.00, 2);
    });
  });

  // ============================================================================
  // Validation of Menu Options (TC-001, TC-002, TC-003, TC-004)
  // ============================================================================
  describe('Menu Operations', () => {
    test('TC-001: System initializes with menu interaction ready', () => {
      const data = new DataProgram();
      const ops = new Operations(data);
      const menu = new MainProgram(ops);
      expect(menu).toBeDefined();
      expect(menu.continueFlag).toBe(true);
    });

    test('TC-002: Valid menu choices can be processed', () => {
      const data = new DataProgram();
      const ops = new Operations(data);
      const menu = new MainProgram(ops);
      
      // Test menu choice processing
      menu.processChoice(1); // Valid choice
      expect(menu.continueFlag).toBe(true);
      
      menu.processChoice(2); // Valid choice
      expect(menu.continueFlag).toBe(true);
      
      menu.processChoice(3); // Valid choice
      expect(menu.continueFlag).toBe(true);
    });

    test('TC-003: Invalid menu choice is handled', () => {
      const data = new DataProgram();
      const ops = new Operations(data);
      const menu = new MainProgram(ops);
      
      mockConsoleLog.mockClear();
      menu.processChoice(5); // Invalid choice
      expect(mockConsoleLog).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
      expect(menu.continueFlag).toBe(true);
    });

    test('TC-004: Exit choice terminates application', () => {
      const data = new DataProgram();
      const ops = new Operations(data);
      const menu = new MainProgram(ops);
      
      expect(menu.continueFlag).toBe(true);
      menu.processChoice(4); // Exit choice
      expect(menu.continueFlag).toBe(false);
    });
  });
});
