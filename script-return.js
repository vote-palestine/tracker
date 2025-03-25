document.addEventListener("DOMContentLoaded", function() {
    // Form submission handler
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
            const googleScriptUrl = `https://script.google.com/macros/s/AKfycbzBaCZM3S5ahdNsiA3ynlMI0QPTI_CsVCx8liLAO6-gHcdsxVHGHCPsmzHKWrNEYkr74g/exec?search=${encodeURIComponent(districtName)}`;
            const apiResponse = await fetch(googleScriptUrl);
            if (!apiResponse.ok) throw new Error("Failed to fetch riding data");
            
            const jsonData = await apiResponse.json();
            console.log("API Response Data:", jsonData); // Debugging
            
            // Display the data
            displayDataInDiv(jsonData, ridingTableDiv);

        } catch (error) {
            console.error("Error:", error);
            ridingTableDiv.innerHTML = '<p class="error">Error loading data. Please try again later.</p>';
        }
    });

    // Function to display data in the div
    function displayDataInDiv(jsonData, container) {
        // Clear container
        container.innerHTML = '';

        // Check if data is valid
        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
            container.innerHTML = '<p class="no-data">No riding data found for this postal code.</p>';
            return;
        }

        // Process each item in the data array
        jsonData.forEach(obj => {
            if (!obj) return;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            
            // Add Riding as H1 (if exists)
            if (obj['Riding']) {
                const h1 = document.createElement('h1');
                h1.textContent = obj['Riding'];
                itemDiv.appendChild(h1);
            }
            
            // Create ordered list for other properties
            const ol = document.createElement('ol');
            
            // Add all properties except 'Riding'
            Object.entries(obj).forEach(([key, value]) => {
                if (key !== 'Riding' && value !== undefined) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${key}:</strong> ${value}`;
                    ol.appendChild(li);
                }
            });
            
            itemDiv.appendChild(ol);
            container.appendChild(itemDiv);
        });
    }

    // Add CSS styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        #riding-table {
            margin-top: 20px;
            font-family: Arial, sans-serif;
        }
        
        #riding-table .loading {
            padding: 20px;
            text-align: center;
            color: #666;
        }
        
        #riding-table .error {
            color: #d9534f;
            padding: 15px;
            background: #f8d7da;
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
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        #riding-table h1 {
            color: #2c3e50;
            margin: 0 0 15px 0;
            font-size: 24px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        #riding-table ol {
            margin: 10px 0 0 0;
            padding-left: 25px;
        }
        
        #riding-table li {
            margin-bottom: 8px;
            line-height: 1.5;
            padding-left: 5px;
        }
        
        #riding-table strong {
            color: #f0f0f0;
            min-width: 120px;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
});
