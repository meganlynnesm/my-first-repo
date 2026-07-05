document.addEventListener('DOMContentLoaded', function() {  // Wait for HTML to fully load before running code
    console.log('JavaScript is now running!');              // Print message to browser console for debugging
    
    // Find HTML elements by their IDs
    const button = document.getElementById('demoButton');      // Get the button element by its ID
    const messageArea = document.getElementById('messageDisplay');  // Get the message area element by its ID
    
    // Add click event listener to the button
    button.addEventListener('click', function() {              // Listen for clicks on the button
        console.log('Button was clicked!');                    // Print message to console when button is clicked
        
        // Create a message with the current visit date and time
        const now = new Date();                                 // Get the current date/time
        const visitDate = now.toLocaleDateString();             // Format as a readable date
        const visitTime = now.toLocaleTimeString();             // Format as a readable time
        const message = 'You visited this site on ' + visitDate + ' at ' + visitTime;  // Create the visit-log message

        // Display the message in our HTML
        messageArea.textContent = message;                     // Put the message text into the HTML element

        // Change button text temporarily
        button.textContent = 'Visit Logged!';                  // Change what the button displays

        // Reset button text after 2 seconds
        setTimeout(function() {                                // Run a function after a delay
            button.textContent = 'Record My Visit';            // Change button text back to original
        }, 2000);                                              // Wait 2000 milliseconds (2 seconds)
    });
});
