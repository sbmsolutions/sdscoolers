// Make function globally accessible
window.updatePayment = async function () {
    const selectedMonthYear = document.getElementById("monthYear").value;
    const talibAmount = parseInt(document.getElementById("talibAmount").value) || 0;
    const harshAmount = parseInt(document.getElementById("harshAmount").value) || 0;

    try {
        const docRef = doc(db, "staff_payments", selectedMonthYear);
        const docSnap = await getDoc(docRef);
        let newTalibAmount = talibAmount;
        let newHarshAmount = harshAmount;

        if (docSnap.exists()) {
            const existingData = docSnap.data();
            newTalibAmount += existingData.talib || 0;
            newHarshAmount += existingData.harsh || 0;
        }

        await setDoc(docRef, {
            talib: newTalibAmount,
            harsh: newHarshAmount,
            lastUpdated: serverTimestamp()
        });

        updatePaymentDetails(selectedMonthYear, newTalibAmount, newHarshAmount);
        alert("Payments updated successfully!");
        console.log("Firestore Write Success:", selectedMonthYear, { talib: newTalibAmount, harsh: newHarshAmount });

    } catch (error) {
        console.error("Error writing to Firestore:", error);
        alert("Failed to update payments. Check console for errors.");
    }
};

// Update Payment Display Details
function updatePaymentDetails(monthYear, talib, harsh) {
    document.getElementById("paymentDetails").innerHTML = `
<p>Updated Payments for <strong>${monthYear}</strong>:</p>
<p><strong>Talib:</strong> ₹${talib}</p>
<p><strong>Harsh:</strong> ₹${harsh}</p>
<p><i class="material-icons">done</i> Payment details updated.</p>
`;
}