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

                // Create the iframe element
                const iframe = document.createElement('iframe');
                iframe.referrerPolicy = 'no-referrer-when-downgrade';
                iframe.height = '600px';
                iframe.width = '100%';
                iframe.style.border = 'none';
                iframe.src = `https://view-awesome-table.com/-OLpesndwnKveWjWiQEi/view?filterB=${encodeURIComponent(districtName)}`;

                ridingTableDiv.appendChild(iframe);
            } else {
                console.error("Div with ID 'riding-table' not found.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Error fetching data. Please try again later.");
        }
    });
});
