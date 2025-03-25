document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("address").addEventListener("submit", async function(event) {
        console.log("Form submitted!"); // Debugging: Check if the event listener is triggered
        event.preventDefault(); // Prevent default form submission behavior

        // Get the postal code, remove spaces, and convert to uppercase
        const postalCode = document.getElementById("postal").value.replace(/\s+/g, "").toUpperCase().trim();

        // Validate the postal code format
        const postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;
        if (!postalCodeRegex.test(postalCode)) {
            alert("Please enter a valid Canadian postal code.");
            return;
        }

        // Your Cloudflare Worker URL
        const workerUrl = `https://green-paper-72c4.hello-ef7.workers.dev/${postalCode}`;

        try {
            const response = await fetch(workerUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            // Parse the response as plain text (since the worker returns a string)
            const districtName = await response.text();

            console.log("District Name:", districtName); // Log the district name for debugging

            // Find the div with ID 'riding-table'
            const ridingTableDiv = document.getElementById('riding-table');

            if (ridingTableDiv) {
                // Clear the div's content
                ridingTableDiv.innerHTML = '';

                // NEW CODE: Fetch data from Google Script API
                const googleScriptUrl = `https://script.google.com/macros/s/AKfycbzBaCZM3S5ahdNsiA3ynlMI0QPTI_CsVCx8liLAO6-gHcdsxVHGHCPsmzHKWrNEYkr74g/exec?search=${encodeURIComponent(districtName)}`;
                
                try {
                    const apiResponse = await fetch(googleScriptUrl);
                    if (!apiResponse.ok) {
                        throw new Error("Failed to fetch data from Google Script");
                    }
                    
                    const jsonData = await apiResponse.json();
                    displayDataInDiv(jsonData, ridingTableDiv);
                } catch (apiError) {
                    console.error("Error fetching from Google Script:", apiError);
                    ridingTableDiv.innerHTML = '<p>Error loading district data. Please try again later.</p>';
                }

            } else {
                console.error("Div with ID 'riding-table' not found.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Error fetching data. Please try again later.");
        }
    });

    // Modified displayDataInDiv function (now takes container element as parameter)
    function displayDataInDiv(jsonData, container) {
        // Clear previous content (already done in main function)
        
        // Process each object in the JSON array
        jsonData.forEach(obj => {
            if (!obj) return;
            
            // Create wrapper div for each item
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            
            // Add H1 from column D (change 'D' to your actual column header)
            if (obj['District'] !== undefined) { // Adjust this key to match your data
                const h1 = document.createElement('h1');
                h1.textContent = obj['District']; // Adjust this key to match your data
                itemDiv.appendChild(h1);
            }
            
            // Create ordered list for other properties
            const ol = document.createElement('ol');
            
            // Add all other properties except the one used in H1
            Object.keys(obj).forEach(key => {
                if (key !== 'District' && obj[key] !== undefined) { // Adjust 'District' to match your H1 key
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${key}:</strong> ${obj[key]}`;
                    ol.appendChild(li);
                }
            });
            
            itemDiv.appendChild(ol);
            container.appendChild(itemDiv);
        });
        
        // Add some basic styling if no CSS is present
        if (!document.querySelector('style#riding-table-styles')) {
            const style = document.createElement('style');
            style.id = 'riding-table-styles';
            style.textContent = `
                #riding-table .data-item {
                    margin-bottom: 2rem;
                    padding: 1rem;
                    border: 1px solid #eee;
                    border-radius: 8px;
                }
                #riding-table h1 {
                    color: #2c3e50;
                    margin-bottom: 0.5rem;
                    font-size: 1.5rem;
                }
                #riding-table ol {
                    margin-top: 0;
                    padding-left: 1.5rem;
                }
                #riding-table li {
                    margin-bottom: 0.5rem;
                }
                #riding-table strong {
                    color: #34495e;
                }
            `;
            document.head.appendChild(style);
        }
    }
});
