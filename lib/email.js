export const sendInvoiceEmail = async (emailData) => {
    try {
        const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error: error.message };
    }
};
