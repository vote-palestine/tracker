document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("address").addEventListener("submit", async function(event) {
        console.log("Form submitted!");
        event.preventDefault();

        const postalCode = document.getElementById("postal").value.replace(/\s+/g, "").toUpperCase().trim();
        const postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;
        
        if (!postalCodeRegex.test(postalCode)) {
            alert("Please enter a valid Canadian postal code.");
            return;
        }

        const workerUrl = `https://green-paper-72c4.hello-ef7.workers.dev/${postalCode}`;

        try {
            const response = await fetch(workerUrl);
            if (!response.ok) throw new Error("Failed to fetch data");
            
            const districtName = await response.text();
            console.log("District Name:", districtName);

            const ridingTableDiv = document.getElementById('riding-table');
            if (!ridingTableDiv) {
                console.error("Div with ID 'riding-table' not found.");
                return;
            }

            ridingTableDiv.innerHTML = ''; // Clear previous content

            // Fetch data from Google Script API
            const googleScriptUrl = `https://script.google.com/macros/s/AKfycbzBaCZM3S5ahdNsiA3ynlMI0QPTI_CsVCx8liLAO6-gHcdsxVHGHCPsmzHKWrNEYkr74g/exec?search=${encodeURIComponent(districtName)}`;
            
            const apiResponse = await fetch(googleScriptUrl);
            if (!apiResponse.ok) throw new Error("Failed to fetch data from Google Script");
            
            const jsonData = await apiResponse.json();
            displayDataInDiv(jsonData, ridingTableDiv);

        } catch (error) {
            console.error("Error:", error);
            const ridingTableDiv = document.getElementById('riding-table');
            if (ridingTableDiv) {
                ridingTableDiv.innerHTML = '<p class="error">Error loading data. Please try again later.</p>';
            }
            alert("Error fetching data. Please try again later.");
        }
    });

    function displayDataInDiv(jsonData, container) {
        if (!jsonData || !Array.isArray(jsonData)) {
            container.innerHTML = '<p>No data available</p>';
            return;
        }

        jsonData.forEach(obj => {
            if (!obj) return;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            
            // Add Riding as H1
            if (obj['Riding']) {
                const h1 = document.createElement('h1');
                h1.textContent = obj['Riding'];
                itemDiv.appendChild(h1);
            }
            
            // Create list for other properties
            const ol = document.createElement('ol');
            
            // Add all properties except Riding
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
});
