document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const invoiceForm = document.getElementById('invoiceForm');
    const invoicePreview = document.getElementById('invoicePreview');
    const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
    const editInvoiceBtn = document.getElementById('editInvoiceBtn');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsTableBody = document.getElementById('itemsTableBody');
    
    // Initialize invoice number
    initializeInvoiceNumber();
    
    // Set default date
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    // Add event listeners
    generateInvoiceBtn.addEventListener('click', generateInvoice);
    editInvoiceBtn.addEventListener('click', editInvoice);
    printInvoiceBtn.addEventListener('click', printInvoice);
    addItemBtn.addEventListener('click', addItem);
    
    // Add listeners for calculating totals
    const taxInputs = ['cgst', 'sgst', 'igst', 'discount'];
    taxInputs.forEach(id => {
      document.getElementById(id).addEventListener('input', calculateTotals);
    });
    
    // Add first item row
    addItem();
    
    /**
     * Initialize invoice number from localStorage or start with 1001
     */
    function initializeInvoiceNumber() {
      const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber');
      const newInvoiceNumber = lastInvoiceNumber ? (parseInt(lastInvoiceNumber) + 1).toString() : '1001';
      document.getElementById('invoiceNumber').value = newInvoiceNumber;
    }
    
    /**
     * Add a new item row to the table
     */
    function addItem() {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="item-input" name="description" placeholder="Enter item description"></td>
        <td><input type="number" class="item-input" name="quantity" value="1" min="1"></td>
        <td><input type="number" class="item-input" name="rate" value="0" min="0" step="0.01"></td>
        <td class="item-total">0.00</td>
        <td><button class="btn-remove" onclick="removeItem(this)">×</button></td>
      `;
      
      itemsTableBody.appendChild(tr);
      
      // Add event listeners to new inputs
      const inputs = tr.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('input', function() {
          updateItemTotal(tr);
          calculateTotals();
        });
      });
    }
    
    /**
     * Remove an item row from the table
     */
    window.removeItem = function(button) {
      const tr = button.closest('tr');
      
      // Only remove if there's more than one item
      if (itemsTableBody.children.length > 1) {
        tr.remove();
        calculateTotals();
      }
    }
    
    /**
     * Update the total for a single item row
     */
    function updateItemTotal(tr) {
      const quantity = parseFloat(tr.querySelector('input[name="quantity"]').value) || 0;
      const rate = parseFloat(tr.querySelector('input[name="rate"]').value) || 0;
      const total = quantity * rate;
      
      tr.querySelector('.item-total').textContent = total.toFixed(2);
    }
    
    /**
     * Calculate all totals (subtotal, tax, discount, grand total)
     */
    function calculateTotals() {
      // Calculate subtotal
      let subtotal = 0;
      const itemTotals = document.querySelectorAll('.item-total');
      itemTotals.forEach(item => {
        subtotal += parseFloat(item.textContent) || 0;
      });
      
      // Get tax and discount percentages
      const cgstRate = parseFloat(document.getElementById('cgst').value) || 0;
      const sgstRate = parseFloat(document.getElementById('sgst').value) || 0;
      const igstRate = parseFloat(document.getElementById('igst').value) || 0;
      const discountRate = parseFloat(document.getElementById('discount').value) || 0;
      
      // Calculate amounts
      const cgstAmount = (subtotal * cgstRate) / 100;
      const sgstAmount = (subtotal * sgstRate) / 100;
      const igstAmount = (subtotal * igstRate) / 100;
      const taxAmount = cgstAmount + sgstAmount + igstAmount;
      const discountAmount = (subtotal * discountRate) / 100;
      const grandTotal = subtotal + taxAmount - discountAmount;
      
      // Update summary
      document.getElementById('subtotal').textContent = formatCurrency(subtotal);
      document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
      document.getElementById('discountAmount').textContent = formatCurrency(discountAmount);
      document.getElementById('grandTotal').textContent = formatCurrency(grandTotal);
    }
    
    /**
     * Format number as currency (INR)
     */
    function formatCurrency(amount) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }
    
    /**
     * Format date string for display
     */
    function formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    
    /**
     * Generate the invoice preview
     */
    function generateInvoice() {
      // Save invoice number to localStorage
      localStorage.setItem('lastInvoiceNumber', document.getElementById('invoiceNumber').value);
      
      // Customer details
      document.getElementById('previewCustomerName').textContent = document.getElementById('customerName').value;
      document.getElementById('previewCustomerAddress').textContent = document.getElementById('customerAddress').value;
      document.getElementById('previewCustomerState').textContent = document.getElementById('customerState').value;
      
      const phone = document.getElementById('customerPhone').value;
      const pan = document.getElementById('customerPan').value;
      const gst = document.getElementById('customerGst').value;
      
      document.getElementById('previewCustomerPhone').textContent = phone ? `Phone: ${phone}` : '';
      document.getElementById('previewCustomerPan').textContent = pan ? `PAN: ${pan}` : '';
      document.getElementById('previewCustomerGst').textContent = gst ? `GST: ${gst}` : '';
      
      // Invoice details
      document.getElementById('previewInvoiceNumber').textContent = document.getElementById('invoiceNumber').value;
      document.getElementById('previewInvoiceDate').textContent = formatDate(document.getElementById('invoiceDate').value);
      document.getElementById('previewInvoiceDueDate').textContent = formatDate(document.getElementById('invoiceDueDate').value);
      
      // Items
      const previewItemsTable = document.getElementById('previewItemsTable');
      previewItemsTable.innerHTML = '';
      
      const items = document.querySelectorAll('#itemsTableBody tr');
      items.forEach(item => {
        const description = item.querySelector('input[name="description"]').value;
        const quantity = item.querySelector('input[name="quantity"]').value;
        const rate = parseFloat(item.querySelector('input[name="rate"]').value) || 0;
        const total = parseFloat(item.querySelector('.item-total').textContent) || 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${description}</td>
          <td>${quantity}</td>
          <td>${formatCurrency(rate)}</td>
          <td>${formatCurrency(total)}</td>
        `;
        previewItemsTable.appendChild(tr);
      });
      
      // Tax and totals
      const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace(/[^0-9.-]+/g, '')) || 0;
      const cgstRate = parseFloat(document.getElementById('cgst').value) || 0;
      const sgstRate = parseFloat(document.getElementById('sgst').value) || 0;
      const igstRate = parseFloat(document.getElementById('igst').value) || 0;
      const discountRate = parseFloat(document.getElementById('discount').value) || 0;
      
      const cgstAmount = (subtotal * cgstRate) / 100;
      const sgstAmount = (subtotal * sgstRate) / 100;
      const igstAmount = (subtotal * igstRate) / 100;
      const discountAmount = (subtotal * discountRate) / 100;
      const grandTotal = subtotal + cgstAmount + sgstAmount + igstAmount - discountAmount;
      
      document.getElementById('previewSubtotal').textContent = formatCurrency(subtotal);
      document.getElementById('previewGrandTotal').textContent = formatCurrency(grandTotal);
      
      // CGST
      if (cgstRate > 0) {
        document.getElementById('previewCgstRow').style.display = 'flex';
        document.getElementById('previewCgstLabel').textContent = `CGST (${cgstRate}%):`;
        document.getElementById('previewCgstAmount').textContent = formatCurrency(cgstAmount);
      } else {
        document.getElementById('previewCgstRow').style.display = 'none';
      }
      
      // SGST
      if (sgstRate > 0) {
        document.getElementById('previewSgstRow').style.display = 'flex';
        document.getElementById('previewSgstLabel').textContent = `SGST (${sgstRate}%):`;
        document.getElementById('previewSgstAmount').textContent = formatCurrency(sgstAmount);
      } else {
        document.getElementById('previewSgstRow').style.display = 'none';
      }
      
      // IGST
      if (igstRate > 0) {
        document.getElementById('previewIgstRow').style.display = 'flex';
        document.getElementById('previewIgstLabel').textContent = `IGST (${igstRate}%):`;
        document.getElementById('previewIgstAmount').textContent = formatCurrency(igstAmount);
      } else {
        document.getElementById('previewIgstRow').style.display = 'none';
      }
      
      // Discount
      if (discountRate > 0) {
        document.getElementById('previewDiscountRow').style.display = 'flex';
        document.getElementById('previewDiscountLabel').textContent = `Discount (${discountRate}%):`;
        document.getElementById('previewDiscountAmount').textContent = `-${formatCurrency(discountAmount)}`;
      } else {
        document.getElementById('previewDiscountRow').style.display = 'none';
      }
      
      // Terms and notes
      document.getElementById('previewTerms').textContent = document.getElementById('terms').value;
      document.getElementById('previewNotes').textContent = document.getElementById('notes').value;
      
      // Show preview, hide form
      invoiceForm.style.display = 'none';
      invoicePreview.style.display = 'block';
    }
    
    /**
     * Go back to edit mode
     */
    function editInvoice() {
      invoicePreview.style.display = 'none';
      invoiceForm.style.display = 'block';
    }
    
    /**
     * Print the invoice
     */
    function printInvoice() {
      window.print();
    }
  });