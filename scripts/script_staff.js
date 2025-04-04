import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
        import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

        // Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyA2yvXdcSGMFzTdHLtLbdYSCtfG4XYmfZJ",
            authDomain: "sdscoolers.firebaseapp.com",
            projectId: "sdscoolers",
            storageBucket: "sdscoolers.firebasestorage.app",
            messagingSenderId: "532383388279",
            appId: "1:532383388279:web:340b970c366ea6f7502c72",
            measurementId: "G-0VPZ84T7JN"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        document.addEventListener("DOMContentLoaded", function () {
            document.getElementById("updatePaymentBtn").addEventListener("click", updatePayment);
        });

        // Ensure script runs after page loads
        document.addEventListener("DOMContentLoaded", function () {
            console.log("DOM fully loaded, initializing...");
            populateMonthYear();
            loadPayments();

            // ✅ Add event listener to dropdown
            document.getElementById("monthYear").addEventListener("change", loadPayments);
        });

        // Populate Month-Year Dropdown
        function populateMonthYear() {
            const monthYearSelect = document.getElementById("monthYear");

            if (!monthYearSelect) {
                console.error("Dropdown not found!");
                return;
            }

            console.log("Populating month-year dropdown...");

            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            monthYearSelect.innerHTML = ""; // Clear existing options

            for (let year = currentYear; year >= currentYear - 1; year--) {
                for (let month = 0; month < 12; month++) {
                    if (year === currentYear && month + 1 > currentMonth) {
                        continue; // Skip future months of current year
                    }
                    const value = `${year}-${String(month + 1).padStart(2, '0')}`;
                    const text = `${months[month]} ${year}`;
                    const option = new Option(text, value);

                    // ✅ Select the current month by default
                    if (year === currentYear && month + 1 === currentMonth) {
                        option.selected = true;
                    }

                    monthYearSelect.add(option);
                }
            }

            console.log("Dropdown populated successfully.");
        }

        // Add event listener if dropdown exists
        const monthYearDropdown = document.getElementById("monthYear");
        if (monthYearDropdown) {
            monthYearDropdown.addEventListener("change", loadPayments);
        }

        // Fetch payments from Firestore
        // async function loadPayments() {
        //     const selectedMonthYear = document.getElementById("monthYear").value;
        //     const docRef = doc(db, "staff_payments", selectedMonthYear);
        //     const docSnap = await getDoc(docRef);

        //     console.log(`Loading data for: ${selectedMonthYear}`);

        //     if (docSnap.exists()) {
        //         const data = docSnap.data();
        //         document.getElementById("talibAmount").value = data.talib || 0;
        //         document.getElementById("harshAmount").value = data.harsh || 0;
        //         updatePaymentDetails(selectedMonthYear, data.talib, data.harsh);
        //     } else {
        //         document.getElementById("talibAmount").value = null;
        //         document.getElementById("harshAmount").value = null;
        //         updatePaymentDetails(selectedMonthYear, null, null);
        //     }
        // }

        window.updateIndividualPayment = async function (staffName) {

            const selectedMonthYear = document.getElementById("monthYear").value;
            const amountInput = document.getElementById(`${staffName}Amount`);
            if (!amountInput) {
                console.error(`Input field for ${staffName} not found!`);
                return;
            }

            const amountValue = amountInput.value.trim(); // Trim spaces
            if (!amountValue) {
                alert("Enter a valid amount!");
                return;
            }

            const amount = parseInt(amountValue);
            if (isNaN(amount) || amount <= 0) {
                alert("Enter a valid amount!");
                return;
            }

            console.log("Raw Input:", amountInput.value); // Debugging step
            console.log("Parsed Amount:", amount); // Debugging step

            

            try {
                const docRef = doc(db, "staff_payments", selectedMonthYear);
                const docSnap = await getDoc(docRef);

                let existingData = {};
                let newTransactions = [];

                if (docSnap.exists()) {
                    existingData = docSnap.data();
                    newTransactions = existingData.transactions || [];
                }

                // Add new transaction with timestamp
                const newTransaction = {
                    staff: staffName,
                    amount: amount,
                    timestamp: new Date().toLocaleString() // Store human-readable date
                };

                newTransactions.push(newTransaction);

                // Update only the respective staff's amount and transactions list
                await setDoc(docRef, {
                    ...existingData,
                    [staffName]: (existingData[staffName] || 0) + amount,
                    transactions: newTransactions
                });

                alert(`${staffName} payment updated successfully!`);
                amountInput.value = ""; // Clear input after update
                loadPayments(); // Refresh data
            } catch (error) {
                console.error("Error updating payment:", error);
                alert("Failed to update payment.");
            }
        };

        // Fetch payments and display transaction history
        async function loadPayments() {
            const selectedMonthYear = document.getElementById("monthYear").value;
            const docRef = doc(db, "staff_payments", selectedMonthYear);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById("talibAmount").value = "";
                document.getElementById("harshAmount").value = "";

                updateTransactionHistory(data.transactions || []);
            } else {
                updateTransactionHistory([]);
            }
        }

        // Display transaction history in a table
        function updateTransactionHistory(transactions) {
            const historyContainer = document.getElementById("transactionHistory");
            let html = `<h4>Transaction History</h4>
                <table class="highlight">
                    <thead>
                        <tr>
                            <th>Staff Name</th>
                            <th>Amount (₹)</th>
                            <th>Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>`;

            if (transactions.length === 0) {
                html += `<tr><td colspan="3">No transactions found.</td></tr>`;
            } else {
                transactions.forEach((t) => {
                    html += `<tr>
                        <td>${t.staff}</td>
                        <td>₹${t.amount}</td>
                        <td>${t.timestamp}</td>
                     </tr>`;
                });
            }

            html += `</tbody></table>`;
            historyContainer.innerHTML = html;
        }