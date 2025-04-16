document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("address").addEventListener("submit", async function(event) {
        event.preventDefault();
        console.log("Form submitted!!");

        // Get and validate postal code
        const postalCode = document.getElementById("postal").value.replace(/\s+/g, "").toUpperCase().trim();
        const postalCodeRegex = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;
        
        if (!postalCodeRegex.test(postalCode)) {
            alert("ode postal invalid.");
            return;
        }

        // Show loading state
        const ridingTableDiv = document.getElementById('riding-table');
        ridingTableDiv.innerHTML = '<div class="loading">En cours...</div>';

        try {
            // First API call to get district name
            const workerUrl = `https://green-paper-72c4.hello-ef7.workers.dev/${postalCode}`;
            const response = await fetch(workerUrl);
            if (!response.ok) throw new Error("Failed to fetch district data");
            
            const districtName = await response.text();
            console.log("District Name:", districtName);

            // Second API call to Google Script
            const googleScriptUrl = `https://script.google.com/macros/s/AKfycbxI6CG1DU9krLfBSudMnBYZtpR3O7Z-n-dciSyKWWh-clGBCRF4SjQIXvNp6lpS68IU/exec?search=${encodeURIComponent(districtName)}`;
            const apiResponse = await fetch(googleScriptUrl);
            if (!apiResponse.ok) throw new Error("Failed to fetch riding data");
            
            const jsonData = await apiResponse.json();
            console.log("API Response Data:", jsonData);

            // Clear the container entirely before adding new content
            ridingTableDiv.innerHTML = '';

            // Add district heading
            const districtHeading = document.createElement('h3');
            districtHeading.textContent = `${districtName}`;
            ridingTableDiv.appendChild(districtHeading);

            // Display the data as a table
            displayDataAsTable(jsonData, ridingTableDiv);

        } catch (error) {
            console.error("Error:", error);
            ridingTableDiv.innerHTML = '<p class="error">Error, please try again later. Erreur, veuillez recommencer plus tard.</p>';
        }
    });

    function displayDataAsTable(jsonData, container) {
        // Check if data is valid
        if (!jsonData || !Array.isArray(jsonData) || jsonData.length === 0) {
            container.innerHTML += '<p class="no-data">Aucun candidat.e trouvé.e dans votre circonscription.</p>';
            return;
        }

        // Create table element
        const table = document.createElement('table');
        table.className = 'candidates-table';
        
        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Add column headers
        const headers = ['Candidat.e', 'Parti', 'D1', 'D2', 'D3', 'D4', 'D5'];
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
            var textContent = candidate['Incumbent'] ? ' (sortant.e)' : '';
            nameCell.textContent = candidate['Candidat.e'] +  textContent || '';
            row.appendChild(nameCell);
            
            // Party
            const partyCell = document.createElement('td');
            var party = ''
            switch(candidate['Party - Parti']) {
                case 'NDP-NPD':
                  party = 'NPD'
                  break;
                case 'CPC-PCC':
                  party = 'PCC'
                  break;
                case 'LPC-PLC':
                  party = 'PLC'
                  break;
                case 'Green Party.i vert':
                  party = 'Parti vert'
                  break;
                default:
                  party = candidate['Party - Parti']
              } 
            partyCell.textContent = party
            row.appendChild(partyCell);
            
            // // Incumbent (Yes/No)
            // const incumbentCell = document.createElement('td');
            // incumbentCell.textContent = candidate['Incumbent'] ? 'Yes' : 'No';
            // row.appendChild(incumbentCell);
            
            // Map D1-D5 to Demand.e 1-5

            if (candidate[`1`] == '' && candidate[`2`] == '' && candidate[`3`] == '' && candidate[`4`] == '' && candidate[`5`] == '') {
                const qCell = document.createElement('td');
                const hyperlink = document.createElement("a");
                hyperlink.href = "/fr-sengager"
                hyperlink.innerHTML = "<u>ENVOYER UN COURRIEL!</u>"
                hyperlink.target="_blank"
                qCell.appendChild(hyperlink)
                qCell.colSpan = 5
                row.appendChild(qCell)
                row.className = "red-row"
            } else {
                for (let i = 1; i <= 5; i++) {
                    const qCell = document.createElement('td');
                    qCell.textContent = candidate[`${i}`] || '';
                    row.appendChild(qCell);
                }
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
            // font-family: Arial, sans-serif;
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
            color: #f22248;
            padding: 15px;
            background: #000000;
            border-radius: 4px;
            text-align: center;
            font-weight: bold;
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

        .candidates-table tr.red-row {
            background-color: hsla(var(--safeDarkAccent-hsl),0.75);
        }

        .candidates-table tr.red-row:hover {
            background-color: hsla(var(--safeDarkAccent-hsl),1);
        }
    `;
    document.head.appendChild(style);
});
