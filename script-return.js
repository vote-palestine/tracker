document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("address").addEventListener("submit", async function(event) {
        event.preventDefault();
        console.log("Form submitted!");

        // Get and validate postal code
        const postalCode = document.getElementById("postal").value.replace(/\s+/g, "").toUpperCase().trim();
        const postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;
        
        if (!postalCodeRegex.test(postalCode)) {
            alert("Please enter a valid Canadian postal code.");
            return;
        }

        // Show loading state
        const ridingTableDiv = document.getElementById('riding-table');
        ridingTableDiv.innerHTML = '<div class="loading">Loading data...</div>';

        try {
            // First API call to get district name
            const workerUrl = `https://green-paper-72c4.hello-ef7.workers.dev/${postalCode}`;
            const response = await fetch(workerUrl);
            if (!response.ok) throw new Error("Failed to fetch district data");
            
            const districtName = await response.text();
            console.log("District Name:", districtName);

            // Second API call to Google Script
            const googleScriptUrl = `https://script.google.com/macros/s/AKfycbyCotN8vkC8HzLZ4IUHXLDwg9RsKbc4fJZRFZWOlJ8SQOAKMsdhe1SH4kj7h0dRKnYS/exec?search=${encodeURIComponent(districtName)}`;
            const apiResponse = await fetch(googleScriptUrl);
            if (!apiResponse.ok) throw new Error("Failed to fetch riding data");
            
            const jsonData = await apiResponse.json();
            console.log("API Response Data:", jsonData); // Debug the actual response

            // Clear the container completely before adding new content
            ridingTableDiv.innerHTML = '';

            // Add district heading
            const districtHeading = document.createElement('h3');
            districtHeading.textContent = `Candidates in ${districtName}`;
            ridingTableDiv.appendChild(districtHeading);

            // Display the data with error handling
            try {
                displayDataInDiv(jsonData, ridingTableDiv);
            } catch (displayError) {
                console.error("Display Error:", displayError);
                ridingTableDiv.innerHTML += '<p class="error">Error displaying candidate data.</p>';
                // Show raw data for debugging
                const debugDiv = document.createElement('pre');
                debugDiv.textContent = JSON.stringify(jsonData, null, 2);
                ridingTableDiv.appendChild(debugDiv);
            }

        } catch (error) {
            console.error("Error:", error);
            ridingTableDiv.innerHTML = '<p class="error">Error loading data. Please try again later.</p>';
        }
    });

    function displayDataInDiv(jsonData, container) {
        // Check if data is valid
        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
            container.innerHTML += '<p class="no-data">No candidate data found for this riding.</p>';
            return;
        }

        // Process each item in the data array
        jsonData.forEach((obj, index) => {
            if (!obj) return;
            
            console.log(`Processing item ${index}:`, obj); // Debug each item
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            
            // Create h3 with columns F and C - handle different data structures
            const h3 = document.createElement('h3');
            let fValue, cValue;
            
            // Try different ways to access the data
            if (obj['F'] !== undefined && obj['C'] !== undefined) {
                // Case 1: Column letter keys
                fValue = obj['F'] || '';
                cValue = obj['C'] || '';
            } else if (obj['f'] !== undefined && obj['c'] !== undefined) {
                // Case 2: Lowercase column letters
                fValue = obj['f'] || '';
                cValue = obj['c'] || '';
            } else if (obj[5] !== undefined && obj[2] !== undefined) {
                // Case 3: Array index (0-based, F=5, C=2)
                fValue = obj[5] || '';
                cValue = obj[2] || '';
            } else {
                // Case 4: Try to find values by header names
                const headers = Object.keys(obj);
                const fKey = headers.find(k => k.toLowerCase().includes('firstname') || headers[5];
                const cKey = headers.find(k => k.toLowerCase().includes('lastname') || headers[2];
                fValue = fKey ? obj[fKey] || '' : '';
                cValue = cKey ? obj[cKey] || '' : '';
            }
            
            h3.textContent = `${fValue}, ${cValue}`;
            itemDiv.appendChild(h3);
            
            // Add column G (or equivalent) as bold/italic paragraph if it exists
            const gValue = obj['G'] || obj['g'] || obj[6] || 
                          Object.values(obj).find(v => typeof v === 'string' && v.includes('Party'));
            if (gValue) {
                const gParagraph = document.createElement('p');
                gParagraph.innerHTML = `<strong><em>${gValue}</em></strong>`;
                itemDiv.appendChild(gParagraph);
            }
            
            // Create unordered list for specific columns
            const ul = document.createElement('ul');
            
            // Define columns we want to include (H,I,J,K,L or equivalent)
            const columnsToCheck = [
                ['H','I','J','K','L'],  // Case 1: Uppercase letters
                ['h','i','j','k','l'],  // Case 2: Lowercase letters
                [7,8,9,10,11],          // Case 3: Array indices
                Object.keys(obj).slice(7,12) // Case 4: First 5 properties after F,G
            ];
            
            // Find which set of columns exists in our data
            const availableColumns = columnsToCheck.find(colSet => 
                colSet.some(col => obj[col] !== undefined)
            ) || [];
            
            // Add specified columns to the list
            availableColumns.forEach(col => {
                if (obj[col] !== undefined && obj[col] !== null && obj[col] !== '') {
                    const li = document.createElement('li');
                    // Try to get a label for the column
                    const label = typeof col === 'string' ? col : `Field ${col}`;
                    li.innerHTML = `<strong>${label}:</strong> ${obj[col]}`;
                    ul.appendChild(li);
                }
            });
            
            itemDiv.appendChild(ul);
            container.appendChild(itemDiv);
        });
    }

    // CSS styles (unchanged from your preferences)
    const style = document.createElement('style');
    style.textContent = `
        #riding-table {
            margin-top: 20px;
        }
        
        #riding-table > h3 {
            color: #f0f0f0;
            font-size: 22px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
        }
        
        #riding-table .loading {
            padding: 20px;
            text-align: center;
            color: #f0f0f0;
        }
        
        #riding-table .error {
            color: #000000;
            padding: 15px;
            background: #b0ecac;
            border-radius: 4px;
            text-align: center;
        }
        
        #riding-table .no-data {
            color: #5bc0de;
            padding: 15px;
            background: #d9edf7;
            border-radius: 4px;
            text-align: center;
        }
        
        #riding-table .data-item {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #e1e1e1;
            border-radius: 6px;
            background: #b0ecac;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        #riding-table .data-item h3 {
            color: #000000;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        
        #riding-table ul {
            margin: 10px 0 0 0;
            padding-left: 20px;
            color: #000000;
        }
        
        #riding-table li {
            margin-bottom: 6px;
            line-height: 1.4;
            padding-left: 5px;
        }
        
        #riding-table strong {
            color: #000000;
            min-width: 100px;
            display: inline-block;
        }
        
        /* Debug styles */
        #riding-table pre {
            background: #f8f8f8;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
    `;
    document.head.appendChild(style);
});
