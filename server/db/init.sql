-- Create code_blocks table
CREATE TABLE IF NOT EXISTS code_blocks
(
    id
    SERIAL
    PRIMARY
    KEY,
    title
    VARCHAR
(
    255
) NOT NULL,
    description TEXT,
    initial_code TEXT NOT NULL,
    solution TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Insert initial code blocks
INSERT INTO code_blocks (title, description, initial_code, solution)
VALUES ('Async Case', 'Learn how to use async/await',
        '// Write an async function that fetches user data
        function getUserData(userId) {
          // Your code here
        }',
        '// Write an async function that fetches user data
        async function getUserData(userId) {
          try {
            const response = await fetch(`/api/users/${userId}`);
            const data = await response.json();
            return data;
          } catch (error) {
            console.error("Error fetching user:", error);
            throw error;
          }
        }'),

       ('Array Methods', 'Practice array manipulation methods',
        '// Use map to double all numbers in the array
        const numbers = [1, 2, 3, 4, 5];
        const doubled = // Your code here',
        '// Use map to double all numbers in the array
        const numbers = [1, 2, 3, 4, 5];
        const doubled = numbers.map(num => num * 2);'),

       ('Promise Handling', 'Master JavaScript promises',
        '// Create a promise that resolves after 2 seconds
        function delay() {
          // Your code here
        }',
        '// Create a promise that resolves after 2 seconds
        function delay() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve("Done!");
            }, 2000);
          });
        }'),

       ('Closure Example', 'Understand JavaScript closures',
        '// Create a counter function using closure
        function createCounter() {
          // Your code here
        }',
        '// Create a counter function using closure
        function createCounter() {
          let count = 0;
          return function() {
            count++;
            return count;
          };
        }');