document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("address");
    if (!form) {
        console.error("Form with ID 'address' not found");
        return;
    }

    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        console.log("Form submitted!");

        const postalInput = document.getElementById("postal");
        if (!postalInput) {
            console.error("Postal code input not found");
            return;
        }

        // Get and validate postal code
        const postalCode = postalInput.value.replace(/\s+/g, "").toUpperCase().trim();
        const postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;
        
        if (!postalCodeRegex.test(postalCode)) {
            alert("Please enter a valid Canadian postal code.");
            return;
        }

        // Show loading state
        const ridingTableDiv = document.getElementById('riding-table');
        if (!ridingTableDiv) {
            console.error("Div with ID 'riding-table' not found");
            return;
        }
        ridingTableDiv.innerHTML = '<div class="loading">Loading data...</div>';

        try {
            // First API call to get district name
            const workerUrl = `https://green-paper-72c4.hello-ef7.workers.dev/${postalCode}`;
            console.log("Fetching district from:", workerUrl);
            const response = await fetch(workerUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const districtName = await response.text();
            console.log("District Name:", districtName);

            // Second API call to Google Script
            const googleScriptUrl = `https://script.google.com/macros/s/AKfycbyCotN8vkC8HzLZ4IUHXLDwg9RsKbc4fJZRFZWOlJ8SQOAKMsdhe1SH4kj7h0dRKnYS/exec?search=${encodeURIComponent(districtName)}`;
            console.log("Fetching candidates from:", googleScriptUrl);
            const apiResponse = await fetch(googleScriptUrl);
            if (!apiResponse.ok) throw new Error(`HTTP error! status: ${apiResponse.status}`);
            
            const jsonData = await apiResponse.json();
            console.log("API Response Data:", jsonData);

            // Clear the container completely before adding new content
            ridingTableDiv.innerHTML = '';

            // Add district heading
            const districtHeading = document.createElement('h3');
            districtHeading.textContent = `Candidates in ${districtName}`;
            ridingTableDiv.appendChild(districtHeading);

            // Display the data
            displayDataInDiv(jsonData, ridingTableDiv);

        } catch (error) {
            console.error("Error:", error);
            if (ridingTableDiv) {
                ridingTableDiv.innerHTML = '<p class="error">Error loading data. Please try again later.</p>';
            }
        }
    });

    function displayDataInDiv(jsonData, container) {
        if (!jsonData || !Array.isArray(jsonData)) {
            container.innerHTML += '<p class="no-data">No candidate data found for this riding.</p>';
            return;
        }

        jsonData.forEach(obj => {
            if (!obj || typeof obj !== 'object') return;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            
            // Get values using multiple possible key formats
            const getValue = (keys) => {
                for (const key of keys) {
                    if (obj[key] !== undefined) return obj[key];
                }
                return '';
            };

            // Create h3 with columns F and C
            const h3 = document.createElement('h3');
            const fValue = getValue(['F', 'f', 'FirstName', 'firstname', 'Name', 'name', 5]);
            const cValue = getValue(['C', 'c', 'LastName', 'lastname', 2]);
            h3.textContent = `${fValue}, ${cValue}`;
            itemDiv.appendChild(h3);
            
            // Add column G as bold/italic paragraph if it exists
            const gValue = getValue(['G', 'g', 'Party', 'party', 6]);
            if (gValue) {
                const gParagraph = document.createElement('p');
                gParagraph.innerHTML = `<strong><em>${gValue}</em></strong>`;
                itemDiv.appendChild(gParagraph);
            }
            
            // Create unordered list for specific columns
            const ul = document.createElement('ul');
            
            // Try to find columns H-L
            const columnsToShow = ['H', 'I', 'J', 'K', 'L', 'h', 'i', 'j', 'k', 'l', 7, 8, 9, 10, 11];
            columnsToShow.forEach(col => {
                const value = obj[col];
                if (value !== undefined && value !== null && value !== '') {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${col}:</strong> ${value}`;
                    ul.appendChild(li);
                }
            });
            
            itemDiv.appendChild(ul);
            container.appendChild(itemDiv);
        });
    }

    // Add CSS styles
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
    `;
    document.head.appendChild(style);
});
