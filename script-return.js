// Modified displayDataInDiv function
function displayDataInDiv(jsonData, container) {
    // Clear previous content (already done in main function)
    
    // Process each object in the JSON array
    jsonData.forEach(obj => {
        if (!obj) return;
        
        // Create wrapper div for each item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'data-item';
        
        // Add H1 from Riding field (outside the list)
        if (obj['Riding'] !== undefined) {
            const h1 = document.createElement('h1');
            h1.textContent = obj['Riding'];
            itemDiv.appendChild(h1);
            
            // Remove Riding from the object so it doesn't appear in the list
            delete obj['Riding'];
        }
        
        // Create ordered list for remaining properties
        const ol = document.createElement('ol');
        
        // Add all remaining properties
        Object.keys(obj).forEach(key => {
            if (obj[key] !== undefined) {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${key}:</strong> ${obj[key]}`;
                ol.appendChild(li);
            }
        });
        
        itemDiv.appendChild(ol);
        container.appendChild(itemDiv);
    });
    
    // Add styling if none exists
    if (!document.querySelector('style#riding-table-styles')) {
        const style = document.createElement('style');
        style.id = 'riding-table-styles';
        style.textContent = `
            #riding-table .data-item {
                margin-bottom: 2rem;
                padding: 1rem;
                border: 1px solid #eee;
                border-radius: 8px;
                background: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            #riding-table h1 {
                color: #2c3e50;
                margin: 0 0 1rem 0;
                font-size: 1.8rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #f0f0f0;
            }
            #riding-table ol {
                margin: 0.5rem 0 0 0;
                padding-left: 1.5rem;
            }
            #riding-table li {
                margin-bottom: 0.3rem;
                line-height: 1.5;
            }
            #riding-table strong {
                color: #f0f0f0;
                min-width: 100px;
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }
}
