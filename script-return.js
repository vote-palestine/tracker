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
            console.log("API Response Data:", jsonData);

            // Clear the container completely before adding new content
            ridingTableDiv.innerHTML = '';

            // Add district heading
            const districtHeading = document.createElement('h3');
            districtHeading.textContent = `Candidates in ${districtName}`;
            ridingTableDiv.appendChild(districtHeading);

            // Display the data as a table
            displayDataAsTable(jsonData, ridingTableDiv);

        } catch (error) {
            console.error("Error:", error);
            ridingTableDiv.innerHTML = '<p class="error">Error loading data. Please try again later.</p>';
        }
    });

    function displayDataAsTable(jsonData, container) {
        // Check if data is valid
        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
            container.innerHTML += '<p class="no-data">No candidate data found for this riding.</p>';
            return;
        }

        // Create table element
        const table = document.createElement('table');
        table.className = 'candidates-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Add column headers
        const headers = ['Candidate', 'Party', 'Incumbent', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
        headers.forEach(function(headerText) {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        // Add each candidate as a row
        jsonData.forEach(function(candidate) {
            if (!candidate) return;
            
            const row = document.createElement('tr');
            
            // Candidate Name
            const nameCell = document.createElement('td');
            nameCell.textContent = candidate['Candidat.e'] || '';
            row.appendChild(nameCell);
            
            // Party
            const partyCell = document.createElement('td');
            partyCell.textContent = candidate['Party - Parti'] || '';
            row.appendChild(partyCell);
            
            // Incumbent (Yes/No)
            const incumbentCell = document.createElement('td');
            incumbentCell.textContent = candidate['Incumbent'] ? 'Yes' : 'No';
            row.appendChild(incumbentCell);
            
            // Map Q1-Q5 to Demand.e 1-5
            for (let i = 1; i <= 5; i++) {
                const qCell = document.createElement('td');
                qCell.textContent = candidate[`Demand.e ${i}`] || '';
                row.appendChild(qCell);
            }
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
    }

    // Updated CSS with black font for table rows
    const style = document.createElement('style');
    style.textContent = `
        #riding-table {
            margin-top: 20px;
            font-family: Arial, sans-serif;
            width: 100%;
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
            color: #95c892;
            padding: 15px;
            background: #000000;
            border-radius: 4px;
            text-align: center;
        }
        
        .candidates-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            background: #b0ecac;
            color: #000000; /* Black font for all table text */
        }
        
        .candidates-table th {
            background-color: #8fd988;
            color: #000;
            text-align: left;
            padding: 12px;
            border: 1px solid #e1e1e1;
        }
        
        .candidates-table td {
            padding: 10px 12px;
            border: 1px solid #e1e1e1;
            vertical-align: top;
            color: #000000; /* Black font for table cells */
        }
        
        .candidates-table tr:nth-child(even) {
            background-color: #c5f0c0;
        }
        
        .candidates-table tr:hover {
            background-color: #a0e69a;
        }
    `;
    document.head.appendChild(style);
});
