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

            // Display the data
            displayDataInDiv(jsonData, ridingTableDiv);

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

        // Process each candidate in the data array
        jsonData.forEach(candidate => {
            if (!candidate) return;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            
            // Create h3 with Candidate and Party
            const h3 = document.createElement('h3');
            h3.textContent = `${candidate['Candidat.e'] || ''}, ${candidate['Party - Parti'] || ''}`;
            itemDiv.appendChild(h3);
            
            // Add Incumbent as bold/italic paragraph if it exists
            if (candidate['Incumbent']) {
                const incumbentPara = document.createElement('p');
                incumbentPara.innerHTML = `<strong><em>${candidate['Incumbent']}</em></strong>`;
                itemDiv.appendChild(incumbentPara);
            }
            
            // Create unordered list for Demands
            const ul = document.createElement('ul');
            
            // Add each Demand.e field that exists
            for (let i = 1; i <= 5; i++) {
                const demandKey = `Demand.e ${i}`;
                if (candidate[demandKey]) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${demandKey}:</strong> ${candidate[demandKey]}`;
                    ul.appendChild(li);
                }
            }
            
            itemDiv.appendChild(ul);
            container.appendChild(itemDiv);
        });
    }

    // CSS styles
    const style = document.createElement('style');
    style.textContent = `
        #riding-table {
            margin-top: 20px;
            font-family: Arial, sans-serif;
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
        
        #riding-table .data-item p {
            margin: 0 0 10px 0;
            font-size: 16px;
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
