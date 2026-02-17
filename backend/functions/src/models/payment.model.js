class Payment {
    constructor({ userId, amount, currency, status, stripeSessionId, items }) {
        this.userId = userId;
        this.amount = amount;
        this.currency = currency;
        this.status = status || "pending";
        this.stripeSessionId = stripeSessionId;
        this.items = items || [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    toFirestore() {
        return {
            userId: this.userId,
            amount: this.amount,
            currency: this.currency,
            status: this.status,
            stripeSessionId: this.stripeSessionId,
            items: this.items,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

module.exports = Payment;
